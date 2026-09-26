import jwt from 'jsonwebtoken'
import { env } from '../config/env-vars.js'

const ACCESS_TOKEN_TYPE = 'access'
const REFRESH_TOKEN_TYPE = 'refresh'

function verifyToken(token, secret, expectedTokenType) {
  const payload = jwt.verify(token, secret)

  if (payload.tokenType !== expectedTokenType) {
    throw new Error('Tipo de token inválido')
  }

  return payload
}

export function createAccessToken(payload) {
  return jwt.sign(
    { ...payload, tokenType: ACCESS_TOKEN_TYPE },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  )
}

export function createRefreshToken(payload) {
  return jwt.sign(
    { sub: payload.sub, tokenType: REFRESH_TOKEN_TYPE },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  )
}

export function verifyAccessToken(token) {
  return verifyToken(token, env.JWT_SECRET, ACCESS_TOKEN_TYPE)
}

export function verifyRefreshToken(token) {
  return verifyToken(token, env.JWT_REFRESH_SECRET, REFRESH_TOKEN_TYPE)
}

export function createTokenPair(payload) {
  const accessToken = createAccessToken(payload)
  const refreshToken = createRefreshToken(payload)
  const decodedAccessToken = jwt.decode(accessToken)

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt: decodedAccessToken.exp * 1000
  }
}

export function createToken(payload) {
  return createAccessToken(payload)
}
