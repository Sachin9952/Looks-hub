import express from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'
import {
  createBooking,
  getBookings,
  getBookingById,
  rescheduleBooking,
  cancelBooking,
  reviewBooking,
  updateBookingStatus,
  deleteBooking,
  getAvailableSlots,
  lookupBooking
} from '../controllers/bookingController.js'
import { protectAdmin } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validateMiddleware.js'
import { lookupRateLimiter } from '../middleware/rateLimitMiddleware.js'

const router = express.Router()

// Optional Admin Auth Middleware for GET /api/bookings
const optionalAdmin = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.admin = await Admin.findById(decoded.id).select('-password')
    } catch (error) {
      // Skip invalid tokens for public search queries
    }
  }
  next()
}

// Public Booking Creation
router.post(
  '/',
  [
    body('customerName').notEmpty().withMessage('Customer name is required').trim(),
    body('phone').notEmpty().withMessage('Phone number is required').trim(),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('service').notEmpty().withMessage('Service name is required').trim(),
    body('date').notEmpty().withMessage('Date is required').trim(),
    body('time').notEmpty().withMessage('Time is required').trim()
  ],
  validate,
  createBooking
)

// Public Dashboard Queries
router.get('/', optionalAdmin, getBookings)
router.get('/available-slots', getAvailableSlots)
router.get('/:id', getBookingById)

// Secure Booking Lookup (Public)
router.post(
  '/lookup',
  lookupRateLimiter,
  [
    body('customerName')
      .notEmpty().withMessage('Customer name is required').trim(),
    body('phone')
      .notEmpty().withMessage('Phone number is required').trim()
      .isLength({ min: 10, max: 15 }).withMessage('Phone number must be between 10 and 15 digits')
  ],
  validate,
  lookupBooking
)

// Booking Actions (Public)
router.patch('/reschedule', rescheduleBooking)
router.patch('/cancel', cancelBooking)
router.post('/review', reviewBooking)

// Protected Admin Routes
router.patch(
  '/:id/status',
  protectAdmin,
  [
    body('status')
      .isIn(['pending', 'confirmed', 'completed', 'cancelled', 'cancelled_by_user', 'cancelled_by_salon', 'rejected', 'expired', 'no_show'])
      .withMessage('Invalid booking status')
  ],
  validate,
  updateBookingStatus
)
router.delete('/:id', protectAdmin, deleteBooking)

export default router
