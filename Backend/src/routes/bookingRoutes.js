const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelUserBooking,
  getShowSeats
} = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, createBooking);
router.get('/my', authenticateToken, getUserBookings);
router.get('/my-bookings', authenticateToken, getUserBookings);
router.get('/seats', getShowSeats);
router.get('/:id', authenticateToken, getBookingById);
router.put('/:id/cancel', authenticateToken, cancelUserBooking);

module.exports = router;
