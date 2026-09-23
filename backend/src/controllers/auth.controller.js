import { login } from '../services/auth.service.js'
import { z } from 'zod'

const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1)
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
