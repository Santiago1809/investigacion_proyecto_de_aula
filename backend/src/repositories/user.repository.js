import { pool } from '../config/database.js'

export async function findByEmail(email) {
  const { rows } = await pool.query(
    `SELECT id, email, password_hash, username, full_name FROM users WHERE (email = $1 OR username = $1) AND status = 'ACTIVE'`,
    [email]
  )
  return rows[0] ?? null
}

export async function findRolesByUserId(userId) {
  const { rows } = await pool.query(
    `
        SELECT r.id, r.name
        FROM user_roles ur
        INNER JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = $1
        `,
    [userId]
  )

  return rows ?? null
}

export async function insertUser(
  email,
  username,
  full_name,
  password_hash,
  role_id
) {
  const { rows } = await pool.query(
    `INSERT INTO users (email, username, full_name, password_hash) VALUES ($1, $2, $3, $4) RETURNING id`,
    [email, username, full_name, password_hash]
  )
  const user_id = rows[0].id

  const { rows: roleRows } = await pool.query(
    `INSERT INTO user_roles (user_id, role_id) VALUES ($1,$2) RETURNING user_id`,
    [user_id, role_id]
  )

  return roleRows.length > 0 ? user_id : null
}
