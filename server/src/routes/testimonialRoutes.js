import express from 'express'
import { body } from 'express-validator'
import { getTestimonials, createTestimonial, deleteTestimonial } from '../controllers/testimonialController.js'
import { protectAdmin } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validateMiddleware.js'

const router = express.Router()

router.get('/', getTestimonials)

router.post(
  '/',
  [
    body('customerName').notEmpty().withMessage('Customer name is required').trim(),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
    body('review').notEmpty().withMessage('Review content is required').trim(),
    body('source').optional().trim(),
    body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean')
  ],
  validate,
  createTestimonial
)

// Protected Admin Route
router.delete('/:id', protectAdmin, deleteTestimonial)

export default router
