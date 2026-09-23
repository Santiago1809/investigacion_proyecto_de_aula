import jwt from 'jsonwebtoken'
import { env } from '../config/env-vars.js'

function getBearerToken(req) {
  const authorization = req.headers.authorization

  if (!authorization?.startsWith('Bearer ')) {
    return null
  }

  return authorization.slice(7).trim() || null
}

export function authenticateToken(req, res, next) {
  const token = getBearerToken(req)

  if (!token) {
    return res.status(401).json({ message: 'Token de autenticación requerido' })
  }

  try {
    req.user = jwt.verify(token, env.JWT_SECRET)
    return next()
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' })
  }
}

/**
 *
 * @param  {...any} allowedRoles
 * LOS ROLES SON LOS SIGUIENTES:
 * 1 -> SOLICITANTE
 * 2 -> AGENTE
 * 3 -> COORDINADOR
 * 4 -> AUDITOR
 *
 * EJEMPLO: en una ruta, puede que los agentes y los coordinadores sean los únicos con acceso, entonces en la ruta sería algo:
 * someRoute.get('/datos-sensibles', authenticateToken,authorizeRoles(2,3),someController.action)
 *
 */
export function authorizeRoles(...allowedRoles) {
  const requiredRoles = allowedRoles.flat().map(Number).filter(Number.isInteger)

  if (requiredRoles.length === 0) {
    throw new Error('authorizeRoles requiere al menos un rol válido')
  }

  return (req, res, next) => {
    const userRoles = Array.isArray(req.user?.roles)
      ? req.user.roles.map(Number)
      : []

    const hasRequiredRole = requiredRoles.some((role) =>
      userRoles.includes(role)
    )

    if (!hasRequiredRole) {
      return res.status(403).json({
        message: 'No tienes permisos para acceder a este recurso'
      })
    }

    return next()
  }
}
