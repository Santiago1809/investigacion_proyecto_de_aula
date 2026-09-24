import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { authRoutes } from './routes/auth.route.js'
import { requestRoutes } from './routes/request.route.js'
const app = express()

app.use(express.json())
app.use(cors({ origin: 'http://localhost:3000' }))
app.use(morgan('dev'))
app.use('/auth', authRoutes)
app.use('/request', requestRoutes)

export { app }
