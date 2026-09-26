import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(5432),

  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32).optional(),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d')
})

const parsedEnv = envSchema.parse(process.env)

if (parsedEnv.NODE_ENV === 'production' && !parsedEnv.JWT_REFRESH_SECRET) {
  throw new Error('JWT_REFRESH_SECRET es obligatorio en producción')
}

export const env = {
  ...parsedEnv,
  JWT_REFRESH_SECRET:
    parsedEnv.JWT_REFRESH_SECRET ??
    'development-refresh-secret-change-me-32-chars'
}
