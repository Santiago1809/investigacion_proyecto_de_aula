import { Router } from 'express'
import {
  authenticateToken,
  authorizeRoles
} from '../middlewares/auth.middleware.js'
import {
  getAuditEventsController,
  getAuditEventByIdController
} from '../controllers/audit.controller.js'

export const auditRoutes = Router()

// HU11. Lectura pura y exclusiva del rol 4 (AUDITOR): `audit_events` la escriben
// los triggers de la BD (request_create, trg_validate_status_transition, etc.)
// y esta feature NO expone POST/PUT/PATCH/DELETE. Si alguna vez se necesita
// escribir un evento, el punto de entrada es el trigger, no esta API.
auditRoutes.get(
  '/',
  authenticateToken,
  authorizeRoles(4),
  getAuditEventsController
)

auditRoutes.get(
  '/:id',
  authenticateToken,
  authorizeRoles(4),
  getAuditEventByIdController
)
