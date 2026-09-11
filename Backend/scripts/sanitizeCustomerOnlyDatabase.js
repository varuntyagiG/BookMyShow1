const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { connectDB, closeDB } = require('../src/config/db');
const mongoose = require('mongoose');

async function sanitizeDatabase() {
  console.log('=== STARTING DATABASE CLEANUP & RELATIONSHIP SANITIZATION ===\n');
  await connectDB();
  const db = mongoose.connection.db;

  // 1. Pre-validation checks
  console.log('--- 1. Pre-cleanup Verification ---');
  const preUsers = await db.collection('users').find().toArray();
  const preCustomers = preUsers.filter(u => u.role === 'customer' || u.role === 'user');
  const preAdmins = preUsers.filter(u => u.role === 'admin');
  const prePartners = preUsers.filter(u => u.role === 'cinema_partner' || u.role === 'partner');
  const preBookings = await db.collection('bookings').countDocuments();
  const preAuditLogs = await db.collection('auditlogs').countDocuments();

  console.log(`Pre Total Users: ${preUsers.length} (Customers: ${preCustomers.length}, Admins: ${preAdmins.length}, Partners: ${prePartners.length})`);
  console.log(`Pre Total Bookings: ${preBookings}`);
  console.log(`Pre Audit Logs: ${preAuditLogs}`);

  if (preCustomers.length === 0) {
    throw new Error('Safety abort: No customer accounts detected in database!');
  }

  // 2. Delete Admin & Partner Users
  console.log('\n--- 2. Deleting Admin & Vendor Users ---');
  const deleteUsersResult = await db.collection('users').deleteMany({
    role: { $in: ['admin', 'cinema_partner', 'partner'] }
  });
  console.log(`Deleted ${deleteUsersResult.deletedCount} Admin & Partner user accounts.`);

  // 3. Drop / Empty auditlogs collection
  console.log('\n--- 3. Removing Audit Logs ---');
  try {
    await db.collection('auditlogs').drop();
    console.log('Successfully dropped auditlogs collection.');
  } catch (err) {
    if (err.codeName === 'NamespaceNotFound') {
      console.log('auditlogs collection was already empty or dropped.');
    } else {
      console.warn('Note dropping auditlogs:', err.message);
    }
  }

  // 4. Sanitize Bookings (remove partner foreign key)
  console.log('\n--- 4. Sanitizing Bookings References ---');
  const bookingsUpdate = await db.collection('bookings').updateMany(
    {},
    { $unset: { partner: "" } }
  );
  console.log(`Unset 'partner' reference from ${bookingsUpdate.modifiedCount} bookings.`);

  // 5. Sanitize Cinemas, Screens, Shows (remove partner foreign key)
  console.log('\n--- 5. Sanitizing Venues & Shows References ---');
  const cinemasUpdate = await db.collection('cinemas').updateMany(
    {},
    { $unset: { partner: "" } }
  );
  console.log(`Unset 'partner' reference from ${cinemasUpdate.modifiedCount} cinemas.`);

  const screensUpdate = await db.collection('screens').updateMany(
    {},
    { $unset: { partner: "" } }
  );
  console.log(`Unset 'partner' reference from ${screensUpdate.modifiedCount} screens.`);

  const showsUpdate = await db.collection('shows').updateMany(
    {},
    { $unset: { partner: "" } }
  );
  console.log(`Unset 'partner' reference from ${showsUpdate.modifiedCount} shows.`);

  // 6. Clean legacy partner fields from Customer records if present
  console.log('\n--- 6. Sanitizing Customer Schema Fields ---');
  const usersUpdate = await db.collection('users').updateMany(
    {},
    {
      $unset: {
        partnerStatus: "",
        businessName: "",
        partnerPhone: "",
        businessAddress: "",
        approvalNotes: "",
        suspendedReason: ""
      }
    }
  );
  console.log(`Sanitized user collection fields (${usersUpdate.modifiedCount} documents updated).`);

  // 7. Post-cleanup Verification & Integrity Checks
  console.log('\n--- 7. Post-cleanup Verification & Cross-Reference Integrity ---');
  const postUsers = await db.collection('users').find().toArray();
  const postBookings = await db.collection('bookings').find().toArray();
  const postCinemas = await db.collection('cinemas').find().toArray();
  const postScreens = await db.collection('screens').find().toArray();
  const postShows = await db.collection('shows').find().toArray();
  const postMovies = await db.collection('movies').find().toArray();
  const postCities = await db.collection('cities').find().toArray();
  const postOffers = await db.collection('offers').find().toArray();
  const postCategoryItems = await db.collection('categoryitems').find().toArray();

  const userIds = new Set(postUsers.map(u => u._id.toString()));
  const cinemaIds = new Set(postCinemas.map(c => c._id.toString()));
  const movieIds = new Set(postMovies.map(m => m._id.toString()));

  // Broken reference check on bookings
  let brokenBookingUserCount = 0;
  for (const b of postBookings) {
    if (b.user && !userIds.has(b.user.toString())) {
      brokenBookingUserCount++;
    }
    if (b.partner) {
      throw new Error(`Booking ${b._id} still has partner property!`);
    }
  }

  // Broken reference check on shows
  let brokenShowCinemaCount = 0;
  let brokenShowMovieCount = 0;
  for (const s of postShows) {
    if (s.cinema && !cinemaIds.has(s.cinema.toString())) {
      brokenShowCinemaCount++;
    }
    if (s.movie && !movieIds.has(s.movie.toString())) {
      brokenShowMovieCount++;
    }
    if (s.partner) {
      throw new Error(`Show ${s._id} still has partner property!`);
    }
  }

  const finalSummary = {
    totalCustomersPreserved: postUsers.length,
    adminAccountsRemaining: postUsers.filter(u => u.role === 'admin').length,
    partnerAccountsRemaining: postUsers.filter(u => u.role === 'cinema_partner' || u.role === 'partner').length,
    customerBookingsPreserved: postBookings.length,
    brokenBookingUserReferences: brokenBookingUserCount,
    cinemasPreserved: postCinemas.length,
    screensPreserved: postScreens.length,
    showsPreserved: postShows.length,
    moviesPreserved: postMovies.length,
    citiesPreserved: postCities.length,
    offersPreserved: postOffers.length,
    categoryItemsPreserved: postCategoryItems.length,
    brokenShowCinemaReferences: brokenShowCinemaCount,
    brokenShowMovieReferences: brokenShowMovieCount
  };

  console.table(finalSummary);

  if (
    finalSummary.adminAccountsRemaining === 0 &&
    finalSummary.partnerAccountsRemaining === 0 &&
    finalSummary.totalCustomersPreserved === 24 &&
    finalSummary.customerBookingsPreserved === 42 &&
    finalSummary.brokenBookingUserReferences === 0
  ) {
    console.log('\n🎉 DATABASE SANITIZATION 100% SUCCESSFUL & VERIFIED!');
  } else {
    console.error('\n⚠️ WARNING: Database counts differed from expected values. Check table above.');
  }

  await closeDB();
}

sanitizeDatabase().catch((err) => {
  console.error('❌ Sanitization failed:', err);
  process.exit(1);
});
