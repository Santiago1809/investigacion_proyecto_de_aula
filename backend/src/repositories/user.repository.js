import { pool } from '../config/database.js'

export async function findByEmail(email) {
  const { rows } = await pool.query(
    `SELECT id, email, password_hash, username, full_name FROM users WHERE email = $1 AND status = 'ACTIVE'`,
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
