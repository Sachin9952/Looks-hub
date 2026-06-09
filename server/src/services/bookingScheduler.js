/**
 * Background Booking Status Scheduler
 * 
 * Runs every 5 minutes via node-cron to persist automatic
 * status transitions to the database:
 *   - PENDING  → EXPIRED  (appointment time passed, never confirmed)
 *   - CONFIRMED → NO_SHOW  (appointment ended, never completed)
 * 
 * This is a safety net. The real-time evaluator in
 * bookingStatusService.js handles read-time evaluation,
 * so the UI is always correct even between scheduler runs.
 * 
 * Idempotent: safe to run at any frequency. Only updates
 * bookings that are currently in PENDING or CONFIRMED status.
 */

import cron from 'node-cron'
import Booking from '../models/Booking.js'
import { BOOKING_STATUSES } from './bookingStatusService.js'

/**
 * Process expired pending bookings.
 * A PENDING booking whose appointment start time has passed
 * means the salon never confirmed it.
 */
const expirePendingBookings = async (now) => {
  // We need to find pending bookings where date+time < now.
  // Since date and time are stored as separate strings,
  // we query all pending bookings and filter in-memory.
  // For a small-to-medium salon this is fine.
  const pendingBookings = await Booking.find({
    status: BOOKING_STATUSES.PENDING,
  })

  let expiredCount = 0

  for (const booking of pendingBookings) {
    const appointmentStr = `${booking.date}T${booking.time}:00+05:30`
    const appointmentTime = new Date(appointmentStr)

    if (isNaN(appointmentTime.getTime())) continue
    if (appointmentTime >= now) continue

    booking.status = BOOKING_STATUSES.EXPIRED
    booking.statusHistory.push({
      status: 'Expired',
      changedAt: now,
      changedBy: 'System (Auto)',
    })
    await booking.save()
    expiredCount++
  }

  return expiredCount
}

/**
 * Process no-show confirmed bookings.
 * A CONFIRMED booking whose appointment end time (start + duration)
 * has passed means the customer either didn't show up or the salon
 * forgot to mark it as completed.
 */
const markNoShowBookings = async (now) => {
  const confirmedBookings = await Booking.find({
    status: BOOKING_STATUSES.CONFIRMED,
  })

  let noShowCount = 0

  for (const booking of confirmedBookings) {
    const appointmentStr = `${booking.date}T${booking.time}:00+05:30`
    const appointmentStart = new Date(appointmentStr)

    if (isNaN(appointmentStart.getTime())) continue

    // Grace: use appointment end time (start + service duration)
    const durationMins = booking.durationMinutes || 60
    const appointmentEnd = new Date(appointmentStart.getTime() + durationMins * 60 * 1000)

    if (appointmentEnd >= now) continue

    booking.status = BOOKING_STATUSES.NO_SHOW
    booking.statusHistory.push({
      status: 'Marked as No-Show',
      changedAt: now,
      changedBy: 'System (Auto)',
    })
    await booking.save()
    noShowCount++
  }

  return noShowCount
}

/**
 * Run one cycle of the scheduler.
 * Exported for testing / manual invocation.
 */
export const runBookingStatusJob = async () => {
  const now = new Date()
  const startTime = Date.now()

  try {
    const [expiredCount, noShowCount] = await Promise.all([
      expirePendingBookings(now),
      markNoShowBookings(now),
    ])

    const elapsed = Date.now() - startTime

    if (expiredCount > 0 || noShowCount > 0) {
      console.log(
        `[BookingScheduler] ✓ Processed in ${elapsed}ms — ` +
        `Expired: ${expiredCount}, No-Show: ${noShowCount}`
      )
    }
  } catch (error) {
    console.error('[BookingScheduler] ✗ Error during status update:', error.message)
  }
}

/**
 * Start the cron scheduler.
 * Called once during server boot after DB connection is established.
 */
export const startBookingScheduler = () => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    runBookingStatusJob()
  })

  // Also run immediately on startup to catch any stale bookings
  runBookingStatusJob()

  console.log('[BookingScheduler] ⏱ Started — runs every 5 minutes')
}
