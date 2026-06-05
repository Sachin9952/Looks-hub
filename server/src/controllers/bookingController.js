import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import Booking from '../models/Booking.js'
import Service from '../models/Service.js'
import Artist from '../models/Artist.js'
import Admin from '../models/Admin.js'
import asyncHandler from '../utils/asyncHandler.js'
import { sendSuccess, sendError } from '../utils/responseHandler.js'
import lockInstance from '../utils/lock.js'

// Helper conversion functions
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

const getBookingDurationMinutes = (booking) => {
  if (booking.durationMinutes) return booking.durationMinutes
  if (booking.duration) {
    const match = booking.duration.match(/(\d+)/)
    if (match) return parseInt(match[1], 10)
  }
  return 60
}

const serviceIdMap = {
  haircut: "Haircut & Styling",
  spa: "Hair Spa Treatment",
  color: "Hair Coloring",
  bridal: "Bridal & Event Makeup",
  facial: "Signature Facial",
  shaving: "Professional Shaving & Grooming",
  grooming: "Men's Grooming Package"
}

const artistIdMap = {
  "1": "Professional Team",
  "2": "Expert Barbers",
  "3": "Skilled Colorists",
  "4": "Estheticians"
}

const isAdminRequest = async (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const admin = await Admin.findById(decoded.id)
      if (admin) return true
    } catch (error) {
      // Ignore token verification errors
    }
  }
  return false
}

const isLessThanTwoHoursAway = (dateStr, timeStr) => {
  const apptTime = new Date(`${dateStr}T${timeStr}`)
  const now = new Date()
  const diffHours = (apptTime.getTime() - now.getTime()) / (1000 * 60 * 60)
  return diffHours < 2
}

const getActiveBookingCount = async (phone) => {
  if (!phone) return 0
  return await Booking.countDocuments({
    phone: phone.trim(),
    status: { $in: ['pending', 'confirmed'] }
  })
}

export const checkBookingConflict = async (artistId, stylistName, date, timeStr, durationMins, excludeBookingId = null) => {
  const startMins = timeToMinutes(timeStr)
  const endMins = startMins + durationMins

  const query = {
    date,
    status: { $in: ['pending', 'confirmed', 'completed'] }
  }

  const artistIdStr = artistId ? artistId.toString() : null
  if (artistIdStr && stylistName) {
    query.$or = [
      { barberId: artistIdStr },
      { stylist: stylistName }
    ]
  } else if (artistIdStr) {
    query.barberId = artistIdStr
  } else if (stylistName) {
    query.stylist = stylistName
  } else {
    return null
  }

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId }
  }

  const existingBookings = await Booking.find(query)

  for (const booking of existingBookings) {
    const bStart = timeToMinutes(booking.time)
    const bEnd = bStart + getBookingDurationMinutes(booking)

    if (startMins < bEnd && bStart < endMins) {
      return booking
    }
  }

  return null
}

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

  // Resolve serviceId to a valid ObjectId or valid mapping
  if (finalServiceId && !mongoose.Types.ObjectId.isValid(finalServiceId)) {
    const mappedName = serviceIdMap[finalServiceId] || finalServiceId
    const foundService = await Service.findOne({ name: { $regex: new RegExp(`^${mappedName}$`, 'i') } })
    if (foundService) {
      finalServiceId = foundService._id
      if (!finalPrice) finalPrice = foundService.price
      if (!finalDuration) finalDuration = foundService.duration
    } else {
      finalServiceId = undefined
    }
  }

  // Resolve artist name and ID for conflict check and schema consistency
  let finalBarberId = barberId
  let finalStylistName = stylist
  if (barberId && mongoose.Types.ObjectId.isValid(barberId)) {
    const foundArtist = await Artist.findById(barberId)
    if (foundArtist) {
      finalStylistName = foundArtist.name
    }
  } else {
    const artistNameLookup = (barberId && artistIdMap[barberId]) ? artistIdMap[barberId] : (barberId || stylist)
    if (artistNameLookup) {
      const foundArtist = await Artist.findOne({ name: { $regex: new RegExp(`^${artistNameLookup}$`, 'i') } })
      if (foundArtist) {
        finalBarberId = foundArtist._id.toString()
        finalStylistName = foundArtist.name
      } else {
        finalBarberId = undefined
      }
    } else {
      finalBarberId = undefined
    }
  }

  // Resolve duration minutes for conflict check
  let finalDurationMinutes = 60
  if (finalServiceId && mongoose.Types.ObjectId.isValid(finalServiceId)) {
    const serviceDoc = await Service.findById(finalServiceId)
    if (serviceDoc) {
      finalDurationMinutes = serviceDoc.durationMinutes || 60
    }
  } else if (finalDuration) {
    const match = finalDuration.match(/(\d+)/)
    if (match) {
      finalDurationMinutes = parseInt(match[1], 10)
    }
  }

  // 2-hour advance booking rule (except for admins)
  const isAdmin = await isAdminRequest(req)
  if (!isAdmin) {
    if (isLessThanTwoHoursAway(date, time)) {
      return sendError(res, "Appointments must be booked at least 2 hours in advance.", 400)
    }

    // Active bookings limit rule (max 3 pending/confirmed bookings per customer, except for admins)
    const activeCount = await getActiveBookingCount(phone)
    if (activeCount >= 3) {
      console.log(`[BookingLimit]\nPhone: ${phone.trim()}\nActiveCount: ${activeCount}\nResult: BLOCKED`)
      return sendError(res, "You already have 3 active appointments. Please complete or cancel an existing appointment before booking another.", 400)
    } else {
      console.log(`[BookingLimit]\nPhone: ${phone.trim()}\nActiveCount: ${activeCount}\nResult: ALLOWED`)
    }
  }

  // Lock key by artist date to avoid race condition
  const lockKey = `${finalBarberId || finalStylistName}_${date}`
  const release = await lockInstance.acquire(lockKey)

  try {
    // Check conflicts
    const conflict = await checkBookingConflict(finalBarberId, finalStylistName, date, time, finalDurationMinutes)
    if (conflict) {
      return sendError(res, 'The selected slot is no longer available. Please select another time or stylist.', 400)
    }

    const booking = await Booking.create({
      customerName,
      phone,
      email,
      service,
      serviceId: finalServiceId,
      barberId: finalBarberId,
      stylist: finalStylistName,
      userId,
      price: finalPrice || 1200,
      duration: finalDuration || '60 Min',
      durationMinutes: finalDurationMinutes,
      date,
      time,
      notes
    })

    sendSuccess(res, booking, 'Booking created successfully', 201)
  } finally {
    release()
  }
})

