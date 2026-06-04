import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/looks-hub';
const API_URL = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Helpers
const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getFutureDateString = (daysAhead) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Main test function
async function runTests() {
  console.log('=== Same-Day Advance Booking Restriction System Verification ===');
  
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

  // Find or create an artist to book
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

  const todayStr = getTodayString();
  const futureStr = getFutureDateString(3);

  console.log(`\nTesting dates - Today: ${todayStr}, Future: ${futureStr}`);

  // Test 1: Query available slots for today
  console.log('\n--- Test 1: Fetching available slots for today ---');
  const slotsRes = await fetch(`${API_URL}/bookings/available-slots?date=${todayStr}&artistId=${artistId}`);
  const slotsData = await slotsRes.json();
  
  if (slotsData.success) {
    console.log(`Today's available slots returned: ${slotsData.data.join(', ')}`);
    const now = new Date();
    // Validate all slots are >= 2 hours away
    let anyInvalidSlot = false;
    for (const slot of slotsData.data) {
      const slotTime = new Date(`${todayStr}T${slot}`);
      const diffHours = (slotTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (diffHours < 2) {
        console.error(`FAILURE: Found slot ${slot} today which is less than 2 hours away (diff: ${diffHours.toFixed(2)} hours).`);
        anyInvalidSlot = true;
      }
    }
    if (!anyInvalidSlot) {
      console.log('SUCCESS: All returned slots for today are at least 2 hours in the future!');
    }
  } else {
    console.error('FAILURE: Failed to query available slots:', slotsData.message);
  }

  // Test 2: Verify future date slots are unaffected
  console.log('\n--- Test 2: Fetching available slots for a future date ---');
  const futureSlotsRes = await fetch(`${API_URL}/bookings/available-slots?date=${futureStr}&artistId=${artistId}`);
  const futureSlotsData = await futureSlotsRes.json();
  if (futureSlotsData.success) {
    console.log(`Future date slots returned count: ${futureSlotsData.data.length}`);
    if (futureSlotsData.data.length > 0) {
      console.log('SUCCESS: Future date slots list is populated and unaffected.');
    } else {
      console.error('FAILURE: Future date returned 0 slots.');
    }
  } else {
    console.error('FAILURE: Failed to query future slots:', futureSlotsData.message);
  }

  // Calculate a time that is within 2 hours
  const nearTimeObj = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
  const nearTimeStr = `${String(nearTimeObj.getHours()).padStart(2, '0')}:${String(nearTimeObj.getMinutes()).padStart(2, '0')}`;
  
  // Test 3: Attempt customer booking for a slot within 2 hours
  console.log(`\n--- Test 3: Attempt customer booking for today at ${nearTimeStr} (1 hour away) ---`);
  const bookRes = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Customer Test',
      phone: '+919999999999',
      service: 'Haircut & Styling',
      stylist: artistName,
      artistId: artistId,
      date: todayStr,
      time: nearTimeStr,
      notes: 'Test booking'
    })
  });
  const bookData = await bookRes.json();
  console.log('Response Status:', bookRes.status);
  console.log('Response Data:', bookData);
  if (bookRes.status === 400 && bookData.message === 'Appointments must be booked at least 2 hours in advance.') {
    console.log('SUCCESS: Customer booking within 2 hours was correctly blocked!');
  } else {
    console.error('FAILURE: Customer booking within 2 hours was NOT blocked correctly.');
  }

  // Test 4: Attempt admin booking for a slot within 2 hours
  console.log(`\n--- Test 4: Attempt admin booking for today at ${nearTimeStr} (1 hour away) ---`);
  const adminBookRes = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      customerName: 'Admin Override Test',
      phone: '+919999999999',
      service: 'Haircut & Styling',
      stylist: artistName,
      artistId: artistId,
      date: todayStr,
      time: nearTimeStr,
      notes: 'Admin overrides advance policy'
    })
  });
  const adminBookData = await adminBookRes.json();
  console.log('Response Status:', adminBookRes.status);
  console.log('Response Data:', adminBookData);
  let adminBookingId = null;
  if (adminBookRes.status === 201 && adminBookData.success) {
    adminBookingId = adminBookData.data._id;
    console.log('SUCCESS: Admin override booking completed successfully!');
  } else {
    console.error('FAILURE: Admin was blocked from booking near-term slot.');
  }

  // Cleanup admin override booking to free the slot for reschedule tests
  if (adminBookingId) {
    console.log('\nCleaning up admin override booking to free the slot...');
    await Booking.deleteOne({ _id: adminBookingId });
    adminBookingId = null;
  }

  // Test 5: Create a future booking and attempt customer reschedule to a slot within 2 hours
  console.log('\n--- Test 5: Rescheduling validation for customer ---');
  // First, create a valid booking on future date
  const futureBookRes = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Reschedule Test Customer',
      phone: '+918888888888',
      service: 'Haircut & Styling',
      stylist: artistName,
      artistId: artistId,
      date: futureStr,
      time: '12:00',
      notes: 'Reschedule test'
    })
  });
  const futureBookData = await futureBookRes.json();
  if (futureBookRes.status === 201 && futureBookData.success) {
    const bookingId = futureBookData.data._id;
    console.log(`Future booking created with ID: ${bookingId}`);

    // Try to reschedule to a time within 2 hours
    console.log(`Attempting customer reschedule to today at ${nearTimeStr}...`);
    const rescheduleRes = await fetch(`${API_URL}/bookings/reschedule`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: bookingId,
        date: todayStr,
        time: nearTimeStr
      })
    });
    const rescheduleData = await rescheduleRes.json();
    console.log('Reschedule Response Status:', rescheduleRes.status);
    console.log('Reschedule Response Data:', rescheduleData);

    if (rescheduleRes.status === 400 && rescheduleData.message === 'Appointments must be booked at least 2 hours in advance.') {
      console.log('SUCCESS: Customer reschedule to a near-term slot was blocked correctly!');
    } else {
      console.error('FAILURE: Customer reschedule was NOT blocked correctly.');
    }

    // Test 6: Attempt admin reschedule to a slot within 2 hours
    console.log(`\n--- Test 6: Attempt admin reschedule to today at ${nearTimeStr} ---`);
    const adminRescheduleRes = await fetch(`${API_URL}/bookings/reschedule`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        id: bookingId,
        date: todayStr,
        time: nearTimeStr
      })
    });
    const adminRescheduleData = await adminRescheduleRes.json();
    console.log('Admin Reschedule Response Status:', adminRescheduleRes.status);
    console.log('Admin Reschedule Response Data:', adminRescheduleData);
    if (adminRescheduleRes.status === 200 && adminRescheduleData.success) {
      console.log('SUCCESS: Admin rescheduled booking to near-term slot successfully!');
    } else {
      console.error('FAILURE: Admin was blocked from rescheduling to near-term slot.');
    }

    // Cleanup future booking
    console.log('\nCleaning up future booking...');
    await Booking.deleteOne({ _id: bookingId });
  } else {
    console.error('FAILURE: Could not create future booking for reschedule test.');
  }

  // Cleanup admin override booking
  if (adminBookingId) {
    console.log('\nCleaning up admin override booking...');
    await Booking.deleteOne({ _id: adminBookingId });
  }

  if (createdTempAdmin) {
    console.log('Cleaning up temp admin...');
    await Admin.deleteOne({ _id: admin._id });
  }

  await mongoose.disconnect();
  console.log('\nVerification tests complete.');
}

runTests().catch(err => {
  console.error('Unhandled error during tests:', err);
  mongoose.disconnect();
});
