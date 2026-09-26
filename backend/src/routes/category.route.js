import { Router } from 'express'
import { authenticateToken } from '../middlewares/auth.middleware.js'
import { getCategoriesController } from '../controllers/category.controller.js'

export const categoryRoutes = Router()

categoryRoutes.get('/', authenticateToken, getCategoriesController)
