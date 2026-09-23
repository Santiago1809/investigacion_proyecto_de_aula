import * as bcrypt from 'bcrypt'
import {
  findByEmail,
  findRolesByUserId
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
