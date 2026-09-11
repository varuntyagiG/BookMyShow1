const mongoose = require('mongoose');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const Screen = require('../models/Screen');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const AuditLog = require('../models/AuditLog');
const Offer = require('../models/Offer');
const City = require('../models/City');

// Helper: Create an Audit Log entry asynchronously
async function logAuditAction(adminUser, action, entityType, entityId, entityName = '', details = {}, req = null) {
  try {
    const ip = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '') : '';
    await AuditLog.create({
      admin: adminUser._id || adminUser.id,
      adminEmail: adminUser.email,
      action,
      entityType,
      entityId: String(entityId),
      entityName,
      details,
      ipAddress: String(ip)
    });
  } catch (err) {
    console.warn('Failed to record audit log:', err.message);
  }
}

// ==========================================
// 1. TELEMETRY & DASHBOARD KPIS
// ==========================================
async function getDashboardStats(req, res) {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const [
      totalCustomers,
      totalPartners,
      pendingPartners,
      totalCinemas,
      totalScreens,
      totalMovies,
      totalShows,
      totalBookings,
      recentLogsDocs,
      recentBookingsDocs,
      revenueAggResult,
      todayAggResult
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'cinema_partner' }),
      User.countDocuments({ role: 'cinema_partner', partnerStatus: 'pending' }),
      Cinema.countDocuments(),
      Screen.countDocuments(),
      Movie.countDocuments(),
      Show.countDocuments({ status: 'active' }),
      Booking.countDocuments(),
      AuditLog.find().sort({ createdAt: -1 }).limit(6),
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('user', 'name email phone')
        .populate('movie', 'title posterUrl')
        .populate('cinema', 'name city'),
      Booking.aggregate([
        { $match: { bookingStatus: 'confirmed' } },
        {
          $group: {
            _id: null,
            grossRevenue: { $sum: '$totalAmount' },
            platformConvenienceFee: { $sum: '$convenienceFee' }
          }
        }
      ]),
      Booking.aggregate([
        { $match: { createdAt: { $gte: startOfToday }, bookingStatus: 'confirmed' } },
        {
          $group: {
            _id: null,
            todayGrossRevenue: { $sum: '$totalAmount' },
            todayTicketsSold: { $sum: '$seatsCount' },
            todayBookingsCount: { $sum: 1 }
          }
        }
      ])
    ]);

    // Financial Metrics from atomic database aggregations
    const grossRevenue = revenueAggResult[0]?.grossRevenue || 0;
    const platformConvenienceFee = revenueAggResult[0]?.platformConvenienceFee || 0;
    const partnerBoxOfficeShare = Math.max(0, grossRevenue - platformConvenienceFee);

    const todayGrossRevenue = todayAggResult[0]?.todayGrossRevenue || 0;
    const todayTicketsSold = todayAggResult[0]?.todayTicketsSold || 0;
    const todayBookingsCount = todayAggResult[0]?.todayBookingsCount || 0;

    // Active occupancy estimate
    const activeShows = await Show.find({ status: 'active' }).limit(50);
    let totalBookedSeatsAcrossShows = 0;
    let totalCapacityAcrossShows = 0;
    activeShows.forEach(s => {
      totalBookedSeatsAcrossShows += (s.bookedSeats?.length || 0);
      totalCapacityAcrossShows += 120; // default estimated capacity
    });
    const avgOccupancyRate = totalCapacityAcrossShows > 0
      ? Math.round((totalBookedSeatsAcrossShows / totalCapacityAcrossShows) * 100)
      : 0;

    // Top Performing Movies Aggregation via MongoDB Pipeline
    const [topMovies, topCinemas] = await Promise.all([
      Booking.aggregate([
        { $match: { bookingStatus: 'confirmed' } },
        {
          $group: {
            _id: '$movieTitle',
            bookingsCount: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 },
        { $project: { title: '$_id', bookingsCount: 1, totalRevenue: 1, _id: 0 } }
      ]),
      Booking.aggregate([
        { $match: { bookingStatus: 'confirmed' } },
        {
          $group: {
            _id: '$theatreName',
            bookingsCount: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 },
        { $project: { name: '$_id', bookingsCount: 1, totalRevenue: 1, _id: 0 } }
      ])
    ]);

    const statsPayload = {
      totalCustomers,
      totalPartners,
      pendingPartners,
      totalCinemas,
      totalScreens,
      totalMovies,
      totalShows,
      totalBookings,
      todayBookingsCount,
      todayTicketsSold,
      todayGrossRevenue,
      grossRevenue,
      platformConvenienceFee,
      partnerBoxOfficeShare,
      avgOccupancyRate,
      topMovies,
      topCinemas,
      recentBookings: recentBookingsDocs,
      recentLogs: recentLogsDocs
    };

    return res.json({
      success: true,
      stats: statsPayload,
      recentBookings: recentBookingsDocs,
      recentLogs: recentLogsDocs
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to load platform telemetry.' });
  }
}

// ==========================================
// 2. PLATFORM ANALYTICS & TRENDS
// ==========================================
async function getAnalytics(req, res) {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const bookings = await Booking.find({
      createdAt: { $gte: thirtyDaysAgo },
      bookingStatus: 'confirmed'
    }).select('totalAmount createdAt categoryType theatreName');

    // Group by Day (last 14 days)
    const dailyMap = new Map();
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(5, 10); // MM-DD
      dailyMap.set(key, { date: key, bookings: 0, revenue: 0 });
    }

    bookings.forEach(b => {
      const key = new Date(b.createdAt).toISOString().slice(5, 10);
      if (dailyMap.has(key)) {
        const item = dailyMap.get(key);
        item.bookings += 1;
        item.revenue += (b.totalAmount || 0);
      }
    });

    // Category breakdown
    const categoriesMap = { movie: 0, event: 0, play: 0, sport: 0, activity: 0 };
    bookings.forEach(b => {
      const cat = b.categoryType || 'movie';
      if (categoriesMap[cat] !== undefined) categoriesMap[cat] += 1;
      else categoriesMap.movie += 1;
    });

    return res.json({
      success: true,
      dailyTrends: Array.from(dailyMap.values()),
      categoryDistribution: categoriesMap
    });
  } catch (error) {
    console.error('Error in getAnalytics:', error);
    return res.status(500).json({ success: false, message: 'Failed to load analytics trends.' });
  }
}

