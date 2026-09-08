import React, { useState, useEffect } from 'react';
import { useCity } from '../context/CityContext';
import { contentApi } from '../services/api';
import MovieCard from '../components/home/MovieCard';
import { Filter, ChevronDown, ChevronUp, RotateCcw, Loader2 } from 'lucide-react';

export default function MoviesPage() {
  const { selectedCity } = useCity();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedFormats, setSelectedFormats] = useState([]);

  // Accordion toggle states
  const [openSections, setOpenSections] = useState({
    languages: true,
    genres: true,
    formats: true,
  });

  const languagesList = ['Hindi', 'English', 'Telugu', 'Tamil', 'Malayalam'];
  const genresList = ['Action', 'Adventure', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Thriller'];
  const formatsList = ['2D', '3D', 'IMAX 3D', '4DX'];

  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      try {
        const res = await contentApi.getCategoryItems('movies', {
          city: selectedCity,
        });
        if (res.success && res.items) {
          setMovies(res.items);
        }
      } catch (err) {
        console.error('Failed to load movies:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, [selectedCity]);

  const toggleFilter = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const clearAllFilters = () => {
    setSelectedLanguages([]);
    setSelectedGenres([]);
    setSelectedFormats([]);
  };

  // Filter movies client-side
  const filteredMovies = movies.filter((movie) => {
    // Language check
    if (selectedLanguages.length > 0) {
      const matchLang = selectedLanguages.some((l) =>
        movie.language.toLowerCase().includes(l.toLowerCase())
      );
      if (!matchLang) return false;
    }
    // Genre check
    if (selectedGenres.length > 0) {
      const matchGenre = selectedGenres.some((g) =>
        movie.genre.some(mg => mg.toLowerCase() === g.toLowerCase())
      );
      if (!matchGenre) return false;
    }
    // Format check
    if (selectedFormats.length > 0) {
      const matchFormat = selectedFormats.some((f) =>
        movie.formats && movie.formats.some(mf => mf.toLowerCase() === f.toLowerCase())
      );
      if (!matchFormat) return false;
    }
    return true;
  });

  const hasActiveFilters =
    selectedLanguages.length > 0 ||
    selectedGenres.length > 0 ||
    selectedFormats.length > 0;

  return (
    <div className="bg-[#F5F5FA] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight my-0">
              Movies in {selectedCity}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Explore trending blockbusters, new releases, and upcoming cinema tickets
            </p>
          </div>

          {/* Quick Categories Bar */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="px-3 py-1 bg-white border border-[#F84464] text-[#F84464] rounded-full text-xs font-semibold shrink-0 shadow-xs">
              Now Showing ({filteredMovies.length})
            </span>
            <button
              onClick={() => alert('Coming Soon lineup: Fantastic Four, Superman (2025), Avatar 3')}
              className="px-3 py-1 bg-white border border-gray-200 text-gray-700 hover:border-gray-300 rounded-full text-xs font-medium shrink-0 cursor-pointer"
            >
              Coming Soon
            </button>
            <button
              onClick={() => alert('Cinema chains in ' + selectedCity + ': PVR Inox, Cinepolis, Miraj, MovieMax')}
              className="px-3 py-1 bg-white border border-gray-200 text-gray-700 hover:border-gray-300 rounded-full text-xs font-medium shrink-0 cursor-pointer"
            >
              Cinemas
            </button>
          </div>
        </div>

        {/* Main Content Layout (Sidebar Filters + Movie Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar Filters */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Filters Box */}
            <div className="bg-white rounded-lg p-5 shadow-xs border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#F84464]" />
                  <h2 className="text-sm font-bold text-gray-900 my-0">Filters</h2>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-1 text-[11px] text-[#F84464] font-semibold hover:underline cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              {/* Languages Accordion */}
              <div className="py-4 border-b border-gray-100">
                <button
                  onClick={() =>
                    setOpenSections((prev) => ({ ...prev, languages: !prev.languages }))
                  }
                  className="w-full flex items-center justify-between text-xs font-bold text-gray-800 cursor-pointer mb-2"
                >
                  <span>Languages</span>
                  {openSections.languages ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {openSections.languages && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {languagesList.map((lang) => {
                      const isChecked = selectedLanguages.includes(lang);
                      return (
                        <button
                          key={lang}
                          onClick={() => toggleFilter(selectedLanguages, setSelectedLanguages, lang)}
                          className={`px-3 py-1 rounded-sm text-xs font-medium transition-colors cursor-pointer ${
                            isChecked
                              ? 'bg-[#F84464] text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Genres Accordion */}
              <div className="py-4 border-b border-gray-100">
                <button
                  onClick={() =>
                    setOpenSections((prev) => ({ ...prev, genres: !prev.genres }))
                  }
                  className="w-full flex items-center justify-between text-xs font-bold text-gray-800 cursor-pointer mb-2"
                >
                  <span>Genres</span>
                  {openSections.genres ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {openSections.genres && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {genresList.map((genre) => {
                      const isChecked = selectedGenres.includes(genre);
                      return (
                        <button
                          key={genre}
                          onClick={() => toggleFilter(selectedGenres, setSelectedGenres, genre)}
                          className={`px-3 py-1 rounded-sm text-xs font-medium transition-colors cursor-pointer ${
                            isChecked
                              ? 'bg-[#F84464] text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {genre}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Format Accordion */}
              <div className="pt-4">
                <button
                  onClick={() =>
                    setOpenSections((prev) => ({ ...prev, formats: !prev.formats }))
                  }
                  className="w-full flex items-center justify-between text-xs font-bold text-gray-800 cursor-pointer mb-2"
                >
                  <span>Format</span>
                  {openSections.formats ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {openSections.formats && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {formatsList.map((fmt) => {
                      const isChecked = selectedFormats.includes(fmt);
                      return (
                        <button
                          key={fmt}
                          onClick={() => toggleFilter(selectedFormats, setSelectedFormats, fmt)}
                          className={`px-3 py-1 rounded-sm text-xs font-medium transition-colors cursor-pointer ${
                            isChecked
                              ? 'bg-[#F84464] text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {fmt}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Promo Banner in Sidebar */}
            <div className="bg-gradient-to-br from-[#333545] to-[#1F2533] p-4 rounded-lg text-white text-xs">
              <p className="font-bold text-sm text-[#F84464]">Stream Anytime</p>
              <p className="text-gray-300 mt-1">
                Missed a movie in theatres? Rent or buy blockbusters directly on BookMyShow Stream!
              </p>
            </div>
          </div>

          {/* Right Movie Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg">
                <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mb-2" />
                <p className="text-xs text-gray-500 font-medium">Loading movies in {selectedCity}...</p>
              </div>
            ) : filteredMovies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {filteredMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-12 text-center border border-gray-100">
                <p className="text-sm font-semibold text-gray-800 mb-1">
                  No movies match your selected filters
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Try adjusting or clearing your filters to view more movies.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-[#F84464] hover:bg-[#e03a58] text-white text-xs font-bold py-2 px-5 rounded cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

