import multer from 'multer'
import { storage } from '../config/cloudinary.js'

// File filter to allow only jpg, jpeg, png, webp
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and WebP images are allowed!'), false)
  }
}

// Multer instance config
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
})

// Middleware to execute upload and handle errors gracefully
export const uploadBarberImage = (req, res, next) => {
  const uploadSingle = upload.single('image')

  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File is too large. Maximum size allowed is 5MB.'
        })
      }
      return res.status(400).json({
        success: false,
        message: err.message
      })
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded or missing required image file.'
      })
    }

    next()
  })
}
