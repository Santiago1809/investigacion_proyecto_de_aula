import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { authRoutes } from './routes/auth.route.js'
import { requestRoutes } from './routes/request.route.js'
import { categoryRoutes } from './routes/category.route.js'
import { userRoutes } from './routes/user.route.js'
import { notificationRoutes } from './routes/notification.route.js'
import { metricRoutes } from './routes/metric.route.js'
import { reportRoutes } from './routes/report.route.js'
import { auditRoutes } from './routes/audit.route.js'
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
app.use('/users', userRoutes)
app.use('/notifications', notificationRoutes)
app.use('/metrics', metricRoutes)
app.use('/reports', reportRoutes)
app.use('/audit', auditRoutes)

export { app }
