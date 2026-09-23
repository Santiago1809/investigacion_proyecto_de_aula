import { Router } from 'express'
import {
  loginController,
  registerController
} from '../controllers/auth.controller.js'

export const authRoutes = Router()

authRoutes.post('/login', loginController)
authRoutes.post('/register', registerController)
