import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import dotenv from 'dotenv'

import authRoutes from './src/routes/auth.routes.js'
import invoiceRoutes from './src/routes/invoice.routes.js'
import approvalRoutes from './src/routes/approval.routes.js'
import dashboardRoutes from './src/routes/dashboard.routes.js'
import profileRoutes from './src/routes/profile.routes.js'
import notificationRoutes from './src/routes/notification.routes.js'
import { errorHandler } from './src/middleware/error.middleware.js'
import { errorResponse } from './src/utils/apiResponse.js'

dotenv.config()

const app = express()

// Security & Logging Middlewares
app.use(helmet())
app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
)
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'InvoiceFlow Backend', timestamp: new Date() })
})

// Application REST API Routes
app.use('/api/auth', authRoutes)
app.use('/api/invoices', invoiceRoutes)
app.use('/api/approvals', approvalRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/notifications', notificationRoutes)

// 404 Handler
app.use((req, res) => {
  errorResponse(res, 404, `Route ${req.originalUrl} not found`)
})

// Centralized Error Handling Middleware
app.use(errorHandler)

export default app
