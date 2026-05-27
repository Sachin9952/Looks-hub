import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Import routes
import authRoutes from './routes/authRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js'
import serviceRoutes from './routes/serviceRoutes.js'
import galleryRoutes from './routes/galleryRoutes.js'
import testimonialRoutes from './routes/testimonialRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'

// Import error middleware
import { errorHandler } from './middleware/errorMiddleware.js'

dotenv.config()

const app = express()

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:8080',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080'
].filter(Boolean)

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    
    // Allow standard local and network IPs on any port
    const isLocalOrNetworkIp = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin)
    
    if (allowedOrigins.includes(origin) || isLocalOrNetworkIp) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Mount Routes
app.use('/api/auth', authRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/gallery', galleryRoutes)
app.use('/api/testimonials', testimonialRoutes)
app.use('/api/dashboard', dashboardRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' })
})

// Centralized error handler
app.use(errorHandler)

export default app
