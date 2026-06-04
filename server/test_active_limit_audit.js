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
  console.log('=== Active Booking Limit Audit Verification ===');
  
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

  const testPhone = '+919999990000';
  const futureStr1 = getFutureDateString(3);
  const futureStr2 = getFutureDateString(4);
  const futureStr3 = getFutureDateString(5);
  const futureStr4 = getFutureDateString(6);

  console.log(`Using test phone: ${testPhone}`);

  // Cleanup old records for this test phone
  await Booking.deleteMany({ phone: testPhone });

  // 1. Create 3 active bookings
  console.log('\nCreating 3 active bookings...');
  const b1 = await Booking.create({
    customerName: 'Test Audit User',
    phone: testPhone,
    service: 'Haircut & Styling',
    stylist: artistName,
    artistId: artistId,
    date: futureStr1,
    time: '10:00',
    status: 'confirmed'
  });
  const b2 = await Booking.create({
    customerName: 'Test Audit User',
    phone: testPhone,
    service: 'Haircut & Styling',
    stylist: artistName,
    artistId: artistId,
    date: futureStr2,
    time: '11:00',
    status: 'confirmed'
  });
  const b3 = await Booking.create({
    customerName: 'Test Audit User',
    phone: testPhone,
    service: 'Haircut & Styling',
    stylist: artistName,
    artistId: artistId,
    date: futureStr3,
    time: '12:00',
    status: 'pending'
  });

  // 2. Attempt customer booking for 4th slot
  console.log('\nAttempting 4th customer booking...');
  const bookRes = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Test Audit User',
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

  const expectedMessage = "You already have 3 active appointments. Please complete or cancel an existing appointment before booking another.";
  if (bookRes.status === 400 && bookData.message === expectedMessage) {
    console.log('SUCCESS: Customer booking blocked with 400 and the exact message string!');
  } else {
    console.error(`FAILURE: Booking creation expected status 400 and message "${expectedMessage}", but got status ${bookRes.status} and message "${bookData.message}"`);
  }

  // 3. Attempt admin override booking for 4th slot
  console.log('\nAttempting 4th booking as Admin (should bypass)...');
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
  console.log('Admin Response Status:', adminBookRes.status);
  if (adminBookRes.status === 201 && adminBookData.success) {
    console.log('SUCCESS: Admin override booking completed successfully!');
    await Booking.deleteOne({ _id: adminBookData.data._id });
  } else {
    console.error('FAILURE: Admin was blocked from booking override.');
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
