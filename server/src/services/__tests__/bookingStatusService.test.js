/**
 * Unit Tests for Booking Status Evaluator Service
 * 
 * Tests all status transition rules, edge cases,
 * and terminal status protection.
 */

import {
  evaluateBookingStatus,
  evaluateBookingsArray,
  isTerminalStatus,
  getAppointmentDateTime,
  getAppointmentEndDateTime,
  BOOKING_STATUSES,
  TERMINAL_STATUSES,
  ACTIVE_STATUSES,
  ALL_STATUS_VALUES,
} from '../bookingStatusService.js'

// ─── Test Helpers ─────────────────────────────────────────

/** Create a booking stub with sensible defaults */
const makeBooking = (overrides = {}) => ({
  date: '2026-06-15',
  time: '11:00',
  status: 'pending',
  durationMinutes: 60,
  ...overrides,
})

/** Create a Date in IST timezone */
const istDate = (dateStr, timeStr) => {
  return new Date(`${dateStr}T${timeStr}:00+05:30`)
}

// ─── Constants ────────────────────────────────────────────

describe('Constants', () => {
  test('ALL_STATUS_VALUES has 8 entries', () => {
    expect(ALL_STATUS_VALUES).toHaveLength(8)
  })

  test('TERMINAL_STATUSES includes completed, cancelled variants, rejected, expired, no_show', () => {
    expect(TERMINAL_STATUSES.has('completed')).toBe(true)
    expect(TERMINAL_STATUSES.has('cancelled_by_user')).toBe(true)
    expect(TERMINAL_STATUSES.has('cancelled_by_salon')).toBe(true)
    expect(TERMINAL_STATUSES.has('rejected')).toBe(true)
    expect(TERMINAL_STATUSES.has('expired')).toBe(true)
    expect(TERMINAL_STATUSES.has('no_show')).toBe(true)
  })

  test('TERMINAL_STATUSES does NOT include pending or confirmed', () => {
    expect(TERMINAL_STATUSES.has('pending')).toBe(false)
    expect(TERMINAL_STATUSES.has('confirmed')).toBe(false)
  })

  test('ACTIVE_STATUSES is [pending, confirmed]', () => {
    expect(ACTIVE_STATUSES).toEqual(['pending', 'confirmed'])
  })
})

// ─── isTerminalStatus ─────────────────────────────────────

describe('isTerminalStatus', () => {
  test.each([
    ['completed', true],
    ['cancelled_by_user', true],
    ['cancelled_by_salon', true],
    ['rejected', true],
    ['expired', true],
    ['no_show', true],
    ['pending', false],
    ['confirmed', false],
  ])('isTerminalStatus("%s") = %s', (status, expected) => {
    expect(isTerminalStatus(status)).toBe(expected)
  })
})

// ─── getAppointmentDateTime ───────────────────────────────

describe('getAppointmentDateTime', () => {
  test('returns a valid Date for valid booking', () => {
    const booking = makeBooking({ date: '2026-06-15', time: '11:00' })
    const dt = getAppointmentDateTime(booking)
    expect(dt).toBeInstanceOf(Date)
    expect(dt.getTime()).not.toBeNaN()
  })

  test('returns null for missing date', () => {
    const booking = makeBooking({ date: undefined, time: '11:00' })
    expect(getAppointmentDateTime(booking)).toBeNull()
  })

  test('returns null for missing time', () => {
    const booking = makeBooking({ date: '2026-06-15', time: undefined })
    expect(getAppointmentDateTime(booking)).toBeNull()
  })

  test('returns null for null booking', () => {
    expect(getAppointmentDateTime(null)).toBeNull()
  })
})

// ─── getAppointmentEndDateTime ────────────────────────────

