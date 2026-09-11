const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateAdminToken } = require('../middleware/adminAuthMiddleware');

// Public route: Admin authentication
router.post('/login', adminController.loginAdmin);

// Protected routes (Requires Platform Super Admin privileges)
router.use(authenticateAdminToken);

// Admin Profile verification
router.get('/me', (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      adminRole: req.user.adminRole || 'super_admin'
    }
  });
});

// 1. Dashboard Overview & Real-time Platform GMV
router.get('/overview', adminController.getOverview);

// 2. Cinema Partner / Vendor Governance
router.get('/vendors', adminController.getVendors);
router.put('/vendors/:vendorId/status', adminController.updateVendorStatus);
router.put('/vendors/:id/status', adminController.updateVendorStatus);

// 3. Central Movie Registry & Spotlight Promotions
router.get('/movies', adminController.getMovies);
router.post('/movies', adminController.createMovie);
router.put('/movies/:movieId', adminController.updateMovie);
router.put('/movies/:id', adminController.updateMovie);
router.delete('/movies/:movieId', adminController.deleteMovie);
router.delete('/movies/:id', adminController.deleteMovie);
router.patch('/movies/:movieId/promote', adminController.togglePromoteMovie);
router.patch('/movies/:id/promote', adminController.togglePromoteMovie);

// 4. Universal Bookings Audit & Refunds
router.get('/bookings', adminController.getBookings);
router.post('/bookings/:bookingId/refund', adminController.refundBooking);
router.post('/bookings/:id/refund', adminController.refundBooking);

// 5. Bank Offers & Promo Engine
router.get('/offers', adminController.getOffers);
router.post('/offers', adminController.createOffer);
router.put('/offers/:offerId', adminController.updateOffer);
router.put('/offers/:id', adminController.updateOffer);
router.delete('/offers/:offerId', adminController.deleteOffer);
router.delete('/offers/:id', adminController.deleteOffer);

// 6. Nodal Settlements & Financial Ledger
router.get('/settlements', adminController.getSettlements);
router.post('/settlements/:partnerId/disburse', adminController.disburseSettlement);
router.post('/settlements/:id/disburse', adminController.disburseSettlement);

module.exports = router;
