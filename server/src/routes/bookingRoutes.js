import express from 'express'
import { body } from 'express-validator'
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking
} from '../controllers/bookingController.js'
import { protectAdmin } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validateMiddleware.js'

const router = express.Router()

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

// Protected Admin Routes
router.get('/', protectAdmin, getBookings)
router.get('/:id', protectAdmin, getBookingById)
router.patch(
  '/:id/status',
  protectAdmin,
  [
    body('status')
      .isIn(['pending', 'confirmed', 'completed', 'cancelled'])
      .withMessage('Status must be pending, confirmed, completed, or cancelled')
  ],
  validate,
  updateBookingStatus
)
router.delete('/:id', protectAdmin, deleteBooking)

export default router