describe('getAppointmentEndDateTime', () => {
  test('returns start + durationMinutes', () => {
    const booking = makeBooking({ date: '2026-06-15', time: '11:00', durationMinutes: 90 })
    const end = getAppointmentEndDateTime(booking)
    const start = getAppointmentDateTime(booking)
    expect(end.getTime() - start.getTime()).toBe(90 * 60 * 1000)
  })

  test('defaults to 60 min when no duration specified', () => {
    const booking = makeBooking({ date: '2026-06-15', time: '11:00', durationMinutes: undefined, duration: undefined })
    const end = getAppointmentEndDateTime(booking)
    const start = getAppointmentDateTime(booking)
    expect(end.getTime() - start.getTime()).toBe(60 * 60 * 1000)
  })

  test('parses duration string (e.g. "90 Min")', () => {
    const booking = makeBooking({ date: '2026-06-15', time: '11:00', durationMinutes: undefined, duration: '90 Min' })
    const end = getAppointmentEndDateTime(booking)
    const start = getAppointmentDateTime(booking)
    expect(end.getTime() - start.getTime()).toBe(90 * 60 * 1000)
  })
})

// ─── evaluateBookingStatus: PENDING transitions ──────────

describe('evaluateBookingStatus — PENDING', () => {
  test('PENDING + future appointment → stays PENDING', () => {
    const booking = makeBooking({ status: 'pending', date: '2026-12-25', time: '11:00' })
    const now = istDate('2026-06-10', '12:00')
    expect(evaluateBookingStatus(booking, now)).toBe('pending')
  })

  test('PENDING + past appointment → EXPIRED', () => {
    const booking = makeBooking({ status: 'pending', date: '2026-06-05', time: '11:00' })
    const now = istDate('2026-06-10', '12:00')
    expect(evaluateBookingStatus(booking, now)).toBe('expired')
  })

  test('PENDING + appointment exactly at now → EXPIRED (boundary)', () => {
    const booking = makeBooking({ status: 'pending', date: '2026-06-10', time: '12:00' })
    // Now is exactly 2026-06-10 12:00:01 IST → past
    const now = new Date(istDate('2026-06-10', '12:00').getTime() + 1000)
    expect(evaluateBookingStatus(booking, now)).toBe('expired')
  })

  test('PENDING + appointment 1 second in future → stays PENDING', () => {
    const booking = makeBooking({ status: 'pending', date: '2026-06-10', time: '12:00' })
    const now = new Date(istDate('2026-06-10', '12:00').getTime() - 1000)
    expect(evaluateBookingStatus(booking, now)).toBe('pending')
  })
})

// ─── evaluateBookingStatus: CONFIRMED transitions ────────

describe('evaluateBookingStatus — CONFIRMED', () => {
  test('CONFIRMED + future appointment → stays CONFIRMED', () => {
    const booking = makeBooking({ status: 'confirmed', date: '2026-12-25', time: '11:00' })
    const now = istDate('2026-06-10', '12:00')
    expect(evaluateBookingStatus(booking, now)).toBe('confirmed')
  })

  test('CONFIRMED + appointment in progress (within duration) → stays CONFIRMED', () => {
    const booking = makeBooking({ status: 'confirmed', date: '2026-06-10', time: '11:00', durationMinutes: 60 })
    // Now = 11:30 IST → appointment runs 11:00–12:00, so still in progress
    const now = istDate('2026-06-10', '11:30')
    expect(evaluateBookingStatus(booking, now)).toBe('confirmed')
  })

  test('CONFIRMED + appointment ended (past end time) → NO_SHOW', () => {
    const booking = makeBooking({ status: 'confirmed', date: '2026-06-05', time: '11:00', durationMinutes: 60 })
    const now = istDate('2026-06-10', '12:00')
    expect(evaluateBookingStatus(booking, now)).toBe('no_show')
  })

  test('CONFIRMED + exactly at end time → stays CONFIRMED (boundary: not yet past)', () => {
    const booking = makeBooking({ status: 'confirmed', date: '2026-06-10', time: '11:00', durationMinutes: 60 })
    // Now is exactly the end time (12:00 IST) → appointmentEnd === now → NOT past
    const now = istDate('2026-06-10', '12:00')
    expect(evaluateBookingStatus(booking, now)).toBe('confirmed')
  })

  test('CONFIRMED + 1 second after end time → NO_SHOW', () => {
    const booking = makeBooking({ status: 'confirmed', date: '2026-06-10', time: '11:00', durationMinutes: 60 })
    const now = new Date(istDate('2026-06-10', '12:00').getTime() + 1000)
    expect(evaluateBookingStatus(booking, now)).toBe('no_show')
  })
})

