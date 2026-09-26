import { z } from 'zod'
import { login, refreshSession, register } from '../services/auth.service.js'

const loginSchema = z
  .object({
    email: z.string().min(1),
    password: z.string().min(1)
  })
  .strict()

const registerSchema = z
  .object({
    email: z.string().min(1),
    password: z.string().min(8).max(250),
    full_name: z.string().min(2).max(250),
    username: z.string().min(2).max(250),
    role_id: z.coerce.number().int().positive().min(1).max(4).default(1)
  })
  .strict()

const refreshSchema = z
  .object({
    refreshToken: z.string().min(1)
  })
  .strict()

export async function loginController(req, res) {
  const body = loginSchema.safeParse(req.body)

  if (!body.success) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: body.error.flatten()
    })
  }
  const { email, password } = body.data
  const request = await login(email, password)
  return res.status(request.status).json(request)
}

export async function registerController(req, res) {
  const body = registerSchema.safeParse(req.body)

  if (!body.success) {
    return res.status(400).json({
      error: 'DAtos de entrada inválidos',
      details: body.error.flatten()
    })
  }
  const { email, full_name, password, role_id, username } = body.data
  const request = await register(email, username, full_name, password, role_id)
  return res.status(request.status).json(request)
}

export async function refreshController(req, res) {
  const body = refreshSchema.safeParse(req.body)

  if (!body.success) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: body.error.flatten()
    })
  }

  const request = await refreshSession(body.data.refreshToken)
  return res.status(request.status).json(request)
}
