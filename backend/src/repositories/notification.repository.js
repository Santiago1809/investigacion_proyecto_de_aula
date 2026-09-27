import { pool } from '../config/database.js'

export async function getUserNotifications(user_id, limit, offset) {
  const { rows } = await pool.query(
    `select
        id,
        request_id,
        type,
        message,
        read_at,
        created_at,
        count(*) over() as total_items
      from notifications
      where user_id = $1
      order by read_at is not null, created_at desc
      limit $2 offset $3;`,
    [user_id, limit, offset]
  )
  return rows
}
