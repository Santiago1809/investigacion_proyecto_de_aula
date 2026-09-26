import { Router } from 'express'
import {
  authenticateToken,
  authorizeRoles
} from '../middlewares/auth.middleware.js'
import {
  createRequestController,
  getUserRequestController
} from '../controllers/request.controller.js'

export const requestRoutes = Router()

requestRoutes.get(
  '/',
  authenticateToken,
  authorizeRoles(1, 2, 3, 4),
  getUserRequestController
)

requestRoutes.post(
  '/',
  authenticateToken,
  authorizeRoles(1),
  createRequestController
)
