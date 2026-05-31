import Booking from '../models/Booking.js'
import Service from '../models/Service.js'
import asyncHandler from '../utils/asyncHandler.js'
import { sendSuccess, sendError } from '../utils/responseHandler.js'

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Public
export const createBooking = asyncHandler(async (req, res) => {
  const { customerName, phone, email, service, stylist, date, time, notes, price, duration, serviceId, barberId, userId } = req.body

  // Try to lookup service to auto-fill duration/price if not provided
  let finalPrice = price
  let finalDuration = duration
  let finalServiceId = serviceId

  if (service && (!finalPrice || !finalDuration || !finalServiceId)) {
    const foundService = await Service.findOne({ name: { $regex: new RegExp(`^${service}$`, 'i') } })
    if (foundService) {
      if (!finalPrice) finalPrice = foundService.price
      if (!finalDuration) finalDuration = foundService.duration
      if (!finalServiceId) finalServiceId = foundService._id
    }
  }

  const booking = await Booking.create({
    customerName,
    phone,
    email,
    service,
    serviceId: finalServiceId,
    barberId,
    stylist,
    userId,
    price: finalPrice || 1200, // Default price if not found
    duration: finalDuration || '60 Min', // Default duration
    date,
    time,
    notes
  })

  sendSuccess(res, booking, 'Booking created successfully', 201)
})

// @desc    Get bookings (Admin gets all, Users filter by phone/email/userId)
// @route   GET /api/bookings
// @access  Public / Private
export const getBookings = asyncHandler(async (req, res) => {
  const { phone, email, userId } = req.query

  // If search query is provided, return matching bookings
  if (phone || email || userId) {
    const query = { $or: [] }
    if (phone) query.$or.push({ phone: phone.trim() })
    if (email) query.$or.push({ email: email.trim().toLowerCase() })
    if (userId) query.$or.push({ userId: userId.trim() })

    const bookings = await Booking.find(query).sort({ date: -1, time: -1 })
    return sendSuccess(res, bookings, 'Bookings retrieved successfully')
  }

  // Otherwise, require Admin login
  // Note: auth middleware would have set req.admin if protectAdmin passed
  if (req.admin) {
    const bookings = await Booking.find({}).sort({ createdAt: -1 })
    return sendSuccess(res, bookings, 'Bookings retrieved successfully')
  }

  return sendError(res, 'Query parameter (phone, email, or userId) required to retrieve bookings', 400)
})

// @desc    Get a single booking by ID (Public lookup)
// @route   GET /api/bookings/:id
// @access  Public
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)

  if (!booking) {
    return sendError(res, 'Booking not found', 404)
  }

  sendSuccess(res, booking, 'Booking retrieved successfully')
})

// @desc    Reschedule a booking
// @route   PATCH /api/bookings/reschedule
// @access  Public
export const rescheduleBooking = asyncHandler(async (req, res) => {
  const { id, date, time } = req.body

  if (!id || !date || !time) {
    return sendError(res, 'Booking ID, new date, and new time are required', 400)
  }

  const booking = await Booking.findById(id)
  if (!booking) {
    return sendError(res, 'Booking not found', 404)
  }

  // Prevent rescheduling cancelled/completed appointments
  if (booking.status === 'cancelled') {
    return sendError(res, 'Cancelled appointments cannot be rescheduled.', 400)
  }
  if (booking.status === 'completed') {
    return sendError(res, 'Completed appointments cannot be rescheduled.', 400)
  }

  // Verify rescheduleCount < 2
  if ((booking.rescheduleCount || 0) >= 2) {
    return sendError(res, 'You have reached the maximum number of allowed reschedules. Please contact the salon directly.', 400)
  }

  // Verify appointment is at least 4 hours away
  const appointmentTime = new Date(`${booking.date}T${booking.time}`)
  const now = new Date()
  const diffHours = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (diffHours < 4) {
    return sendError(res, 'Appointments can only be rescheduled at least 4 hours before the scheduled time.', 400)
  }

  booking.date = date
  booking.time = time
  booking.rescheduleCount = (booking.rescheduleCount || 0) + 1
  // status is preserved and not updated
  await booking.save()

  sendSuccess(res, booking, 'Booking rescheduled successfully')
})

// @desc    Cancel a booking
// @route   PATCH /api/bookings/cancel
// @access  Public
export const cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.body

  if (!id) {
    return sendError(res, 'Booking ID is required', 400)
  }

  const booking = await Booking.findById(id)
  if (!booking) {
    return sendError(res, 'Booking not found', 404)
  }

  if (booking.status === 'completed') {
    return sendError(res, 'Cannot cancel a completed appointment', 400)
  }

  booking.status = 'cancelled'
  await booking.save()

  sendSuccess(res, booking, 'Booking cancelled successfully')
})

// @desc    Submit review for completed booking
// @route   POST /api/bookings/review
// @access  Public
export const reviewBooking = asyncHandler(async (req, res) => {
  const { id, rating, feedback } = req.body

  if (!id || !rating) {
    return sendError(res, 'Booking ID and rating (1-5) are required', 400)
  }

  const booking = await Booking.findById(id)
  if (!booking) {
    return sendError(res, 'Booking not found', 404)
  }

  // Set review
  booking.review = {
    rating: Number(rating),
    feedback: feedback || ''
  }
  
  await booking.save()

  sendSuccess(res, booking, 'Review submitted successfully')
})

// @desc    Update booking status (Admin route)
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
