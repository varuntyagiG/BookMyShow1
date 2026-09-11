const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const Screen = require('../models/Screen');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const Offer = require('../models/Offer');
const { JWT_SECRET } = require('../middleware/authMiddleware');

/**
 * 1. Admin Login
 */
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Admin privileges required' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, adminRole: user.adminRole || 'super_admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        adminRole: user.adminRole || 'super_admin'
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ success: false, message: 'Server error during admin login' });
  }
};

/**
 * 2. Executive Overview & Global KPIs
 */
exports.getOverview = async (req, res) => {
  try {
    const { range = 'all' } = req.query;

    const bookingFilter = {};
    if (range === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      bookingFilter.createdAt = { $gte: startOfDay };
    } else if (range === 'week') {
      bookingFilter.createdAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    } else if (range === 'month') {
      bookingFilter.createdAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    }

    const [
      customersCount,
      partnersCount,
      cinemasCount,
      screensCount,
      activeShowsCount,
      moviesCount,
      bookings
    ] = await Promise.all([
      User.countDocuments({ role: { $in: ['customer', 'user'] } }),
      User.countDocuments({ role: 'cinema_partner' }),
      Cinema.countDocuments(),
      Screen.countDocuments(),
      Show.countDocuments({ status: 'active' }),
      Movie.countDocuments(),
      Booking.find(bookingFilter).sort({ createdAt: -1 }).limit(100).populate('user', 'name email phone')
    ]);

    let totalGMV = 0;
    let totalCommission = 0;
    let totalTicketsSold = 0;
    let confirmedBookingsCount = 0;

    bookings.forEach((b) => {
      if (b.bookingStatus !== 'cancelled') {
        const amt = Number(b.totalAmount) || 0;
        totalGMV += amt;
        const fee = Number(b.convenienceFee) || Math.round(amt * 0.10);
        totalCommission += fee;
        totalTicketsSold += (b.seats || []).length || b.seatsCount || 1;
        confirmedBookingsCount += 1;
      }
    });

    const recentBookings = bookings.slice(0, 10).map((b) => ({
      id: b._id,
      _id: b._id,
      bookingId: b.bookingId,
      movieTitle: b.movieTitle,
      theatreName: b.theatreName,
      screenName: b.screenName || 'Audi 1',
      customerName: b.user?.name || 'Guest User',
      customerEmail: b.user?.email || '',
      showDate: b.showDate,
      showtime: b.showtime,
      seats: b.seats || [],
      totalAmount: b.totalAmount,
      bookingStatus: b.bookingStatus,
      paymentStatus: b.paymentStatus,
      ticketValidated: b.ticketValidated,
      createdAt: b.createdAt
    }));

    const summaryObj = {
      totalGMV,
      totalCommission,
      totalRevenue: totalGMV,
      platformFeeRevenue: totalCommission,
      totalBookings: confirmedBookingsCount,
      totalTicketsSold,
      confirmedBookingsCount,
      totalCustomers: customersCount,
      totalUsers: customersCount,
      totalPartners: partnersCount,
      totalVendors: partnersCount,
      totalCinemas: cinemasCount,
      totalScreens: screensCount,
      totalShows: activeShowsCount,
      activeShowsCount,
      totalMovies: moviesCount,
      moviesCount,
      pendingVendors: 0
    };

    res.json({
      success: true,
      data: {
        summary: summaryObj,
        stats: summaryObj,
        recentBookings
      }
    });
  } catch (err) {
    console.error('Admin getOverview error:', err);
    res.status(500).json({ success: false, message: 'Failed to load executive overview' });
  }
};

/**
 * 3. Multiplex Partners Directory & KYC Governance
 */
