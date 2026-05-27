import Testimonial from '../models/Testimonial.js'
import asyncHandler from '../utils/asyncHandler.js'
import { sendSuccess, sendError } from '../utils/responseHandler.js'

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
export const getTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({}).sort({ createdAt: -1 })
  sendSuccess(res, testimonials, 'Testimonials retrieved successfully')
})

// @desc    Create new testimonial
// @route   POST /api/testimonials
// @access  Public
export const createTestimonial = asyncHandler(async (req, res) => {
  const { customerName, rating, review, source, isFeatured } = req.body

  const testimonial = await Testimonial.create({
    customerName,
    rating,
    review,
    source,
    isFeatured
  })

  sendSuccess(res, testimonial, 'Testimonial created successfully', 201)
})

// @desc    Delete testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private (Admin)
export const deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id)

  if (!testimonial) {
    return sendError(res, 'Testimonial not found', 404)
  }

  await testimonial.deleteOne()
  sendSuccess(res, null, 'Testimonial deleted successfully')
})
