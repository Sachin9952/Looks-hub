import Service from '../models/Service.js'
import asyncHandler from '../utils/asyncHandler.js'
import { sendSuccess, sendError } from '../utils/responseHandler.js'

// @desc    Get all services
// @route   GET /api/services
// @access  Public
export const getServices = asyncHandler(async (req, res) => {
  const query = {}
  let selectFields = '_id name category price duration description isPopular isActive'

  // Non-admins only see active services
  if (!req.headers.authorization) {
    query.isActive = true
    selectFields = '_id name category price duration description isPopular isActive'
  }
  const services = await Service.find(query)
    .select(selectFields)
    .sort({ category: 1, name: 1 })
    .lean()
  sendSuccess(res, services, 'Services retrieved successfully')
})

export const createService = asyncHandler(async (req, res) => {
  const { name, category, price, duration, description, isPopular, isActive, durationMinutes } = req.body

  let finalDurationMinutes = durationMinutes
  if (!finalDurationMinutes && duration) {
    const match = duration.match(/(\d+)/)
    if (match) {
      finalDurationMinutes = parseInt(match[1], 10)
    }
  }

  const service = await Service.create({
    name,
    category,
    price,
    duration,
    durationMinutes: finalDurationMinutes || 60,
    description,
    isPopular,
    isActive
  })

  sendSuccess(res, service, 'Service created successfully', 201)
})

// @desc    Update service details
// @route   PUT /api/services/:id
// @access  Private (Admin)
// export const updateService = asyncHandler(async (req, res) => {
export const updateService = asyncHandler(async (req, res) => {
  const { name, category, price, duration, description, isPopular, isActive, durationMinutes } = req.body

  const service = await Service.findById(req.params.id)

  if (!service) {
    return sendError(res, 'Service not found', 404)
  }

  service.name = name !== undefined ? name : service.name
  service.category = category !== undefined ? category : service.category
  service.price = price !== undefined ? price : service.price
  service.duration = duration !== undefined ? duration : service.duration
  if (durationMinutes !== undefined) {
    service.durationMinutes = durationMinutes
  } else if (duration !== undefined) {
    const match = duration.match(/(\d+)/)
    if (match) {
      service.durationMinutes = parseInt(match[1], 10)
    }
  }
  service.description = description !== undefined ? description : service.description
  service.isPopular = isPopular !== undefined ? isPopular : service.isPopular
  service.isActive = isActive !== undefined ? isActive : service.isActive

  await service.save()
  sendSuccess(res, service, 'Service updated successfully')
})

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Admin)
export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)

  if (!service) {
    return sendError(res, 'Service not found', 404)
  }

  await service.deleteOne()
  sendSuccess(res, null, 'Service deleted successfully')
})
