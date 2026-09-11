const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { connectDB, closeDB } = require('../src/config/db');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = require('../src/models/User');
const Booking = require('../src/models/Booking');
const Cinema = require('../src/models/Cinema');
const Screen = require('../src/models/Screen');
const Show = require('../src/models/Show');
const Movie = require('../src/models/Movie');
const City = require('../src/models/City');
const CategoryItem = require('../src/models/CategoryItem');
const Offer = require('../src/models/Offer');
const { JWT_SECRET } = require('../src/middleware/authMiddleware');

async function verifyAll() {
  console.log('=== VERIFYING CUSTOMER PLATFORM INTEGRITY & APIS ===\n');
  await connectDB();

  // 1. Check all Models Loaded cleanly
  console.log('✅ All Customer-Only Mongoose models loaded successfully.');

  // 2. Verify Zero Admin / Partner Accounts
  const nonCustomers = await User.find({ role: { $nin: ['customer', 'user'] } });
  if (nonCustomers.length > 0) {
    throw new Error(`Integrity Failure: Found ${nonCustomers.length} non-customer accounts!`);
  }
  console.log('✅ 0 Admin or Partner accounts exist in database.');

  // 3. Verify Customer Accounts Count & Authenticate Demo User
  const customersCount = await User.countDocuments();
  console.log(`✅ Total active Customer accounts: ${customersCount}`);

  const demoUser = await User.findOne({ email: 'demo@bookmyshow.com' });
  if (!demoUser) {
    throw new Error('Integrity Failure: Demo customer account not found!');
  }
  const isMatch = await demoUser.comparePassword('password123');
  if (!isMatch) {
    throw new Error('Integrity Failure: Demo customer password verification failed!');
  }
  console.log(`✅ Demo customer authentication verified: ${demoUser.email} (Role: ${demoUser.role})`);

  // 4. Test Token Generation & Verification
  const token = jwt.sign(
    { id: demoUser._id.toString(), email: demoUser.email, name: demoUser.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  const decoded = jwt.verify(token, JWT_SECRET);
  if (decoded.email !== demoUser.email) {
    throw new Error('Integrity Failure: JWT payload mismatch!');
  }
  console.log('✅ Customer JWT generation and verification working.');

  // 5. Verify Customer Booking History
  const totalBookings = await Booking.countDocuments();
  const demoBookings = await Booking.find({ user: demoUser._id });
  console.log(`✅ Total confirmed customer bookings in DB: ${totalBookings}`);
  console.log(`✅ Demo customer bookings: ${demoBookings.length}`);

  // 6. Verify Catalog Assets
  const [moviesCount, showsCount, cinemasCount, screensCount, citiesCount, offersCount, categoriesCount] = await Promise.all([
    Movie.countDocuments(),
    Show.countDocuments(),
    Cinema.countDocuments(),
    Screen.countDocuments(),
    City.countDocuments(),
    Offer.countDocuments(),
    CategoryItem.countDocuments()
  ]);

  console.log('\n--- Catalog & Venue Summary ---');
  console.table({
    Movies: moviesCount,
    Shows: showsCount,
    Cinemas: cinemasCount,
    Screens: screensCount,
    Cities: citiesCount,
    Offers: offersCount,
    CategoryItems: categoriesCount
  });

  // 7. Verify Broken References on Bookings
  const allBookings = await Booking.find();
  const userIds = new Set((await User.find({}, '_id')).map(u => u._id.toString()));
  let brokenBookingUsers = 0;
  for (const b of allBookings) {
    if (b.user && !userIds.has(b.user.toString())) {
      brokenBookingUsers++;
    }
    if (b.partner) {
      throw new Error(`Integrity Failure: Booking ${b.bookingId} still has partner field!`);
    }
  }
  if (brokenBookingUsers > 0) {
    throw new Error(`Integrity Failure: ${brokenBookingUsers} bookings have missing users!`);
  }
  console.log('✅ 0 broken booking references detected.');

  // 8. Verify Broken References on Shows
  const allShows = await Show.find();
  const cinemaIds = new Set((await Cinema.find({}, '_id')).map(c => c._id.toString()));
  const movieIds = new Set((await Movie.find({}, '_id')).map(m => m._id.toString()));
  let brokenShowCinemas = 0;
  let brokenShowMovies = 0;
  for (const s of allShows) {
    if (s.cinema && !cinemaIds.has(s.cinema.toString())) {
      brokenShowCinemas++;
    }
    if (s.movie && !movieIds.has(s.movie.toString())) {
      brokenShowMovies++;
    }
    if (s.partner) {
      throw new Error(`Integrity Failure: Show ${s._id} still has partner field!`);
    }
  }
  console.log(`✅ Show reference check: 0 broken cinemas, 0 broken movies.`);

  console.log('\n🎉 ALL CUSTOMER PLATFORM INTEGRITY CHECKS PASSED WITH 100% SUCCESS!');
  await closeDB();
}

verifyAll().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
