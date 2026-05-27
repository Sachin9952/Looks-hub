import express from 'express'
import { body } from 'express-validator'
import {
  getServices,
  createService,
  updateService,
  deleteService
} from '../controllers/serviceController.js'
import { protectAdmin } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validateMiddleware.js'

const router = express.Router()

router.get('/', getServices)

// Protected Admin Routes
router.post(
  '/',
  protectAdmin,
  [
    body('name').notEmpty().withMessage('Service name is required').trim(),
    body('category').notEmpty().withMessage('Category is required').trim(),
    body('price').isNumeric().withMessage('Price must be a valid number'),
    body('duration').notEmpty().withMessage('Duration is required').trim(),
    body('isPopular').optional().isBoolean().withMessage('isPopular must be a boolean'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
  ],
  validate,
  createService
)

router.put(
  '/:id',
  protectAdmin,
  [
    body('name').optional().notEmpty().withMessage('Service name cannot be empty').trim(),
    body('category').optional().notEmpty().withMessage('Category cannot be empty').trim(),
    body('price').optional().isNumeric().withMessage('Price must be a valid number'),
    body('duration').optional().notEmpty().withMessage('Duration cannot be empty').trim(),
    body('isPopular').optional().isBoolean().withMessage('isPopular must be a boolean'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
  ],
  validate,
  updateService
)

router.delete('/:id', protectAdmin, deleteService)

export default router
