import {
  createUserRequest,
  getUserRequests,
  getAllRequests,
  updateRequestPriority,
  getRequestById,
  assignRequestToAgent,
  changeRequestStatus,
  getRequestStatusHistory
} from '../repositories/request.repository.js'

const MAX_LIMIT = 100

function normalizePagination(page, limit) {
  page = Math.max(1, Number.parseInt(page, 10) || 1)
  limit = Math.min(MAX_LIMIT, Math.max(1, Number.parseInt(limit, 10) || 10))
  return { page, limit, offset: (page - 1) * limit }
}

function buildPaginatedResponse(request, page, limit) {
  const totalItems = request.length ? Number(request[0].total_items) : 0
  const totalPages = Math.ceil(totalItems / limit)
  return {
    status: 200,
    data: request.map((row) => {
      const { total_items, ...data } = row
      void total_items
      return data
    }),
    pagination: {
      page,
      limit,
      itemsInPage: request.length,
      totalItems,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }
}

export async function createRequest(
  title,
  description,
  category_id,
  priority,
  user_id
) {
  const request = await createUserRequest(
    title,
    description,
    category_id,
    priority,
    user_id
  )
  if (!request || request.length === 0) {
    return { status: 400, message: 'Error creando la solicitud' }
  }
  return { status: 201, request: request[0] }
}

export async function getRequestsByUser(user_id, page = 1, limit = 10) {
  const pagination = normalizePagination(page, limit)
  const request = await getUserRequests(
    user_id,
    pagination.limit,
    pagination.offset
  )
  return buildPaginatedResponse(request, pagination.page, pagination.limit)
}

export async function getAllRequestsSorted(
  sortBy = 'created_at',
  order = 'desc',
  page = 1,
  limit = 10
) {
  const pagination = normalizePagination(page, limit)
  const request = await getAllRequests(
    sortBy,
    order,
    pagination.limit,
    pagination.offset
  )
  return buildPaginatedResponse(request, pagination.page, pagination.limit)
}

export async function getRequestDetail(request_id) {
  const request = await getRequestById(request_id)
  if (!request) {
    return { status: 404, message: 'Solicitud no encontrada' }
  }
  return { status: 200, data: request }
}

function mapAssignmentError(error) {
  // Violaciones levantadas por los triggers de la BD (mensajes en español)
  // y por la restricción de una sola asignación activa por solicitud.
  if (error?.code === '23505') {
    return {
      status: 409,
      message: 'La solicitud ya tiene un agente asignado'
    }
  }
  if (error?.code === '23503') {
    return { status: 404, message: 'Solicitud no encontrada' }
  }
  if (typeof error?.message === 'string') {
    if (error.message.includes('Transición de estado no permitida')) {
      return {
        status: 409,
        message: 'La solicitud no está en estado NUEVO y no puede asignarse'
      }
    }
    if (
      error.message.includes('no está activo') ||
      error.message.includes('no tiene rol de AGENTE') ||
      error.message.includes('Solo un COORDINADOR')
    ) {
      return { status: 400, message: error.message }
    }
  }
  return { status: 500, message: 'Error asignando la solicitud' }
}

export async function assignRequest(request_id, agent_id, assigned_by) {
  try {
    const assignment = await assignRequestToAgent(
      request_id,
      agent_id,
      assigned_by
    )
    return { status: 201, data: assignment }
  } catch (error) {
    return mapAssignmentError(error)
  }
}

const ROLE_COORDINADOR = 3

function mapStatusChangeError(error) {
  // Errores de negocio levantados por el repository antes de tocar la BD
  // y el trigger trg_validate_status_transition como red de seguridad.
  if (error?.code === 'FORBIDDEN') {
    return { status: 403, message: error.message }
  }
  if (
    error?.code === 'INVALID_TRANSITION' ||
    error?.message?.includes('Transición de estado no permitida')
  ) {
    return {
      status: 409,
      message: error.message ?? 'Transición de estado no permitida'
    }
  }
  throw error
}

export async function updateRequestStatus(request_id, new_status, user) {
  try {
    const result = await changeRequestStatus(
      request_id,
      new_status,
      user.id,
      user.roles.includes(ROLE_COORDINADOR)
    )
    if (!result) {
      return { status: 404, message: 'Solicitud no encontrada' }
    }
    return { status: 200, data: result }
  } catch (error) {
    return mapStatusChangeError(error)
  }
}

export async function getStatusHistory(request_id) {
  const history = await getRequestStatusHistory(request_id)
  if (!history) {
    return { status: 404, message: 'Solicitud no encontrada' }
  }
  return { status: 200, data: history }
}

export async function changeRequestPriority(request_id, priority, actor_id) {
  const request = await updateRequestPriority(request_id, priority, actor_id)
  if (!request) {
    return { status: 404, message: 'Solicitud no encontrada' }
  }
  return { status: 200, data: request }
}
