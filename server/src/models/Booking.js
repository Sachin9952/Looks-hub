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
  durationMinutes: {
    type: Number,
    default: 60
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
  },
  reference: {
    type: String,
    unique: true,
    sparse: true
  },
  statusHistory: [
    {
      status: { type: String, required: true },
      changedAt: { type: Date, default: Date.now },
      changedBy: { type: String, required: true }
    }
  ]
}, {
  timestamps: true
})

bookingSchema.index({ date: 1, barberId: 1, status: 1 })
bookingSchema.index({ date: 1, stylist: 1, status: 1 })
bookingSchema.index({ phone: 1, status: 1 })

// Pre-save hook to generate unique sequential references and statusHistory
bookingSchema.pre('save', async function (next) {
  const BookingModel = mongoose.model('Booking');

  // 1. Generate unique sequential reference
  if (!this.reference) {
    const year = this.date ? this.date.split('-')[0] : new Date().getFullYear().toString();
    const prefix = `LH-${year}-`;
    
    try {
      const lastBooking = await BookingModel.findOne({
        reference: { $regex: new RegExp('^' + prefix) }
      }).sort({ reference: -1 });

      let sequence = 1;
      if (lastBooking && lastBooking.reference) {
        const parts = lastBooking.reference.split('-');
        const lastSeq = parseInt(parts[2], 10);
        if (!isNaN(lastSeq)) {
          sequence = lastSeq + 1;
        }
      }
      this.reference = `${prefix}${String(sequence).padStart(5, '0')}`;
    } catch (err) {
      return next(err);
    }
  }

  // 2. Initialize status history if empty
  if (!this.statusHistory || this.statusHistory.length === 0) {
    this.statusHistory = [{
      status: 'Booking Created',
      changedAt: new Date(),
      changedBy: 'Customer'
    }];
  }

  next();
})

const Booking = mongoose.model('Booking', bookingSchema)
export default Booking
