import mongoose from 'mongoose'

export const connectDB = async () => {
  try {
    const dbUri = process.env.MONGO_URI || process.env.MONGODB_URI
    if (!dbUri) {
      throw new Error('Database connection string (MONGO_URI or MONGODB_URI) is missing in environment variables.')
    }
    const conn = await mongoose.connect(dbUri)
    console.log(`MongoDB connected: ${conn.connection.host}`)
    return conn
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`)
    throw error
  }
}
