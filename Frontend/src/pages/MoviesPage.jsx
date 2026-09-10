import React, { useState, useEffect } from 'react';
import { useCity } from '../context/CityContext';
import { contentApi } from '../services/api';
import MovieCard from '../components/home/MovieCard';
import { Filter, ChevronDown, ChevronUp, RotateCcw, Loader2, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';

export default function MoviesPage() {
  const { selectedCity } = useCity();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('popularity'); // 'popularity' | 'rating' | 'release'

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
  let filteredMovies = movies.filter((movie) => {
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

  // Sort movies client-side
  if (sortBy === 'rating') {
    filteredMovies.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortBy === 'release') {
    filteredMovies.sort((a, b) => (b.id > a.id ? 1 : -1));
  }

  const hasActiveFilters =
    selectedLanguages.length > 0 ||
    selectedGenres.length > 0 ||
    selectedFormats.length > 0;

  const activeFilterList = [
    ...selectedLanguages.map(l => ({ type: 'lang', label: l, clear: () => toggleFilter(selectedLanguages, setSelectedLanguages, l) })),
    ...selectedGenres.map(g => ({ type: 'genre', label: g, clear: () => toggleFilter(selectedGenres, setSelectedGenres, g) })),
    ...selectedFormats.map(f => ({ type: 'format', label: f, clear: () => toggleFilter(selectedFormats, setSelectedFormats, f) })),
  ];

  return (
    <div className="bg-[#F5F5FA] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#222432] tracking-tight my-0">
              Movies in {selectedCity}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
              Explore trending blockbusters, new releases, and upcoming cinema tickets
            </p>
          </div>

          {/* Quick Categories Bar & Mobile Filter Toggle */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden px-3.5 py-2 bg-white border border-gray-200 text-[#222432] rounded-full text-xs font-bold shrink-0 shadow-sm flex items-center gap-1.5 transition-colors hover:border-[#F84464]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464] cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#F84464]" />
              <span>Filters {hasActiveFilters && `(${activeFilterList.length})`}</span>
            </button>

            <span className="px-4 py-2 bg-[#F84464] text-white rounded-full text-xs font-bold shrink-0 shadow-[0_4px_14px_-4px_rgba(248,68,100,0.5)]">
              Now Showing ({filteredMovies.length})
            </span>
            <button
              onClick={() => alert('Coming Soon lineup: Fantastic Four, Superman (2025), Avatar 3')}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:border-[#F84464]/40 hover:text-[#222432] rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464]"
            >
              Coming Soon
            </button>
            <button
              onClick={() => alert('Cinema chains in ' + selectedCity + ': PVR Inox, Cinepolis, Miraj, MovieMax')}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:border-[#F84464]/40 hover:text-[#222432] rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464]"
            >
              Cinemas
            </button>
          </div>
        </div>

        {/* Main Content Layout (Sidebar Filters + Movie Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">

          {/* Left Sidebar Filters */}
          <div className={`lg:col-span-1 space-y-4 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>

            {/* Filters Box */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] border border-gray-100">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#F84464]" />
                  <h2 className="text-sm font-bold text-[#222432] my-0 uppercase tracking-wider">Filters</h2>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-1 text-xs text-[#F84464] font-bold hover:underline cursor-pointer transition-colors"
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
                  className="w-full flex items-center justify-between text-xs font-bold text-gray-800 cursor-pointer mb-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464] rounded"
                >
                  <span className="uppercase tracking-wider text-gray-600">Languages</span>
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
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464] ${
                            isChecked
                              ? 'bg-[#F84464] text-white shadow-[0_3px_10px_-3px_rgba(248,68,100,0.5)]'
                              : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-gray-700'
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
                  className="w-full flex items-center justify-between text-xs font-bold text-gray-800 cursor-pointer mb-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464] rounded"
                >
                  <span className="uppercase tracking-wider text-gray-600">Genres</span>
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
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464] ${
                            isChecked
                              ? 'bg-[#F84464] text-white shadow-[0_3px_10px_-3px_rgba(248,68,100,0.5)]'
                              : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-gray-700'
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
                  className="w-full flex items-center justify-between text-xs font-bold text-gray-800 cursor-pointer mb-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464] rounded"
                >
                  <span className="uppercase tracking-wider text-gray-600">Format</span>
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
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464] ${
                            isChecked
                              ? 'bg-[#F84464] text-white shadow-[0_3px_10px_-3px_rgba(248,68,100,0.5)]'
                              : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-gray-700'
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
            <div className="relative bg-gradient-to-br from-[#333545] to-[#1F2533] p-5 rounded-2xl text-white text-xs shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)] border border-white/10 overflow-hidden">
              <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 bg-[#F84464]/20 rounded-full blur-2xl" />
              <p className="relative font-extrabold text-sm text-[#F84464]">BookMyShow Stream</p>
              <p className="relative text-gray-300 mt-2 leading-relaxed">
                Missed a blockbuster in theatres? Rent or buy straight from the cloud to your screen!
              </p>
            </div>
          </div>

          {/* Right Movie Grid */}
          <div className="lg:col-span-3">

            {/* Sorting & Filter Tags Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">

              {/* Active Filter Chips */}
              <div className="flex items-center gap-1.5 flex-wrap flex-1">
                {hasActiveFilters ? (
                  activeFilterList.map((chip) => (
                    <span
                      key={chip.label}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F84464]/10 text-[#F84464] border border-[#F84464]/25 rounded-full text-xs font-bold"
                    >
                      <span>{chip.label}</span>
                      <button
                        type="button"
                        onClick={chip.clear}
                        className="p-0.5 hover:bg-[#F84464]/20 rounded-full cursor-pointer transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500 font-medium">
                    Showing all available releases in {selectedCity}
                  </span>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 shrink-0 text-xs">
                <span className="text-gray-500 font-semibold flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" /> Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#F84464] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464] cursor-pointer transition-colors"
                >
                  <option value="popularity">Popularity</option>
                  <option value="rating">Top Rated</option>
                  <option value="release">New Releases</option>
                </select>
              </div>

            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100">
                <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mb-3" />
                <p className="text-xs text-gray-500 font-semibold">Loading movies in {selectedCity}...</p>
              </div>
            ) : filteredMovies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {filteredMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-10 sm:p-12 text-center border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
                <p className="text-base font-bold text-[#222432] mb-1.5">
                  No movies match your selected filters
                </p>
                <p className="text-xs text-gray-500 mb-6 max-w-sm mx-auto leading-relaxed">
                  Try adjusting or resetting your filter choices to explore more titles.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-[#F84464] hover:bg-[#E03A58] active:scale-[0.97] text-white text-xs font-bold py-2.5 px-6 rounded-xl cursor-pointer shadow-[0_6px_18px_-6px_rgba(248,68,100,0.5)] transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464] focus-visible:outline-offset-2"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}