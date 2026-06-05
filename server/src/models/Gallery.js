import mongoose from 'mongoose'

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['hair', 'makeup', 'skin', 'nails', 'grooming'],
    required: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

gallerySchema.index({ isFeatured: 1, createdAt: -1 })

const Gallery = mongoose.model('Gallery', gallerySchema)
export default Gallery
