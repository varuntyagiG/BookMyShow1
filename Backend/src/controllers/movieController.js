const Movie = require('../models/Movie');
const CategoryItem = require('../models/CategoryItem');
const Show = require('../models/Show');
const Cinema = require('../models/Cinema');
const City = require('../models/City');
const Offer = require('../models/Offer');
const mongoose = require('mongoose');

// Helper to normalize document output with backwards-compatible `id` property
function normalizeItem(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  obj.id = obj.customId || obj._id.toString();
  return obj;
}

async function getAllHomeData(req, res) {
  try {
    const { city, search } = req.query;

    let movieQuery = {
      status: { $nin: ['draft', 'archived'] }
    };
    if (city && city !== 'All') {
      movieQuery.cities = city;
    }
    if (search) {
      movieQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } },
        { language: { $regex: search, $options: 'i' } }
      ];
    }

    const [moviesDocs, bannersDocs, eventsDocs, sportsDocs, playsDocs, activitiesDocs, premieresDocs] = await Promise.all([
      Movie.find(movieQuery).sort({ rating: -1 }),
      CategoryItem.find({ categoryType: 'banner' }),
      CategoryItem.find({
        categoryType: 'event',
        ...(city && city !== 'All' ? { city: { $regex: `^${city}$`, $options: 'i' } } : {})
      }),
      CategoryItem.find({
        categoryType: 'sport',
        ...(city && city !== 'All' ? { city: { $regex: `^${city}$`, $options: 'i' } } : {})
      }),
      CategoryItem.find({
        categoryType: 'play',
        ...(city && city !== 'All' ? { city: { $regex: `^${city}$`, $options: 'i' } } : {})
      }),
      CategoryItem.find({
        categoryType: 'activity',
        ...(city && city !== 'All' ? { city: { $regex: `^${city}$`, $options: 'i' } } : {})
      }),
      CategoryItem.find({ categoryType: 'premiere' })
    ]);

    return res.json({
      success: true,
      data: {
        banners: bannersDocs.map(normalizeItem),
        movies: moviesDocs.map(normalizeItem),
        events: eventsDocs.map(normalizeItem),
        sports: sportsDocs.map(normalizeItem),
        plays: playsDocs.map(normalizeItem),
        activities: activitiesDocs.map(normalizeItem),
        premieres: premieresDocs.map(normalizeItem)
      }
    });
  } catch (error) {
    console.error('Error fetching home data from MongoDB:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve movies and events from database.'
    });
  }
}

async function getMovieById(req, res) {
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
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    if (movie.status && ['draft', 'archived'].includes(movie.status)) {
      return res.status(404).json({ success: false, message: 'This movie is currently unpublished.' });
    }

    // Query active shows scheduled by B2B Cinema Partners for this movie
    const partnerShows = await Show.find({
      $or: [{ movie: movie._id }, { movieTitle: movie.title }],
      status: 'active'
    }).populate('cinema').populate('screen');

    const cinemaMap = new Map();

    // 1. Add any existing/legacy embedded theatres from movie.theatres
    (movie.theatres || []).forEach(t => {
      cinemaMap.set(t.name.toLowerCase(), {
        id: t.id || t._id?.toString(),
        _id: t._id,
        name: t.name,
        distance: t.distance || '2.0 km away',
        facilities: t.facilities || ['M-Ticket', 'F&B'],
        showtimes: (t.showtimes || []).map(st => ({
          ...st.toObject ? st.toObject() : st,
          showId: st._id?.toString() || '',
          time: st.time,
          showDate: 'Today'
        }))
      });
    });

    // 2. Merge/append partner shows with full screen layout and IDs
    partnerShows.forEach(s => {
      if (!s.cinema) return;
      const key = s.cinema.name.toLowerCase();
      const existing = cinemaMap.get(key) || {
        id: s.cinema._id.toString(),
        _id: s.cinema._id,
        name: s.cinema.name,
        distance: s.cinema.city ? `${s.cinema.city}` : '2.0 km away',
        facilities: s.cinema.facilities || ['M-Ticket', 'F&B', 'Recliner'],
        showtimes: []
      };

      const showtimeItem = {
        _id: s._id,
        id: s._id.toString(),
        showId: s._id.toString(),
        time: s.startTime,
        endTime: s.endTime,
        showDate: s.showDate,
        format: s.format || '2D',
        price: `₹${s.ticketPrice || s.pricingTiers?.normal || 200}`,
        ticketPrice: s.ticketPrice || s.pricingTiers?.normal || 200,
        status: (s.bookedSeats && s.screen && s.bookedSeats.length >= (s.screen.totalCapacity || 120)) ? 'sold_out' : 'available',
        bookedSeats: s.bookedSeats || [],
        pricingTiers: s.pricingTiers,
        cinemaId: s.cinema._id.toString(),
        cinemaName: s.cinema.name,
        screenId: s.screen ? (s.screen._id?.toString() || s.screen.toString()) : '',
        screenName: s.screen ? (s.screen.name || s.screen.screenNumber || 'Screen 1') : 'Screen 1',
        seatingLayout: s.screen?.seatingLayout || [],
        totalCapacity: s.screen?.totalCapacity || 120
      };

      // If existing showtime has same time, replace or add
      const existingIdx = existing.showtimes.findIndex(st => st.time === showtimeItem.time && (st.showDate === showtimeItem.showDate || !st.showDate));
      if (existingIdx >= 0) {
        existing.showtimes[existingIdx] = showtimeItem;
      } else {
        existing.showtimes.push(showtimeItem);
      }
      cinemaMap.set(key, existing);
    });

    const normalized = normalizeItem(movie);
    normalized.theatres = Array.from(cinemaMap.values());

    return res.json({ success: true, movie: normalized });
  } catch (error) {
    console.error('Error in getMovieById:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving movie' });
  }
}

