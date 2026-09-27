import { Router } from 'express'
import {
  authenticateToken,
  authorizeRoles
} from '../middlewares/auth.middleware.js'
import {
  createRequestController,
  getUserRequestController,
  getAllRequestsController,
  updateRequestPriorityController,
  getRequestByIdController,
  assignRequestController
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

requestRoutes.get(
  '/all',
  authenticateToken,
  authorizeRoles(3),
  getAllRequestsController
)

requestRoutes.get(
  '/:id',
  authenticateToken,
  authorizeRoles(1, 2, 3, 4),
  getRequestByIdController
)

requestRoutes.post(
  '/:id/assign',
  authenticateToken,
  authorizeRoles(3),
  assignRequestController
)

requestRoutes.patch(
  '/:id/priority',
  authenticateToken,
  authorizeRoles(3),
  updateRequestPriorityController
)
