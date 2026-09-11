const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const Show = require('../models/Show');
const Screen = require('../models/Screen');
const mongoose = require('mongoose');

// Create a new movie or event ticket booking
async function createBooking(req, res) {
  let reservedOnShow = null;
  let seatList = [];

  try {
    const {
      showId,
      screenId,
      cinemaId,
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
    seatList = Array.isArray(seats) && seats.length > 0 ? [...seats] : [];
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

    // 2. Locate matching Show and Cinema entities
    let matchedShow = null;
    let matchedCinema = null;
    let matchedScreen = null;

    if (showId && mongoose.Types.ObjectId.isValid(showId)) {
      matchedShow = await Show.findById(showId).populate('cinema').populate('screen');
      if (matchedShow) {
        matchedCinema = matchedShow.cinema;
        matchedScreen = matchedShow.screen;
      }
    }

    if (!matchedShow) {
      // Fallback matching
      try {
        matchedCinema = await Cinema.findOne({ name: { $regex: `^${theatreName.trim()}$`, $options: 'i' } });
        if (matchedCinema) {
          matchedShow = await Show.findOne({
            cinema: matchedCinema._id,
            startTime: showtime,
            status: 'active'
          }).populate('screen');
          if (matchedShow) matchedScreen = matchedShow.screen;
        } else {
          matchedShow = await Show.findOne({
            movieTitle: resolvedMovieTitle,
            startTime: showtime,
            status: 'active'
          }).populate('cinema').populate('screen');
          if (matchedShow) {
            matchedCinema = matchedShow.cinema;
            matchedScreen = matchedShow.screen;
          }
        }
      } catch (lookupErr) {
        console.warn('Note: Could not match partner cinema/show:', lookupErr.message);
      }
    }

    // 3. ATOMIC CONCURRENCY SEAT LOCK: Prevent double-booking race condition
    if (matchedShow && categoryType === 'movie') {
      const updatedShow = await Show.findOneAndUpdate(
        {
          _id: matchedShow._id,
          status: 'active',
          bookedSeats: { $nin: seatList }
        },
        {
          $push: { bookedSeats: { $each: seatList } }
        },
        { returnDocument: 'after' }
      );

      if (!updatedShow) {
        return res.status(409).json({
          success: false,
          message: `Seat selection conflict: One or more selected seats (${seatList.join(', ')}) have just been booked by another customer. Please select different seats.`
        });
      }

      reservedOnShow = matchedShow._id;
    } else if (categoryType === 'movie' && seatList.every(s => !s.startsWith('PASS-'))) {
      // Legacy conflict check if show document is not in MongoDB
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

    // 4. Price calculation
    let unitPrice = 200;
    if (matchedShow) {
      unitPrice = matchedShow.ticketPrice || matchedShow.pricingTiers?.normal || 200;
    } else if (movie) {
      const matchedTheatre = movie.theatres?.find(t => t.name.toLowerCase() === theatreName.toLowerCase());
      if (matchedTheatre) {
        const matchedShowtime = matchedTheatre.showtimes?.find(s => s.time === showtime);
        if (matchedShowtime && matchedShowtime.price) {
          const parsed = parseInt(matchedShowtime.price.replace(/[^0-9]/g, ''), 10);
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

    // Safeguard all Mongoose ObjectId fields against invalid strings (e.g. "th-4", "scr-1")
    const safeMovieId = (movie && mongoose.Types.ObjectId.isValid(movie._id))
      ? movie._id
      : ((matchedShow?.movie && mongoose.Types.ObjectId.isValid(matchedShow.movie))
          ? matchedShow.movie
          : (mongoose.Types.ObjectId.isValid(movieId) ? movieId : null));

    const safeCinemaId = (matchedCinema && mongoose.Types.ObjectId.isValid(matchedCinema._id))
      ? matchedCinema._id
      : (mongoose.Types.ObjectId.isValid(cinemaId) ? cinemaId : null);

    const safeScreenId = (matchedScreen && mongoose.Types.ObjectId.isValid(matchedScreen._id))
      ? matchedScreen._id
      : (mongoose.Types.ObjectId.isValid(screenId) ? screenId : null);

    const safeShowId = (matchedShow && mongoose.Types.ObjectId.isValid(matchedShow._id))
      ? matchedShow._id
      : (mongoose.Types.ObjectId.isValid(showId) ? showId : null);

    // 5. Create Booking Document in MongoDB
    const booking = await Booking.create({
      bookingId,
      user: req.user._id,
      movie: safeMovieId,
      movieCustomId: movie ? movie.customId : (movieId || ''),
      movieTitle: resolvedMovieTitle,
      categoryType,
      theatreName: matchedCinema ? matchedCinema.name : theatreName,
      showtime: matchedShow ? matchedShow.startTime : showtime,
      showDate: matchedShow ? matchedShow.showDate : showDate,
      seats: seatList,
      seatsCount: finalSeatsCount,
      ticketPrice,
      convenienceFee,
      includeSnacks: !!includeSnacks,
      snacksFee,
      totalAmount,
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
      cinema: safeCinemaId,
      screen: safeScreenId,
      screenName: matchedScreen ? (matchedScreen.name || matchedScreen.screenNumber || 'Screen 1') : 'Screen 1',
      show: safeShowId,
      ticketValidated: false
    });

    // 6. Update legacy Movie embedded showtimes if present
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
    // Rollback atomic seat lock if booking creation failed
    if (reservedOnShow && seatList.length > 0) {
      try {
        await Show.findByIdAndUpdate(reservedOnShow, {
          $pull: { bookedSeats: { $in: seatList } }
        });
      } catch (rollbackErr) {
        console.error('Failed to rollback reserved seats on show:', rollbackErr.message);
      }
    }

    console.error('Error creating booking:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error occurred while creating booking.'
    });
  }
}

// Get all bookings for the authenticated user
async function getUserBookings(req, res) {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('movie', 'title posterUrl certificate duration language')
      .populate('cinema', 'name city address facilities')
      .populate('screen', 'name screenNumber screenType')
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

// Get single booking by bookingId or ObjectId (Secured against IDOR)
async function getBookingById(req, res) {
  try {
    const { id } = req.params;
    let booking = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      booking = await Booking.findById(id)
        .populate('movie', 'title posterUrl certificate duration')
        .populate('cinema', 'name city address facilities contactPhone')
        .populate('screen', 'name screenNumber screenType')
        .populate('user', 'name email phone');
    }
    if (!booking) {
      booking = await Booking.findOne({ bookingId: id })
        .populate('movie', 'title posterUrl certificate duration')
        .populate('cinema', 'name city address facilities contactPhone')
        .populate('screen', 'name screenNumber screenType')
        .populate('user', 'name email phone');
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // IDOR Check: Ensure caller is owner, platform admin, or the associated partner
    const isAdmin = req.user.role === 'admin';
    const isOwner = booking.user && (booking.user._id || booking.user).toString() === req.user._id.toString();
    const isPartner = req.user.role === 'cinema_partner' && (
      (booking.partner && booking.partner.toString() === req.user._id.toString()) ||
      (booking.cinema && (booking.cinema.partner?.toString() === req.user._id.toString()))
    );

    if (!isAdmin && !isOwner && !isPartner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have authorization to view this booking ticket.'
      });
    }

    return res.json({
      success: true,
      booking
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error retrieving booking.' });
  }
}

// Cancel a customer booking and atomically release seat inventory
async function cancelUserBooking(req, res) {
  try {
    const { id } = req.params;
    const reason = (req.body && req.body.reason) ? req.body.reason : 'Customer requested cancellation';

    let booking = await Booking.findOne({
      $or: [
        { bookingId: id },
        ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : [])
      ],
      user: req.user._id
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or you do not have permission to cancel it.'
      });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been cancelled.'
      });
    }

    if (booking.ticketValidated) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a ticket that has already been validated at the cinema gate.'
      });
    }

    // 1. Mark booking cancelled and refunded
    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    // 2. ATOMIC RELEASE: Pull booked seats from Show
    if (booking.show && Array.isArray(booking.seats) && booking.seats.length > 0) {
      try {
        await Show.findByIdAndUpdate(booking.show, {
          $pull: { bookedSeats: { $in: booking.seats } }
        });
      } catch (err) {
        console.warn('Could not release seats on Show:', err.message);
      }
    }

    // 3. Release from legacy Movie showtimes if applicable
    if (booking.movie) {
      try {
        await Movie.updateOne(
          {
            _id: booking.movie,
            'theatres.name': booking.theatreName,
            'theatres.showtimes.time': booking.showtime
          },
          {
            $pull: {
              'theatres.$[t].showtimes.$[s].bookedSeats': { $in: booking.seats }
            }
          },
          {
            arrayFilters: [
              { 't.name': booking.theatreName },
              { 's.time': booking.showtime }
            ]
          }
        );
      } catch (err) {
        console.warn('Could not release seats on Movie:', err.message);
      }
    }

    return res.json({
      success: true,
      message: 'Booking cancelled successfully. Seats have been returned to available inventory.',
      booking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return res.status(500).json({ success: false, message: 'Server error cancelling booking.' });
  }
}

// Get occupied seats for a showtime
async function getShowSeats(req, res) {
  try {
    const { movieTitle, theatreName, showtime, showDate = 'Today', movieId, showId } = req.query;

    let bookedSeats = [];

    // 1. If showId provided, query Show.bookedSeats directly (Single Source of Truth)
    if (showId && mongoose.Types.ObjectId.isValid(showId)) {
      const show = await Show.findById(showId);
      if (show && Array.isArray(show.bookedSeats)) {
        bookedSeats = [...show.bookedSeats];
      }
    }

    // 2. Also query confirmed Bookings for this showtime
    const query = {
      theatreName,
      showtime,
      bookingStatus: 'confirmed'
    };

    if (showDate && showDate !== 'all') {
      query.showDate = showDate;
    }

    if (movieTitle) {
      query.movieTitle = movieTitle;
    }

    const bookings = await Booking.find(query).select('seats');
    const bookingSeats = bookings.flatMap(b => b.seats);

    bookedSeats = Array.from(new Set([...bookedSeats, ...bookingSeats]));

    // 3. Also check predefined bookedSeats in movie theatre showtimes if movie is found
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
  cancelUserBooking,
  getShowSeats
};
