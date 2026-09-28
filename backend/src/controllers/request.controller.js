import { z } from 'zod'
import {
  createRequest,
  getRequestsByUser,
  changeRequestPriority,
  getAllRequestsSorted,
  getRequestDetail,
  assignRequest,
  updateRequestStatus,
  getStatusHistory,
  confirmSolution,
  reopenRequest,
  addRequestComment,
  getRequestComments
} from '../services/request.service.js'

const REQUEST_PRIORITIES = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA']

const getUserRequestSchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    q: z.string().trim().max(100, 'La búsqueda no puede superar los 100 caracteres').optional()
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
  const { page, limit, q } = params.data

  const request = await getRequestsByUser(req.user.id, page, limit, q)
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

const assignRequestSchema = z
  .object({
    agent_id: z.uuid('El agente no es válido')
  })
  .strict()

export async function getRequestByIdController(req, res) {
  const params = requestIdSchema.safeParse(req.params)
  if (!params.success) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: params.error.flatten()
    })
  }

  const result = await getRequestDetail(params.data.id)
  return res.status(result.status).json(result)
}

export async function assignRequestController(req, res) {
  const params = requestIdSchema.safeParse(req.params)
  const body = assignRequestSchema.safeParse(req.body)
  if (!params.success || !body.success) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: (params.success ? body : params).error.flatten()
    })
  }

  const result = await assignRequest(
    params.data.id,
    body.data.agent_id,
    req.user.id
  )
  return res.status(result.status).json(result)
}

const updateStatusSchema = z
  .object({
    status: z.enum(['ASIGNADO', 'EN_PROGRESO', 'RESUELTO', 'CERRADO'], {
      error: 'El estado no es válido'
    })
  })
  .strict()

export async function updateRequestStatusController(req, res) {
  const params = requestIdSchema.safeParse(req.params)
  const body = updateStatusSchema.safeParse(req.body)
  if (!params.success || !body.success) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: (params.success ? body : params).error.flatten()
    })
  }

  const result = await updateRequestStatus(
    params.data.id,
    body.data.status,
    req.user
  )
  return res.status(result.status).json(result)
}

export async function getStatusHistoryController(req, res) {
  const params = requestIdSchema.safeParse(req.params)
  if (!params.success) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: params.error.flatten()
    })
  }

  const result = await getStatusHistory(params.data.id)
  return res.status(result.status).json(result)
}

export async function confirmRequestController(req, res) {
  const params = requestIdSchema.safeParse(req.params)
  if (!params.success) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: params.error.flatten()
    })
  }

  const result = await confirmSolution(params.data.id, req.user)
  return res.status(result.status).json(result)
}

const reopenSchema = z
  .object({
    reason: z
      .string({ error: 'El motivo es obligatorio' })
      .trim()
      .min(1, 'El motivo es obligatorio')
  })
  .strict()

export async function reopenRequestController(req, res) {
  const params = requestIdSchema.safeParse(req.params)
  const body = reopenSchema.safeParse(req.body)
  if (!params.success || !body.success) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: (params.success ? body : params).error.flatten()
    })
  }

  const result = await reopenRequest(params.data.id, body.data.reason, req.user)
  return res.status(result.status).json(result)
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

const createCommentSchema = z
  .object({
    content: z
      .string({ error: 'El comentario es obligatorio' })
      .trim()
      .min(1, 'El comentario es obligatorio')
  })
  .strict()

export async function createCommentController(req, res) {
  const params = requestIdSchema.safeParse(req.params)
  const body = createCommentSchema.safeParse(req.body)
  if (!params.success || !body.success) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: (params.success ? body : params).error.flatten()
    })
  }

  const comment = await addRequestComment(
    params.data.id,
    body.data.content,
    req.user.id
  )
  return res.status(comment.status).json(comment)
}

export async function getCommentsController(req, res) {
  const params = requestIdSchema.safeParse(req.params)
  if (!params.success) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: params.error.flatten()
    })
  }

  const comments = await getRequestComments(params.data.id, req.user)
  return res.status(comments.status).json(comments)
}
