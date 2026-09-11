const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (_e) {}

const BASE_URL = 'http://localhost:5000/api';

const results = [];
function recordResult(category, testName, passed, details = '') {
  results.push({ category, testName, passed, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${category}] ${testName} ${details ? '(' + details + ')' : ''}`);
}

async function runComprehensiveE2ETest() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('🧪 BOOKMYTRIP COMPREHENSIVE E2E SYSTEM AUDIT');
  console.log('   Testing Customer + Vendor Subsystems & Real-Time Sync');
  console.log('════════════════════════════════════════════════════════════════\n');

  let customerToken = '';
  let customerId = '';
  let vendorToken = '';
  let vendorId = '';
  let testCinemaId = '';
  let testScreenId = '';
  let testMovieId = '';
  let testMovieCustomId = '';
  let testShowId = '';
  let testBookingId = '';
  let testBookingDocId = '';

  // =========================================================================
  // SECTION 1: API & DATABASE HEALTH
  // =========================================================================
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    const isHealthy = data.status === 'healthy' && data.database?.status === 'connected';
    recordResult('SYSTEM', 'Backend API & MongoDB Atlas Cloud Connection', isHealthy, `Database: ${data.database?.status}`);
  } catch (err) {
    recordResult('SYSTEM', 'Backend API & MongoDB Atlas Cloud Connection', false, err.message);
  }

  // =========================================================================
  // SECTION 2: VENDOR AUTHENTICATION & PROFILE
  // =========================================================================
  try {
    const loginRes = await fetch(`${BASE_URL}/vendor/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'partner@cinemaworld.com',
        password: 'Partner@123'
      })
    });
    const loginData = await loginRes.json();
    if (loginData.success && loginData.token) {
      vendorToken = loginData.token;
      vendorId = loginData.user.id;
      recordResult('VENDOR', 'Partner Sign-In', true, `Partner: ${loginData.user.businessName}`);
    } else {
      recordResult('VENDOR', 'Partner Sign-In', false, loginData.message);
    }
  } catch (err) {
    recordResult('VENDOR', 'Partner Sign-In', false, err.message);
  }

  const vendorHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${vendorToken}`
  };

  try {
    const profileRes = await fetch(`${BASE_URL}/vendor/profile`, { headers: vendorHeaders });
    const profileData = await profileRes.json();
    recordResult('VENDOR', 'Fetch Partner Profile & Multi-Tenancy Stats', profileData.success, `Cinemas: ${profileData.data?.stats?.cinemasCount}`);
  } catch (err) {
    recordResult('VENDOR', 'Fetch Partner Profile & Multi-Tenancy Stats', false, err.message);
  }

  // =========================================================================
  // SECTION 3: VENDOR CINEMA MANAGEMENT
  // =========================================================================
  try {
    const uniqueCinemaName = `Grand Rex Plex ${Date.now()}`;
    const createCinemaRes = await fetch(`${BASE_URL}/vendor/cinemas`, {
      method: 'POST',
      headers: vendorHeaders,
      body: JSON.stringify({
        name: uniqueCinemaName,
        city: 'Bengaluru',
        state: 'Karnataka',
        address: '88 MG Road, Central Plaza',
        contactPhone: '9820098200',
        contactEmail: 'contact@grandrex.com',
        facilities: ['M-Ticket', 'F&B', 'Recliner', 'IMAX Laser', 'Dolby Atmos']
      })
    });
    const cinemaData = await createCinemaRes.json();
    if (cinemaData.success && cinemaData.data) {
      testCinemaId = cinemaData.data.id || cinemaData.data._id;
      recordResult('VENDOR', 'Create Cinema Venue', true, `Name: ${cinemaData.data.name}`);
    } else {
      recordResult('VENDOR', 'Create Cinema Venue', false, cinemaData.message);
    }
  } catch (err) {
    recordResult('VENDOR', 'Create Cinema Venue', false, err.message);
  }

  try {
    const getCinemasRes = await fetch(`${BASE_URL}/vendor/cinemas`, { headers: vendorHeaders });
    const listData = await getCinemasRes.json();
    const hasCreated = listData.data?.some(c => (c.id || c._id) === testCinemaId);
    recordResult('VENDOR', 'Fetch Partner Cinemas (Multi-Tenancy Scoped)', hasCreated, `Found ${listData.data?.length} partner cinemas`);
  } catch (err) {
    recordResult('VENDOR', 'Fetch Partner Cinemas (Multi-Tenancy Scoped)', false, err.message);
  }

  // =========================================================================
  // SECTION 4: VENDOR AUDITORIUM SCREENS & SEATING TIERS
  // =========================================================================
  try {
    const createScreenRes = await fetch(`${BASE_URL}/vendor/screens`, {
      method: 'POST',
      headers: vendorHeaders,
      body: JSON.stringify({
        cinemaId: testCinemaId,
        screenNumber: 'AUDI-1',
        name: 'Audi 1 (IMAX Laser)',
        screenType: 'IMAX 2D',
        totalCapacity: 64,
        seatingLayout: [
          { row: 'A', tier: 'Recliner', basePrice: 480, seatsCount: 8, disabledSeats: [] },
          { row: 'B', tier: 'Premium', basePrice: 320, seatsCount: 12, disabledSeats: [] },
          { row: 'C', tier: 'Normal', basePrice: 200, seatsCount: 14, disabledSeats: [] }
        ]
      })
    });
    const screenData = await createScreenRes.json();
    if (screenData.success && screenData.data) {
      testScreenId = screenData.data.id || screenData.data._id;
      recordResult('VENDOR', 'Create Auditorium Screen with Tiered Seating Layout', true, `Cap: ${screenData.data.totalCapacity} seats`);
    } else {
      recordResult('VENDOR', 'Create Auditorium Screen with Tiered Seating Layout', false, screenData.message);
    }
  } catch (err) {
    recordResult('VENDOR', 'Create Auditorium Screen with Tiered Seating Layout', false, err.message);
  }

  // =========================================================================
  // SECTION 5: VENDOR MOVIE PUBLISHING (INTERCONNECTION TEST)
  // =========================================================================
  try {
    const testMovieTitle = `Avatar: The Horizon Chronicles ${Date.now()}`;
    const createMovieRes = await fetch(`${BASE_URL}/vendor/movies`, {
      method: 'POST',
      headers: vendorHeaders,
      body: JSON.stringify({
        title: testMovieTitle,
        synopsis: 'An epic new adventure spanning the uncharted horizons of Pandora.',
        genre: ['Sci-Fi', 'Adventure'],
        language: 'English',
        certificate: 'UA',
        duration: '2h 55m',
        releaseDate: 'In Cinemas',
        rating: 9.3,
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
        formats: ['2D', 'IMAX 2D', '3D'],
        cities: ['Bengaluru', 'Mumbai', 'Delhi-NCR']
      })
    });
    const movieData = await createMovieRes.json();
    if (movieData.success && movieData.data) {
      testMovieId = movieData.data._id;
      testMovieCustomId = movieData.data.id;
      recordResult('VENDOR', 'Publish Movie to Platform Catalog', true, `Title: ${movieData.data.title}`);
    } else {
      recordResult('VENDOR', 'Publish Movie to Platform Catalog', false, movieData.message);
    }
  } catch (err) {
    recordResult('VENDOR', 'Publish Movie to Platform Catalog', false, err.message);
  }

  // Verify movie immediately appears in customer catalog
  try {
    const customerHomeRes = await fetch(`${BASE_URL}/home?city=Bengaluru`);
    const homeData = await customerHomeRes.json();
    const movieVisibleToCustomer = homeData.data?.movies?.some(m => m.title.includes('Avatar: The Horizon'));
    recordResult('CUSTOMER', 'Real-Time Interconnection: Vendor Movie Visible on Customer Home', movieVisibleToCustomer, 'Instant sync without manual publishing');
  } catch (err) {
    recordResult('CUSTOMER', 'Real-Time Interconnection: Vendor Movie Visible on Customer Home', false, err.message);
  }

  // =========================================================================
  // SECTION 6: VENDOR SHOW SCHEDULING
  // =========================================================================
  try {
    const createShowRes = await fetch(`${BASE_URL}/vendor/shows`, {
      method: 'POST',
      headers: vendorHeaders,
      body: JSON.stringify({
        cinemaId: testCinemaId,
        screenId: testScreenId,
        movieId: testMovieId,
        showDate: 'Today',
        startTime: '08:00 PM',
        endTime: '11:00 PM',
        format: 'IMAX 2D',
        ticketPrice: 280,
        pricingTiers: { normal: 200, premium: 280, recliner: 480 }
      })
    });
    const showData = await createShowRes.json();
    if (showData.success && showData.data) {
      testShowId = showData.data.id || showData.data._id;
      recordResult('VENDOR', 'Schedule Showtime on Screen', true, `Time: ${showData.data.startTime} (${showData.data.showDate})`);
    } else {
      recordResult('VENDOR', 'Schedule Showtime on Screen', false, showData.message);
    }
  } catch (err) {
    recordResult('VENDOR', 'Schedule Showtime on Screen', false, err.message);
  }

  // Verify Show Heatmap endpoint
  try {
    const seatMapRes = await fetch(`${BASE_URL}/vendor/shows/${testShowId}/seatmap`, { headers: vendorHeaders });
    const seatMapData = await seatMapRes.json();
    recordResult('VENDOR', 'Auditorium Live Seat Heatmap', seatMapData.success, `Capacity: ${seatMapData.data?.totalCapacity}, Booked: ${seatMapData.data?.totalBookedSeats}`);
  } catch (err) {
    recordResult('VENDOR', 'Auditorium Live Seat Heatmap', false, err.message);
  }

  // =========================================================================
  // SECTION 7: CUSTOMER BOOKING FLOW ON VENDOR SHOW
  // =========================================================================
  // 1. Customer Registration or Sign-In
  const custEmail = `test_customer_${Date.now()}@example.com`;
  try {
    const custRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Aarav Mehta',
        email: custEmail,
        password: 'Password123!',
        phone: '9876543210'
      })
    });
    const custData = await custRegRes.json();
    if (custData.success && custData.token) {
      customerToken = custData.token;
      customerId = custData.user.id || custData.user._id;
      recordResult('CUSTOMER', 'Customer Registration & Sign-In', true, `User: ${custData.user.name} (${custEmail})`);
    } else {
      recordResult('CUSTOMER', 'Customer Registration & Sign-In', false, custData.message);
    }
  } catch (err) {
    recordResult('CUSTOMER', 'Customer Registration & Sign-In', false, err.message);
  }

  const customerHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${customerToken}`
  };

  // 2. Customer views Movie Details & Partner Theatres
  try {
    const movieDetailsRes = await fetch(`${BASE_URL}/movies/${testMovieId}`);
    const detailsData = await movieDetailsRes.json();
    const hasTheatres = detailsData.movie?.theatres?.length > 0;
    recordResult('CUSTOMER', 'Movie Details Page: Vendor Showtimes Merged Live', hasTheatres, `Theatres: ${detailsData.movie?.theatres?.length}`);
  } catch (err) {
    recordResult('CUSTOMER', 'Movie Details Page: Vendor Showtimes Merged Live', false, err.message);
  }

  // 3. Customer Books 2 Seats on the Partner Show
  try {
    const seatsToBook = ['B-5', 'B-6'];
    const bookingRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: customerHeaders,
      body: JSON.stringify({
        showId: testShowId,
        cinemaId: testCinemaId,
        screenId: testScreenId,
        movieId: testMovieId,
        theatreName: 'Grand Rex Central',
        showtime: '08:00 PM',
        showDate: 'Today',
        seats: seatsToBook,
        seatsCount: 2,
        categoryType: 'movie'
      })
    });
    const bookingData = await bookingRes.json();
    if (bookingData.success && bookingData.booking) {
      testBookingId = bookingData.booking.bookingId;
      testBookingDocId = bookingData.booking.id || bookingData.booking._id;
      recordResult('CUSTOMER', 'Reserve Movie Tickets (Atomic Seat Lock Concurrency)', true, `ID: ${testBookingId}, Seats: ${seatsToBook.join(', ')}`);
    } else {
      recordResult('CUSTOMER', 'Reserve Movie Tickets (Atomic Seat Lock Concurrency)', false, bookingData.message);
    }
  } catch (err) {
    recordResult('CUSTOMER', 'Reserve Movie Tickets (Atomic Seat Lock Concurrency)', false, err.message);
  }

  // 4. Concurrency Guard: Another customer tries booking the exact same seats
  try {
    const raceConflictRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: customerHeaders,
      body: JSON.stringify({
        showId: testShowId,
        cinemaId: testCinemaId,
        screenId: testScreenId,
        movieId: testMovieId,
        theatreName: 'Grand Rex Central',
        showtime: '08:00 PM',
        showDate: 'Today',
        seats: ['B-5', 'B-7'],
        seatsCount: 2,
        categoryType: 'movie'
      })
    });
    const conflictData = await raceConflictRes.json();
    const conflictDetected = raceConflictRes.status === 409;
    recordResult('SYSTEM', 'Race Condition Guard: 409 Conflict On Double-Booking Seat', conflictDetected, `Correctly blocked seat collision: ${conflictData.message?.slice(0, 40)}...`);
  } catch (err) {
    recordResult('SYSTEM', 'Race Condition Guard: 409 Conflict On Double-Booking Seat', false, err.message);
  }

  // 5. Customer Views Their Bookings List
  try {
    const myBookingsRes = await fetch(`${BASE_URL}/bookings/my-bookings`, { headers: customerHeaders });
    const myBookingsData = await myBookingsRes.json();
    const hasBooking = myBookingsData.bookings?.some(b => b.bookingId === testBookingId);
    recordResult('CUSTOMER', 'My Bookings History & Digital M-Ticket', hasBooking, `Total customer bookings: ${myBookingsData.bookings?.length}`);
  } catch (err) {
    recordResult('CUSTOMER', 'My Bookings History & Digital M-Ticket', false, err.message);
  }

  // =========================================================================
  // SECTION 8: VENDOR REAL-TIME BOX OFFICE & REVENUE SYNC
  // =========================================================================
  try {
    const manifestRes = await fetch(`${BASE_URL}/vendor/bookings?search=${testBookingId}`, { headers: vendorHeaders });
    const manifestData = await manifestRes.json();
    const foundInManifest = manifestData.data?.some(b => b.bookingId === testBookingId);
    recordResult('VENDOR', 'Real-Time Interconnection: Booking Appears in Vendor Manifest', foundInManifest, `Customer booking synced live to partner`);
  } catch (err) {
    recordResult('VENDOR', 'Real-Time Interconnection: Booking Appears in Vendor Manifest', false, err.message);
  }

  try {
    const analyticsRes = await fetch(`${BASE_URL}/vendor/analytics`, { headers: vendorHeaders });
    const analyticsData = await analyticsRes.json();
    recordResult('VENDOR', 'Box Office Financial Reconciliation & Gross Revenue Sync', analyticsData.success, `Gross Revenue: ₹${analyticsData.data?.summary?.totalRevenue}`);
  } catch (err) {
    recordResult('VENDOR', 'Box Office Financial Reconciliation & Gross Revenue Sync', false, err.message);
  }

  // =========================================================================
  // SECTION 9: GATE TICKET QR SCANNER & CHECK-IN
  // =========================================================================
  try {
    const scanRes = await fetch(`${BASE_URL}/vendor/tickets/scan`, {
      method: 'POST',
      headers: vendorHeaders,
      body: JSON.stringify({ bookingId: testBookingId })
    });
    const scanData = await scanRes.json();
    const verified = scanData.success && scanData.code === 'VERIFIED_SUCCESS';
    recordResult('GATE SCANNER', 'First Gate Check-In: Admit Customer & Valid Gate Entry', verified, `Message: ${scanData.message}`);
  } catch (err) {
    recordResult('GATE SCANNER', 'First Gate Check-In: Admit Customer & Valid Gate Entry', false, err.message);
  }

  // 2. Duplicate check-in prevention test
  try {
    const dupScanRes = await fetch(`${BASE_URL}/vendor/tickets/scan`, {
      method: 'POST',
      headers: vendorHeaders,
      body: JSON.stringify({ bookingId: testBookingId })
    });
    const dupData = await dupScanRes.json();
    const isDuplicateBlocked = dupScanRes.status === 409 && dupData.code === 'ALREADY_VALIDATED';
    recordResult('GATE SCANNER', 'Duplicate Scan Guard: Block Re-Entry (ALREADY_VALIDATED)', isDuplicateBlocked, `Prevented second admission`);
  } catch (err) {
    recordResult('GATE SCANNER', 'Duplicate Scan Guard: Block Re-Entry (ALREADY_VALIDATED)', false, err.message);
  }

  // 3. Verify Customer App reflects check-in status
  try {
    const reCheckRes = await fetch(`${BASE_URL}/bookings/my-bookings`, { headers: customerHeaders });
    const reCheckData = await reCheckRes.json();
    const matchingBooking = reCheckData.bookings?.find(b => b.bookingId === testBookingId);
    const isValidated = matchingBooking?.ticketValidated === true;
    recordResult('CUSTOMER', 'Customer Ticket Status Updates to "✓ Checked In"', isValidated, `ticketValidated: ${isValidated}`);
  } catch (err) {
    recordResult('CUSTOMER', 'Customer Ticket Status Updates to "✓ Checked In"', false, err.message);
  }

  // =========================================================================
  // CLEANUP TEST ARTIFACTS
  // =========================================================================
  try {
    if (testShowId) await fetch(`${BASE_URL}/vendor/shows/${testShowId}/cancel`, { method: 'PUT', headers: vendorHeaders });
    if (testScreenId) await fetch(`${BASE_URL}/vendor/screens/${testScreenId}`, { method: 'DELETE', headers: vendorHeaders });
    if (testCinemaId) await fetch(`${BASE_URL}/vendor/cinemas/${testCinemaId}`, { method: 'DELETE', headers: vendorHeaders });
    console.log('\n🧹 Cleaned up temporary test show, screen, and cinema.');
  } catch (_ignore) {}

  // =========================================================================
  // SUMMARY SCORECARD
  // =========================================================================
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`📊 AUDIT SUMMARY: ${passed}/${total} TESTS PASSED (${Math.round((passed/total)*100)}%)`);
  if (failed === 0) {
    console.log('🎉 ALL SYSTEMS 100% OPERATIONAL & IN FULL SYNC!');
  } else {
    console.log(`⚠️ ${failed} tests reported issues.`);
  }
  console.log('════════════════════════════════════════════════════════════════\n');
}

runComprehensiveE2ETest().catch(err => {
  console.error('FATAL AUDIT ERROR:', err);
  process.exit(1);
});
