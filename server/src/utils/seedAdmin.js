import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Admin from '../models/Admin.js'
import { connectDB } from '../config/db.js'

dotenv.config()

const seedAdmin = async () => {
  try {
    await connectDB()

    const adminEmail = 'admin@lookshub.com'
    const adminExists = await Admin.findOne({ email: adminEmail })

    if (adminExists) {
      console.log(`Admin account with email "${adminEmail}" already exists. Skipping seeding.`)
      process.exit(0)
    }

    await Admin.create({
      name: "Look's Hub Admin",
      email: adminEmail,
      password: 'admin@123',
      role: 'admin'
    })

    console.log(`Successfully created the first admin account:`)
    console.log(`- Email: ${adminEmail}`)
    console.log(`- Password: admin@123`)

    process.exit(0)
  } catch (error) {
    console.error('Error seeding admin account:', error)
    process.exit(1)
  }
}

seedAdmin()
