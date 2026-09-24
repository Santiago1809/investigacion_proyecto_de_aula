import { z } from 'zod'
import { getRequestsByUser } from '../services/request.service.js'

const getUserRequestSchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10)
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
