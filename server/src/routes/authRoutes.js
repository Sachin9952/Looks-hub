import express from 'express'
import { body } from 'express-validator'
import { registerAdmin, loginAdmin, getAdminProfile } from '../controllers/authController.js'
import { protectAdmin } from '../middleware/authMiddleware.js'
import { validate } from '../middleware/validateMiddleware.js'

const router = express.Router()

// Public registration is disabled after initial setup to secure the system
// router.post(
//   '/register-admin',
//   [
//     body('name').notEmpty().withMessage('Name is required').trim(),
//     body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
//     body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
//   ],
//   validate,
//   registerAdmin
// )

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  loginAdmin
)

router.get('/me', protectAdmin, getAdminProfile)

export default router
