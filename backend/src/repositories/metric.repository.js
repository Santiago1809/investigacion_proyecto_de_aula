import { pool } from '../config/database.js'

// Filtros opcionales y combinables entre sí (AND). Cada filtro se omite del
// WHERE cuando no viene, así el mismo helper sirve para el caso sin filtros.
// status/priority comparan contra columnas ENUM, por eso NO se castean a text:
// Postgres infiere el tipo enum y el planner puede aprovechar el índice.
function buildFilters({ status, priority, category_id, q }) {
  const conditions = []
  const values = []

  if (status !== undefined) {
    values.push(status)
    conditions.push(`r.status = $${values.length}`)
  }
  if (priority !== undefined) {
    values.push(priority)
    conditions.push(`r.priority = $${values.length}`)
  }
  if (category_id !== undefined) {
    values.push(category_id)
    conditions.push(`r.category_id = $${values.length}`)
  }
  // q vacío equivale a "sin filtro" (mismo criterio que request.repository.js).
  if (q) {
    values.push(`%${q}%`)
    const index = values.length
    conditions.push(
      `(r.title ilike $${index} or r.description ilike $${index})`
    )
  }

  return {
    where: conditions.length ? `where ${conditions.join(' and ')}` : '',
    values
  }
}

// Volumen por estado sobre el conjunto filtrado. El total por estado sale del
// propio GROUP BY (sin subconsulta extra) y el orden por enum ya coincide con
// el orden natural del ciclo de vida.
export async function getVolumeByStatus(filters) {
  const { where, values } = buildFilters(filters)
  const { rows } = await pool.query(
    `select
        r.status,
        count(*) as total
      from requests r
      ${where}
      group by r.status
      order by r.status;`,
    values
  )
  return rows
}

// Métricas de ciclo sobre el conjunto filtrado: mediana de horas entre creación
// y resolución y tamaño de la muestra. El cálculo va en SQL a propósito
// (percentile_cont): traer los timestamps al backend para promediar en JS
// obligaría a traer una fila por solicitud y resolver mal el caso "sin datos".
// El FILTER es explícito aunque percentile_cont ya ignora NULLs: deja escrito
// que la mediana es solo sobre solicitudes resueltas.
// ::float8 para que node-pg devuelva un number y no el string de un numeric.
export async function getCycleMetrics(filters) {
  const { where, values } = buildFilters(filters)
  const { rows } = await pool.query(
    `select
        count(r.resolved_at) as muestra,
        round(
          (
            percentile_cont(0.5) within group (
              order by extract(epoch from (r.resolved_at - r.created_at)) / 3600.0
            ) filter (where r.resolved_at is not null)
          )::numeric,
          2
        )::float8 as mediana_horas
      from requests r
      ${where};`,
    values
  )

  const row = rows[0] ?? { muestra: 0, mediana_horas: null }
  const muestra = Number(row.muestra ?? 0)

  return {
    // Sin solicitudes resueltas no hay mediana: null es el dato honesto, 0 sería
    // un valor inventado que el frontend no puede distinguir de "resueltas en 0h".
    mediana_horas: muestra === 0 ? null : (row.mediana_horas ?? null),
    muestra
  }
}
