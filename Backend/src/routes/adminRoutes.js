const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getAnalytics,
  getCustomers,
  getCustomerById,
  updateCustomerStatus,
  getPartners,
  getPartnerById,
  updatePartnerStatus,
  getCinemas,
  updateCinemaStatus,
  getMovies,
  createMovie,
  updateMovie,
  deleteMovie,
  getShows,
  cancelShow,
  getBookings,
  getBookingById,
  cancelBooking,
  getRevenueOverview,
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  getCities,
  createCity,
  updateCity,
  getAuditLogs,
  getReportData
} = require('../controllers/adminController');

// All admin endpoints strictly require valid JWT and verified platform 'admin' role
router.use(authenticateToken, requireAdmin);

// 1. Dashboard Telemetry & Deep Analytics
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);

// 2. Customer Governance
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerById);
router.put('/customers/:id/status', updateCustomerStatus);

// 3. Cinema Partner Lifecycle & Oversight
router.get('/partners', getPartners);
router.get('/partners/:id', getPartnerById);
router.put('/partners/:id/status', updatePartnerStatus);

// 4. Global Cinema Registry
router.get('/cinemas', getCinemas);
router.put('/cinemas/:id/status', updateCinemaStatus);

// 5. Global Movie Master Catalog
router.get('/movies', getMovies);
router.post('/movies', createMovie);
router.put('/movies/:id', updateMovie);
router.delete('/movies/:id', deleteMovie);

// 6. Screening Schedule Monitoring
router.get('/shows', getShows);
router.put('/shows/:id/cancel', cancelShow);

// 7. Global Bookings & Ticket Oversight
router.get('/bookings', getBookings);
router.get('/bookings/:id', getBookingById);
router.put('/bookings/:id/cancel', cancelBooking);

// 8. Commercial Revenue & Settlements
router.get('/revenue', getRevenueOverview);

// 9. Marketing Promotions & Offers
router.get('/offers', getOffers);
router.post('/offers', createOffer);
router.put('/offers/:id', updateOffer);
router.delete('/offers/:id', deleteOffer);

// 10. Operational Cities
router.get('/cities', getCities);
router.post('/cities', createCity);
router.put('/cities/:id', updateCity);

// 11. Security & Compliance Audit Logs
router.get('/audit-logs', getAuditLogs);

// 12. Reports & Data Export
router.get('/reports/:reportType', getReportData);

module.exports = router;
