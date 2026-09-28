import {
  getRequestsForExport,
  registerReportExport
} from '../repositories/report.repository.js'

// El orden de estas cabeceras es el del archivo entregado. Coinciden con los
// alias del SELECT del repositorio, así el renderer mapea directo y no existe
// una segunda lista de columnas que pueda quedar desincronizada.
const CSV_HEADERS = [
  'id',
  'titulo',
  'categoria',
  'estado',
  'prioridad',
  'solicitante',
  'agente',
  'creada',
  'resuelta',
  'cerrada'
]

const CSV_ROW_SEPARATOR = '\r\n'
// Excel necesita el BOM para leer UTF-8; sin él "Solicitud de屏幕上" aparece
// con la Ñ rota. El BOM va dentro del documento para que el servicio sea el
// único dueño del formato y el controlador no tenga que saberlo.
const UTF8_BOM = '\uFEFF'

// Una celda que empieza con =, +, -, @, tab o CR es una FÓRMULA para una
// planilla. Prefijarla con apóstrofo la vuelve texto plano. Es un guardia de
// integridad de datos: el title y el full_name son texto libre de usuarios y
// un "=cmd|..." no debe ejecutarse al abrir el archivo.
const FORMULA_START = /^[=+\-@\t\r]/
const NEEDS_QUOTES = /[",\n\r]/

function formatTimestamp(value) {
  // TIMESTAMPTZ de node-pg llega como Date. Se fija UTC explícito en lugar de
  // toLocaleString: el reporte debe ser reproducible en cualquier máquina que
  // lo abra, y el string ISO ordena lexicográficamente igual que por fecha.
  return value.toISOString().slice(0, 19).replace('T', ' ')
}

/**
 * Escapa un valor para CSV (RFC 4180) y neutraliza intentos de fórmula.
 * @param {unknown} value
 * @returns {string}
 */
export function toCsvCell(value) {
  if (value === null || value === undefined) {
    return ''
  }

  const raw = value instanceof Date ? formatTimestamp(value) : String(value)
  // Primero el guardia de fórmula y después las comillas: al anteponer el
  // apóstrofo, una celda que empezaba con CR pasa a contenerlo igual, y así
  // sigue saliendo entrecomillada.
  const guarded = FORMULA_START.test(raw) ? `'${raw}` : raw

  return NEEDS_QUOTES.test(guarded)
    ? `"${guarded.replaceAll('"', '""')}"`
    : guarded
}

/**
 * Documento CSV completo: BOM + cabecera + una línea por fila.
 * @param {object[]} rows
 * @returns {string}
 */
export function toCsv(rows) {
  const lines = [CSV_HEADERS.join(',')]

  for (const row of rows) {
    lines.push(CSV_HEADERS.map((header) => toCsvCell(row[header])).join(','))
  }

  return UTF8_BOM + lines.join(CSV_ROW_SEPARATOR) + CSV_ROW_SEPARATOR
}

// Solo los filtros que realmente se aplicaron, para que el JSONB de
// report_exports diga la verdad sobre qué se exportó (y el trigger lo grabe en
// el evento de auditoría).
function buildAppliedFilters({ q, status, priority, category_id }) {
  const applied = {}
  if (q) applied.q = q
  if (status !== undefined) applied.status = status
  if (priority !== undefined) applied.priority = priority
  if (category_id !== undefined) applied.category_id = category_id
  return applied
}

/**
 * Exporta las solicitudes filtradas a CSV (HU12).
 *
 * Orden a propósito: primero se arma el archivo, después se REGISTRA la
 * exportación, y solo entonces se entrega. Si el registro de auditoría falla se
 * devuelve 500 sin CSV: un archivo que sale del sistema sin rastro de quién lo
 * pidió y con qué filtros es peor que un error.
 */
export async function exportRequestsCsv(filters, requested_by) {
  const rows = await getRequestsForExport(filters)
  const csv = toCsv(rows)

  try {
    await registerReportExport(requested_by, buildAppliedFilters(filters))
  } catch {
    return { status: 500, error: 'No se pudo registrar la exportación' }
  }

  return { status: 200, csv }
}
