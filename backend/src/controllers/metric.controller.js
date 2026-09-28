import { z } from 'zod'
import { getMetricsSummary } from '../services/metric.service.js'

// Todos los filtros son opcionales y combinables entre sí. Cada uno se marca
// .optional() explícito porque en Zod 4 un campo de objeto es obligatorio por
// defecto: sin esto, /metrics/summary sin query string respondería 400.
const metricsQuerySchema = z
  .object({
    status: z
      .enum(['NUEVO', 'ASIGNADO', 'EN_PROGRESO', 'RESUELTO', 'CERRADO'], {
        error: 'El estado no es válido'
      })
      .optional(),
    priority: z
      .enum(['BAJA', 'MEDIA', 'ALTA', 'CRITICA'], {
        error: 'La prioridad no es válida'
      })
      .optional(),
    // z.coerce convierte '' en 0, y .positive() la rechaza: es exactamente el
    // caso "el frontend mandó la clave con string vacío".
    category_id: z.coerce
      .number({ error: 'La categoría no es válida' })
      .int('La categoría debe ser un número entero')
      .positive('La categoría no es válida')
      .optional(),
    q: z
      .string({ error: 'La búsqueda debe ser texto' })
      .trim()
      .max(100, 'La búsqueda no puede superar los 100 caracteres')
      .optional()
  })
  .strict()

export async function getMetricsSummaryController(req, res) {
  const params = metricsQuerySchema.safeParse(req.query)
  if (!params.success) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: params.error.flatten()
    })
  }

  const result = await getMetricsSummary(params.data)
  return res.status(result.status).json(result)
}
