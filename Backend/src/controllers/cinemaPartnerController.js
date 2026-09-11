const Cinema = require('../models/Cinema');
const Screen = require('../models/Screen');
const Show = require('../models/Show');
const Movie = require('../models/Movie');
const Booking = require('../models/Booking');
const User = require('../models/User');
const mongoose = require('mongoose');

// Helper to convert time string (e.g., "07:30 PM" or "10:15 AM") to minutes from midnight
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

// Check if two time slots on the same date overlap
function timesOverlap(startA, endA, startB, endB) {
  const sA = parseTimeToMinutes(startA);
  const eA = parseTimeToMinutes(endA);
  const sB = parseTimeToMinutes(startB);
  const eB = parseTimeToMinutes(endB);

  // Overlap occurs if one doesn't end before the other begins
  return !(eA <= sB || sA >= eB);
}

// Helper: Get list of cinema IDs and names owned by the authenticated partner
async function getPartnerCinemas(partnerId) {
  const cinemas = await Cinema.find({ partner: partnerId });
  const cinemaIds = cinemas.map(c => c._id);
  const cinemaNames = cinemas.map(c => c.name.toLowerCase());
  return { cinemas, cinemaIds, cinemaNames };
}

// ==========================================
// 1. B2B CINEMA PARTNER DASHBOARD
// ==========================================
async function getDashboardStats(req, res) {
  try {
    const partnerId = req.user._id;
    const { cinemas, cinemaIds, cinemaNames } = await getPartnerCinemas(partnerId);

    const totalCinemas = cinemas.length;

    // Screens owned by partner
    const screens = await Screen.find({ partner: partnerId, status: 'active' });
    const totalScreens = screens.length;
    const totalCapacity = screens.reduce((sum, s) => sum + (s.totalCapacity || 120), 0);

    // Shows scheduled by partner
    const allShows = await Show.find({ partner: partnerId }).populate('movie', 'title posterUrl duration');
    const todayStr = 'Today';
    const isoToday = new Date().toISOString().slice(0, 10);

    const todayShows = allShows.filter(s => s.showDate === todayStr || s.showDate === isoToday);

    // Scoped Bookings for this partner
    const bookings = await Booking.find({
      $or: [
        { partner: partnerId },
        { cinema: { $in: cinemaIds } },
        { theatreName: { $regex: new RegExp(cinemaNames.join('|') || '^$', 'i') } }
      ]
    })
      .populate('user', 'name email phone')
      .populate('movie', 'title posterUrl')
      .sort({ createdAt: -1 });

    const confirmedBookings = bookings.filter(b => b.bookingStatus === 'confirmed');

    // Financial calculations
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const todayBookings = confirmedBookings.filter(b => new Date(b.createdAt) >= startOfToday);
    const weeklyBookings = confirmedBookings.filter(b => new Date(b.createdAt) >= sevenDaysAgo);
    const monthlyBookings = confirmedBookings.filter(b => new Date(b.createdAt) >= thirtyDaysAgo);

    const todayRevenue = todayBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const weeklyRevenue = weeklyBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const monthlyRevenue = monthlyBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    // Occupancy metrics
    const ticketsSoldToday = todayBookings.reduce((sum, b) => sum + (b.seatsCount || b.seats?.length || 0), 0);
    const totalTicketsSold = confirmedBookings.reduce((sum, b) => sum + (b.seatsCount || b.seats?.length || 0), 0);

    // Calculate occupied seats across today's shows
    const occupiedSeatsToday = todayShows.reduce((sum, s) => sum + (s.bookedSeats?.length || 0), 0);
    const maxCapacityToday = todayShows.length * (totalScreens > 0 ? Math.round(totalCapacity / totalScreens) : 120);
    const occupancyRate = maxCapacityToday > 0 ? Math.min(100, Math.round((occupiedSeatsToday / maxCapacityToday) * 100)) : 0;
    const availableSeatsToday = Math.max(0, maxCapacityToday - occupiedSeatsToday);

    // Movie Performance breakdown
    const movieMap = new Map();
    confirmedBookings.forEach(b => {
      const mTitle = b.movieTitle || 'Movie';
      const prev = movieMap.get(mTitle) || { tickets: 0, revenue: 0 };
      prev.tickets += (b.seatsCount || b.seats?.length || 1);
      prev.revenue += (b.totalAmount || 0);
      movieMap.set(mTitle, prev);
    });

    const bestPerformingMovies = Array.from(movieMap.entries())
      .map(([title, stats]) => ({ title, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return res.json({
      success: true,
      data: {
        totalCinemas,
        totalScreens,
        totalSeats: totalCapacity,
        todayShowsCount: todayShows.length,
        todayBookingsCount: todayBookings.length,
        ticketsSoldToday,
        totalTicketsSold,
        occupiedSeatsToday,
        availableSeatsToday,
        occupancyRate,
        todayRevenue,
        weeklyRevenue,
        monthlyRevenue,
        totalRevenue,
        upcomingShows: allShows.slice(0, 5),
        recentBookings: bookings.slice(0, 8),
        bestPerformingMovies
      }
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve dashboard metrics.' });
  }
}

// ==========================================
// 2. CINEMA MANAGEMENT
// ==========================================
async function getCinemas(req, res) {
  try {
    const cinemas = await Cinema.find({ partner: req.user._id }).sort({ createdAt: -1 });

    // Attach real screens count and active shows count
    const cinemaIds = cinemas.map(c => c._id);
    const [screensCounts, showsCounts] = await Promise.all([
      Screen.aggregate([
        { $match: { cinema: { $in: cinemaIds } } },
        { $group: { _id: '$cinema', count: { $sum: 1 } } }
      ]),
      Show.aggregate([
        { $match: { cinema: { $in: cinemaIds }, status: 'active' } },
        { $group: { _id: '$cinema', count: { $sum: 1 } } }
      ])
    ]);

    const screensMap = new Map(screensCounts.map(s => [s._id.toString(), s.count]));
    const showsMap = new Map(showsCounts.map(s => [s._id.toString(), s.count]));

    const result = cinemas.map(c => ({
      ...c.toObject(),
      screensCount: screensMap.get(c._id.toString()) || 0,
      activeShowsCount: showsMap.get(c._id.toString()) || 0
    }));

    return res.json({ success: true, cinemas: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve cinemas.' });
  }
}

async function createCinema(req, res) {
  try {
    const { name, city, state, address, contactPhone, contactEmail, facilities, status } = req.body;

    if (!name || !city || !address) {
      return res.status(400).json({ success: false, message: 'Cinema name, city, and address are required.' });
    }

    const cinema = await Cinema.create({
      partner: req.user._id,
      name: name.trim(),
      city: city.trim(),
      state: state ? state.trim() : '',
      address: address.trim(),
      contactPhone: contactPhone ? contactPhone.trim() : '',
      contactEmail: contactEmail ? contactEmail.trim() : '',
      facilities: Array.isArray(facilities) && facilities.length > 0 ? facilities : ['M-Ticket', 'F&B', 'Recliner', 'Parking'],
      status: status || 'active'
    });

    return res.status(201).json({ success: true, cinema, message: 'Cinema created successfully!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create cinema.' });
  }
}

async function getCinemaById(req, res) {
  try {
    const { cinemaId } = req.params;
    const cinema = await Cinema.findOne({ _id: cinemaId, partner: req.user._id });

    if (!cinema) {
      return res.status(404).json({ success: false, message: 'Cinema not found or access denied.' });
    }

    const screens = await Screen.find({ cinema: cinema._id });
    return res.json({ success: true, cinema, screens });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching cinema details.' });
  }
}

async function updateCinema(req, res) {
  try {
    const { cinemaId } = req.params;
    const updates = { ...req.body };
    delete updates.partner; // Partner cannot transfer ownership

    const cinema = await Cinema.findOneAndUpdate(
      { _id: cinemaId, partner: req.user._id },
      updates,
      { returnDocument: 'after', runValidators: true }
    );

    if (!cinema) {
      return res.status(404).json({ success: false, message: 'Cinema not found or access denied.' });
    }

    return res.json({ success: true, cinema, message: 'Cinema details updated.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update cinema.' });
  }
}

async function deleteCinema(req, res) {
  try {
    const { cinemaId } = req.params;
    const cinema = await Cinema.findOne({ _id: cinemaId, partner: req.user._id });

    if (!cinema) {
      return res.status(404).json({ success: false, message: 'Cinema not found or access denied.' });
    }

    // Check for active bookings
    const activeBookings = await Booking.countDocuments({
      $or: [{ cinema: cinema._id }, { theatreName: cinema.name }],
      bookingStatus: 'confirmed'
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete "${cinema.name}" because ${activeBookings} confirmed booking(s) exist for it. Please deactivate the cinema instead.`
      });
    }

    await Screen.deleteMany({ cinema: cinema._id });
    await Show.deleteMany({ cinema: cinema._id });
    await Cinema.findByIdAndDelete(cinema._id);

    return res.json({ success: true, message: `Cinema "${cinema.name}" deleted successfully.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete cinema.' });
  }
}

// ==========================================
// 3. SCREEN & SEAT LAYOUT MANAGEMENT
// ==========================================
async function getScreens(req, res) {
  try {
    const { cinemaId } = req.query;
    const query = { partner: req.user._id };
    if (cinemaId) query.cinema = cinemaId;

    const screens = await Screen.find(query).populate('cinema', 'name city').sort({ screenNumber: 1 });
    return res.json({ success: true, screens });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve screens.' });
  }
}

async function createScreen(req, res) {
  try {
    const { cinemaId, screenNumber, name, screenType, seatingLayout, status } = req.body;

    if (!cinemaId || !screenNumber || !name) {
      return res.status(400).json({ success: false, message: 'Cinema ID, screen identifier, and name are required.' });
    }

    // Verify partner owns this cinema
    const cinema = await Cinema.findOne({ _id: cinemaId, partner: req.user._id });
    if (!cinema) {
      return res.status(404).json({ success: false, message: 'Associated cinema not found or access denied.' });
    }

    // Check duplicate screen in same cinema
    const existing = await Screen.findOne({ cinema: cinema._id, screenNumber: screenNumber.trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: `Screen "${screenNumber}" already exists in ${cinema.name}.` });
    }

    // Default layout if none provided
    const layout = Array.isArray(seatingLayout) && seatingLayout.length > 0 ? seatingLayout : [
      { row: 'A', tier: 'Recliner', basePrice: 400, seatsCount: 10, disabledSeats: [] },
      { row: 'B', tier: 'Premium', basePrice: 250, seatsCount: 12, disabledSeats: [] },
      { row: 'C', tier: 'Premium', basePrice: 250, seatsCount: 12, disabledSeats: [] },
      { row: 'D', tier: 'Normal', basePrice: 180, seatsCount: 14, disabledSeats: [] },
      { row: 'E', tier: 'Normal', basePrice: 180, seatsCount: 14, disabledSeats: [] },
      { row: 'F', tier: 'Normal', basePrice: 180, seatsCount: 14, disabledSeats: [] },
      { row: 'G', tier: 'Normal', basePrice: 180, seatsCount: 14, disabledSeats: [] },
      { row: 'H', tier: 'Normal', basePrice: 180, seatsCount: 14, disabledSeats: [] }
    ];

    const totalCapacity = layout.reduce((sum, r) => sum + (r.seatsCount || 12), 0);

    const screen = await Screen.create({
      cinema: cinema._id,
      partner: req.user._id,
      screenNumber: screenNumber.trim(),
      name: name.trim(),
      screenType: screenType || 'Standard 2D',
      totalCapacity,
      seatingLayout: layout,
      status: status || 'active'
    });

    // Update screen count on cinema
    const count = await Screen.countDocuments({ cinema: cinema._id });
    await Cinema.findByIdAndUpdate(cinema._id, { screensCount: count });

    return res.status(201).json({ success: true, screen, message: 'Screen and seating layout configured.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create screen.' });
  }
}

async function updateScreen(req, res) {
  try {
    const { screenId } = req.params;
    const { screenNumber, name, screenType, seatingLayout, status } = req.body;

    const screen = await Screen.findOne({ _id: screenId, partner: req.user._id });
    if (!screen) {
      return res.status(404).json({ success: false, message: 'Screen not found or access denied.' });
    }

    if (screenNumber) screen.screenNumber = screenNumber.trim();
    if (name) screen.name = name.trim();
    if (screenType) screen.screenType = screenType;
    if (status) screen.status = status;

    if (Array.isArray(seatingLayout) && seatingLayout.length > 0) {
      screen.seatingLayout = seatingLayout;
      screen.totalCapacity = seatingLayout.reduce((sum, r) => sum + (r.seatsCount || 12), 0);
    }

    await screen.save();
    return res.json({ success: true, screen, message: 'Screen configuration updated.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update screen.' });
  }
}

async function deleteScreen(req, res) {
  try {
    const { screenId } = req.params;
    const screen = await Screen.findOne({ _id: screenId, partner: req.user._id });

    if (!screen) {
      return res.status(404).json({ success: false, message: 'Screen not found or access denied.' });
    }

    const activeShows = await Show.countDocuments({ screen: screen._id, status: 'active' });
    if (activeShows > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete screen "${screen.name}" because ${activeShows} active show(s) are scheduled on it.`
      });
    }

    await Screen.findByIdAndDelete(screen._id);
    const count = await Screen.countDocuments({ cinema: screen.cinema });
    await Cinema.findByIdAndUpdate(screen.cinema, { screensCount: count });

    return res.json({ success: true, message: `Screen "${screen.name}" deleted.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete screen.' });
  }
}

// ==========================================
// 4. MOVIE CATALOG (Central Catalog Browser)
// ==========================================
async function getAvailableMovies(req, res) {
  try {
    const movies = await Movie.find({ status: { $nin: ['draft', 'archived'] } })
      .select('title synopsis genre language certificate duration releaseDate rating posterUrl backdropUrl formats')
      .sort({ rating: -1 });

    return res.json({ success: true, movies });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load movie catalog.' });
  }
}

// ==========================================
// 5. SHOW MANAGEMENT WITH CONFLICT PREVENTION
// ==========================================
async function getShows(req, res) {
  try {
    const { cinemaId, screenId, date, movieId, status } = req.query;
    const query = { partner: req.user._id };

    if (cinemaId) query.cinema = cinemaId;
    if (screenId) query.screen = screenId;
    if (date) query.showDate = date;
    if (movieId) query.movie = movieId;
    if (status) query.status = status;

    const shows = await Show.find(query)
      .populate('cinema', 'name city')
      .populate('screen', 'screenNumber name screenType totalCapacity')
      .populate('movie', 'title posterUrl duration certificate language')
      .sort({ showDate: 1, startTime: 1 });

    return res.json({ success: true, shows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve shows.' });
  }
}

async function createShow(req, res) {
  try {
    const {
      cinemaId,
      screenId,
      movieId,
      showDate = 'Today',
      startTime,
      endTime,
      format = '2D',
      ticketPrice = 200,
      pricingTiers
    } = req.body;

    if (!cinemaId || !screenId || !movieId || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Cinema, Screen, Movie, Start Time, and End Time are required.'
      });
    }

    // Verify ownership of cinema and screen
    const [cinema, screen, movie] = await Promise.all([
      Cinema.findOne({ _id: cinemaId, partner: req.user._id }),
      Screen.findOne({ _id: screenId, partner: req.user._id }),
      Movie.findById(movieId)
    ]);

    if (!cinema) return res.status(404).json({ success: false, message: 'Cinema not found or access denied.' });
    if (!screen) return res.status(404).json({ success: false, message: 'Screen not found or access denied.' });
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found in platform catalog.' });

    // Overlap conflict detection on the same screen and date
    const existingShowsOnScreen = await Show.find({
      screen: screen._id,
      showDate,
      status: 'active'
    });

    for (const existing of existingShowsOnScreen) {
      if (timesOverlap(startTime, endTime, existing.startTime, existing.endTime)) {
        return res.status(409).json({
          success: false,
          message: `Scheduling Conflict: ${screen.name} already has show "${existing.movieTitle}" running from ${existing.startTime} to ${existing.endTime} on ${showDate}. Please choose another time or screen.`
        });
      }
    }

    const tiers = pricingTiers || {
      normal: Number(ticketPrice) || 180,
      premium: (Number(ticketPrice) || 180) + 70,
      recliner: (Number(ticketPrice) || 180) + 200
    };

    const show = await Show.create({
      partner: req.user._id,
      cinema: cinema._id,
      screen: screen._id,
      movie: movie._id,
      movieTitle: movie.title,
      showDate,
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      format,
      ticketPrice: Number(ticketPrice) || tiers.normal,
      pricingTiers: tiers,
      bookedSeats: [],
      status: 'active'
    });

    return res.status(201).json({ success: true, show, message: 'Show scheduled successfully!' });
  } catch (error) {
    console.error('Error creating show:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create show.' });
  }
}

async function updateShow(req, res) {
  try {
    const { showId } = req.params;
    const { startTime, endTime, showDate, format, ticketPrice, pricingTiers, status } = req.body;

    const show = await Show.findOne({ _id: showId, partner: req.user._id });
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found or access denied.' });
    }

    const newStart = startTime || show.startTime;
    const newEnd = endTime || show.endTime;
    const newDate = showDate || show.showDate;

    // Check overlap if time or date is changing
    if (startTime || endTime || showDate) {
      const otherShows = await Show.find({
        _id: { $ne: show._id },
        screen: show.screen,
        showDate: newDate,
        status: 'active'
      });

      for (const existing of otherShows) {
        if (timesOverlap(newStart, newEnd, existing.startTime, existing.endTime)) {
          return res.status(409).json({
            success: false,
            message: `Conflict: Screen already has show "${existing.movieTitle}" running ${existing.startTime}-${existing.endTime} on ${newDate}.`
          });
        }
      }
    }

    if (startTime) show.startTime = startTime.trim();
    if (endTime) show.endTime = endTime.trim();
    if (showDate) show.showDate = showDate;
    if (format) show.format = format;
    if (ticketPrice !== undefined) show.ticketPrice = Number(ticketPrice);
    if (pricingTiers) show.pricingTiers = pricingTiers;
    if (status) show.status = status;

    await show.save();
    return res.json({ success: true, show, message: 'Show updated.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update show.' });
  }
}

async function deleteShow(req, res) {
  try {
    const { showId } = req.params;
    const show = await Show.findOne({ _id: showId, partner: req.user._id });

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found or access denied.' });
    }

    // Check if tickets have already been booked
    if (show.bookedSeats && show.bookedSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete show "${show.movieTitle}" because ${show.bookedSeats.length} seat(s) have already been booked. Please cancel the show instead.`
      });
    }

    await Show.findByIdAndDelete(show._id);
    return res.json({ success: true, message: 'Show removed.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete show.' });
  }
}

// ==========================================
// 6. BOOKINGS MANAGEMENT (SCOPED TO PARTNER)
// ==========================================
async function getBookings(req, res) {
  try {
    const partnerId = req.user._id;
    const { cinemaIds, cinemaNames } = await getPartnerCinemas(partnerId);

    const { date, status, search, limit = 50, page = 1 } = req.query;

    const query = {
      $or: [
        { partner: partnerId },
        { cinema: { $in: cinemaIds } },
        { theatreName: { $regex: new RegExp(cinemaNames.join('|') || '^$', 'i') } }
      ]
    };

    if (status && status !== 'all') {
      query.bookingStatus = status;
    }

    if (date && date !== 'all') {
      query.showDate = date;
    }

    if (search) {
      query.$and = [
        {
          $or: [
            { bookingId: { $regex: search, $options: 'i' } },
            { movieTitle: { $regex: search, $options: 'i' } },
            { theatreName: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('user', 'name email phone')
        .populate('movie', 'title posterUrl certificate')
        .populate('cinema', 'name city')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(query)
    ]);

    return res.json({
      success: true,
      bookings,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve bookings.' });
  }
}

async function getBookingById(req, res) {
  try {
    const { id } = req.params;
    const partnerId = req.user._id;
    const { cinemaIds, cinemaNames } = await getPartnerCinemas(partnerId);

    const booking = await Booking.findOne({
      $and: [
        { $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { bookingId: id }] },
        {
          $or: [
            { partner: partnerId },
            { cinema: { $in: cinemaIds } },
            { theatreName: { $regex: new RegExp(cinemaNames.join('|') || '^$', 'i') } }
          ]
        }
      ]
    })
      .populate('user', 'name email phone')
      .populate('movie', 'title posterUrl')
      .populate('cinema', 'name city address');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or does not belong to your cinemas.' });
    }

    return res.json({ success: true, booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching booking details.' });
  }
}

// ==========================================
// 7. TICKETS INVENTORY & BREAKDOWN
// ==========================================
async function getTickets(req, res) {
  try {
    const partnerId = req.user._id;
    const { cinemaIds, cinemaNames } = await getPartnerCinemas(partnerId);

    const bookings = await Booking.find({
      $or: [
        { partner: partnerId },
        { cinema: { $in: cinemaIds } },
        { theatreName: { $regex: new RegExp(cinemaNames.join('|') || '^$', 'i') } }
      ]
    })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(100);

    const totalSold = bookings.filter(b => b.bookingStatus === 'confirmed').length;
    const totalUsed = bookings.filter(b => b.ticketValidated).length;
    const totalUnused = totalSold - totalUsed;
    const totalCancelled = bookings.filter(b => b.bookingStatus === 'cancelled').length;

    return res.json({
      success: true,
      summary: { totalSold, totalUsed, totalUnused, totalCancelled },
      tickets: bookings
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve tickets inventory.' });
  }
}

// ==========================================
// 8. ATOMIC QR / TICKET VALIDATION
// ==========================================
async function validateTicket(req, res) {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID or QR code is required.' });
    }

    const trimmedId = bookingId.trim();
    const partnerId = req.user._id;
    const { cinemaIds, cinemaNames } = await getPartnerCinemas(partnerId);

    // 1. Locate booking document
    const query = {
      $or: [
        { bookingId: trimmedId },
        ...(mongoose.Types.ObjectId.isValid(trimmedId) ? [{ _id: trimmedId }] : [])
      ]
    };

    const booking = await Booking.findOne(query)
      .populate('user', 'name email phone')
      .populate('movie', 'title posterUrl duration');

    if (!booking) {
      return res.status(404).json({
        success: false,
        status: 'INVALID_TICKET',
        message: `Invalid Ticket: No booking found with identifier "${trimmedId}".`
      });
    }

    // 2. Ownership verification: Must belong to this partner's cinema
    const belongsToPartner =
      (booking.partner && booking.partner.toString() === partnerId.toString()) ||
      (booking.cinema && cinemaIds.some(id => id.toString() === booking.cinema.toString())) ||
      (booking.theatreName && cinemaNames.includes(booking.theatreName.toLowerCase()));

    if (!belongsToPartner) {
      return res.status(403).json({
        success: false,
        status: 'WRONG_CINEMA',
        message: `Access Rejected: This ticket is for venue "${booking.theatreName}". It does not belong to your cinema network.`
      });
    }

    // 3. Status Check: Must be confirmed and paid
    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        status: 'CANCELLED_TICKET',
        message: `Ticket Cancelled: Booking ${booking.bookingId} has been cancelled and refunded.`
      });
    }

    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        status: 'UNPAID_TICKET',
        message: `Unpaid Ticket: Payment is marked as ${booking.paymentStatus}.`
      });
    }

    // 4. ATOMIC CHECK: Check if already validated to prevent race conditions & duplicate entry
    const updatedBooking = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        ticketValidated: false
      },
      {
        $set: {
          ticketValidated: true,
          validatedAt: new Date(),
          validatedBy: req.user._id
        },
        $push: {
          validationHistory: {
            validatedAt: new Date(),
            validatedBy: req.user._id,
            action: 'CHECK_IN',
            notes: 'Gate check-in confirmed via B2B Scanner'
          }
        }
      },
      { returnDocument: 'after' }
    );

    if (!updatedBooking) {
      // It was already validated!
      return res.status(409).json({
        success: false,
        status: 'ALREADY_USED',
        message: `Ticket Already Used: Booking ${booking.bookingId} was previously validated on ${booking.validatedAt ? new Date(booking.validatedAt).toLocaleTimeString() : 'record'}.`,
        booking: {
          bookingId: booking.bookingId,
          movieTitle: booking.movieTitle,
          seats: booking.seats,
          validatedAt: booking.validatedAt,
          customerName: booking.user?.name || 'Customer'
        }
      });
    }

    return res.json({
      success: true,
      status: 'VALID_TICKET',
      message: '✓ Valid Ticket: Entry Authorized',
      booking: {
        bookingId: updatedBooking.bookingId,
        movieTitle: updatedBooking.movieTitle,
        theatreName: updatedBooking.theatreName,
        screenName: updatedBooking.screenName || 'Screen 1',
        showtime: updatedBooking.showtime,
        showDate: updatedBooking.showDate,
        seats: updatedBooking.seats,
        seatsCount: updatedBooking.seatsCount,
        customerName: booking.user?.name || 'Customer',
        customerPhone: booking.user?.phone || '',
        validatedAt: updatedBooking.validatedAt
      }
    });
  } catch (error) {
    console.error('Error validating ticket:', error);
    return res.status(500).json({ success: false, message: 'Server error validating ticket.' });
  }
}

// ==========================================
// 9. REVENUE & FINANCIAL REPORTING
// ==========================================
async function getRevenue(req, res) {
  try {
    const partnerId = req.user._id;
    const { cinemaIds, cinemaNames } = await getPartnerCinemas(partnerId);

    const bookings = await Booking.find({
      $or: [
        { partner: partnerId },
        { cinema: { $in: cinemaIds } },
        { theatreName: { $regex: new RegExp(cinemaNames.join('|') || '^$', 'i') } }
      ],
      bookingStatus: 'confirmed'
    }).sort({ createdAt: -1 });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const todayBookings = bookings.filter(b => new Date(b.createdAt) >= startOfToday);
    const weekBookings = bookings.filter(b => new Date(b.createdAt) >= sevenDaysAgo);
    const monthBookings = bookings.filter(b => new Date(b.createdAt) >= thirtyDaysAgo);

    const todayRevenue = todayBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const weeklyRevenue = weekBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const monthlyRevenue = monthBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const grossRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    // Revenue by Movie
    const revenueByMovie = {};
    bookings.forEach(b => {
      const m = b.movieTitle || 'Movie';
      revenueByMovie[m] = (revenueByMovie[m] || 0) + (b.totalAmount || 0);
    });

    // Revenue by Cinema
    const revenueByCinema = {};
    bookings.forEach(b => {
      const c = b.theatreName || 'Cinema';
      revenueByCinema[c] = (revenueByCinema[c] || 0) + (b.totalAmount || 0);
    });

    return res.json({
      success: true,
      revenue: {
        todayRevenue,
        weeklyRevenue,
        monthlyRevenue,
        grossRevenue,
        totalBookingsCount: bookings.length,
        revenueByMovie,
        revenueByCinema
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve revenue metrics.' });
  }
}

// ==========================================
// 10. COMPREHENSIVE B2B REPORTS
// ==========================================
async function getReports(req, res) {
  try {
    const partnerId = req.user._id;
    const { cinemaIds, cinemaNames } = await getPartnerCinemas(partnerId);

    const bookings = await Booking.find({
      $or: [
        { partner: partnerId },
        { cinema: { $in: cinemaIds } },
        { theatreName: { $regex: new RegExp(cinemaNames.join('|') || '^$', 'i') } }
      ]
    }).sort({ createdAt: -1 });

    const confirmed = bookings.filter(b => b.bookingStatus === 'confirmed');

    // Group by Movie
    const movieStats = {};
    confirmed.forEach(b => {
      const m = b.movieTitle || 'Movie';
      if (!movieStats[m]) {
        movieStats[m] = { movie: m, tickets: 0, revenue: 0, bookingsCount: 0 };
      }
      movieStats[m].tickets += (b.seatsCount || b.seats?.length || 1);
      movieStats[m].revenue += (b.totalAmount || 0);
      movieStats[m].bookingsCount += 1;
    });

    // Group by Cinema
    const cinemaStats = {};
    confirmed.forEach(b => {
      const c = b.theatreName || 'Cinema';
      if (!cinemaStats[c]) {
        cinemaStats[c] = { cinema: c, tickets: 0, revenue: 0, bookingsCount: 0 };
      }
      cinemaStats[c].tickets += (b.seatsCount || b.seats?.length || 1);
      cinemaStats[c].revenue += (b.totalAmount || 0);
      cinemaStats[c].bookingsCount += 1;
    });

    return res.json({
      success: true,
      reports: {
        moviePerformance: Object.values(movieStats).sort((a, b) => b.revenue - a.revenue),
        cinemaPerformance: Object.values(cinemaStats).sort((a, b) => b.revenue - a.revenue),
        totalTransactions: bookings.length,
        totalConfirmed: confirmed.length,
        grossSales: confirmed.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to generate operational reports.' });
  }
}

// ==========================================
// 11. PARTNER PROFILE MANAGEMENT
// ==========================================
async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const cinemasCount = await Cinema.countDocuments({ partner: req.user._id });

    return res.json({
      success: true,
      profile: {
        ...user.toObject(),
        cinemasCount
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch partner profile.' });
  }
}

async function updateProfile(req, res) {
  try {
    const { name, phone, businessName, partnerPhone, businessAddress } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (businessName !== undefined) user.businessName = businessName.trim();
    if (partnerPhone !== undefined) user.partnerPhone = partnerPhone.trim();
    if (businessAddress !== undefined) user.businessAddress = businessAddress.trim();

    await user.save();

    return res.json({
      success: true,
      message: 'Partner profile updated successfully.',
      profile: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        businessName: user.businessName,
        partnerPhone: user.partnerPhone,
        businessAddress: user.businessAddress
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update profile.' });
  }
}

module.exports = {
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
};
