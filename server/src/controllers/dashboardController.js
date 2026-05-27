import Booking from '../models/Booking.js'
import Service from '../models/Service.js'
import Testimonial from '../models/Testimonial.js'
import asyncHandler from '../utils/asyncHandler.js'
import { sendSuccess } from '../utils/responseHandler.js'

// @desc    Get dashboard metrics & recent bookings
// @route   GET /api/dashboard/stats
// @access  Private (Admin)
export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalBookings = await Booking.countDocuments()
  const pendingBookings = await Booking.countDocuments({ status: 'pending' })
  const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' })
  const completedBookings = await Booking.countDocuments({ status: 'completed' })
  const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' })

  const totalServices = await Service.countDocuments()
  const totalTestimonials = await Testimonial.countDocuments()

  const recentBookings = await Booking.find({})
    .sort({ createdAt: -1 })
    .limit(10)

  sendSuccess(res, {
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    cancelledBookings,
    totalServices,
    totalTestimonials,
    recentBookings
  }, 'Dashboard statistics retrieved successfully')
})
