const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getBookingById,
  getShowSeats
} = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, createBooking);
router.get('/my', authenticateToken, getUserBookings);
router.get('/seats', getShowSeats);
router.get('/:id', getBookingById);

module.exports = router;
