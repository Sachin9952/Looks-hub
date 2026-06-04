import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/looks-hub';
const API_URL = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const getFutureDateString = (daysAhead) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

async function runTests() {
  console.log('=== Active Booking Limit System Verification ===');
  
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB.');

  const Admin = mongoose.model('Admin', new mongoose.Schema({}, { strict: false }));
  const Booking = mongoose.model('Booking', new mongoose.Schema({}, { strict: false }));
  const Artist = mongoose.model('Artist', new mongoose.Schema({}, { strict: false }));

  // Find or create admin
  let admin = await Admin.findOne({});
  let createdTempAdmin = false;
  if (!admin) {
    console.log('No admin found, creating a temp admin...');
    admin = await Admin.create({
      name: 'Temp Test Admin',
      email: 'temp_test_admin@lookshub.com',
      password: 'password123',
      role: 'admin'
    });
    createdTempAdmin = true;
  }
  
  const adminToken = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '1h' });
  console.log(`Using Admin ID: ${admin._id}`);

  // Find or create an artist
  let artist = await Artist.findOne({});
  if (!artist) {
    console.log('No artist found, creating a temp artist...');
    artist = await Artist.create({
      name: 'Robin Singh',
      specialty: 'Master Stylist',
      workingHours: { start: '09:00', end: '19:00' }
    });
  }
  const artistName = artist.name;
  const artistId = artist._id.toString();

  const testPhone = '+919999998888';
  const futureStr1 = getFutureDateString(3);
  const futureStr2 = getFutureDateString(4);
  const futureStr3 = getFutureDateString(5);
  const futureStr4 = getFutureDateString(6);

  console.log(`\nUsing test phone: ${testPhone}`);

  // Cleanup any old bookings for this test phone to start fresh
  await Booking.deleteMany({ phone: testPhone });

  // 1. Create 3 active bookings
  console.log('\n--- 1. Creating 3 active bookings for client... ---');
  const b1 = await Booking.create({
    customerName: 'Test Limit User',
    phone: testPhone,
    service: 'Haircut & Styling',
    stylist: artistName,
    artistId: artistId,
    date: futureStr1,
    time: '10:00',
    status: 'confirmed'
  });
  const b2 = await Booking.create({
    customerName: 'Test Limit User',
    phone: testPhone,
    service: 'Haircut & Styling',
    stylist: artistName,
    artistId: artistId,
    date: futureStr2,
    time: '11:00',
    status: 'confirmed'
  });
  const b3 = await Booking.create({
    customerName: 'Test Limit User',
    phone: testPhone,
    service: 'Haircut & Styling',
    stylist: artistName,
    artistId: artistId,
    date: futureStr3,
    time: '12:00',
    status: 'pending' // pending is also active!
  });
  console.log('Created bookings:', [b1._id, b2._id, b3._id]);

  // 2. Attempt customer booking for 4th slot
  console.log('\n--- 2. Attempting 4th customer booking (should be blocked)... ---');
  const bookRes = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Test Limit User',
      phone: testPhone,
      service: 'Haircut & Styling',
      stylist: artistName,
      artistId: artistId,
      date: futureStr4,
      time: '13:00',
      notes: 'Should fail'
    })
  });
  const bookData = await bookRes.json();
  console.log('Response Status:', bookRes.status);
  console.log('Response Data:', bookData);

  if (bookRes.status === 400 && bookData.message.includes('already have 3 active appointments')) {
    console.log('SUCCESS: Customer was correctly blocked after 3 active bookings!');
  } else {
    console.error('FAILURE: Customer was NOT blocked correctly.');
  }

  // 3. Attempt admin override booking for 4th slot
  console.log('\n--- 3. Attempting 4th booking as Admin (should be allowed override)... ---');
  const adminBookRes = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      customerName: 'Admin Override Test',
      phone: testPhone,
      service: 'Haircut & Styling',
      stylist: artistName,
      artistId: artistId,
      date: futureStr4,
      time: '13:00',
      notes: 'Admin bypasses limit'
    })
  });
  const adminBookData = await adminBookRes.json();
  console.log('Response Status:', adminBookRes.status);
  console.log('Response Data:', adminBookData);

  let adminBookingId = null;
  if (adminBookRes.status === 201 && adminBookData.success) {
    adminBookingId = adminBookData.data._id;
    console.log('SUCCESS: Admin was allowed to bypass the 3 active bookings limit!');
  } else {
    console.error('FAILURE: Admin override was blocked.');
  }

  // Cleanup admin booking before proceeding to reschedule/cancellation tests
  if (adminBookingId) {
    await Booking.deleteOne({ _id: adminBookingId });
  }

  // 4. Test rescheduling does not trigger active booking limit
  console.log('\n--- 4. Rescheduling active booking (should be allowed)... ---');
  const rescheduleRes = await fetch(`${API_URL}/bookings/reschedule`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: b1._id.toString(),
      date: futureStr1,
      time: '14:00' // change time, should be allowed
    })
  });
  const rescheduleData = await rescheduleRes.json();
  console.log('Response Status:', rescheduleRes.status);
  console.log('Response Data:', rescheduleData);
  if (rescheduleRes.status === 200 && rescheduleData.success) {
    console.log('SUCCESS: Rescheduling does not trigger the limit validation!');
  } else {
    console.error('FAILURE: Rescheduling was blocked.');
  }

  // 5. Cancel one booking and try customer booking again
  console.log('\n--- 5. Cancelling one active booking and testing booking creation again... ---');
  const cancelRes = await fetch(`${API_URL}/bookings/cancel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: b3._id.toString() })
  });
  console.log('Cancellation Status:', cancelRes.status);

  // Now active booking count is 2 (b1 and b2). A new customer booking should be allowed.
  console.log('Attempting customer booking again after cancellation...');
  const retryBookRes = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Test Limit User',
      phone: testPhone,
      service: 'Haircut & Styling',
      stylist: artistName,
      artistId: artistId,
      date: futureStr4,
      time: '15:00',
      notes: 'Should succeed now'
    })
  });
  const retryBookData = await retryBookRes.json();
  console.log('Response Status:', retryBookRes.status);
  console.log('Response Data:', retryBookData);

  if (retryBookRes.status === 201 && retryBookData.success) {
    console.log('SUCCESS: New customer booking was allowed after cancelling an active one!');
    await Booking.deleteOne({ _id: retryBookData.data._id });
  } else {
    console.error('FAILURE: Customer booking was still blocked after cancellation.');
  }

  // Cleanup test bookings
  console.log('\nCleaning up database records...');
  await Booking.deleteMany({ phone: testPhone });
  if (createdTempAdmin) {
    await Admin.deleteOne({ _id: admin._id });
  }

  await mongoose.disconnect();
  console.log('\nVerification complete.');
}

runTests().catch(err => {
  console.error('Unhandled error:', err);
  mongoose.disconnect();
});
