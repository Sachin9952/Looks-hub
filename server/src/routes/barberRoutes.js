import express from 'express'
import { protectAdmin } from '../middleware/authMiddleware.js'
import { uploadBarberImage } from '../middleware/uploadBarberImage.js'

const router = express.Router()

// POST /api/barbers/upload
// Protected for Admins only
router.post('/upload', protectAdmin, uploadBarberImage, (req, res) => {
  res.json({
    success: true,
    message: 'Barber image uploaded successfully to Cloudinary',
    imageUrl: req.file.path, // Secure URL from Cloudinary
    imagePublicId: req.file.filename // Public ID from Cloudinary
  })
})

export default router
