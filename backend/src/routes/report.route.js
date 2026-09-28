import { Router } from 'express'
import {
  authenticateToken,
  authorizeRoles
} from '../middlewares/auth.middleware.js'
import { exportRequestsCsvController } from '../controllers/report.controller.js'

export const reportRoutes = Router()

// Un reporte con datos de todas las solicitudes es información institucional:
// solo el rol 3 (COORDINADOR) lo puede descargar.
reportRoutes.get(
  '/requests.csv',
  authenticateToken,
  authorizeRoles(3),
  exportRequestsCsvController
)
