const { getMovieData } = require('../config/db');

function getAllHomeData(req, res) {
  try {
    const { city, search } = req.query;
    const data = getMovieData();

    let movies = [...(data.movies || [])];
    let events = [...(data.events || [])];
    let banners = [...(data.banners || [])];
    let premieres = [...(data.premieres || [])];
    let sports = [...(data.sports || [])];
    let plays = [...(data.plays || [])];
    let activities = [...(data.activities || [])];

    if (city && city !== 'All') {
      movies = movies.filter(m => !m.cities || m.cities.includes(city));
      events = events.filter(e => !e.city || e.city.toLowerCase() === city.toLowerCase());
      sports = sports.filter(s => !s.city || s.city.toLowerCase() === city.toLowerCase());
      plays = plays.filter(p => !p.city || p.city.toLowerCase() === city.toLowerCase());
      activities = activities.filter(a => !a.city || a.city.toLowerCase() === city.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      movies = movies.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.genre.some(g => g.toLowerCase().includes(q)) ||
        m.language.toLowerCase().includes(q)
      );
      events = events.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      );
      sports = sports.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
      plays = plays.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    return res.json({
      success: true,
      data: {
        banners,
        movies,
        events,
        sports,
        plays,
        activities,
        premieres
      }
    });
  } catch (error) {
    console.error('Error fetching home data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve movies and events.'
    });
  }
}

function getMovieById(req, res) {
  try {
    const { id } = req.params;
    const data = getMovieData();
    const movie = data.movies.find(m => m.id === id);

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    return res.json({ success: true, movie });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

function getCategoryItems(req, res) {
  try {
    const { category } = req.params; // 'movies' | 'events' | 'sports' | 'plays' | 'activities' | 'stream'
    const { city, language, genre, format } = req.query;
    const data = getMovieData();

    if (category === 'movies') {
      let list = [...data.movies];
      if (city && city !== 'All') {
        list = list.filter(m => !m.cities || m.cities.includes(city));
      }
      if (language) {
        list = list.filter(m => m.language.toLowerCase().includes(language.toLowerCase()));
      }
      if (genre) {
        list = list.filter(m => m.genre.some(g => g.toLowerCase() === genre.toLowerCase()));
      }
      if (format) {
        list = list.filter(m => m.formats && m.formats.some(f => f.toLowerCase() === format.toLowerCase()));
      }
      return res.json({ success: true, items: list });
    }

    if (category === 'stream') {
      return res.json({ success: true, items: data.premieres });
    }

    if (category === 'events') {
      let list = [...data.events];
      if (city && city !== 'All') {
        list = list.filter(e => !e.city || e.city.toLowerCase() === city.toLowerCase());
      }
      return res.json({ success: true, items: list });
    }

    if (category === 'sports') {
      return res.json({ success: true, items: data.sports || [] });
    }

    if (category === 'plays') {
      return res.json({ success: true, items: data.plays || [] });
    }

    if (category === 'activities') {
      return res.json({ success: true, items: data.activities || [] });
    }

    return res.status(404).json({ success: false, message: 'Unknown category' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error fetching category data' });
  }
}

module.exports = {
  getAllHomeData,
  getMovieById,
  getCategoryItems
};
