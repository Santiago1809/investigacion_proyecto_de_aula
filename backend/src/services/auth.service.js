import * as bcrypt from 'bcrypt'
import {
  findById,
  findByEmail,
  findRolesByUserId,
  insertUser
} from '../repositories/user.repository.js'
import { createTokenPair, verifyRefreshToken } from './jwt.service.js'

function buildTokenResponse(user, roles) {
  const tokens = createTokenPair({
    sub: user.id,
    username: user.username,
    roles
  })

  return {
    ...tokens,
    token: tokens.accessToken,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      roles_id: roles
    }
  }
}

export async function login(email, password) {
  const user = await findByEmail(email)
  if (!user) {
    return { status: 400, message: 'Credenciales inválidas' }
  }
  const validPassword = await bcrypt.compare(password, user.password_hash)
  if (!validPassword) return { status: 400, message: 'Credenciales inválidas' }
  const userRoles = await findRolesByUserId(user.id)
  const roles = userRoles.map((r) => r.id)
  return {
    status: 200,
    ...buildTokenResponse(user, roles)
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
  return {
    status: 200,
    ...buildTokenResponse({ id: user, username, full_name }, [role_id])
  }
}

export async function refreshSession(refreshToken) {
  try {
    const payload = verifyRefreshToken(refreshToken)
    const user = await findById(payload.sub)

    if (!user) {
      return { status: 401, message: 'Sesión de actualización inválida' }
    }

    const userRoles = await findRolesByUserId(user.id)
    const roles = userRoles.map((role) => role.id)

    return {
      status: 200,
      ...buildTokenResponse(user, roles)
    }
  } catch {
    return {
      status: 401,
      message: 'Token de actualización inválido o expirado'
    }
  }
}
