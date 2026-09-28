import { pool } from '../config/database.js'

// Mismos filtros combinables que el resto de la API (q/status/priority/
// category_id) con la misma semántica: cada criterio se omite del WHERE cuando
// no viene y todos se combinan con AND. status/priority son ENUM y
// category_id SMALLINT, por eso NO se castean a text: PostgreSQL infiere el
// tipo de la columna y el planner puede usar los índices.
const FILTER_PREDICATES = {
  q: (filters, values) => {
    values.push(`%${filters.q}%`)
    return `(r.title ilike $${values.length} or r.description ilike $${values.length})`
  },
  status: (filters, values) => {
    values.push(filters.status)
    return `r.status = $${values.length}`
  },
  priority: (filters, values) => {
    values.push(filters.priority)
    return `r.priority = $${values.length}`
  },
  category_id: (filters, values) => {
    values.push(filters.category_id)
    return `r.category_id = $${values.length}`
  }
}

const FILTER_KEYS = Object.keys(FILTER_PREDICATES)

function buildWhere(filters) {
  const values = []
  const conditions = FILTER_KEYS.filter(
    (key) => filters[key] !== undefined
  ).map((key) => FILTER_PREDICATES[key](filters, values))

  return {
    where: conditions.length ? `where ${conditions.join(' and ')}` : '',
    values
  }
}

/**
 * Filas para el CSV de solicitudes, en el orden exacto que espera el renderer.
 *
 * Los alias del SELECT coinciden con las cabeceras del CSV, así el servicio
 * mapea sin una tabla de columnas que pueda desincronizarse.
 *
 * Minimización de datos: el SELECT NO trae description, ni email, ni username,
 * ni password_hash. Un reporte exportado sale del sistema hacia un archivo que
 * viaja por correo, así que de él sale solo lo que el reporte necesita.
 *
 * El LEFT JOIN de la asignación activa no duplica filas: el índice único
 * parcial uq_active_request_assignment impide dos asignaciones activas para la
 * misma solicitud, por eso no hace falta distinct.
 */
export async function getRequestsForExport(filters) {
  const { where, values } = buildWhere(filters)
  const { rows } = await pool.query(
    `select
        r.id as id,
        r.title as titulo,
        c."name" as categoria,
        r.status as estado,
        r.priority as prioridad,
        u.full_name as solicitante,
        ua.full_name as agente,
        r.created_at as creada,
        r.resolved_at as resuelta,
        r.closed_at as cerrada
      from requests r
      inner join categories c
        on r.category_id = c.id
      inner join users u
        on r.requester_id = u.id
      left join request_assignments ra
        on ra.request_id = r.id and ra.unassigned_at is null
      left join users ua
        on ua.id = ra.agent_id
      ${where}
      order by r.created_at desc, r.id;`,
    values
  )
  return rows
}

/**
 * Registra la exportación ANTES de entregar el archivo. El trigger
 * trg_report_export_audit escribe el evento REPORT_EXPORTED con los filtros
 * serializados en new_value, así que este INSERT ES la auditoría: si falla, no
 * se entrega el CSV.
 */
export async function registerReportExport(requested_by, filters) {
  await pool.query(
    `insert into report_exports (requested_by, filters)
      values ($1, $2::jsonb);`,
    [requested_by, JSON.stringify(filters)]
  )
}
