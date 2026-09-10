const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getMovies,
  createMovie,
  updateMovie,
  deleteMovie,
  addTheatreToMovie,
  deleteTheatreFromMovie,
  addShowtimeToTheatre,
  deleteShowtimeFromTheatre,
  getBookings,
  updateBookingStatus,
  getCategoryItems,
  createCategoryItem,
  deleteCategoryItem,
  getUsers,
  updateUserRole
} = require('../controllers/adminController');

// Guard all admin routes with authentication and super admin role check
router.use(authenticateToken, requireAdmin);

// Dashboard
router.get('/stats', getDashboardStats);

// Movie Management
router.get('/movies', getMovies);
router.post('/movies', createMovie);
router.put('/movies/:id', updateMovie);
router.delete('/movies/:id', deleteMovie);

// Theatres & Shows linked to Movies
router.post('/movies/:id/theatres', addTheatreToMovie);
router.delete('/movies/:id/theatres/:theatreId', deleteTheatreFromMovie);
router.post('/movies/:id/theatres/:theatreId/showtimes', addShowtimeToTheatre);
router.delete('/movies/:id/theatres/:theatreId/showtimes/:showtimeId', deleteShowtimeFromTheatre);

// Bookings Management
router.get('/bookings', getBookings);
router.put('/bookings/:id/status', updateBookingStatus);

// Category Items (Live Events, Banners, Sports, Plays)
router.get('/items', getCategoryItems);
router.post('/items', createCategoryItem);
router.delete('/items/:id', deleteCategoryItem);

// User Accounts & Role Permissions
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);

module.exports = router;
