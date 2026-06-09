/**
 * Centralized Booking Status Evaluator
 * 
 * All booking status logic lives here. No status decisions
 * should be made outside this module.
 * 
 * The evaluator computes the "effective" status of a booking
 * based on its stored status and the current time. This ensures
 * that stale PENDING and CONFIRMED bookings are correctly shown
 * as EXPIRED or NO_SHOW in all API responses without waiting
 * for the background scheduler to persist the change.
 */

// ─── Status Constants ───────────────────────────────────────
export const BOOKING_STATUSES = Object.freeze({
  PENDING:            'pending',
  CONFIRMED:          'confirmed',
  COMPLETED:          'completed',
  CANCELLED_BY_USER:  'cancelled_by_user',
  CANCELLED_BY_SALON: 'cancelled_by_salon',
  REJECTED:           'rejected',
  EXPIRED:            'expired',
  NO_SHOW:            'no_show',
})

/** All valid status values for schema enum validation */
export const ALL_STATUS_VALUES = Object.values(BOOKING_STATUSES)

/** Statuses that are final — never automatically transitioned */
export const TERMINAL_STATUSES = new Set([
  BOOKING_STATUSES.COMPLETED,
  BOOKING_STATUSES.CANCELLED_BY_USER,
  BOOKING_STATUSES.CANCELLED_BY_SALON,
  BOOKING_STATUSES.REJECTED,
  BOOKING_STATUSES.EXPIRED,
  BOOKING_STATUSES.NO_SHOW,
])

/** Statuses that count as "active" for booking limits & conflict checks */
export const ACTIVE_STATUSES = [
  BOOKING_STATUSES.PENDING,
  BOOKING_STATUSES.CONFIRMED,
]

// ─── Configurable Business Rules ────────────────────────────

/** Hours before appointment when cancellation is blocked */
export const ALLOW_CANCEL_UNTIL_HOURS = 1

/** Hours before appointment when reschedule is blocked */
export const ALLOW_RESCHEDULE_UNTIL_HOURS = 2

// ─── Date Utilities (IST-aware) ─────────────────────────────

/**
 * Build a proper Date object from the booking's date + time strings.
 * Treats them as Asia/Kolkata (IST) since the salon is in Indore.
 */
export const getAppointmentDateTime = (booking) => {
  if (!booking?.date || !booking?.time) return null

  // booking.date = "YYYY-MM-DD", booking.time = "HH:mm"
  // We treat these as IST (UTC+05:30)
  const isoStr = `${booking.date}T${booking.time}:00+05:30`
  const dt = new Date(isoStr)
  return isNaN(dt.getTime()) ? null : dt
}

/**
 * Get the appointment end time = start + service duration.
 * Used for the NO_SHOW grace window — a confirmed booking shouldn't
 * become NO_SHOW while the service could still be in progress.
 */
export const getAppointmentEndDateTime = (booking) => {
  const start = getAppointmentDateTime(booking)
  if (!start) return null

  const durationMins = getBookingDurationMinutes(booking)
  return new Date(start.getTime() + durationMins * 60 * 1000)
}

/** Extract duration in minutes from a booking document */
const getBookingDurationMinutes = (booking) => {
  if (booking.durationMinutes) return booking.durationMinutes
  if (booking.duration) {
    const match = booking.duration.match(/(\d+)/)
    if (match) return parseInt(match[1], 10)
  }
  return 60 // default
}

// ─── Core Evaluator ─────────────────────────────────────────

/**
 * Compute the effective status of a single booking.
 * This is a **pure function** (aside from `new Date()`) — safe to
 * call from any context without side effects.
 *
 * @param {Object} booking - Mongoose document or plain object
 * @param {Date}   [now]   - Override current time (useful for tests)
 * @returns {string} The effective booking status
 */
export const evaluateBookingStatus = (booking, now = new Date()) => {
  if (!booking) return null

  const currentStatus = booking.status

  // Terminal statuses are never overridden
  if (TERMINAL_STATUSES.has(currentStatus)) {
    return currentStatus
  }

  const appointmentStart = getAppointmentDateTime(booking)
  if (!appointmentStart) return currentStatus // can't evaluate without date

  // PENDING + past appointment time → EXPIRED
  if (currentStatus === BOOKING_STATUSES.PENDING && appointmentStart < now) {
    return BOOKING_STATUSES.EXPIRED
  }

  // CONFIRMED + past appointment end time → NO_SHOW
  if (currentStatus === BOOKING_STATUSES.CONFIRMED) {
    const appointmentEnd = getAppointmentEndDateTime(booking)
    if (appointmentEnd && appointmentEnd < now) {
      return BOOKING_STATUSES.NO_SHOW
    }
  }

  return currentStatus
}

/**
 * Check if a status is terminal (final, never auto-transitions).
 */
export const isTerminalStatus = (status) => TERMINAL_STATUSES.has(status)

/**
 * Evaluate an array of bookings and attach the effective status.
 * Returns plain objects (not Mongoose documents) with an
 * `effectiveStatus` field, and the `status` field overwritten.
 *
 * @param {Array}  bookings - Array of booking docs or plain objects
 * @param {Date}   [now]    - Override current time
 * @returns {Array} Bookings with evaluated status
 */
export const evaluateBookingsArray = (bookings, now = new Date()) => {
  if (!Array.isArray(bookings)) return []

  return bookings.map((booking) => {
    const plain = typeof booking.toObject === 'function' ? booking.toObject() : { ...booking }
    const originalStatus = plain.status
    const effectiveStatus = evaluateBookingStatus(plain, now)
    return {
      ...plain,
      status: effectiveStatus,
      _originalStatus: originalStatus, // preserve for debugging
    }
  })
}
