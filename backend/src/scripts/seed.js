import bcrypt from 'bcrypt'
import { pool } from '../config/database.js'
import { findByEmail, insertUser } from '../repositories/user.repository.js'

const ROLES = ['SOLICITANTE', 'AGENTE', 'COORDINADOR', 'AUDITOR']

const CATEGORIES = [
  'Infraestructura',
  'Académico',
  'Soporte técnico',
  'Bienestar',
  'Biblioteca',
  'Administrativo',
  'Seguridad'
]

const USERS = [
  {
    email: 'admin@example.com',
    username: 'admin',
    full_name: 'Coordinador Principal',
    password: 'Admin1234!',
    role: 'COORDINADOR'
  },
  {
    email: 'agente@example.com',
    username: 'agente1',
    full_name: 'Agente de Soporte',
    password: 'Agente1234!',
    role: 'AGENTE'
  },
  {
    email: 'solicitante@example.com',
    username: 'solicitante1',
    full_name: 'Solicitante de Ejemplo',
    password: 'Solicitante1234!',
    role: 'SOLICITANTE'
  },
  {
    email: 'auditor@example.com',
    username: 'auditor1',
    full_name: 'Auditor del Sistema',
    password: 'Auditor1234!',
    role: 'AUDITOR'
  }
]

async function seedRoles() {
  const results = { inserted: [], skipped: [] }
  const roleIdByName = {}
  for (const name of ROLES) {
    const { rowCount, rows } = await pool.query(
      `INSERT INTO roles (name) VALUES ($1)
       ON CONFLICT (name) DO NOTHING
       RETURNING id`,
      [name]
    )
    if (rowCount > 0) {
      results.inserted.push(name)
      roleIdByName[name] = rows[0].id
    } else {
      results.skipped.push(name)
      const { rows: existing } = await pool.query(
        'SELECT id FROM roles WHERE name = $1',
        [name]
      )
      roleIdByName[name] = existing[0].id
    }
  }
  return { results, roleIdByName }
}

async function seedCategories() {
  const results = { inserted: [], skipped: [] }
  for (const name of CATEGORIES) {
    const { rowCount } = await pool.query(
      `INSERT INTO categories (name) VALUES ($1)
       ON CONFLICT (name) DO NOTHING
       RETURNING id`,
      [name]
    )
    ;(rowCount > 0 ? results.inserted : results.skipped).push(name)
  }
  return results
}

async function seedUsers(roleIdByName) {
  const results = { inserted: [], skipped: [] }
  for (const u of USERS) {
    const existing = await findByEmail(u.email)
    if (existing) {
      results.skipped.push(u.email)
      continue
    }
    const password_hash = await bcrypt.hash(u.password, 12)
    await insertUser(
      u.email,
      u.username,
      u.full_name,
      password_hash,
      roleIdByName[u.role]
    )
    results.inserted.push(`${u.email} (${u.role})`)
  }
  return results
}

async function main() {
  console.log('Iniciando seed...')
  const roles = await seedRoles()
  const categories = await seedCategories()
  const users = await seedUsers(roles.roleIdByName)

  console.log('Roles — insertados:', roles.results.inserted.join(', ') || 'ninguno', '| omitidos:', roles.results.skipped.join(', ') || 'ninguno')
  console.log('Categorías — insertadas:', categories.inserted.join(', ') || 'ninguna', '| omitidas:', categories.skipped.join(', ') || 'ninguna')
  console.log('Usuarios — insertados:', users.inserted.join(', ') || 'ninguno', '| omitidos:', users.skipped.join(', ') || 'ninguno')
}

main()
  .catch((err) => {
    console.error('Error ejecutando seed:', err)
    process.exitCode = 1
  })
  .finally(() => pool.end())
