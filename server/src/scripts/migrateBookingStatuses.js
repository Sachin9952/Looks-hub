/**
 * One-time Migration Script: Booking Status Migration
 * 
 * Migrates existing bookings to the new status system:
 *   1. 'cancelled' → 'cancelled_by_user' (conservative assumption)
 *   2. 'pending' + past date → 'expired'
 *   3. 'confirmed' + past date → 'no_show'
 * 
 * Idempotent — safe to run multiple times.
 * 
 * Usage:
 *   node src/scripts/migrateBookingStatuses.js
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

// Import after dotenv so env vars are available
import Booking from '../models/Booking.js'
import { BOOKING_STATUSES } from '../services/bookingStatusService.js'

const MONGO_URI = process.env.MONGO_URI

const migrate = async () => {
  console.log('═══════════════════════════════════════════')
  console.log(' Booking Status Migration')
  console.log('═══════════════════════════════════════════')

  if (!MONGO_URI) {
    console.error('✗ MONGO_URI is not set in environment variables.')
    process.exit(1)
  }

  await mongoose.connect(MONGO_URI)
  console.log('✓ Connected to MongoDB\n')

  const now = new Date()
  let totalMigrated = 0

  // ──────────────────────────────────────
  // 1. Migrate 'cancelled' → 'cancelled_by_user'
  // ──────────────────────────────────────
  const cancelledResult = await Booking.updateMany(
    { status: 'cancelled' },
    {
      $set: { status: BOOKING_STATUSES.CANCELLED_BY_USER },
      $push: {
        statusHistory: {
          status: 'Migrated: cancelled → cancelled_by_user',
          changedAt: now,
          changedBy: 'Migration Script',
        },
      },
    }
  )
  console.log(`[1/3] cancelled → cancelled_by_user: ${cancelledResult.modifiedCount} bookings`)
  totalMigrated += cancelledResult.modifiedCount

  // ──────────────────────────────────────
  // 2. Expire stale PENDING bookings
  // ──────────────────────────────────────
  const pendingBookings = await Booking.find({ status: BOOKING_STATUSES.PENDING })
  let expiredCount = 0

  for (const booking of pendingBookings) {
    const appointmentStr = `${booking.date}T${booking.time}:00+05:30`
    const appointmentTime = new Date(appointmentStr)
    if (isNaN(appointmentTime.getTime()) || appointmentTime >= now) continue

    booking.status = BOOKING_STATUSES.EXPIRED
    booking.statusHistory.push({
      status: 'Migrated: pending → expired',
      changedAt: now,
      changedBy: 'Migration Script',
    })
    await booking.save()
    expiredCount++
  }
  console.log(`[2/3] pending → expired: ${expiredCount} bookings`)
  totalMigrated += expiredCount

  // ──────────────────────────────────────
  // 3. Mark stale CONFIRMED bookings as NO_SHOW
  // ──────────────────────────────────────
  const confirmedBookings = await Booking.find({ status: BOOKING_STATUSES.CONFIRMED })
  let noShowCount = 0

  for (const booking of confirmedBookings) {
    const appointmentStr = `${booking.date}T${booking.time}:00+05:30`
    const appointmentStart = new Date(appointmentStr)
    if (isNaN(appointmentStart.getTime())) continue

    const durationMins = booking.durationMinutes || 60
    const appointmentEnd = new Date(appointmentStart.getTime() + durationMins * 60 * 1000)
    if (appointmentEnd >= now) continue

    booking.status = BOOKING_STATUSES.NO_SHOW
    booking.statusHistory.push({
      status: 'Migrated: confirmed → no_show',
      changedAt: now,
      changedBy: 'Migration Script',
    })
    await booking.save()
    noShowCount++
  }
  console.log(`[3/3] confirmed → no_show: ${noShowCount} bookings`)
  totalMigrated += noShowCount

  // ──────────────────────────────────────
  console.log(`\n═══════════════════════════════════════════`)
  console.log(` Total migrated: ${totalMigrated} bookings`)
  console.log(`═══════════════════════════════════════════`)

  await mongoose.disconnect()
  console.log('✓ Disconnected from MongoDB')
  process.exit(0)
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
