import { Router } from 'express'
import {
  authenticateToken,
  authorizeRoles
} from '../middlewares/auth.middleware.js'
import {
  getAllRequestsController,
  getUserRequestController,
  updateRequestPriorityController
} from '../controllers/request.controller.js'

export const requestRoutes = Router()

requestRoutes.get(
  '/',
  authenticateToken,
  authorizeRoles(1, 2, 3, 4),
  getUserRequestController
)

requestRoutes.get(
  '/all',
  authenticateToken,
  authorizeRoles(3),
  getAllRequestsController
)

requestRoutes.patch(
  '/:id/priority',
  authenticateToken,
  authorizeRoles(3),
  updateRequestPriorityController
)
