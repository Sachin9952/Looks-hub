import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/looks-hub';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');
  const Booking = mongoose.model('Booking', new mongoose.Schema({}, { strict: false }));
  
  const bookings = await Booking.find({});
  const phoneGroups = {};

  bookings.forEach(b => {
    const phone = b.phone ? b.phone.trim() : 'undefined';
    if (!phoneGroups[phone]) {
      phoneGroups[phone] = {
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        total: 0
      };
    }
    phoneGroups[phone].total += 1;
    if (b.status === 'pending') phoneGroups[phone].pending += 1;
    else if (b.status === 'confirmed') phoneGroups[phone].confirmed += 1;
    else if (b.status === 'completed') phoneGroups[phone].completed += 1;
    else if (b.status === 'cancelled') phoneGroups[phone].cancelled += 1;
  });

  console.log('\n=== BOOKINGS AUDIT PER PHONE NUMBER ===');
  Object.keys(phoneGroups).forEach(phone => {
    const group = phoneGroups[phone];
    const active = group.pending + group.confirmed;
    console.log(`Phone: ${phone}`);
    console.log(`  Active (pending + confirmed): ${active} (Pending: ${group.pending}, Confirmed: ${group.confirmed})`);
    console.log(`  Non-active (completed + cancelled): ${group.completed + group.cancelled} (Completed: ${group.completed}, Cancelled: ${group.cancelled})`);
    console.log(`  Total: ${group.total}`);
    if (active > 3) {
      console.log(`  WARNING: Exceeds active limit of 3!`);
    }
    console.log('------------------------------------');
  });

  await mongoose.disconnect();
}

run();
