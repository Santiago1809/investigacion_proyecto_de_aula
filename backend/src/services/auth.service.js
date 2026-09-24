import * as bcrypt from 'bcrypt'
import {
  findByEmail,
  findRolesByUserId,
  insertUser
} from '../repositories/user.repository.js'
import { createToken } from './jwt.service.js'

export async function login(email, password) {
  const user = await findByEmail(email)
  if (!user) {
    return { status: 400, message: 'Credenciales inválidas' }
  }
  const validPassword = await bcrypt.compare(password, user.password_hash)
  if (!validPassword) return { status: 400, message: 'Credenciales inválidas' }
  const userRoles = await findRolesByUserId(user.id)
  const roles = userRoles.map((r) => r.id)
  const token = createToken({ sub: user.id, username: user.username, roles })
  return {
    status: 200,
    token,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      roles_id: roles
    }
  }
}

export async function register(
  email,
  username,
  full_name,
  password_hash,
  role_id = 1
) {
  let user = await findByEmail(email)
  if (user) {
    return { status: 400, message: 'No fue posible registrar el usuario' }
  }
  password_hash = await bcrypt.hash(password_hash, 12)
  user = await insertUser(email, username, full_name, password_hash, role_id)

  if (!user) {
    return { status: 400, message: 'No fue posible registrar al usuario' }
  }
  const token = createToken({ sub: user, username, roles: [role_id] })
  return {
    status: 200,
    token,
    user: {
      id: user,
      username,
      fullName: full_name,
      roles_id: [role_id]
    }
  }
}
