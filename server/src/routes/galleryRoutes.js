import express from 'express'
import { body } from 'express-validator'
import { getGalleryItems, createGalleryItem, deleteGalleryItem } from '../controllers/galleryController.js'
import { protectAdmin } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validateMiddleware.js'

const router = express.Router()

router.get('/', getGalleryItems)

// Protected Admin Routes
router.post(
  '/',
  protectAdmin,
  [
    body('title').notEmpty().withMessage('Title is required').trim(),
    body('category').notEmpty().withMessage('Category is required').trim(),
    body('imageUrl').notEmpty().withMessage('Image URL is required').trim(),
    body('type')
      .isIn(['hair', 'makeup', 'skin', 'nails', 'grooming'])
      .withMessage('Type must be hair, makeup, skin, nails, or grooming'),
    body('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean')
  ],
  validate,
  createGalleryItem
)

router.delete('/:id', protectAdmin, deleteGalleryItem)

export default router