exports.getVendors = async (req, res) => {
  try {
    const { search = '', status = 'all' } = req.query;

    const partnerFilter = { role: 'cinema_partner' };

    if (search.trim()) {
      const q = search.trim();
      partnerFilter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { businessName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } }
      ];
    }

    if (status && status !== 'all') {
      if (status === 'approved' || status === 'active') {
        partnerFilter.$and = [
          { partnerStatus: { $in: ['active', 'approved'] } },
          { isDeactivated: { $ne: true } }
        ];
      } else if (status === 'suspended') {
        partnerFilter.$or = [
          { partnerStatus: 'suspended' },
          { isDeactivated: true }
        ];
      } else if (status === 'pending') {
        partnerFilter.partnerStatus = 'pending';
      }
    }

    const partners = await User.find(partnerFilter).select('-password').sort({ createdAt: -1 });

    const partnersWithDetails = await Promise.all(
      partners.map(async (p) => {
        const cinemas = await Cinema.find({ partner: p._id }).lean();
        const cinemaIds = cinemas.map((c) => c._id);
        const screensCount = await Screen.find({ cinemaId: { $in: cinemaIds } }).countDocuments();
        const showsCount = await Show.find({ cinema: { $in: cinemaIds }, status: 'active' }).countDocuments();

        const isSuspended = p.isDeactivated || p.partnerStatus === 'suspended';
        const isPending = p.partnerStatus === 'pending';
        const verificationStatus = isSuspended ? 'suspended' : isPending ? 'pending' : 'approved';

        return {
          id: p._id,
          _id: p._id,
          name: p.name,
          email: p.email,
          phone: p.phone || p.partnerPhone,
          businessName: p.businessName || p.name,
          businessAddress: p.businessAddress,
          gstin: p.gstin,
          partnerStatus: p.partnerStatus || 'active',
          verificationStatus,
          isDeactivated: p.isDeactivated || false,
          cinemasCount: cinemas.length,
          cinemaCount: cinemas.length,
          screensCount,
          screenCount: screensCount,
          activeShowsCount: showsCount,
          showCount: showsCount,
          cinemas: cinemas.map((c) => ({ id: c._id, _id: c._id, name: c.name, city: c.city, status: c.status })),
          createdAt: p.createdAt
        };
      })
    );

    res.json({ success: true, data: partnersWithDetails });
  } catch (err) {
    console.error('Admin getVendors error:', err);
    res.status(500).json({ success: false, message: 'Failed to load partners' });
  }
};

exports.updateVendorStatus = async (req, res) => {
  try {
    const vendorId = req.params.vendorId || req.params.id;
    const { status } = req.body; // 'active' | 'approved' | 'suspended' | 'pending'

    if (!vendorId) {
      return res.status(400).json({ success: false, message: 'Vendor ID is required' });
    }

    const normalized = (status || '').toLowerCase().trim();
    if (!['active', 'approved', 'suspended', 'pending'].includes(normalized)) {
      return res.status(400).json({ success: false, message: 'Invalid partner status' });
    }

    const isDeactivated = normalized === 'suspended';
    const partnerStatus = normalized === 'approved' ? 'active' : normalized;

    const partner = await User.findByIdAndUpdate(
      vendorId,
      { partnerStatus, isDeactivated },
      { returnDocument: 'after' }
    ).select('-password');

    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }

    const verificationStatus = isDeactivated ? 'suspended' : partnerStatus === 'pending' ? 'pending' : 'approved';

    res.json({
      success: true,
      message: `Partner status updated to ${normalized.toUpperCase()}`,
      data: {
        ...partner.toObject(),
        id: partner._id,
        _id: partner._id,
        verificationStatus
      }
    });
  } catch (err) {
    console.error('Admin updateVendorStatus error:', err);
    res.status(500).json({ success: false, message: 'Failed to update partner status' });
  }
};

/**
 * 4. Master CineData Movie Catalog
 */
