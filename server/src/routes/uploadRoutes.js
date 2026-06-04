import express from 'express'
import { protectAdmin } from '../middleware/authMiddleware.js'
import { uploadBarberImage } from '../middleware/uploadBarberImage.js'

const router = express.Router()

// POST /api/upload - Single image upload using Cloudinary
router.post('/', protectAdmin, uploadBarberImage, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' })
  }
  
  res.json({
    success: true,
    message: 'Image uploaded successfully',
    imageUrl: req.file.path,
    imagePublicId: req.file.filename
  })
})

export default router
