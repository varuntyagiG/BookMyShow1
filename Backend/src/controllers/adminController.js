const Movie = require('../models/Movie');
const Booking = require('../models/Booking');
const User = require('../models/User');
const CategoryItem = require('../models/CategoryItem');
const mongoose = require('mongoose');

// Helper to normalize document with id
function normalizeItem(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  obj.id = obj.customId || obj._id.toString();
  return obj;
}

// 1. Dashboard Statistics
async function getDashboardStats(req, res) {
  try {
    const [
      totalMovies,
      totalUsers,
      totalCategoryItems,
      allBookings,
      recentBookings
    ] = await Promise.all([
      Movie.countDocuments(),
      User.countDocuments(),
      CategoryItem.countDocuments(),
      Booking.find().select('totalAmount bookingStatus categoryType'),
      Booking.find()
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    const confirmedBookings = allBookings.filter(b => b.bookingStatus === 'confirmed');
    const cancelledBookings = allBookings.filter(b => b.bookingStatus === 'cancelled');

    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
    const movieBookingsCount = confirmedBookings.filter(b => b.categoryType === 'movie').length;
    const otherBookingsCount = confirmedBookings.length - movieBookingsCount;

    return res.json({
      success: true,
      data: {
        totalRevenue,
        totalBookings: allBookings.length,
        confirmedCount: confirmedBookings.length,
        cancelledCount: cancelledBookings.length,
        movieBookingsCount,
        otherBookingsCount,
        totalMovies,
        totalUsers,
        totalCategoryItems,
        recentBookings
      }
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    return res.status(500).json({ success: false, message: 'Failed to compute dashboard metrics.' });
  }
}

// 2. Movie CRUD
async function getMovies(req, res) {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    return res.json({ success: true, movies: movies.map(normalizeItem) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve movies.' });
  }
}

async function createMovie(req, res) {
  try {
    const movieData = { ...req.body };
    if (!movieData.customId) {
      movieData.customId = 'm_' + Date.now().toString(36);
    }

    // Ensure array structures
    if (typeof movieData.genre === 'string') {
      movieData.genre = movieData.genre.split(',').map(g => g.trim()).filter(Boolean);
    }
    if (typeof movieData.formats === 'string') {
      movieData.formats = movieData.formats.split(',').map(f => f.trim()).filter(Boolean);
    }
    if (typeof movieData.cities === 'string') {
      movieData.cities = movieData.cities.split(',').map(c => c.trim()).filter(Boolean);
    }

    const movie = await Movie.create(movieData);
    return res.status(201).json({ success: true, movie: normalizeItem(movie) });
  } catch (error) {
    console.error('Error creating movie:', error);
    return res.status(400).json({ success: false, message: error.message || 'Failed to create movie.' });
  }
}

async function updateMovie(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (typeof updates.genre === 'string') {
      updates.genre = updates.genre.split(',').map(g => g.trim()).filter(Boolean);
    }
    if (typeof updates.formats === 'string') {
      updates.formats = updates.formats.split(',').map(f => f.trim()).filter(Boolean);
    }
    if (typeof updates.cities === 'string') {
      updates.cities = updates.cities.split(',').map(c => c.trim()).filter(Boolean);
    }

    let movie = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      movie = await Movie.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    }
    if (!movie) {
      movie = await Movie.findOneAndUpdate({ customId: id }, updates, { new: true, runValidators: true });
    }

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    return res.json({ success: true, movie: normalizeItem(movie) });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to update movie.' });
  }
}

async function deleteMovie(req, res) {
  try {
    const { id } = req.params;
    let movie = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      movie = await Movie.findById(id);
    }
    if (!movie) {
      movie = await Movie.findOne({ customId: id });
    }

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    // Safe Delete Check: Block hard deletion if active customer bookings exist
    const activeBookingsCount = await Booking.countDocuments({
      $or: [
        { movie: movie._id },
        { movieCustomId: movie.customId },
        { movieTitle: movie.title }
      ],
      bookingStatus: 'confirmed'
    });

    if (activeBookingsCount > 0) {
      return res.status(400).json({
        success: false,
        isSafeDeleteBlocked: true,
        activeBookings: activeBookingsCount,
        message: `Cannot delete "${movie.title}" because ${activeBookingsCount} active customer booking(s) exist. Please unpublish or archive this movie instead to preserve customer booking history.`
      });
    }

    await Movie.findByIdAndDelete(movie._id);

    return res.json({ success: true, message: `Movie "${movie.title}" deleted successfully.` });
  } catch (error) {
    console.error('Error deleting movie:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete movie.' });
  }
}

// 3. Theatres & Shows Management
async function addTheatreToMovie(req, res) {
  try {
    const { id } = req.params; // movieId
    const { name, distance = '2.0 km away', facilities = ['M-Ticket', 'F&B'] } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Theatre name is required.' });
    }

    let movie = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      movie = await Movie.findById(id);
    }
    if (!movie) {
      movie = await Movie.findOne({ customId: id });
    }

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    const newTheatre = {
      id: 'th_' + Date.now().toString(36),
      name: name.trim(),
      distance,
      facilities: Array.isArray(facilities) ? facilities : facilities.split(',').map(f => f.trim()),
      showtimes: []
    };

    movie.theatres.push(newTheatre);
    await movie.save();

    return res.status(201).json({ success: true, movie: normalizeItem(movie), theatre: newTheatre });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to add theatre to movie.' });
  }
}

