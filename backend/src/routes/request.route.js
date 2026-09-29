import { Router } from 'express'
import {
  authenticateToken,
  authorizeRoles
} from '../middlewares/auth.middleware.js'
import {
  createRequestController,
  getUserRequestController,
  getAllRequestsController,
  getAssignedRequestsController,
  updateRequestPriorityController,
  getRequestByIdController,
  assignRequestController,
  updateRequestStatusController,
  getStatusHistoryController,
  confirmRequestController,
  reopenRequestController,
  createCommentController,
  getCommentsController
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

// Tiene que ir antes de cualquier ruta con :id o Express matchearía
// 'assigned' como id y nunca llegaría al handler del agente.
requestRoutes.get(
  '/assigned',
  authenticateToken,
  authorizeRoles(2),
  getAssignedRequestsController
)

requestRoutes.get(
  '/:id',
  authenticateToken,
  authorizeRoles(1, 2, 3, 4),
  getRequestByIdController
)

requestRoutes.post(
  '/:id/confirm',
  authenticateToken,
  authorizeRoles(1),
  confirmRequestController
)

requestRoutes.post(
  '/:id/reopen',
  authenticateToken,
  authorizeRoles(1),
  reopenRequestController
)

requestRoutes.post(
  '/:id/assign',
  authenticateToken,
  authorizeRoles(3),
  assignRequestController
)

requestRoutes.patch(
  '/:id/status',
  authenticateToken,
  authorizeRoles(2, 3),
  updateRequestStatusController
)

requestRoutes.get(
  '/:id/history',
  authenticateToken,
  authorizeRoles(2, 3, 4),
  getStatusHistoryController
)

requestRoutes.patch(
  '/:id/priority',
  authenticateToken,
  authorizeRoles(3),
  updateRequestPriorityController
)

requestRoutes.post(
  '/:id/comments',
  authenticateToken,
  authorizeRoles(2, 3),
  createCommentController
)

requestRoutes.get(
  '/:id/comments',
  authenticateToken,
  authorizeRoles(1, 2, 3, 4),
  getCommentsController
)
