import { getUserNotifications } from '../repositories/notification.repository.js'

const MAX_LIMIT = 100

export async function getNotifications(user_id, page = 1, limit = 10) {
  page = Math.max(1, Number.parseInt(page, 10) || 1)
  limit = Math.min(MAX_LIMIT, Math.max(1, Number.parseInt(limit, 10) || 10))
  const offset = (page - 1) * limit

  const notifications = await getUserNotifications(user_id, limit, offset)
  const totalItems = notifications.length
    ? Number(notifications[0].total_items)
    : 0
  const totalPages = Math.ceil(totalItems / limit)

  return {
    status: 200,
    data: notifications.map((row) => {
      const { total_items, ...data } = row
      void total_items
      return data
    }),
    pagination: {
      page,
      limit,
      itemsInPage: notifications.length,
      totalItems,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }
}