async function deleteTheatreFromMovie(req, res) {
  try {
    const { id, theatreId } = req.params;

    let movie = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      movie = await Movie.findById(id);
    }
    if (!movie) {
      movie = await Movie.findOne({ customId: id });
    }

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    const theatre = movie.theatres.find(t => t._id.toString() === theatreId || t.id === theatreId);
    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found.' });
    }

    // Safe Delete: Check for existing active bookings at this theatre
    const activeBookings = await Booking.countDocuments({
      $or: [
        { movie: movie._id },
        { movieCustomId: movie.customId },
        { movieTitle: movie.title }
      ],
      theatreName: theatre.name,
      bookingStatus: 'confirmed'
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot remove theatre "${theatre.name}" because ${activeBookings} active customer booking(s) exist for it.`
      });
    }

    movie.theatres = movie.theatres.filter(t => t._id.toString() !== theatreId && t.id !== theatreId);
    await movie.save();

    return res.json({ success: true, movie: normalizeItem(movie), message: 'Theatre removed successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete theatre.' });
  }
}

async function addShowtimeToTheatre(req, res) {
  try {
    const { id, theatreId } = req.params;
    const { time, format = '2D', price = '₹450', status = 'available' } = req.body;

    if (!time) {
      return res.status(400).json({ success: false, message: 'Showtime (e.g., "10:15 AM") is required.' });
    }

    let movie = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      movie = await Movie.findById(id);
    }
    if (!movie) {
      movie = await Movie.findOne({ customId: id });
    }

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    const theatre = movie.theatres.find(t => t._id.toString() === theatreId || t.id === theatreId);
    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found for this movie.' });
    }

    const newShowtime = {
      time: time.trim(),
      format,
      price: price.startsWith('₹') ? price : `₹${price}`,
      status,
      bookedSeats: []
    };

    theatre.showtimes.push(newShowtime);
    await movie.save();

    return res.status(201).json({ success: true, movie: normalizeItem(movie), showtime: newShowtime });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to add showtime.' });
  }
}

async function deleteShowtimeFromTheatre(req, res) {
  try {
    const { id, theatreId, showtimeId } = req.params;

    let movie = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      movie = await Movie.findById(id);
    }
    if (!movie) {
      movie = await Movie.findOne({ customId: id });
    }

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    const theatre = movie.theatres.find(t => t._id.toString() === theatreId || t.id === theatreId);
    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found.' });
    }

    const showtime = theatre.showtimes.find(s => s._id.toString() === showtimeId);
    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found.' });
    }

    // Safe Delete: Check for existing active bookings for this specific showtime
    const activeBookings = await Booking.countDocuments({
      $or: [
        { movie: movie._id },
        { movieCustomId: movie.customId },
        { movieTitle: movie.title }
      ],
      theatreName: theatre.name,
      showtime: showtime.time,
      bookingStatus: 'confirmed'
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot remove showtime "${showtime.time}" because ${activeBookings} active customer booking(s) exist for it.`
      });
    }

    theatre.showtimes = theatre.showtimes.filter(s => s._id.toString() !== showtimeId);
    await movie.save();

    return res.json({ success: true, movie: normalizeItem(movie), message: 'Showtime removed successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to remove showtime.' });
  }
}

// 4. Bookings Management
async function getBookings(req, res) {
  try {
    const { search, status, limit = 50, page = 1 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.bookingStatus = status;
    }

    if (search) {
      query.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { movieTitle: { $regex: search, $options: 'i' } },
        { theatreName: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('user', 'name email phone')
        .populate('movie', 'title posterUrl')
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

async function updateBookingStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'confirmed' | 'cancelled'

    if (!['confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid booking status.' });
    }

    let booking = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      booking = await Booking.findById(id);
    }
    if (!booking) {
      booking = await Booking.findOne({ bookingId: id });
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    booking.bookingStatus = status;
    if (status === 'cancelled') {
      booking.paymentStatus = 'refunded';
    }
    await booking.save();

    return res.json({
      success: true,
      message: `Booking ${booking.bookingId} marked as ${status}.`,
      booking
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update booking status.' });
  }
}

// 5. Category Items (Events, Banners, Plays, Sports)
async function getCategoryItems(req, res) {
  try {
    const { type } = req.query;
    const filter = type ? { categoryType: type } : {};
    const items = await CategoryItem.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, items: items.map(normalizeItem) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve items.' });
  }
}

async function createCategoryItem(req, res) {
  try {
    const itemData = { ...req.body };
    if (!itemData.customId) {
      itemData.customId = 'cat_' + Date.now().toString(36);
    }
    const item = await CategoryItem.create(itemData);
    return res.status(201).json({ success: true, item: normalizeItem(item) });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to create category item.' });
  }
}

async function deleteCategoryItem(req, res) {
  try {
    const { id } = req.params;
    let item = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      item = await CategoryItem.findByIdAndDelete(id);
    }
    if (!item) {
      item = await CategoryItem.findOneAndDelete({ customId: id });
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    return res.json({ success: true, message: `Item "${item.title}" deleted successfully.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete category item.' });
  }
}

// 6. User Management
async function getUsers(req, res) {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    // Fetch user booking counts
    const userBookingCounts = await Booking.aggregate([
      { $group: { _id: '$user', count: { $sum: 1 } } }
    ]);
    const countsMap = new Map(userBookingCounts.map(c => [c._id.toString(), c.count]));

    const usersWithCounts = users.map(u => ({
      ...u.toObject(),
      bookingCount: countsMap.get(u._id.toString()) || 0
    }));

    return res.json({ success: true, users: usersWithCounts });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
}

async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be "user" or "admin".' });
    }

    // Safety: Admin cannot revoke their own admin status
    if (req.user._id.toString() === id && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Action rejected: You cannot revoke your own Super Admin access.'
      });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({
      success: true,
      message: `User ${user.name} role changed to ${role}.`,
      user
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update user role.' });
  }
}

module.exports = {
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
};
