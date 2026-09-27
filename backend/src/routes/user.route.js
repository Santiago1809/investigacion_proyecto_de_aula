import { Router } from 'express'
import {
  authenticateToken,
  authorizeRoles
} from '../middlewares/auth.middleware.js'
import { listAgentsController } from '../controllers/user.controller.js'

export const userRoutes = Router()

userRoutes.get(
  '/agents',
  authenticateToken,
  authorizeRoles(3),
  listAgentsController
)
