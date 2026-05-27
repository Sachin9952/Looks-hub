import Service from '../models/Service.js'
import asyncHandler from '../utils/asyncHandler.js'
import { sendSuccess, sendError } from '../utils/responseHandler.js'

// @desc    Get all services
// @route   GET /api/services
// @access  Public
export const getServices = asyncHandler(async (req, res) => {
  const query = {}
  // Non-admins only see active services
  if (!req.headers.authorization) {
    query.isActive = true
  }
  const services = await Service.find(query).sort({ category: 1, name: 1 })
  sendSuccess(res, services, 'Services retrieved successfully')
})

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Admin)
export const createService = asyncHandler(async (req, res) => {
  const { name, category, price, duration, description, isPopular, isActive } = req.body

  const service = await Service.create({
    name,
    category,
    price,
    duration,
    description,
    isPopular,
    isActive
  })

  sendSuccess(res, service, 'Service created successfully', 201)
})

// @desc    Update service details
// @route   PUT /api/services/:id
// @access  Private (Admin)
export const updateService = asyncHandler(async (req, res) => {
  const { name, category, price, duration, description, isPopular, isActive } = req.body

  const service = await Service.findById(req.params.id)

  if (!service) {
    return sendError(res, 'Service not found', 404)
  }

  service.name = name !== undefined ? name : service.name
  service.category = category !== undefined ? category : service.category
  service.price = price !== undefined ? price : service.price
  service.duration = duration !== undefined ? duration : service.duration
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
