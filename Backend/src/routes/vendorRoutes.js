const express = require('express');
const router = express.Router();
const { authenticateVendorToken } = require('../middleware/vendorAuthMiddleware');
const {
  registerVendor,
  loginVendor,
  getProfile,
  updateProfile,
  getCinemas,
  createCinema,
  updateCinema,
  deleteCinema,
  getScreens,
  createScreen,
  updateScreen,
  deleteScreen,
  getMovies,
  createMovie,
  getShows,
  createShow,
  cancelShow,
  getShowSeatMap,
  scanTicket,
  getBookings,
  getAnalytics
} = require('../controllers/vendorController');

// 1. Partner Authentication (Public)
router.post('/register', registerVendor);
router.post('/login', loginVendor);

// 2. Partner Profile & Account (Protected)
router.get('/profile', authenticateVendorToken, getProfile);
router.put('/profile', authenticateVendorToken, updateProfile);

// 3. Cinema Multiplexes & Venues
router.get('/cinemas', authenticateVendorToken, getCinemas);
router.post('/cinemas', authenticateVendorToken, createCinema);
router.put('/cinemas/:id', authenticateVendorToken, updateCinema);
router.delete('/cinemas/:id', authenticateVendorToken, deleteCinema);

// 4. Auditoriums & Seating Layouts
router.get('/screens', authenticateVendorToken, getScreens);
router.post('/screens', authenticateVendorToken, createScreen);
router.put('/screens/:id', authenticateVendorToken, updateScreen);
router.delete('/screens/:id', authenticateVendorToken, deleteScreen);

// 5. Movies Catalog & Add Movie (Interconnected with Customer App)
router.get('/movies', authenticateVendorToken, getMovies);
router.post('/movies', authenticateVendorToken, createMovie);

// 6. Shows & Timetable Scheduling (Interconnected with Customer App)
router.get('/shows', authenticateVendorToken, getShows);
router.post('/shows', authenticateVendorToken, createShow);
router.put('/shows/:id/cancel', authenticateVendorToken, cancelShow);
router.get('/shows/:showId/seatmap', authenticateVendorToken, getShowSeatMap);

// 7. Gate Ticket QR Scanner & Validation
router.post('/tickets/scan', authenticateVendorToken, scanTicket);

// 8. Box Office Bookings Manifest & Analytics
router.get('/bookings', authenticateVendorToken, getBookings);
router.get('/analytics', authenticateVendorToken, getAnalytics);

module.exports = router;