// ==========================================
// 3. CUSTOMER MANAGEMENT
// ==========================================
async function getCustomers(req, res) {
  try {
    const { search = '', status = 'all', page = 1, limit = 20 } = req.query;
    const query = { role: 'customer' };

    if (status === 'active') query.isDeactivated = { $ne: true };
    if (status === 'deactivated') query.isDeactivated = true;

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [customers, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)),
      User.countDocuments(query)
    ]);

    // Attach booking stats per customer
    const userIds = customers.map(c => c._id);
    const bookings = await Booking.find({ user: { $in: userIds }, bookingStatus: 'confirmed' })
      .select('user totalAmount');

    const customerStats = customers.map(c => {
      const userBookings = bookings.filter(b => b.user && b.user.toString() === c._id.toString());
      const totalSpent = userBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      return {
        ...c.toObject(),
        bookingsCount: userBookings.length,
        totalSpent
      };
    });

    return res.json({
      success: true,
      customers: customerStats,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10))
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve customers.' });
  }
}

async function getCustomerById(req, res) {
  try {
    const { id } = req.params;
    const customer = await User.findOne({ _id: id, role: 'customer' }).select('-password');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const bookings = await Booking.find({ user: customer._id })
      .populate('movie', 'title posterUrl')
      .populate('cinema', 'name city')
      .sort({ createdAt: -1 });

    const totalSpent = bookings
      .filter(b => b.bookingStatus === 'confirmed')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    return res.json({
      success: true,
      customer: {
        ...customer.toObject(),
        bookingsCount: bookings.length,
        totalSpent
      },
      bookings
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load customer profile.' });
  }
}

async function updateCustomerStatus(req, res) {
  try {
    const { id } = req.params;
    const { isDeactivated, reason } = req.body;

    const customer = await User.findOne({ _id: id, role: 'customer' });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    customer.isDeactivated = !!isDeactivated;
    await customer.save();

    await logAuditAction(
      req.user,
      isDeactivated ? 'CUSTOMER_DEACTIVATED' : 'CUSTOMER_ACTIVATED',
      'User',
      customer._id,
      customer.name,
      { reason: reason || 'Administrative action' },
      req
    );

    return res.json({
      success: true,
      message: `Customer account ${isDeactivated ? 'deactivated' : 'reactivated'} successfully.`,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        isDeactivated: customer.isDeactivated
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update customer status.' });
  }
}

// ==========================================
// 4. CINEMA PARTNER MANAGEMENT
// ==========================================
async function getPartners(req, res) {
  try {
    const { search = '', status = 'all' } = req.query;
    const query = { role: 'cinema_partner' };

    if (status !== 'all') {
      query.partnerStatus = status;
    }

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { businessName: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const partners = await User.find(query).select('-password').sort({ createdAt: -1 });
    const partnerIds = partners.map(p => p._id);

    const [cinemas, screens, shows, bookings] = await Promise.all([
      Cinema.find({ partner: { $in: partnerIds } }).select('partner name city'),
      Screen.find({ partner: { $in: partnerIds } }).select('partner totalCapacity'),
      Show.find({ partner: { $in: partnerIds }, status: 'active' }).select('partner'),
      Booking.find({ partner: { $in: partnerIds }, bookingStatus: 'confirmed' }).select('partner totalAmount')
    ]);

    const enrichedPartners = partners.map(p => {
      const pIdStr = p._id.toString();
      const pCinemas = cinemas.filter(c => c.partner && c.partner.toString() === pIdStr);
      const pScreens = screens.filter(s => s.partner && s.partner.toString() === pIdStr);
      const pShows = shows.filter(s => s.partner && s.partner.toString() === pIdStr);
      const pBookings = bookings.filter(b => b.partner && b.partner.toString() === pIdStr);
      const grossRevenue = pBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      return {
        ...p.toObject(),
        cinemasCount: pCinemas.length,
        screensCount: pScreens.length,
        showsCount: pShows.length,
        bookingsCount: pBookings.length,
        grossRevenue
      };
    });

    return res.json({ success: true, partners: enrichedPartners });
  } catch (error) {
    console.error('Error fetching partners:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve cinema partners.' });
  }
}

async function getPartnerById(req, res) {
  try {
    const { id } = req.params;
    const partner = await User.findOne({ _id: id, role: 'cinema_partner' }).select('-password');
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Cinema partner not found.' });
    }

    const [cinemas, screens, shows, bookings] = await Promise.all([
      Cinema.find({ partner: partner._id }),
      Screen.find({ partner: partner._id }),
      Show.find({ partner: partner._id }).populate('movie', 'title posterUrl').populate('cinema', 'name'),
      Booking.find({ partner: partner._id }).sort({ createdAt: -1 }).limit(20)
    ]);

    const grossRevenue = bookings
      .filter(b => b.bookingStatus === 'confirmed')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    return res.json({
      success: true,
      partner: {
        ...partner.toObject(),
        cinemasCount: cinemas.length,
        screensCount: screens.length,
        showsCount: shows.length,
        grossRevenue
      },
      cinemas,
      screens,
      shows,
      recentBookings: bookings
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load partner details.' });
  }
}

async function updatePartnerStatus(req, res) {
  try {
    const { id } = req.params;
    const { partnerStatus, reason, notes } = req.body;

    if (!['pending', 'approved', 'active', 'suspended'].includes(partnerStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid partner lifecycle status.' });
    }

    const partner = await User.findOne({ _id: id, role: 'cinema_partner' });
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Cinema Partner not found.' });
    }

    const previousStatus = partner.partnerStatus;
    partner.partnerStatus = partnerStatus;
    if (notes) partner.approvalNotes = notes;
    if (reason) partner.suspendedReason = reason;
    await partner.save();

    await logAuditAction(
      req.user,
      `PARTNER_${partnerStatus.toUpperCase()}`,
      'User',
      partner._id,
      partner.businessName || partner.name,
      { previousStatus, newStatus: partnerStatus, reason, notes },
      req
    );

    return res.json({
      success: true,
      message: `Partner status updated to "${partnerStatus}" successfully.`,
      partner: {
        id: partner._id,
        name: partner.name,
        email: partner.email,
        businessName: partner.businessName,
        partnerStatus: partner.partnerStatus
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update partner status.' });
  }
}

// ==========================================
// 5. GLOBAL CINEMA MANAGEMENT
// ==========================================
async function getCinemas(req, res) {
  try {
    const { city, partnerId, status, search } = req.query;
    const query = {};

    if (city && city !== 'all') query.city = city;
    if (partnerId && partnerId !== 'all') query.partner = partnerId;
    if (status && status !== 'all') query.status = status;
    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    const cinemas = await Cinema.find(query)
      .populate('partner', 'name email businessName partnerStatus')
      .sort({ createdAt: -1 });

    const cinemaIds = cinemas.map(c => c._id);
    const [screens, shows] = await Promise.all([
      Screen.find({ cinema: { $in: cinemaIds } }).select('cinema totalCapacity'),
      Show.find({ cinema: { $in: cinemaIds }, status: 'active' }).select('cinema')
    ]);

    const enrichedCinemas = cinemas.map(c => {
      const cScreens = screens.filter(s => s.cinema && s.cinema.toString() === c._id.toString());
      const cShows = shows.filter(s => s.cinema && s.cinema.toString() === c._id.toString());
      const capacity = cScreens.reduce((sum, s) => sum + (s.totalCapacity || 120), 0);

      return {
        ...c.toObject(),
        activeScreensCount: cScreens.length,
        activeShowsCount: cShows.length,
        managedCapacity: capacity
      };
    });

    return res.json({ success: true, cinemas: enrichedCinemas });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve cinemas.' });
  }
}

async function updateCinemaStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be "active" or "inactive".' });
    }

    const cinema = await Cinema.findById(id);
    if (!cinema) return res.status(404).json({ success: false, message: 'Cinema not found.' });

    cinema.status = status;
    await cinema.save();

    await logAuditAction(
      req.user,
      'CINEMA_STATUS_CHANGED',
      'Cinema',
      cinema._id,
      cinema.name,
      { newStatus: status },
      req
    );

    return res.json({
      success: true,
      message: `Cinema "${cinema.name}" status updated to ${status}.`,
      cinema
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update cinema status.' });
  }
}

// ==========================================
// 6. GLOBAL MOVIE CATALOG MANAGEMENT
// ==========================================
async function getMovies(req, res) {
  try {
    const { search = '', status = 'all' } = req.query;
    const query = {};

    if (status !== 'all') query.status = status;
    if (search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { genre: { $regex: search.trim(), $options: 'i' } },
        { language: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const movies = await Movie.find(query).sort({ releaseDate: -1, createdAt: -1 });

    // Attach active shows count
    const movieIds = movies.map(m => m._id);
    const shows = await Show.find({ movie: { $in: movieIds }, status: 'active' }).select('movie');

    const enrichedMovies = movies.map(m => {
      const activeShows = shows.filter(s => s.movie && s.movie.toString() === m._id.toString());
      return {
        ...m.toObject(),
        activeShowsCount: activeShows.length
      };
    });

    return res.json({ success: true, movies: enrichedMovies });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load movie catalog.' });
  }
}

async function createMovie(req, res) {
  try {
    const {
      title,
      synopsis,
      genre,
      language,
      certificate,
      duration,
      releaseDate,
      rating,
      posterUrl,
      backdropUrl,
      formats,
      cities,
      cast,
      isPromoted,
      status = 'published'
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Movie title is required.' });
    }

    const customId = 'm_' + Date.now();
    const movie = await Movie.create({
      customId,
      title: title.trim(),
      synopsis: synopsis || '',
      genre: Array.isArray(genre) ? genre : (genre ? genre.split(',').map(g => g.trim()) : ['Action']),
      language: language || 'Hindi',
      certificate: certificate || 'UA',
      duration: duration || '2h 15m',
      releaseDate: releaseDate || 'Coming Soon',
      rating: Number(rating) || 8.0,
      posterUrl: posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
      backdropUrl: backdropUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop',
      formats: Array.isArray(formats) ? formats : ['2D'],
      cities: Array.isArray(cities) ? cities : ['Mumbai', 'Delhi-NCR', 'Bengaluru'],
      cast: Array.isArray(cast) ? cast : [],
      isPromoted: !!isPromoted,
      status
    });

    await logAuditAction(req.user, 'MOVIE_CREATED', 'Movie', movie._id, movie.title, { movie }, req);

    return res.status(201).json({
      success: true,
      message: 'Movie added to global platform catalog!',
      movie
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create movie.' });
  }
}

async function updateMovie(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const movie = await Movie.findById(id);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found.' });

    Object.assign(movie, updates);
    await movie.save();

    await logAuditAction(req.user, 'MOVIE_UPDATED', 'Movie', movie._id, movie.title, { updates }, req);

    return res.json({
      success: true,
      message: 'Movie catalog record updated successfully.',
      movie
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update movie.' });
  }
}

async function deleteMovie(req, res) {
  try {
    const { id } = req.params;
    const movie = await Movie.findById(id);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found.' });

    movie.status = 'archived';
    await movie.save();

    await logAuditAction(req.user, 'MOVIE_ARCHIVED', 'Movie', movie._id, movie.title, {}, req);

    return res.json({
      success: true,
      message: `Movie "${movie.title}" has been safely archived.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to archive movie.' });
  }
}

// ==========================================
// 7. GLOBAL SHOWS MONITORING
// ==========================================
async function getShows(req, res) {
  try {
    const { cinemaId, movieId, date, status } = req.query;
    const query = {};

    if (cinemaId && cinemaId !== 'all') query.cinema = cinemaId;
    if (movieId && movieId !== 'all') query.movie = movieId;
    if (date && date !== 'all') query.showDate = date;
    if (status && status !== 'all') query.status = status;

    const shows = await Show.find(query)
      .populate('cinema', 'name city')
      .populate('screen', 'name screenType totalCapacity')
      .populate('movie', 'title posterUrl duration certificate')
      .populate('partner', 'name businessName')
      .sort({ showDate: 1, startTime: 1 });

    const enrichedShows = shows.map(s => {
      const capacity = s.screen?.totalCapacity || 120;
      const bookedCount = s.bookedSeats?.length || 0;
      const occupancyRate = Math.min(100, Math.round((bookedCount / capacity) * 100));

      return {
        ...s.toObject(),
        occupancyRate,
        capacity
      };
    });

    return res.json({ success: true, shows: enrichedShows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve shows.' });
  }
}

async function cancelShow(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const show = await Show.findById(id);
    if (!show) return res.status(404).json({ success: false, message: 'Show not found.' });

    show.status = 'cancelled';
    await show.save();

    await logAuditAction(
      req.user,
      'SHOW_CANCELLED',
      'Show',
      show._id,
      `${show.movieTitle} (${show.startTime})`,
      { reason: reason || 'Administrative cancellation' },
      req
    );

    return res.json({
      success: true,
      message: `Show screening has been cancelled.`,
      show
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to cancel show.' });
  }
}

// ==========================================
// 8. GLOBAL BOOKINGS LEDGER
// ==========================================
async function getBookings(req, res) {
  try {
    const { search = '', status = 'all', page = 1, limit = 20 } = req.query;
    const query = {};

    if (status !== 'all') query.bookingStatus = status;

    if (search.trim()) {
      query.$or = [
        { bookingId: { $regex: search.trim(), $options: 'i' } },
        { movieTitle: { $regex: search.trim(), $options: 'i' } },
        { theatreName: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('user', 'name email phone')
        .populate('movie', 'title posterUrl')
        .populate('cinema', 'name city')
        .populate('partner', 'name businessName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Booking.countDocuments(query)
    ]);

    return res.json({
      success: true,
      bookings,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10))
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load bookings ledger.' });
  }
}

async function getBookingById(req, res) {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate('user', 'name email phone createdAt')
      .populate('movie')
      .populate('cinema')
      .populate('screen')
      .populate('partner', 'name businessName email phone')
      .populate('show');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking record not found.' });
    }

    return res.json({ success: true, booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve booking.' });
  }
}

async function cancelBooking(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    // Free up booked seats on Show document if show exists
    if (booking.show && booking.seats?.length) {
      try {
        await Show.findByIdAndUpdate(booking.show, {
          $pull: { bookedSeats: { $in: booking.seats } }
        });
      } catch (err) {
        console.warn('Could not free seats on show:', err.message);
      }
    }

    await logAuditAction(
      req.user,
      'BOOKING_CANCELLED',
      'Booking',
      booking.bookingId,
      `${booking.movieTitle} - ${booking.seats.join(', ')}`,
      { refundAmount: booking.totalAmount, reason },
      req
    );

    return res.json({
      success: true,
      message: `Booking ${booking.bookingId} cancelled and marked as refunded.`,
      booking
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to cancel booking.' });
  }
}

// ==========================================
// 9. COMMERCIAL REVENUE & SETTLEMENTS
// ==========================================
async function getRevenueOverview(req, res) {
  try {
    const bookings = await Booking.find({ bookingStatus: 'confirmed' })
      .populate('partner', 'name businessName email')
      .populate('cinema', 'name city');

    const totalGross = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalConvenienceFees = bookings.reduce((sum, b) => sum + (b.convenienceFee || 0), 0);
    const partnerBoxOffice = Math.max(0, totalGross - totalConvenienceFees);

    // Partner settlements ledger
    const partnerLedgerMap = new Map();
    bookings.forEach(b => {
      const pKey = b.partner ? b.partner._id.toString() : 'unassigned';
      const pName = b.partner ? (b.partner.businessName || b.partner.name) : 'Independent Venue';
      const existing = partnerLedgerMap.get(pKey) || {
        partnerId: pKey,
        partnerName: pName,
        partnerEmail: b.partner?.email || '',
        grossRevenue: 0,
        convenienceFee: 0,
        netPayable: 0,
        bookingsCount: 0
      };

      existing.grossRevenue += (b.totalAmount || 0);
      existing.convenienceFee += (b.convenienceFee || 0);
      existing.netPayable += Math.max(0, (b.totalAmount || 0) - (b.convenienceFee || 0));
      existing.bookingsCount += 1;
      partnerLedgerMap.set(pKey, existing);
    });

    return res.json({
      success: true,
      revenue: {
        totalGross,
        platformFee: totalConvenienceFees,
        partnerShare: partnerBoxOffice,
        totalBookings: bookings.length
      },
      partnerSettlements: Array.from(partnerLedgerMap.values())
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load revenue overview.' });
  }
}

// ==========================================
// 10. MARKETING OFFERS & PROMOTIONS
// ==========================================
async function getOffers(req, res) {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    return res.json({ success: true, offers });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load promo offers.' });
  }
}

async function createOffer(req, res) {
  try {
    const { code, title, description, discountType, discountValue, minBookingAmount, maxDiscount, validUntil } = req.body;

    if (!code || !title || discountValue === undefined || !validUntil) {
      return res.status(400).json({ success: false, message: 'Code, title, discount value, and expiry date are required.' });
    }

    const offer = await Offer.create({
      code: code.trim().toUpperCase(),
      title: title.trim(),
      description: description || '',
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue),
      minBookingAmount: Number(minBookingAmount) || 0,
      maxDiscount: Number(maxDiscount) || 0,
      validUntil: new Date(validUntil),
      status: 'active'
    });

    await logAuditAction(req.user, 'OFFER_CREATED', 'Offer', offer._id, offer.code, { offer }, req);

    return res.status(201).json({ success: true, message: 'Promotion coupon created!', offer });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create promo offer.' });
  }
}

async function updateOffer(req, res) {
  try {
    const { id } = req.params;
    const offer = await Offer.findByIdAndUpdate(id, req.body, { new: true });
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found.' });

    await logAuditAction(req.user, 'OFFER_UPDATED', 'Offer', offer._id, offer.code, { updates: req.body }, req);

    return res.json({ success: true, message: 'Offer updated successfully.', offer });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update offer.' });
  }
}

async function deleteOffer(req, res) {
  try {
    const { id } = req.params;
    const offer = await Offer.findByIdAndDelete(id);
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found.' });

    await logAuditAction(req.user, 'OFFER_DELETED', 'Offer', id, offer.code, {}, req);

    return res.json({ success: true, message: 'Offer removed.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete offer.' });
  }
}

// ==========================================
// 11. CITIES / OPERATIONAL LOCATIONS
// ==========================================
async function getCities(req, res) {
  try {
    let cities = await City.find().sort({ isPopular: -1, name: 1 });

    // If database has 0 cities, initialize with top Indian metropolitan centers
    if (cities.length === 0) {
      const defaultCities = [
        { name: 'Mumbai', state: 'Maharashtra', icon: '🏙️', isPopular: true, status: 'active' },
        { name: 'Delhi-NCR', state: 'Delhi', icon: '🏛️', isPopular: true, status: 'active' },
        { name: 'Bengaluru', state: 'Karnataka', icon: '💻', isPopular: true, status: 'active' },
        { name: 'Hyderabad', state: 'Telangana', icon: '🏰', isPopular: true, status: 'active' },
        { name: 'Chandigarh', state: 'Punjab', icon: '🌳', isPopular: true, status: 'active' },
        { name: 'Ahmedabad', state: 'Gujarat', icon: '🪁', isPopular: true, status: 'active' },
        { name: 'Chennai', state: 'Tamil Nadu', icon: '🏖️', isPopular: true, status: 'active' },
        { name: 'Pune', state: 'Maharashtra', icon: '🎓', isPopular: true, status: 'active' },
        { name: 'Kolkata', state: 'West Bengal', icon: '🚊', isPopular: true, status: 'active' }
      ];
      cities = await City.insertMany(defaultCities);
    }

    // Attach cinema count per city
    const allCinemas = await Cinema.find().select('city');
    const enrichedCities = cities.map(city => {
      const count = allCinemas.filter(c => c.city && c.city.toLowerCase() === city.name.toLowerCase()).length;
      return {
        ...city.toObject(),
        cinemasCount: count
      };
    });

    return res.json({ success: true, cities: enrichedCities });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load cities.' });
  }
}

async function createCity(req, res) {
  try {
    const { name, state, icon, isPopular } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'City name is required.' });

    const city = await City.create({
      name: name.trim(),
      state: state || '',
      icon: icon || '🏙️',
      isPopular: !!isPopular,
      status: 'active'
    });

    await logAuditAction(req.user, 'CITY_CREATED', 'City', city._id, city.name, {}, req);

    return res.status(201).json({ success: true, message: 'Operational city added!', city });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to add city.' });
  }
}

async function updateCity(req, res) {
  try {
    const { id } = req.params;
    const city = await City.findByIdAndUpdate(id, req.body, { new: true });
    if (!city) return res.status(404).json({ success: false, message: 'City not found.' });

    await logAuditAction(req.user, 'CITY_UPDATED', 'City', city._id, city.name, { updates: req.body }, req);

    return res.json({ success: true, message: 'City updated.', city });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update city.' });
  }
}

// ==========================================
// 12. AUDIT LOGS
// ==========================================
async function getAuditLogs(req, res) {
  try {
    const { action, entityType, limit = 50 } = req.query;
    const query = {};

    if (action && action !== 'all') query.action = action;
    if (entityType && entityType !== 'all') query.entityType = entityType;

    const logs = await AuditLog.find(query)
      .populate('admin', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    return res.json({ success: true, logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.' });
  }
}

// ==========================================
// 13. COMPLIANCE & PERFORMANCE REPORTS
// ==========================================
async function getReportData(req, res) {
  try {
    const { reportType } = req.params; // 'bookings' | 'revenue' | 'partners' | 'cinemas' | 'movies'
    const { startDate, endDate } = req.query;

    const dateQuery = {};
    if (startDate) dateQuery.$gte = new Date(startDate);
    if (endDate) dateQuery.$lte = new Date(endDate);

    if (reportType === 'bookings') {
      const query = dateQuery.$gte ? { createdAt: dateQuery } : {};
      const bookings = await Booking.find(query)
        .populate('user', 'name email phone')
        .populate('cinema', 'name city')
        .sort({ createdAt: -1 });

      return res.json({ success: true, reportType, records: bookings });
    }

    if (reportType === 'partners') {
      const partners = await User.find({ role: 'cinema_partner' }).select('-password');
      return res.json({ success: true, reportType, records: partners });
    }

    if (reportType === 'cinemas') {
      const cinemas = await Cinema.find().populate('partner', 'name businessName');
      return res.json({ success: true, reportType, records: cinemas });
    }

    if (reportType === 'movies') {
      const movies = await Movie.find();
      return res.json({ success: true, reportType, records: movies });
    }

    return res.status(400).json({ success: false, message: 'Unknown report type requested.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to compile report data.' });
  }
}

module.exports = {
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
};
