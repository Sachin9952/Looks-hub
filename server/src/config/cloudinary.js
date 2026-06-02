import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import dotenv from 'dotenv'

dotenv.config()

// Verify that environment variables are loaded
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  throw new Error("Cloudinary configuration missing. Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
}

// Configure Cloudinary credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lookshub/barbers',
    format: async (req, file) => 'webp', // Convert all uploaded images to WebP
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      return `barber-${uniqueSuffix}`
    },
    transformation: [
      { width: 800, height: 1000, crop: 'fill', gravity: 'face' }, // Resize/crop for portrait format
      { quality: 'auto' }, // Automatic quality optimization
      { fetch_format: 'auto' } // Fetch format auto
    ]
  }
})

export { cloudinary, storage }
