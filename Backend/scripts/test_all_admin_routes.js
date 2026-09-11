const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const mongoose = require('mongoose');
const { connectDB } = require('../src/config/db');
const User = require('../src/models/User');
const Movie = require('../src/models/Movie');
const Booking = require('../src/models/Booking');
const Offer = require('../src/models/Offer');
const adminController = require('../src/controllers/adminController');

function createMockRes() {
  let responseData = null;
  let statusCode = 200;
  return {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
    getData: () => responseData,
    getStatus: () => statusCode
  };
}

async function runTests() {
  console.log('🚀 Running Complete End-to-End Admin Route Verification Suite...\n');
  await connectDB();

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Admin Login
  console.log('[1/12] Testing Admin Login (POST /login)...');
  const loginRes = createMockRes();
  await adminController.loginAdmin({
    body: { email: 'admin@bookmytrip.com', password: 'Admin@123' }
  }, loginRes);
  const loginData = loginRes.getData();
  assert(loginRes.getStatus() === 200 && loginData?.token, 'Admin login succeeds and issues JWT token');

  // 2. Executive Overview with KPI counts and date range
  console.log('\n[2/12] Testing Executive Overview (GET /overview)...');
  const overviewRes = createMockRes();
  await adminController.getOverview({ query: { range: 'week' } }, overviewRes);
  const overviewData = overviewRes.getData();
  assert(overviewRes.getStatus() === 200, 'getOverview returns status 200');
  assert(overviewData?.data?.stats?.totalMovies > 0, `Overview contains totalMovies (${overviewData?.data?.stats?.totalMovies})`);
  assert(overviewData?.data?.stats?.totalRevenue >= 0, `Overview calculates gross revenue (₹${overviewData?.data?.stats?.totalRevenue})`);
  assert(overviewData?.data?.recentBookings !== undefined, 'Overview contains recentBookings manifest');

  // 3. Cinema Partner Directory
  console.log('\n[3/12] Testing Cinema Partners (GET /vendors)...');
  const vendorsRes = createMockRes();
  await adminController.getVendors({ query: { search: '', status: 'all' } }, vendorsRes);
  const vendorsData = vendorsRes.getData();
  assert(vendorsRes.getStatus() === 200, 'getVendors returns status 200');
  assert(Array.isArray(vendorsData?.data), `Partners list returned (${vendorsData?.data?.length} partners)`);
  if (vendorsData?.data?.length > 0) {
    const firstPartner = vendorsData.data[0];
    assert(firstPartner._id && firstPartner.verificationStatus, 'Partner item has _id and verificationStatus');
  }

  // 4. Update Partner KYC Status
  console.log('\n[4/12] Testing Partner KYC Governance (PUT /vendors/:vendorId/status)...');
  const partnerUser = await User.findOne({ role: 'cinema_partner' });
  if (partnerUser) {
    const statusRes = createMockRes();
    await adminController.updateVendorStatus({
      params: { vendorId: partnerUser._id.toString() },
      body: { status: 'approved' }
    }, statusRes);
    assert(statusRes.getStatus() === 200, 'updateVendorStatus with :vendorId approved returns 200');

    // Test alias with :id
    const aliasRes = createMockRes();
    await adminController.updateVendorStatus({
      params: { id: partnerUser._id.toString() },
      body: { status: 'active' }
    }, aliasRes);
    assert(aliasRes.getStatus() === 200, 'updateVendorStatus with :id alias returns 200');
  }

  // 5. Film Catalog Retrieval & Search
  console.log('\n[5/12] Testing Film Catalog (GET /movies)...');
  const moviesRes = createMockRes();
  await adminController.getMovies({ query: { search: '', genre: 'all' } }, moviesRes);
  const moviesData = moviesRes.getData();
  assert(moviesRes.getStatus() === 200 && Array.isArray(moviesData?.data), `getMovies returns list (${moviesData?.data?.length} movies)`);

  // 6. Film Lifecycle (Create, Update, Promote, Delete)
  console.log('\n[6/12] Testing Movie CRUD & Homepage Spotlight Lifecycle...');
  const createMovieRes = createMockRes();
  await adminController.createMovie({
    body: {
      title: 'Automation Test Film ' + Date.now().toString().slice(-4),
      description: 'A test film for route verification',
      duration: '110',
      rating: 8.5,
      genre: ['Action', 'Thriller'],
      language: 'English',
      isPromoted: false
    },
    user: { _id: partnerUser?._id }
  }, createMovieRes);
  const createdMovie = createMovieRes.getData()?.data;
  assert(createMovieRes.getStatus() === 201 && createdMovie?._id, 'createMovie creates new CineData entry');

  if (createdMovie) {
    // Update Movie
    const updateMovieRes = createMockRes();
    await adminController.updateMovie({
      params: { movieId: createdMovie._id.toString() },
      body: { rating: 9.1, description: 'Updated synopsis' }
    }, updateMovieRes);
    assert(updateMovieRes.getStatus() === 200, 'updateMovie updates metadata');

    // Toggle Spotlight
    const promoteRes = createMockRes();
    await adminController.togglePromoteMovie({
      params: { movieId: createdMovie._id.toString() }
    }, promoteRes);
    assert(promoteRes.getStatus() === 200, 'togglePromoteMovie toggles spotlight on');

    // Delete Movie
    const deleteMovieRes = createMockRes();
    await adminController.deleteMovie({
      params: { movieId: createdMovie._id.toString() }
    }, deleteMovieRes);
    assert(deleteMovieRes.getStatus() === 200, 'deleteMovie cleans up test movie');
  }

  // 7. Universal Bookings Retrieval & Search
  console.log('\n[7/12] Testing Universal Bookings (GET /bookings)...');
  const bookingsRes = createMockRes();
  await adminController.getBookings({ query: { search: '', status: 'all', limit: 10 } }, bookingsRes);
  const bookingsData = bookingsRes.getData();
  assert(bookingsRes.getStatus() === 200 && Array.isArray(bookingsData?.data), `getBookings returns bookings ledger (${bookingsData?.data?.length} entries)`);

  // 8. Force Refund Booking
  console.log('\n[8/12] Testing Force Refund (POST /bookings/:bookingId/refund)...');
  const activeBooking = await Booking.findOne({ bookingStatus: 'confirmed' });
  if (activeBooking) {
    const refundRes = createMockRes();
    await adminController.refundBooking({
      params: { bookingId: activeBooking._id.toString() },
      body: { reason: 'Automated Route Test Reversal' },
      user: partnerUser
    }, refundRes);
    assert(refundRes.getStatus() === 200, 'refundBooking successfully marks booking as refunded');
  } else {
    console.log('  ⚠️ (Skipped refund execution: no active confirmed booking found)');
  }

  // 9. Bank Alliances & Offers Catalog
  console.log('\n[9/12] Testing Bank Alliances (GET /offers)...');
  const offersRes = createMockRes();
  await adminController.getOffers({}, offersRes);
  const offersData = offersRes.getData();
  assert(offersRes.getStatus() === 200 && Array.isArray(offersData?.data), `getOffers returns offers list (${offersData?.data?.length} offers)`);

  // 10. Offer Lifecycle (Create, Update, Delete)
  console.log('\n[10/12] Testing Offer Campaign Lifecycle (Create, Toggle, Delete)...');
  const testCode = 'TEST' + Date.now().toString().slice(-5);
  const createOfferRes = createMockRes();
  await adminController.createOffer({
    body: {
      code: testCode,
      title: 'Automated Test Bank Deal',
      description: 'Buy 1 Get 1 for test purposes',
      discountType: 'b1g1',
      discountValue: 100,
      maxDiscountAmount: 300,
      minBookingAmount: 200,
      bankName: 'HDFC Bank',
      cardType: 'Credit',
      category: 'bank',
      badgeText: 'B1G1',
      usageLimitPerUser: 1,
      isActive: true
    }
  }, createOfferRes);
  const createdOffer = createOfferRes.getData()?.data;
  assert(createOfferRes.getStatus() === 201 && createdOffer?._id, `createOffer persists offer under ${testCode}`);

  if (createdOffer) {
    // Update offer
    const updateOfferRes = createMockRes();
    await adminController.updateOffer({
      params: { offerId: createdOffer._id.toString() },
      body: { isActive: false }
    }, updateOfferRes);
    assert(updateOfferRes.getStatus() === 200, 'updateOffer pauses offer campaign');

    // Delete offer
    const deleteOfferRes = createMockRes();
    await adminController.deleteOffer({
      params: { offerId: createdOffer._id.toString() }
    }, deleteOfferRes);
    assert(deleteOfferRes.getStatus() === 200, 'deleteOffer deletes test campaign');
  }

  // 11. Settlements Ledger
  console.log('\n[11/12] Testing Nodal Financial Settlements (GET /settlements)...');
  const settlementsRes = createMockRes();
  await adminController.getSettlements({}, settlementsRes);
  const settlementsData = settlementsRes.getData();
  assert(settlementsRes.getStatus() === 200 && Array.isArray(settlementsData?.data), `getSettlements returns nodal ledgers (${settlementsData?.data?.length} partners)`);

  // 12. Settlement Wire Disbursement
  console.log('\n[12/12] Testing Wire Disbursement (POST /settlements/:partnerId/disburse)...');
  if (partnerUser) {
    const disburseRes = createMockRes();
    await adminController.disburseSettlement({
      params: { partnerId: partnerUser._id.toString() },
      body: { utrNumber: 'UTR-TEST-' + Date.now().toString().slice(-6), amount: 5000 }
    }, disburseRes);
    assert(disburseRes.getStatus() === 200, 'disburseSettlement authorizes wire disbursement');
  }

  console.log('\n=============================================');
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((e) => {
  console.error('Fatal error during test run:', e);
  process.exit(1);
});
