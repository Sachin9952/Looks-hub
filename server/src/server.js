import app from './app.js'
import { connectDB } from './config/db.js'
import { startBookingScheduler } from './services/bookingScheduler.js'

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await connectDB()

    // Start the background booking status scheduler (every 5 min)
    startBookingScheduler()

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