// @desc    Get bookings (Admin gets all, Users filter by phone/email/userId)
// @route   GET /api/bookings
// @access  Public / Private
export const getBookings = asyncHandler(async (req, res) => {
  const { phone, email, userId } = req.query

  // If search query is provided, return matching bookings ONLY if admin is authenticated
  if (phone || email || userId) {
    const isAdmin = await isAdminRequest(req)
    if (!isAdmin) {
      return sendError(res, 'Unauthorized query. Customer lookups must use the secure lookup endpoint.', 403)
    }

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
    const enrichedBookings = bookings.map(b => {
      const bStart = timeToMinutes(b.time)
      const bEnd = bStart + getBookingDurationMinutes(b)
      
      const hasConflict = b.status !== 'cancelled' && bookings.some(other => {
        if (other._id.toString() === b._id.toString()) return false
        if (other.status === 'cancelled') return false
        if (other.date !== b.date) return false
        
        const sameArtist = (b.barberId && other.barberId && b.barberId === other.barberId) ||
                           (b.stylist && other.stylist && b.stylist.toLowerCase() === other.stylist.toLowerCase())
        if (!sameArtist) return false
        
        const oStart = timeToMinutes(other.time)
        const oEnd = oStart + getBookingDurationMinutes(other)
        
        return bStart < oEnd && oStart < bEnd
      })
      
      return {
        ...b.toObject(),
        hasConflict
      }
    })
    return sendSuccess(res, enrichedBookings, 'Bookings retrieved successfully')
  }

  return sendError(res, 'Query parameter (phone, email, or userId) required to retrieve bookings', 400)
})

// @desc    Get a single booking by ID (Public lookup)
// @route   GET /api/bookings/:id
// @access  Public
export const getBookingById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return sendError(res, 'Booking not found', 404)
  }
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

  // 2-hour advance booking rule for the new time (except for admins)
  const isAdmin = await isAdminRequest(req)
  if (!isAdmin) {
    if (isLessThanTwoHoursAway(date, time)) {
      return sendError(res, "Appointments must be booked at least 2 hours in advance.", 400)
    }
  }

  const durationMins = getBookingDurationMinutes(booking)

  // Lock key
  const lockKey = `${booking.barberId || booking.stylist}_${date}`
  const release = await lockInstance.acquire(lockKey)

  try {
    const conflict = await checkBookingConflict(booking.barberId, booking.stylist, date, time, durationMins, booking._id)
    if (conflict) {
      return sendError(res, 'The selected slot is no longer available. Please select another time.', 400)
    }

    booking.date = date
    booking.time = time
    booking.rescheduleCount = (booking.rescheduleCount || 0) + 1
    booking.statusHistory.push({
      status: 'Rescheduled',
      changedAt: new Date(),
      changedBy: 'Customer'
    })
    await booking.save()

    sendSuccess(res, booking, 'Booking rescheduled successfully')
  } finally {
    release()
  }
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
  booking.statusHistory.push({
    status: 'Cancelled',
    changedAt: new Date(),
    changedBy: 'Customer'
  })
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
  const friendlyStatus = status.charAt(0).toUpperCase() + status.slice(1);
  booking.statusHistory.push({
    status: friendlyStatus,
    changedAt: new Date(),
    changedBy: 'Salon Admin'
  })
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

