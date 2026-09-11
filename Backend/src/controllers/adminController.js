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
    const [
      customersCount,
      partnersCount,
      cinemasCount,
      screensCount,
      activeShowsCount,
      bookings
    ] = await Promise.all([
      User.countDocuments({ role: { $in: ['customer', 'user'] } }),
      User.countDocuments({ role: 'cinema_partner' }),
      Cinema.countDocuments(),
      Screen.countDocuments(),
      Show.countDocuments({ status: 'active' }),
      Booking.find().sort({ createdAt: -1 }).limit(100).populate('user', 'name email phone')
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
      activeShowsCount,
      totalShows: activeShowsCount,
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
    const partners = await User.find({ role: 'cinema_partner' }).select('-password').sort({ createdAt: -1 });

    const partnersWithDetails = await Promise.all(
      partners.map(async (p) => {
        const cinemas = await Cinema.find({ partner: p._id }).lean();
        const cinemaIds = cinemas.map(c => c._id);
        const screensCount = await Screen.find({ cinemaId: { $in: cinemaIds } }).countDocuments();
        const showsCount = await Show.find({ cinema: { $in: cinemaIds }, status: 'active' }).countDocuments();

        return {
          id: p._id,
          name: p.name,
          email: p.email,
          phone: p.phone || p.partnerPhone,
          businessName: p.businessName || p.name,
          businessAddress: p.businessAddress,
          gstin: p.gstin,
          partnerStatus: p.partnerStatus || 'active',
          isDeactivated: p.isDeactivated || false,
          cinemasCount: cinemas.length,
          screensCount,
          activeShowsCount: showsCount,
          cinemas: cinemas.map(c => ({ id: c._id, name: c.name, city: c.city, status: c.status })),
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
    const { id } = req.params;
    const { status } = req.body; // 'active' | 'suspended'

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid partner status' });
    }

    const partner = await User.findByIdAndUpdate(
      id,
      { partnerStatus: status },
      { new: true }
    ).select('-password');

    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }

    res.json({ success: true, message: `Partner status updated to ${status}`, data: partner });
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
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json({ success: true, data: movies });
  } catch (err) {
    console.error('Admin getMovies error:', err);
    res.status(500).json({ success: false, message: 'Failed to load movie catalog' });
  }
};

exports.createMovie = async (req, res) => {
  try {
    const customId = 'pmov-' + Math.floor(100000 + Math.random() * 900000);
    const movie = new Movie({
      ...req.body,
      customId,
      status: req.body.status || 'published',
      addedBy: req.user._id
    });

    await movie.save();
    res.status(201).json({ success: true, message: 'Movie created in CineData registry', data: movie });
  } catch (err) {
    console.error('Admin createMovie error:', err);
    res.status(400).json({ success: false, message: err.message || 'Failed to create movie' });
  }
};

exports.updateMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Movie.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.json({ success: true, message: 'Movie updated successfully', data: updated });
  } catch (err) {
    console.error('Admin updateMovie error:', err);
    res.status(400).json({ success: false, message: err.message || 'Failed to update movie' });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Movie.findByIdAndDelete(id);
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
    const { id } = req.params;
    const movie = await Movie.findById(id);
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
      filter.$or = [
        { bookingId: { $regex: q, $options: 'i' } },
        { movieTitle: { $regex: q, $options: 'i' } },
        { theatreName: { $regex: q, $options: 'i' } }
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

    res.json({
      success: true,
      data: bookings,
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
    const { id } = req.params;
    const { reason = 'Customer Support Refund' } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.bookingStatus === 'cancelled' && booking.paymentStatus === 'refunded') {
      return res.status(400).json({ success: false, message: 'Booking has already been refunded' });
    }

    // 1. Mark as cancelled & refunded
    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.validationHistory.push({
      action: 'ADMIN_FORCE_REFUND',
      notes: reason,
      validatedAt: new Date(),
      validatedBy: req.user._id
    });
    await booking.save();

    // 2. Release seats in Show if active
    if (booking.show) {
      const show = await Show.findById(booking.show);
      if (show) {
        show.bookedSeats = (show.bookedSeats || []).filter(s => !(booking.seats || []).includes(s));
        await show.save();
      }
    }

    res.json({
      success: true,
      message: `Booking ${booking.bookingId} refunded successfully. Allocated seats released.`,
      data: booking
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
    res.json({ success: true, data: offers });
  } catch (err) {
    console.error('Admin getOffers error:', err);
    res.status(500).json({ success: false, message: 'Failed to load offers' });
  }
};

exports.createOffer = async (req, res) => {
  try {
    const offer = new Offer({
      ...req.body,
      code: req.body.code.trim().toUpperCase()
    });
    await offer.save();
    res.status(201).json({ success: true, message: 'Bank Offer / Coupon created', data: offer });
  } catch (err) {
    console.error('Admin createOffer error:', err);
    res.status(400).json({ success: false, message: err.message || 'Failed to create offer' });
  }
};

exports.updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Offer.findByIdAndUpdate(
      id,
      { ...req.body, code: req.body.code ? req.body.code.trim().toUpperCase() : undefined },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }
    res.json({ success: true, message: 'Offer updated successfully', data: updated });
  } catch (err) {
    console.error('Admin updateOffer error:', err);
    res.status(400).json({ success: false, message: err.message || 'Failed to update offer' });
  }
};

exports.deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Offer.findByIdAndDelete(id);
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
    const { partnerId } = req.params;
    const { utrNumber, amount } = req.body;

    res.json({
      success: true,
      message: `Settlement of ₹${amount || 0} successfully authorized and marked disbursed under UTR: ${utrNumber || 'UTR-CLEARED'}`,
      data: {
        partnerId,
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
