import {
  getAuditEvents,
  getAuditEventById,
  AUDIT_FILTER_KEYS
} from '../repositories/audit.repository.js'

const MAX_LIMIT = 100

// Copia deliberada del helper de request.service.js. Ese normalizePagination es
// privado y extraerlo a un util compartido tocaría archivos de otras features;
// se replica el criterio (clamp a MAX_LIMIT, offset derivado) para que el shape
// de `pagination` sea idéntico al del resto del backend y el frontend pueda
// leer las dos feature con el mismo componente.
function normalizePagination(page, limit) {
  page = Math.max(1, Number.parseInt(page, 10) || 1)
  limit = Math.min(MAX_LIMIT, Math.max(1, Number.parseInt(limit, 10) || 10))
  return { page, limit, offset: (page - 1) * limit }
}

// Solo los filtros que venían en el query, para que el cliente sepa qué se
// aplicó sin adivinar. Los criterios ausentes no aparecen.
function buildAppliedFilters(filters) {
  return Object.fromEntries(
    AUDIT_FILTER_KEYS.filter((key) => filters[key] !== undefined).map(
      (key) => [key, filters[key]]
    )
  )
}

function buildPaginatedResponse(events, page, limit, applied_filters) {
  const totalItems = events.length ? Number(events[0].total_items) : 0
  const totalPages = Math.ceil(totalItems / limit)
  return {
    status: 200,
    data: events.map((row) => {
      const { total_items, ...data } = row
      void total_items
      return data
    }),
    pagination: {
      page,
      limit,
      itemsInPage: events.length,
      totalItems,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    applied_filters
  }
}

export async function getAuditTrail(page = 1, limit = 10, filters = {}) {
  const pagination = normalizePagination(page, limit)
  const events = await getAuditEvents(
    pagination.limit,
    pagination.offset,
    filters
  )
  return buildPaginatedResponse(
    events,
    pagination.page,
    pagination.limit,
    buildAppliedFilters(filters)
  )
}

export async function getAuditEventDetail(id) {
  const event = await getAuditEventById(id)
  if (!event) {
    return { status: 404, message: 'Evento de auditoría no encontrado' }
  }
  return { status: 200, data: event }
}
