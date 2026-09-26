import { z } from 'zod'
import {
  createRequest,
  getRequestsByUser
} from '../services/request.service.js'

const getUserRequestSchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10)
  })
  .strict()

const createRequestSchema = z
  .object({
    title: z
      .string({ error: 'El título es obligatorio' })
      .trim()
      .min(1, 'El título es obligatorio')
      .max(200, 'El título no puede superar los 200 caracteres'),
    description: z
      .string({ error: 'La descripción es obligatoria' })
      .trim()
      .min(1, 'La descripción es obligatoria'),
    category_id: z
      .number({ error: 'La categoría es obligatoria' })
      .int('La categoría debe ser un número entero')
      .positive('La categoría no es válida'),
    priority: z
      .enum(['BAJA', 'MEDIA', 'ALTA', 'CRITICA'], {
        error: 'La prioridad no es válida'
      })
      .default('MEDIA')
  })
  .strict()

export async function getUserRequestController(req, res) {
  const params = await getUserRequestSchema.safeParseAsync(req.query)
  if (!params.success) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: params.error.flatten()
    })
  }
  const { page, limit } = params.data

  const request = await getRequestsByUser(req.user.id, page, limit)
  return res.status(request.status).json(request)
}

export async function createRequestController(req, res) {
  const params = await createRequestSchema.safeParseAsync(req.body)
  if (!params.success) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: params.error.flatten()
    })
  }
  const { title, description, category_id, priority } = params.data
  const result = await createRequest(
    title,
    description,
    category_id,
    priority,
    req.user.id
  )
  return res.status(result.status).json(result)
}
