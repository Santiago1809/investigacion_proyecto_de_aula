import { z } from 'zod'
import { getNotifications } from '../services/notification.service.js'

const getNotificationsSchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10)
  })
  .strict()

export async function getNotificationsController(req, res) {
  const params = getNotificationsSchema.safeParse(req.query)
  if (!params.success) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: params.error.flatten()
    })
  }

  const result = await getNotifications(
    req.user.id,
    params.data.page,
    params.data.limit
  )
  return res.status(result.status).json(result)
}
