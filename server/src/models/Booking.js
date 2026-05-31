import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  service: {
    type: String,
    required: true,
    trim: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  barberId: {
    type: String,
    trim: true
  },
  stylist: {
    type: String,
    trim: true
  },
  userId: {
    type: String,
    trim: true
  },
  price: {
    type: Number
  },
  duration: {
    type: String,
    trim: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  rescheduleCount: {
    type: Number,
    default: 0
  },
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
})

const Booking = mongoose.model('Booking', bookingSchema)
export default Booking
