import express from 'express'
import { body } from 'express-validator'
import { getArtists, createArtist, deleteArtist } from '../controllers/artistController.js'
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
    body('image').notEmpty().withMessage('Image is required').trim()
  ],
  validate,
  createArtist
)

router.delete('/:id', protectAdmin, deleteArtist)

export default router
