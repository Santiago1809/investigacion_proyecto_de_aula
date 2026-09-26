import { pool } from '../config/database.js'

export async function getActiveCategories() {
  const { rows } = await pool.query(
    `select id, name from categories where active = true order by name;`
  )
  return rows
}
