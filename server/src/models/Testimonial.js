import mongoose from 'mongoose'

const testimonialSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: true,
    trim: true
  },
  source: {
    type: String,
    trim: true,
    default: 'Google Maps'
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

const Testimonial = mongoose.model('Testimonial', testimonialSchema)
export default Testimonial
