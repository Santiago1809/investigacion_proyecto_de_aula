import { pool } from '../config/database.js'

// Filtros combinables del listado, todos opcionales y unidos con AND. Mismo
// criterio que metric.repository.js: cada filtro entra al WHERE únicamente si
// viene, y el placeholder se numera con el índice que le toca en `values` — el
// valor viaja siempre parametrizado, nunca interpolado. Sin filtros el WHERE
// desaparece y el listado muestra todo.
const AUDIT_FILTER_PREDICATES = {
  // action es ENUM: se compara contra la columna sin castear para que
  // PostgreSQL infiera el tipo y el planner pueda usar el índice.
  action: (filters, values) => {
    values.push(filters.action)
    return `a.action = $${values.length}`
  },
  request_id: (filters, values) => {
    values.push(filters.request_id)
    return `a.request_id = $${values.length}`
  },
  actor_id: (filters, values) => {
    values.push(filters.actor_id)
    return `a.actor_id = $${values.length}`
  },
  // Rango por fecha, inclusivo en ambos extremos. Se filtran los dos límites
  // por separado en vez de un between porque cada uno es opcional por su
  // cuenta: 'from' solo o 'to' solo son consultas válidas.
  from: (filters, values) => {
    values.push(filters.from)
    return `a.created_at >= $${values.length}`
  },
  to: (filters, values) => {
    values.push(filters.to)
    return `a.created_at <= $${values.length}`
  }
}

export const AUDIT_FILTER_KEYS = Object.keys(AUDIT_FILTER_PREDICATES)

function buildFilterPredicates(filters, values) {
  return AUDIT_FILTER_KEYS.filter((key) => filters[key] !== undefined).map(
    (key) => AUDIT_FILTER_PREDICATES[key](filters, values)
  )
}

// `actor_id` sale de la propia tabla (el id codificado que exige el requisito),
// no del join: la identidad del actor no depende de que `users` siga teniendo
// la fila. El LEFT JOIN es deliberado — `actor_id` es NOT NULL con FK ON DELETE
// RESTRICT, así que en la práctica siempre existe, pero un trail de auditoría
// que pierde eventos por un join es peor que uno con actor_name null.
//
// De `users` SOLO se leen `id` y `full_name`. No email, no username, no
// password_hash: el listado de auditoría es la vista más ancha que tiene el
// sistema sobre la actividad de los usuarios y no debe filtrar datos de
// contacto ni credenciales.
const EVENT_COLUMNS = `a.id,
        a.request_id,
        a.action,
        a.field_name,
        a.old_value,
        a.new_value,
        a.created_at,
        a.actor_id,
        u.full_name as actor_name`

export async function getAuditEvents(limit, offset, filters = {}) {
  const values = []
  const conditions = buildFilterPredicates(filters, values)
  values.push(limit, offset)
  const where = conditions.length ? `where ${conditions.join(' and ')}` : ''

  const { rows } = await pool.query(
    `select
        ${EVENT_COLUMNS},
        count(*) over() as total_items
      from
        audit_events a
      left join users u
        on u.id = a.actor_id
      ${where}
      order by a.created_at desc, a.id desc
      limit $${values.length - 1} offset $${values.length};`,
    values
  )
  return rows
}

export async function getAuditEventById(id) {
  const { rows } = await pool.query(
    `select
        ${EVENT_COLUMNS}
      from
        audit_events a
      left join users u
        on u.id = a.actor_id
      where a.id = $1;`,
    [id]
  )
  return rows[0] ?? null
}
