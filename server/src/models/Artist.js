import mongoose from 'mongoose'

const artistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  specialty: {
    type: String,
    required: true,
    trim: true
  },
  years: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    default: 5.0
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  imagePublicId: {
    type: String,
    required: true,
    trim: true
  },
  workingHours: {
    start: {
      type: String,
      default: "09:00"
    },
    end: {
      type: String,
      default: "18:00"
    }
  }
}, {
  timestamps: true
})

const Artist = mongoose.model('Artist', artistSchema)
export default Artist
