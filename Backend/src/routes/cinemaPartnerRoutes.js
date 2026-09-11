const express = require('express');
const router = express.Router();
const { authenticateToken, requireCinemaPartner } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getCinemas,
  createCinema,
  getCinemaById,
  updateCinema,
  deleteCinema,
  getScreens,
  createScreen,
  updateScreen,
  deleteScreen,
  getAvailableMovies,
  getShows,
  createShow,
  updateShow,
  deleteShow,
  getBookings,
  getBookingById,
  getTickets,
  validateTicket,
  getRevenue,
  getReports,
  getProfile,
  updateProfile
} = require('../controllers/cinemaPartnerController');

// All B2B Cinema Partner endpoints require valid token and cinema_partner role
router.use(authenticateToken, requireCinemaPartner);

// 1. Dashboard
router.get('/dashboard', getDashboardStats);

// 2. Cinema Management
router.get('/cinemas', getCinemas);
router.post('/cinemas', createCinema);
router.get('/cinemas/:cinemaId', getCinemaById);
router.put('/cinemas/:cinemaId', updateCinema);
router.delete('/cinemas/:cinemaId', deleteCinema);

// 3. Screen & Seating Layout Management
router.get('/screens', getScreens);
router.post('/screens', createScreen);
router.put('/screens/:screenId', updateScreen);
router.delete('/screens/:screenId', deleteScreen);

// 4. Central Movie Catalog (for scheduling)
router.get('/movies', getAvailableMovies);

// 5. Show Management (with screen overlap conflict detection)
router.get('/shows', getShows);
router.post('/shows', createShow);
router.put('/shows/:showId', updateShow);
router.delete('/shows/:showId', deleteShow);

// 6. Bookings (Scoped to Partner Cinemas)
router.get('/bookings', getBookings);
router.get('/bookings/:id', getBookingById);

// 7. Tickets Inventory
router.get('/tickets', getTickets);

// 8. QR / Ticket Gate Scanner & Atomic Validation
router.post('/scanner/validate', validateTicket);

// 9. Revenue & Financial Analytics
router.get('/revenue', getRevenue);

// 10. Operational Reports (Sales, Occupancy, Movie Performance)
router.get('/reports', getReports);

// 11. Partner Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;
