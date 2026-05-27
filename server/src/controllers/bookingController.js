import Booking from '../models/Booking.js'
import asyncHandler from '../utils/asyncHandler.js'
import { sendSuccess, sendError } from '../utils/responseHandler.js'

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Public
export const createBooking = asyncHandler(async (req, res) => {
  const { customerName, phone, email, service, stylist, date, time, notes } = req.body

  const booking = await Booking.create({
    customerName,
    phone,
    email,
    service,
    stylist,
    date,
    time,
    notes
  })

  sendSuccess(res, booking, 'Booking created successfully', 201)
})

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private (Admin)
export const getBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({}).sort({ createdAt: -1 })
  sendSuccess(res, bookings, 'Bookings retrieved successfully')
})

// @desc    Get a single booking by ID
// @route   GET /api/bookings/:id
// @access  Private (Admin)
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)

  if (!booking) {
    return sendError(res, 'Booking not found', 404)
  }

  sendSuccess(res, booking, 'Booking retrieved successfully')
})

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private (Admin)
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body

  if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
    return sendError(res, 'Invalid status update requested', 400)
  }

  const booking = await Booking.findById(req.params.id)

  if (!booking) {
    return sendError(res, 'Booking not found', 404)
  }

  booking.status = status
  await booking.save()

  sendSuccess(res, booking, `Booking status updated to ${status}`)
})

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private (Admin)
export const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)

  if (!booking) {
    return sendError(res, 'Booking not found', 404)
  }

  await booking.deleteOne()
  sendSuccess(res, null, 'Booking deleted successfully')
})
