import { z } from 'zod'
import {
  changeRequestPriority,
  getAllRequestsSorted,
  getRequestsByUser
} from '../services/request.service.js'

const REQUEST_PRIORITIES = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA']

const getUserRequestSchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10)
  })
  .strict()

const getAllRequestsSchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    sortBy: z.enum(['priority', 'status', 'created_at']).default('created_at'),
    order: z.enum(['asc', 'desc']).default('desc')
  })
  .strict()

const requestIdSchema = z.object({
  id: z.uuid()
})

const updatePrioritySchema = z
  .object({
    priority: z.enum(REQUEST_PRIORITIES)
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

export async function getAllRequestsController(req, res) {
  const params = getAllRequestsSchema.safeParse(req.query)
  if (!params.success) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: params.error.flatten()
    })
  }
  const { sortBy, order, page, limit } = params.data

  const request = await getAllRequestsSorted(sortBy, order, page, limit)
  return res.status(request.status).json(request)
}

export async function updateRequestPriorityController(req, res) {
  const params = requestIdSchema.safeParse(req.params)
  const body = updatePrioritySchema.safeParse(req.body)
  if (!params.success || !body.success) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: (params.success ? body : params).error.flatten()
    })
  }

  const request = await changeRequestPriority(
    params.data.id,
    body.data.priority,
    req.user.id
  )
  return res.status(request.status).json(request)
}