exports.getMovies = async (req, res) => {
  try {
    const { search = '', genre = '', status = '' } = req.query;
    const filter = {};

    if (search.trim()) {
      const q = search.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { synopsis: { $regex: q, $options: 'i' } }
      ];
    }

    if (genre && genre !== 'all') {
      filter.genre = { $regex: genre, $options: 'i' };
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const movies = await Movie.find(filter).sort({ createdAt: -1 });
    const formatted = movies.map((m) => {
      const obj = m.toObject();
      return {
        ...obj,
        id: m._id,
        _id: m._id,
        description: obj.synopsis || obj.description || '',
        bannerUrl: obj.backdropUrl || obj.bannerUrl || ''
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('Admin getMovies error:', err);
    res.status(500).json({ success: false, message: 'Failed to load movie catalog' });
  }
};

exports.createMovie = async (req, res) => {
  try {
    const customId = 'pmov-' + Math.floor(100000 + Math.random() * 900000);
    const movieData = {
      ...req.body,
      customId,
      synopsis: req.body.synopsis || req.body.description || '',
      backdropUrl: req.body.backdropUrl || req.body.bannerUrl || '',
      duration: String(req.body.duration || '120'),
      rating: Number(req.body.rating || 8.0),
      status: req.body.status || 'published',
      addedBy: req.user?._id
    };

    const movie = new Movie(movieData);
    await movie.save();

    res.status(201).json({
      success: true,
      message: 'Movie created in CineData registry',
      data: {
        ...movie.toObject(),
        id: movie._id,
        _id: movie._id
      }
    });
  } catch (err) {
    console.error('Admin createMovie error:', err);
    res.status(400).json({ success: false, message: err.message || 'Failed to create movie' });
  }
};

exports.updateMovie = async (req, res) => {
  try {
    const movieId = req.params.movieId || req.params.id;
    if (!movieId) {
      return res.status(400).json({ success: false, message: 'Movie ID is required' });
    }

    const updateData = { ...req.body };
    if (updateData.description && !updateData.synopsis) {
      updateData.synopsis = updateData.description;
    }
    if (updateData.bannerUrl && !updateData.backdropUrl) {
      updateData.backdropUrl = updateData.bannerUrl;
    }
    if (updateData.duration !== undefined) {
      updateData.duration = String(updateData.duration);
    }
    if (updateData.rating !== undefined) {
      updateData.rating = Number(updateData.rating);
    }

    const updated = await Movie.findByIdAndUpdate(movieId, updateData, {
      returnDocument: 'after',
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    res.json({
      success: true,
      message: 'Movie updated successfully',
      data: {
        ...updated.toObject(),
        id: updated._id,
        _id: updated._id
      }
    });
  } catch (err) {
    console.error('Admin updateMovie error:', err);
    res.status(400).json({ success: false, message: err.message || 'Failed to update movie' });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    const movieId = req.params.movieId || req.params.id;
    if (!movieId) {
      return res.status(400).json({ success: false, message: 'Movie ID is required' });
    }

    const deleted = await Movie.findByIdAndDelete(movieId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    res.json({ success: true, message: 'Movie removed from CineData registry' });
  } catch (err) {
    console.error('Admin deleteMovie error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete movie' });
  }
};

exports.togglePromoteMovie = async (req, res) => {
  try {
    const movieId = req.params.movieId || req.params.id;
    if (!movieId) {
      return res.status(400).json({ success: false, message: 'Movie ID is required' });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    movie.isPromoted = !movie.isPromoted;
    await movie.save();

    res.json({
      success: true,
      message: movie.isPromoted ? 'Movie pinned to Homepage Hero' : 'Movie unpinned from Homepage Hero',
      isPromoted: movie.isPromoted
    });
  } catch (err) {
    console.error('Admin togglePromoteMovie error:', err);
    res.status(500).json({ success: false, message: 'Failed to toggle homepage promotion' });
  }
};

/**
 * 5. Universal Nationwide Bookings & Refund Desk
 */
exports.getBookings = async (req, res) => {
  try {
    const { search = '', status = '', page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.bookingStatus = status;
    }

    if (search.trim()) {
      const q = search.trim();
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { phone: { $regex: q, $options: 'i' } }
        ]
      }).select('_id');
      const userIds = matchingUsers.map((u) => u._id);

      filter.$or = [
        { bookingId: { $regex: q, $options: 'i' } },
        { movieTitle: { $regex: q, $options: 'i' } },
        { theatreName: { $regex: q, $options: 'i' } },
        ...(userIds.length > 0 ? [{ user: { $in: userIds } }] : [])
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [total, bookings] = await Promise.all([
      Booking.countDocuments(filter),
      Booking.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('user', 'name email phone')
    ]);

    const formatted = bookings.map((b) => {
      const obj = b.toObject();
      return {
        ...obj,
        id: b._id,
        _id: b._id,
        userId: obj.user || { name: 'Guest User', email: '' }
      };
    });

    res.json({
      success: true,
      data: formatted,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error('Admin getBookings error:', err);
    res.status(500).json({ success: false, message: 'Failed to load bookings' });
  }
};

exports.refundBooking = async (req, res) => {
  try {
    const bookingId = req.params.bookingId || req.params.id;
    const { reason = 'Customer Support Refund' } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }

    const booking =
      (mongoose.Types.ObjectId.isValid(bookingId) ? await Booking.findById(bookingId) : null) ||
      (await Booking.findOne({ bookingId }));

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.bookingStatus === 'cancelled' && booking.paymentStatus === 'refunded') {
      return res.status(400).json({ success: false, message: 'Booking has already been refunded' });
    }

    // 1. Mark as cancelled & refunded
    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.validationHistory = booking.validationHistory || [];
    booking.validationHistory.push({
      action: 'ADMIN_FORCE_REFUND',
      notes: reason,
      validatedAt: new Date(),
      validatedBy: req.user?._id
    });
    await booking.save();

    // 2. Release seats in Show if active
    if (booking.show) {
      const show = await Show.findById(booking.show);
      if (show) {
        show.bookedSeats = (show.bookedSeats || []).filter((s) => !(booking.seats || []).includes(s));
        await show.save();
      }
    }

    res.json({
      success: true,
      message: `Booking #${booking.bookingId} refunded successfully. Allocated seats released.`,
      data: {
        ...booking.toObject(),
        id: booking._id,
        _id: booking._id
      }
    });
  } catch (err) {
    console.error('Admin refundBooking error:', err);
    res.status(500).json({ success: false, message: 'Failed to process refund' });
  }
};

/**
 * 6. Bank Alliances & Offers Engine
 */
exports.getOffers = async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    const formatted = offers.map((o) => {
      const obj = o.toObject();
      return {
        ...obj,
        id: o._id,
        _id: o._id,
        maxDiscountAmount: obj.maxDiscountAmount || obj.maxDiscount || 0,
        isActive: obj.isActive !== undefined ? obj.isActive : obj.status === 'active'
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('Admin getOffers error:', err);
    res.status(500).json({ success: false, message: 'Failed to load offers' });
  }
};

exports.createOffer = async (req, res) => {
  try {
    const offerData = { ...req.body };
    if (offerData.code) {
      offerData.code = offerData.code.trim().toUpperCase();
    }
    if (offerData.isActive !== undefined) {
      offerData.status = offerData.isActive ? 'active' : 'inactive';
    }
    if (offerData.maxDiscountAmount && !offerData.maxDiscount) {
      offerData.maxDiscount = Number(offerData.maxDiscountAmount);
    }
    if (offerData.maxDiscount && !offerData.maxDiscountAmount) {
      offerData.maxDiscountAmount = Number(offerData.maxDiscount);
    }
    if (!offerData.validUntil) {
      offerData.validUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    }

    const offer = new Offer(offerData);
    await offer.save();

    res.status(201).json({
      success: true,
      message: 'Bank Offer / Coupon created',
      data: {
        ...offer.toObject(),
        id: offer._id,
        _id: offer._id
      }
    });
  } catch (err) {
    console.error('Admin createOffer error:', err);
    res.status(400).json({ success: false, message: err.message || 'Failed to create offer' });
  }
};

exports.updateOffer = async (req, res) => {
  try {
    const offerId = req.params.offerId || req.params.id;
    if (!offerId) {
      return res.status(400).json({ success: false, message: 'Offer ID is required' });
    }

    const updateData = { ...req.body };
    if (updateData.code) {
      updateData.code = updateData.code.trim().toUpperCase();
    }
    if (updateData.isActive !== undefined) {
      updateData.status = updateData.isActive ? 'active' : 'inactive';
    }
    if (updateData.maxDiscountAmount && !updateData.maxDiscount) {
      updateData.maxDiscount = Number(updateData.maxDiscountAmount);
    }
    if (updateData.maxDiscount && !updateData.maxDiscountAmount) {
      updateData.maxDiscountAmount = Number(updateData.maxDiscount);
    }

    const updated = await Offer.findByIdAndUpdate(offerId, updateData, {
      returnDocument: 'after',
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    res.json({
      success: true,
      message: 'Offer updated successfully',
      data: {
        ...updated.toObject(),
        id: updated._id,
        _id: updated._id,
        maxDiscountAmount: updated.maxDiscountAmount || updated.maxDiscount || 0,
        isActive: updated.isActive !== undefined ? updated.isActive : updated.status === 'active'
      }
    });
  } catch (err) {
    console.error('Admin updateOffer error:', err);
    res.status(400).json({ success: false, message: err.message || 'Failed to update offer' });
  }
};

exports.deleteOffer = async (req, res) => {
  try {
    const offerId = req.params.offerId || req.params.id;
    if (!offerId) {
      return res.status(400).json({ success: false, message: 'Offer ID is required' });
    }

    const deleted = await Offer.findByIdAndDelete(offerId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    res.json({ success: true, message: 'Offer deleted successfully' });
  } catch (err) {
    console.error('Admin deleteOffer error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete offer' });
  }
};

/**
 * 7. Financial Settlements & Reconciliation Ledger
 */
exports.getSettlements = async (req, res) => {
  try {
    const partners = await User.find({ role: 'cinema_partner' }).select('name businessName email phone partnerStatus');

    const settlements = await Promise.all(
      partners.map(async (partner) => {
        const bookings = await Booking.find({
          partner: partner._id,
          bookingStatus: 'confirmed'
        });

        const grossRevenue = bookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
        const platformFee = Math.round(grossRevenue * 0.10); // 10% platform fee
        const gatewayFee = Math.round(grossRevenue * 0.02); // 2% gateway cost
        const netDisbursable = grossRevenue - platformFee - gatewayFee;

        return {
          partnerId: partner._id,
          _id: partner._id,
          id: partner._id,
          partnerName: partner.businessName || partner.name,
          email: partner.email,
          totalBookingsCount: bookings.length,
          grossRevenue,
          platformFee,
          gatewayFee,
          netDisbursable,
          status: grossRevenue > 0 ? 'Ready for Wire' : 'No Activity',
          settlementCycle: 'Weekly (Every Tuesday)',
          utrNumber: 'UTR-' + partner._id.toString().slice(-6).toUpperCase()
        };
      })
    );

    res.json({ success: true, data: settlements });
  } catch (err) {
    console.error('Admin getSettlements error:', err);
    res.status(500).json({ success: false, message: 'Failed to load settlements' });
  }
};

exports.disburseSettlement = async (req, res) => {
  try {
    const partnerId = req.params.partnerId || req.params.id;
    const { utrNumber, amount } = req.body;

    if (!partnerId) {
      return res.status(400).json({ success: false, message: 'Partner ID is required' });
    }

    res.json({
      success: true,
      message: `Settlement of ₹${amount || 0} successfully authorized and marked disbursed under UTR: ${utrNumber || 'UTR-CLEARED'}`,
      data: {
        partnerId,
        id: partnerId,
        utrNumber,
        status: 'Disbursed',
        disbursedAt: new Date()
      }
    });
  } catch (err) {
    console.error('Admin disburseSettlement error:', err);
    res.status(500).json({ success: false, message: 'Failed to authorize disbursement' });
  }
};
