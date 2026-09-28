import { Router } from 'express'
import {
  authenticateToken,
  authorizeRoles
} from '../middlewares/auth.middleware.js'
import { getMetricsSummaryController } from '../controllers/metric.controller.js'

export const metricRoutes = Router()

metricRoutes.get(
  '/summary',
  authenticateToken,
  authorizeRoles(3),
  getMetricsSummaryController
)
