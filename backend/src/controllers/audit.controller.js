import { z } from 'zod'
import { getAuditTrail, getAuditEventDetail } from '../services/audit.service.js'

// Espejo de audit_action en bd/base_de_datos.sql. Un valor fuera de la lista es
// 400 antes de tocar la BD, así que el enum de Postgres nunca ve garbage.
const AUDIT_ACTIONS = [
  'REQUEST_CREATED',
  'PRIORITY_CHANGED',
  'ASSIGNED',
  'UNASSIGNED',
  'STATUS_CHANGED',
  'COMMENT_CREATED',
  'SOLUTION_CONFIRMED',
  'REQUEST_REOPENED',
  'REPORT_EXPORTED'
]

// Filtros opcionales del listado, combinables entre sí y todos omitidos del
// WHERE cuando no vienen. Cada uno lleva .optional() explícito porque en Zod 4
// un campo de objeto es obligatorio por defecto: sin esto, GET /audit sin query
// string respondería 400.
const auditListSchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    action: z
      .enum(AUDIT_ACTIONS, { error: 'La acción no es válida' })
      .optional(),
    request_id: z.uuid('El id de la solicitud no es válido').optional(),
    actor_id: z.uuid('El id del actor no es válido').optional(),
    // z.coerce.date() convierte strings ISO en Date (node-pg los manda como
    // timestamp y Postgres los compara contra la columna TIMESTAMPTZ). Ojo con
    // '' : produce una fecha inválida y por tanto 400, que es lo correcto —
    // la clave vacía no debe degradar a "sin filtro".
    from: z.coerce.date({ error: 'La fecha inicial no es válida' }).optional(),
    to: z.coerce.date({ error: 'La fecha final no es válida' }).optional()
  })
  .strict()
  // Rango invertido: un from posterior al to no devuelve una lista vacía
  // silenciosa, es un error del cliente. Va como refine del objeto para que
  // salga por el mismo sobre 400 que el resto de la validación.
  .refine((data) => !data.from || !data.to || data.from <= data.to, {
    message: 'La fecha inicial no puede ser posterior a la fecha final',
    path: ['from']
  })

// audit_events.id es BIGSERIAL, no un UUID: se valida como entero positivo.
const auditIdSchema = z
  .object({
    id: z.coerce
      .number({ error: 'El id del evento no es válido' })
      .int('El id del evento no es válido')
      .positive('El id del evento no es válido')
  })
  .strict()

// Un rango "hasta 2026-09-27" debe incluir todo el 27, no solo el 00:00.
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

export async function getAuditEventsController(req, res) {
  const params = auditListSchema.safeParse(req.query)
  if (!params.success) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: params.error.flatten()
    })
  }
  // El esquema es strict, así que en filters solo quedan los filtros opcionales,
  // presentes únicamente si vinieron.
  const { page, limit, ...filters } = params.data

  // `to` es inclusivo: si el cliente manda solo la fecha, el fin de día se
  // también, porque created_at <= '2026-09-27T00:00:00Z' excluiría ese día.
  if (filters.to instanceof Date && DATE_ONLY.test(req.query.to)) {
    filters.to.setUTCHours(23, 59, 59, 999)
  }

  const result = await getAuditTrail(page, limit, filters)
  return res.status(result.status).json(result)
}

export async function getAuditEventByIdController(req, res) {
  const params = auditIdSchema.safeParse(req.params)
  if (!params.success) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: params.error.flatten()
    })
  }

  const result = await getAuditEventDetail(params.data.id)
  return res.status(result.status).json(result)
}