// @desc    Get available booking slots
// @route   GET /api/bookings/available-slots
// @access  Public
export const getAvailableSlots = asyncHandler(async (req, res) => {
  const { artistId, stylist, date, serviceId, service } = req.query

  if (!date) {
    return sendError(res, 'Date query parameter is required', 400)
  }

  // Resolve artist
  let artist = null
  if (artistId && mongoose.Types.ObjectId.isValid(artistId)) {
    artist = await Artist.findById(artistId)
  } else if (artistId && artistIdMap[artistId]) {
    artist = await Artist.findOne({ name: { $regex: new RegExp(`^${artistIdMap[artistId]}$`, 'i') } })
  } else if (artistId) {
    artist = await Artist.findOne({ name: { $regex: new RegExp(`^${artistId}$`, 'i') } })
  } else if (stylist) {
    artist = await Artist.findOne({ name: { $regex: new RegExp(`^${stylist}$`, 'i') } })
  }

  // Default working hours if artist not found
  const workingHours = artist?.workingHours || { start: '09:00', end: '18:00' }
  const artistName = artist?.name || stylist

  // Resolve service
  let serviceDoc = null
  if (serviceId && mongoose.Types.ObjectId.isValid(serviceId)) {
    serviceDoc = await Service.findById(serviceId)
  } else if (serviceId && serviceIdMap[serviceId]) {
    serviceDoc = await Service.findOne({ name: { $regex: new RegExp(`^${serviceIdMap[serviceId]}$`, 'i') } })
  } else if (serviceId) {
    serviceDoc = await Service.findOne({ name: { $regex: new RegExp(`^${serviceId}$`, 'i') } })
  } else if (service) {
    serviceDoc = await Service.findOne({ name: { $regex: new RegExp(`^${service}$`, 'i') } })
  }

  const durationMinutes = serviceDoc?.durationMinutes || 60

  const startMins = timeToMinutes(workingHours.start)
  const endMins = timeToMinutes(workingHours.end)

  // Query bookings for logging
  const bookingsQuery = {
    date,
    status: { $in: ['pending', 'confirmed', 'completed'] }
  }
  if (artist?._id && artistName) {
    bookingsQuery.$or = [
      { barberId: artist._id.toString() },
      { stylist: artistName }
    ]
  } else if (artist?._id) {
    bookingsQuery.barberId = artist._id.toString()
  } else if (artistName) {
    bookingsQuery.stylist = artistName
  }

  const bookingsFound = (artist?._id || artistName) ? await Booking.find(bookingsQuery) : []
  const occupiedSlots = bookingsFound.map(b => `${b.time} (${getBookingDurationMinutes(b)} mins)`)

  console.log('[DEBUG] artistId:', artistId)
  console.log('[DEBUG] serviceId:', serviceId)
  console.log('[DEBUG] selected date:', date)
  console.log('[DEBUG] artist document:', artist)
  console.log('[DEBUG] workingHours:', workingHours)
  console.log('[DEBUG] service duration:', durationMinutes)
  console.log('[DEBUG] bookings found:', bookingsFound)
  console.log('[DEBUG] occupied slots:', occupiedSlots)

  // Determine current time to filter past slots if the booking date is today
  const now = new Date()
  
  // Note: to match local time of the salon, let's use the local time from user's env / system if possible.
  // We can format current date in YYYY-MM-DD in the server's/local timezone
  // For local timezone format of YYYY-MM-DD:
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const todayStr = `${year}-${month}-${day}`
  
  const currentTotalMins = now.getHours() * 60 + now.getMinutes()

  const availableSlots = []
  for (let mins = startMins; mins + durationMinutes <= endMins; mins += 30) {
    const slotTimeStr = minutesToTime(mins)

    // If date is today, verify slot start time is at least 2 hours in the future
    if (date === todayStr && isLessThanTwoHoursAway(date, slotTimeStr)) {
      continue
    }

    const conflict = await checkBookingConflict(artist?._id, artistName, date, slotTimeStr, durationMinutes)
    if (!conflict) {
      availableSlots.push(slotTimeStr)
    }
  }

  console.log('[DEBUG] generated slots:', availableSlots)

  sendSuccess(res, availableSlots, 'Available slots retrieved successfully')
})

// @desc    Lookup bookings by customer name and phone
// @route   POST /api/bookings/lookup
// @access  Public
export const lookupBooking = asyncHandler(async (req, res) => {
  const { customerName, phone } = req.body

  if (!customerName || !phone) {
    return sendError(res, 'Customer name and phone number are required', 400)
  }

  const normalizedName = customerName.trim()
  const normalizedPhone = phone.trim()

  const bookings = await Booking.find({
    customerName: { $regex: new RegExp(`^${normalizedName}$`, 'i') },
    phone: normalizedPhone
  }).sort({ date: -1, time: -1 })

  if (!bookings || bookings.length === 0) {
    return sendError(res, 'No appointments found for this name and phone number.', 404)
  }

  // Return bookings array
  return res.status(200).json({
    success: true,
    message: 'Bookings retrieved successfully',
    data: bookings,
    bookings: bookings
  })
})
