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
// ORDER BY no acepta parámetros ($1), por eso solo se permiten estas columnas
const SORT_COLUMNS = {
  priority: 'r.priority',
  status: 'r.status',
  created_at: 'r.created_at'
}

export async function getAllRequests(sortBy, order, limit, offset) {
  const column = SORT_COLUMNS[sortBy] ?? SORT_COLUMNS.created_at
  const direction = order === 'asc' ? 'asc' : 'desc'
  const { rows } = await pool.query(
    `select
        r.id,
        r.title,
        r.description,
        c."name" as category,
        r.priority,
        r.status,
        r.created_at,
        u.full_name as requester,
        count(*) over() as total_items
      from
        requests r
      inner join categories c
      on r.category_id = c.id
      inner join users u
      on r.requester_id = u.id
      order by ${column} ${direction}, r.created_at desc, r.id
      limit $1 offset $2;`,
    [limit, offset]
  )
  return rows
}

export async function updateRequestPriority(request_id, priority, actor_id) {
  // El trigger trg_audit_priority_change lee app.current_user_id para registrar
  // quién hizo el cambio, así que todo debe ir en la misma transacción y cliente
  const client = await pool.connect()
  try {
    await client.query('begin')
    await client.query("select set_config('app.current_user_id', $1, true)", [
      actor_id
    ])
    const { rows } = await client.query(
      `update requests
        set priority = $1
        where id = $2
        returning id, priority, updated_at;`,
      [priority, request_id]
    )
    await client.query('commit')
    return rows[0] ?? null
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}
