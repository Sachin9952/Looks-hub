import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { protectAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

// Ensure uploads folder exists
if (!fs.existsSync('uploads/')) {
  fs.mkdirSync('uploads/')
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

// File filter (images only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Only images are allowed!'), false)
  }
}

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
})

// POST /api/upload - Single image upload
router.post('/', protectAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' })
  }
  
  // Return relative URL path
  const fileUrl = `/uploads/${req.file.filename}`
  res.json({
    success: true,
    message: 'Image uploaded successfully',
    url: fileUrl
  })
})

export default router
