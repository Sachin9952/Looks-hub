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
  image: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
})

const Artist = mongoose.model('Artist', artistSchema)
export default Artist
