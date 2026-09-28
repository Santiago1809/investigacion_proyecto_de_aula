import { getVolumeByStatus, getCycleMetrics } from '../repositories/metric.repository.js'

// Orden canónico del ciclo de vida. Se emiten los cinco estados aunque alguno
// tenga cero solicitudes para que el gráfico del coordinator sea estable: si
// faltara "CERRADO: 0" la UI lo interpretaría como un estado inexistente y no
// como "cerramos cero este mes".
const REQUEST_STATUSES = ['NUEVO', 'ASIGNADO', 'EN_PROGRESO', 'RESUELTO', 'CERRADO']

function buildAppliedFilters({ status, priority, category_id, q }) {
  const applied = {}
  if (status !== undefined) applied.status = status
  if (priority !== undefined) applied.priority = priority
  if (category_id !== undefined) applied.category_id = category_id
  if (q) applied.q = q
  return applied
}

/**
 * Indicadores agregados de solicitudes (HU10).
 *
 * HU10 es deliberadamente una agregación SIN RANKING INDIVIDUAL: la respuesta no
 * incluye usuarios, agentes, solicitantes, nombres ni conteos por persona, y no
 * debe empezar a incluirlos. Todo se calcula sobre el conjunto filtrado completo
 * y el SQL nunca hace join contra users ni request_assignments. Si algún día se
 * pide un ranking individual ("agente con más solicitudes"), es otra historia
 * con su propio requisito de privacidad y NO debe agregarse a este endpoint.
 */
export async function getMetricsSummary(filters) {
  // ponytail: dos escaneos agregados de `requests` en paralelo (uno por
  // GROUP BY status, otro para la mediana). Aceptable a esta escala; si la tabla
  // crece o el filtro `q` se usa mucho, colapsar en una sola sentencia con
  // GROUPING SETS o precalcular en una vista materializada.
  const [volumeRows, ciclo] = await Promise.all([
    getVolumeByStatus(filters),
    getCycleMetrics(filters)
  ])

  const counts = new Map(
    volumeRows.map((row) => [row.status, Number(row.total)])
  )

  return {
    status: 200,
    data: {
      volumen_por_estado: REQUEST_STATUSES.map((status) => ({
        status,
        total: counts.get(status) ?? 0
      })),
      ciclo,
      total_filtradas: volumeRows.reduce(
        (acc, row) => acc + Number(row.total),
        0
      ),
      applied_filters: buildAppliedFilters(filters)
    }
  }
}
