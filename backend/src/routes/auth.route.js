import { Router } from 'express'
import {
  loginController,
  refreshController,
  registerController
} from '../controllers/auth.controller.js'

export const authRoutes = Router()

authRoutes.post('/login', loginController)
authRoutes.post('/register', registerController)
authRoutes.post('/refresh', refreshController)
