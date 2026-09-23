import jwt from 'jsonwebtoken'
import { env } from '../config/env-vars.js'

export function createToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  })
}
