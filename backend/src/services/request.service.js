import {
  createUserRequest,
  getUserRequests,
  getAllRequests,
  updateRequestPriority,
  createRequestComment,
  canReadRequestComments,
  listRequestComments
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

export async function changeRequestPriority(request_id, priority, actor_id) {
  const request = await updateRequestPriority(request_id, priority, actor_id)
  if (!request) {
    return { status: 404, message: 'Solicitud no encontrada' }
  }
  return { status: 200, data: request }
}

export async function addRequestComment(request_id, content, author_id) {
  try {
    const comment = await createRequestComment(request_id, author_id, content)
    return { status: 201, data: comment }
  } catch (error) {
    // 23503: FK de request_id, la solicitud no existe
    if (error.code === '23503') {
      return { status: 404, message: 'Solicitud no encontrada' }
    }
    // 23514: chk_comment_not_empty, contenido vacío (la zod ya lo valida)
    if (error.code === '23514') {
      return { status: 400, message: 'El comentario es obligatorio' }
    }
    throw error
  }
}

export async function getRequestComments(request_id, user) {
  const roles = (user?.roles ?? []).map(Number)
  const allowed = await canReadRequestComments(
    request_id,
    user.id,
    roles.includes(1),
    roles.includes(2),
    roles.includes(3) || roles.includes(4)
  )
  if (!allowed) {
    return { status: 404, message: 'Solicitud no encontrada' }
  }
  const comments = await listRequestComments(request_id)
  return { status: 200, data: comments }
}
