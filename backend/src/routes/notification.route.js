import { Router } from 'express'
import { authenticateToken } from '../middlewares/auth.middleware.js'
import { getNotificationsController } from '../controllers/notification.controller.js'

export const notificationRoutes = Router()

notificationRoutes.get('/', authenticateToken, getNotificationsController)
