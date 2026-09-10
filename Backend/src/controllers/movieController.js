const Movie = require('../models/Movie');
const CategoryItem = require('../models/CategoryItem');
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

    return res.json({ success: true, movie: normalizeItem(movie) });
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

module.exports = {
  getAllHomeData,
  getMovieById,
  getCategoryItems
};
