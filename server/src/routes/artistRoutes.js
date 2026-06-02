import express from 'express'
import { body } from 'express-validator'
import { getArtists, createArtist, updateArtist, deleteArtist } from '../controllers/artistController.js'
import { protectAdmin } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validateMiddleware.js'

const router = express.Router()

router.get('/', getArtists)

// Protected Admin Routes
router.post(
  '/',
  protectAdmin,
  [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('specialty').notEmpty().withMessage('Specialty is required').trim(),
    body('years').isNumeric().withMessage('Years of experience must be a number'),
    body('rating').optional().isNumeric().withMessage('Rating must be a number'),
    body('imageUrl').notEmpty().withMessage('Image URL is required').trim(),
    body('imagePublicId').notEmpty().withMessage('Image public ID is required').trim()
  ],
  validate,
  createArtist
)

router.put(
  '/:id',
  protectAdmin,
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty').trim(),
    body('specialty').optional().notEmpty().withMessage('Specialty cannot be empty').trim(),
    body('years').optional().isNumeric().withMessage('Years of experience must be a number'),
    body('rating').optional().isNumeric().withMessage('Rating must be a number'),
    body('imageUrl').optional().notEmpty().withMessage('Image URL cannot be empty').trim(),
    body('imagePublicId').optional().notEmpty().withMessage('Image public ID cannot be empty').trim()
  ],
  validate,
  updateArtist
)

router.delete('/:id', protectAdmin, deleteArtist)

export default router
