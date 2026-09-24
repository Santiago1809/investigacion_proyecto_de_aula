import { pool } from '../config/database.js'

export async function getUserRequests(user_id, limit, offset) {
  const { rows } = await pool.query(
    `select
        r.id,
        r.title,
        r.description,
        c."name" as category,
        r.priority,
        r.status,
        count(*) over() as total_items
      from
        requests r
      inner join categories c
      on r.category_id = c.id
      where r.requester_id  = $1
      limit $2 offset $3;`,
    [user_id, limit, offset]
  )
  return rows
}