async function getCategoryItems(req, res) {
  try {
    const { category } = req.params; // 'movies' | 'events' | 'sports' | 'plays' | 'activities' | 'stream'
    const { city, language, genre, format } = req.query;

    if (category === 'movies') {
      const filter = {
        status: { $nin: ['draft', 'archived'] }
      };
      if (city && city !== 'All') {
        filter.cities = city;
      }
      if (language) {
        filter.language = { $regex: language, $options: 'i' };
      }
      if (genre) {
        filter.genre = { $regex: genre, $options: 'i' };
      }
      if (format) {
        filter.formats = { $regex: format, $options: 'i' };
      }

      const movies = await Movie.find(filter).sort({ rating: -1 });
      return res.json({ success: true, items: movies.map(normalizeItem) });
    }

    const typeMapping = {
      stream: 'premiere',
      events: 'event',
      sports: 'sport',
      plays: 'play',
      activities: 'activity'
    };

    const targetType = typeMapping[category];
    if (!targetType) {
      return res.status(404).json({ success: false, message: 'Unknown category' });
    }

    const itemFilter = { categoryType: targetType };
    if (city && city !== 'All' && targetType !== 'premiere') {
      itemFilter.city = { $regex: `^${city}$`, $options: 'i' };
    }

    const items = await CategoryItem.find(itemFilter);
    return res.json({ success: true, items: items.map(normalizeItem) });
  } catch (err) {
    console.error('Error fetching category data:', err);
    return res.status(500).json({ success: false, message: 'Error fetching category data' });
  }
}

// Public endpoints for Cities, Cinemas, and Offers
async function getPublicCities(req, res) {
  try {
    const defaultCities = await City.find({ status: 'active' }).sort({ isPopular: -1, name: 1 });
    const cinemaCities = await Cinema.distinct('city', { status: 'active' });

    // Deduplicate and merge cinema cities into the city list so any partner city shows up
    const cityMap = new Map();
    defaultCities.forEach(c => {
      cityMap.set(c.name.toLowerCase().trim(), c.toObject ? c.toObject() : c);
    });

    cinemaCities.forEach(cityName => {
      if (cityName && !cityMap.has(cityName.toLowerCase().trim())) {
        cityMap.set(cityName.toLowerCase().trim(), {
          _id: cityName,
          name: cityName.trim(),
          isPopular: false,
          status: 'active'
        });
      }
    });

    return res.json({ success: true, cities: Array.from(cityMap.values()) });
  } catch (error) {
    console.error('Error fetching public cities:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch cities.' });
  }
}

async function getPublicCinemas(req, res) {
  try {
    const { city, search } = req.query;
    const filter = { status: 'active' };

    if (city && city !== 'All') {
      filter.city = { $regex: `^${city.trim()}$`, $options: 'i' };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { address: { $regex: search.trim(), $options: 'i' } },
        { city: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const cinemas = await Cinema.find(filter).sort({ name: 1 });

    // For each cinema, attach active shows currently running with populated movie data
    const enrichedCinemas = await Promise.all(
      cinemas.map(async (cinema) => {
        const shows = await Show.find({ cinema: cinema._id, status: 'active' })
          .populate('movie', 'title posterUrl duration certificate formats rating customId')
          .populate('screen', 'name screenNumber screenType')
          .sort({ startTime: 1 });

        const obj = cinema.toObject();
        obj.id = cinema._id.toString();
        obj.activeShows = shows.map(s => ({
          showId: s._id.toString(),
          movieId: s.movie ? (s.movie.customId || s.movie._id?.toString() || s.movie.toString()) : '',
          movieTitle: s.movieTitle,
          posterUrl: s.movie?.posterUrl || '',
          duration: s.movie?.duration || '',
          rating: s.movie?.rating || 8.5,
          format: s.format,
          startTime: s.startTime,
          endTime: s.endTime,
          showDate: s.showDate,
          ticketPrice: s.ticketPrice,
          screenName: s.screen ? (s.screen.name || s.screen.screenNumber) : 'Screen 1'
        }));
        return obj;
      })
    );

    return res.json({ success: true, data: enrichedCinemas });
  } catch (error) {
    console.error('Error fetching public cinemas:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch cinemas.' });
  }
}

async function getPublicOffers(req, res) {
  try {
    const offers = await Offer.find({ status: 'active' }).sort({ createdAt: -1 });
    return res.json({ success: true, offers, data: offers });
  } catch (error) {
    console.error('Error fetching public offers:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch promo offers.' });
  }
}

module.exports = {
  getAllHomeData,
  getMovieById,
  getCategoryItems,
  getPublicCities,
  getPublicCinemas,
  getPublicOffers
};
