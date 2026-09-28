import { z } from 'zod'
import { exportRequestsCsv } from '../services/report.service.js'

// Filtros idénticos a /metrics/summary: opcionales, combinables entre sí y con
// la misma semántica. Cada uno lleva .optional() explícito porque en Zod 4 un
// campo de objeto es obligatorio por defecto, y sin esto un export sin query
// string respondería 400.
const exportQuerySchema = z
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
    // z.coerce convierte '' en 0 y .positive() lo rechaza: exactamente el caso
    // "el frontend mandó la clave con string vacío".
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

export async function exportRequestsCsvController(req, res) {
  const params = exportQuerySchema.safeParse(req.query)

  if (!params.success) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: params.error.flatten()
    })
  }

  const result = await exportRequestsCsv(params.data, req.user.id)

  if (result.status !== 200) {
    return res.status(result.status).json({ error: result.error })
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="solicitudes.csv"'
  )

  return res.status(200).send(result.csv)
}
