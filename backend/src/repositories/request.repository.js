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
      order by r.created_at desc
      limit $2 offset $3;`,
    [user_id, limit, offset]
  )
  return rows
}

export async function createUserRequest(
  title,
  description,
  category_id,
  priority,
  user_id
) {
  const { rows } = await pool.query(
    `
    INSERT INTO requests (title, description, category_id, priority, requester_id)  VALUES ($1,$2,$3,$4,$5)  RETURNING *
    `,
    [title, description, category_id, priority, user_id]
  )

  return rows
}
