import Gallery from '../models/Gallery.js'
import asyncHandler from '../utils/asyncHandler.js'
import { sendSuccess, sendError } from '../utils/responseHandler.js'

// @desc    Get all gallery items
// @route   GET /api/gallery
// @access  Public
export const getGalleryItems = asyncHandler(async (req, res) => {
  const items = await Gallery.find({}).sort({ createdAt: -1 })
  sendSuccess(res, items, 'Gallery items retrieved successfully')
})

// @desc    Create new gallery item
// @route   POST /api/gallery
// @access  Private (Admin)
export const createGalleryItem = asyncHandler(async (req, res) => {
  const { title, category, imageUrl, type, isFeatured } = req.body

  const item = await Gallery.create({
    title,
    category,
    imageUrl,
    type,
    isFeatured
  })

  sendSuccess(res, item, 'Gallery item created successfully', 201)
})

// @desc    Delete gallery item
// @route   DELETE /api/gallery/:id
// @access  Private (Admin)
export const deleteGalleryItem = asyncHandler(async (req, res) => {
  const item = await Gallery.findById(req.params.id)

  if (!item) {
    return sendError(res, 'Gallery item not found', 404)
  }

  await item.deleteOne()
  sendSuccess(res, null, 'Gallery item deleted successfully')
})
