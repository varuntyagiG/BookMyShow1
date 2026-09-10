const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const mongoose = require('mongoose');

// Create a new movie or event ticket booking
async function createBooking(req, res) {
  try {
    const {
      movieId,
      movieTitle,
      theatreName,
      showtime,
      showDate = 'Today',
      seats = [],
      seatsCount,
      includeSnacks = false,
      categoryType = 'movie',
      ticketPrice: customTicketPrice,
      convenienceFee: customConvenienceFee,
      totalAmount: customTotalAmount
    } = req.body;

    // Resolve seat list
    let seatList = Array.isArray(seats) && seats.length > 0 ? [...seats] : [];
    if (seatList.length === 0 && (seatsCount || 1) > 0) {
      const count = seatsCount || 1;
      for (let i = 1; i <= count; i++) {
        seatList.push(`PASS-${i}`);
      }
    }

    if (!theatreName || !showtime || seatList.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Venue/Theatre, showtime, and at least one seat or pass are required.'
      });
    }

    // 1. Locate Movie if applicable
    let movie = null;
    if (movieId) {
      if (mongoose.Types.ObjectId.isValid(movieId)) {
        movie = await Movie.findById(movieId);
      }
      if (!movie) {
        movie = await Movie.findOne({ customId: movieId });
      }
    }

    const resolvedMovieTitle = movieTitle || (movie ? movie.title : (categoryType === 'stream' ? 'Digital Stream' : 'Live Show'));

    // 2. Concurrency check: Check existing active bookings for these exact seats (only for movie seat selections)
    if (categoryType === 'movie' && seatList.every(s => !s.startsWith('PASS-'))) {
      const existingConflict = await Booking.findOne({
        movieTitle: resolvedMovieTitle,
        theatreName,
        showtime,
        showDate,
        bookingStatus: 'confirmed',
        seats: { $in: seatList }
      });

      if (existingConflict) {
        const conflictedSeats = seatList.filter(s => existingConflict.seats.includes(s));
        return res.status(409).json({
          success: false,
          message: `Seat(s) ${conflictedSeats.join(', ')} have already been booked for this show. Please select different seats.`
        });
      }
    }

    // 3. Price calculation
    let unitPrice = 450;
    if (movie) {
      const matchedTheatre = movie.theatres?.find(t => t.name.toLowerCase() === theatreName.toLowerCase());
      if (matchedTheatre) {
        const matchedShow = matchedTheatre.showtimes?.find(s => s.time === showtime);
        if (matchedShow && matchedShow.price) {
          const parsed = parseInt(matchedShow.price.replace(/[^0-9]/g, ''), 10);
          if (!isNaN(parsed) && parsed > 0) unitPrice = parsed;
        }
      }
    }

    const finalSeatsCount = seatsCount || seatList.length;
    const ticketPrice = customTicketPrice !== undefined ? customTicketPrice : (unitPrice * finalSeatsCount);
    const convenienceFee = customConvenienceFee !== undefined ? customConvenienceFee : (categoryType === 'movie' ? Math.round(35.4 * finalSeatsCount) : 0);
    const snacksFee = includeSnacks ? 250 : 0;
    const totalAmount = customTotalAmount !== undefined ? customTotalAmount : (ticketPrice + convenienceFee + snacksFee);

    const bookingId = 'BMS-' + Date.now().toString().slice(-6);

    // 4. Create Booking Document in MongoDB
    const booking = await Booking.create({
      bookingId,
      user: req.user._id,
      movie: movie ? movie._id : null,
      movieCustomId: movie ? movie.customId : (movieId || ''),
      movieTitle: resolvedMovieTitle,
      categoryType,
      theatreName,
      showtime,
      showDate,
      seats: seatList,
      seatsCount: finalSeatsCount,
      ticketPrice,
      convenienceFee,
      includeSnacks: !!includeSnacks,
      snacksFee,
      totalAmount,
      paymentStatus: 'paid',
      bookingStatus: 'confirmed'
    });

    // 5. Update bookedSeats on the Movie showtime if applicable
    if (movie && categoryType === 'movie') {
      try {
        await Movie.updateOne(
          {
            _id: movie._id,
            'theatres.name': theatreName,
            'theatres.showtimes.time': showtime
          },
          {
            $addToSet: {
              'theatres.$[t].showtimes.$[s].bookedSeats': { $each: seatList }
            }
          },
          {
            arrayFilters: [
              { 't.name': theatreName },
              { 's.time': showtime }
            ]
          }
        );
      } catch (err) {
        console.warn('Note: Could not update nested showtime bookedSeats array:', err.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error occurred while creating booking.'
    });
  }
}

// Get all bookings for the authenticated user
async function getUserBookings(req, res) {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('movie', 'title posterUrl certificate duration language')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your bookings.'
    });
  }
}

// Get single booking by bookingId or ObjectId
async function getBookingById(req, res) {
  try {
    const { id } = req.params;
    let booking = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      booking = await Booking.findById(id).populate('movie', 'title posterUrl');
    }
    if (!booking) {
      booking = await Booking.findOne({ bookingId: id }).populate('movie', 'title posterUrl');
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    return res.json({
      success: true,
      booking
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error retrieving booking.' });
  }
}

// Get occupied seats for a showtime
async function getShowSeats(req, res) {
  try {
    const { movieTitle, theatreName, showtime, showDate = 'Today', movieId } = req.query;

    const query = {
      theatreName,
      showtime,
      showDate,
      bookingStatus: 'confirmed'
    };

    if (movieTitle) {
      query.movieTitle = movieTitle;
    }

    const bookings = await Booking.find(query).select('seats');

    let bookedSeats = Array.from(new Set(bookings.flatMap(b => b.seats)));

    // Also check predefined bookedSeats in movie theatre showtimes if movie is found
    if (movieId || movieTitle) {
      try {
        const movie = movieId
          ? (mongoose.Types.ObjectId.isValid(movieId) ? await Movie.findById(movieId) : await Movie.findOne({ customId: movieId }))
          : await Movie.findOne({ title: movieTitle });

        if (movie && movie.theatres) {
          const th = movie.theatres.find(t => t.name.toLowerCase() === theatreName?.toLowerCase());
          if (th && th.showtimes) {
            const st = th.showtimes.find(s => s.time === showtime);
            if (st && Array.isArray(st.bookedSeats)) {
              bookedSeats = Array.from(new Set([...bookedSeats, ...st.bookedSeats]));
            }
          }
        }
      } catch (err) {
        console.warn('Note: Could not check movie showtime bookedSeats:', err.message);
      }
    }

    return res.json({
      success: true,
      bookedSeats
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving show seats.' });
  }
}

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  getShowSeats
};