// ─── evaluateBookingStatus: Terminal statuses ────────────

describe('evaluateBookingStatus — Terminal statuses never change', () => {
  const pastDate = '2026-01-01'
  const pastTime = '09:00'

  test.each([
    'completed',
    'cancelled_by_user',
    'cancelled_by_salon',
    'rejected',
    'expired',
    'no_show',
  ])('%s booking with past date remains %s', (status) => {
    const booking = makeBooking({ status, date: pastDate, time: pastTime })
    const now = istDate('2026-06-10', '12:00')
    expect(evaluateBookingStatus(booking, now)).toBe(status)
  })

  test('COMPLETED booking NEVER becomes EXPIRED', () => {
    const booking = makeBooking({ status: 'completed', date: '2020-01-01', time: '09:00' })
    const now = istDate('2026-06-10', '12:00')
    expect(evaluateBookingStatus(booking, now)).toBe('completed')
  })

  test('CANCELLED_BY_USER booking NEVER becomes EXPIRED', () => {
    const booking = makeBooking({ status: 'cancelled_by_user', date: '2020-01-01', time: '09:00' })
    const now = istDate('2026-06-10', '12:00')
    expect(evaluateBookingStatus(booking, now)).toBe('cancelled_by_user')
  })

  test('CANCELLED_BY_SALON booking NEVER becomes NO_SHOW', () => {
    const booking = makeBooking({ status: 'cancelled_by_salon', date: '2020-01-01', time: '09:00' })
    const now = istDate('2026-06-10', '12:00')
    expect(evaluateBookingStatus(booking, now)).toBe('cancelled_by_salon')
  })
})

// ─── evaluateBookingStatus: Edge cases ───────────────────

describe('evaluateBookingStatus — Edge cases', () => {
  test('null booking returns null', () => {
    expect(evaluateBookingStatus(null)).toBeNull()
  })

  test('booking with no date/time returns original status', () => {
    const booking = { status: 'pending', date: null, time: null }
    expect(evaluateBookingStatus(booking)).toBe('pending')
  })

  test('booking with invalid date returns original status', () => {
    const booking = makeBooking({ status: 'pending', date: 'invalid', time: '11:00' })
    expect(evaluateBookingStatus(booking)).toBe('pending')
  })
})

// ─── evaluateBookingsArray ───────────────────────────────

describe('evaluateBookingsArray', () => {
  test('returns empty array for non-array input', () => {
    expect(evaluateBookingsArray(null)).toEqual([])
    expect(evaluateBookingsArray(undefined)).toEqual([])
    expect(evaluateBookingsArray('not array')).toEqual([])
  })

  test('evaluates each booking and sets _originalStatus', () => {
    const now = istDate('2026-06-10', '12:00')
    const bookings = [
      makeBooking({ status: 'pending', date: '2026-06-05', time: '11:00' }), // → expired
      makeBooking({ status: 'confirmed', date: '2026-12-25', time: '11:00' }), // → stays confirmed
      makeBooking({ status: 'completed', date: '2026-01-01', time: '09:00' }), // → stays completed
    ]

    const results = evaluateBookingsArray(bookings, now)

    expect(results).toHaveLength(3)
    expect(results[0].status).toBe('expired')
    expect(results[0]._originalStatus).toBe('pending')
    expect(results[1].status).toBe('confirmed')
    expect(results[1]._originalStatus).toBe('confirmed')
    expect(results[2].status).toBe('completed')
    expect(results[2]._originalStatus).toBe('completed')
  })

  test('handles Mongoose documents with toObject()', () => {
    const now = istDate('2026-06-10', '12:00')
    const mongooseDoc = {
      ...makeBooking({ status: 'pending', date: '2026-06-05', time: '11:00' }),
      toObject: function () {
        const { toObject, ...rest } = this
        return rest
      },
    }

    const results = evaluateBookingsArray([mongooseDoc], now)
    expect(results[0].status).toBe('expired')
    expect(results[0]._originalStatus).toBe('pending')
  })
})
