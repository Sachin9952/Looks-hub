import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/looks-hub';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');
  const Booking = mongoose.model('Booking', new mongoose.Schema({}, { strict: false }));
  const bookings = await Booking.find({});
  console.log(`Total bookings found: ${bookings.length}`);
  bookings.forEach(b => {
    console.log(`- ID: ${b._id}, Date: ${b.date}, Time: ${b.time}, Stylist: ${b.stylist}, Phone: ${b.phone}, Status: ${b.status}`);
  });
  await mongoose.disconnect();
}

run();
