import {
  createUserRequest,
  getUserRequests,
  getAllRequests,
  updateRequestPriority
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
