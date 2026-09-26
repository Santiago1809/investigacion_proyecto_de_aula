import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { authRoutes } from './routes/auth.route.js'
import { requestRoutes } from './routes/request.route.js'
import { categoryRoutes } from './routes/category.route.js'
const app = express()

app.use(express.json())
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
}

app.use(cors(corsOptions))
app.use(morgan('dev'))
app.use('/auth', authRoutes)
app.use('/request', requestRoutes)
app.use('/categories', categoryRoutes)

export { app }
