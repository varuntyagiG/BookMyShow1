import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCity } from '../context/CityContext';
import { contentApi } from '../services/api';
import { useRealtimeRefresh } from '../services/realtimeSync';
import MovieCard from '../components/home/MovieCard';
import { Filter, ChevronDown, ChevronUp, RotateCcw, Loader2, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';

export default function MoviesPage() {
  const { selectedCity } = useCity();
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Read URL search query parameters (persists across reloads & shareable)
  const selectedLanguages = useMemo(() => {
    const raw = searchParams.get('languages');
    return raw ? raw.split(',').filter(Boolean) : [];
  }, [searchParams]);

  const selectedGenres = useMemo(() => {
    const raw = searchParams.get('genres');
    return raw ? raw.split(',').filter(Boolean) : [];
  }, [searchParams]);

  const selectedFormats = useMemo(() => {
    const raw = searchParams.get('formats');
    return raw ? raw.split(',').filter(Boolean) : [];
  }, [searchParams]);

  const sortBy = searchParams.get('sort') || 'popularity';

  // Accordion toggle states
  const [openSections, setOpenSections] = useState({
    languages: true,
    genres: true,
    formats: true,
  });

  const languagesList = ['Hindi', 'English', 'Telugu', 'Tamil', 'Malayalam'];
  const genresList = ['Action', 'Adventure', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Thriller'];
  const formatsList = ['2D', '3D', 'IMAX 3D', '4DX'];

  const fetchMovies = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
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
      if (!silent) setLoading(false);
    }
  }, [selectedCity]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // Real-time reactive sync across tabs & portals
  useRealtimeRefresh(['MOVIE_MUTATION'], () => {
    fetchMovies(true);
  });

  const toggleFilter = (paramKey, item) => {
    const currentList = paramKey === 'languages'
      ? selectedLanguages
      : paramKey === 'genres'
        ? selectedGenres
        : selectedFormats;

    const nextList = currentList.includes(item)
      ? currentList.filter(i => i !== item)
      : [...currentList, item];

    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      if (nextList.length === 0) {
        nextParams.delete(paramKey);
      } else {
        nextParams.set(paramKey, nextList.join(','));
      }
      return nextParams;
    }, { replace: true });
  };

  const clearAllFilters = () => {
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      nextParams.delete('languages');
      nextParams.delete('genres');
      nextParams.delete('formats');
      return nextParams;
    }, { replace: true });
  };

  const setSortBy = (newSort) => {
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      if (!newSort || newSort === 'popularity') {
        nextParams.delete('sort');
      } else {
        nextParams.set('sort', newSort);
      }
      return nextParams;
    }, { replace: true });
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
    ...selectedLanguages.map(l => ({ type: 'lang', label: l, clear: () => toggleFilter('languages', l) })),
    ...selectedGenres.map(g => ({ type: 'genre', label: g, clear: () => toggleFilter('genres', g) })),
    ...selectedFormats.map(f => ({ type: 'format', label: f, clear: () => toggleFilter('formats', f) })),
  ];

  return (
    <div className="bg-[#12131A] text-[#F5F5F7] min-h-screen py-8 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-extrabold text-[#F5F5F7] tracking-tight my-0">
              Movies in {selectedCity}
            </h1>
            <p className="text-xs sm:text-sm text-[#A6A8B3] mt-1.5">
              Explore trending blockbusters, new releases, and upcoming cinema tickets
            </p>
          </div>

          {/* Quick Categories Bar & Mobile Filter Toggle */}
          <div className="sticky top-[112px] lg:static z-20 bg-[#12131A]/95 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none py-2 lg:py-0 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 border-b lg:border-none border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0.5 transition-all">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden px-3.5 py-2 bg-[#20212B] border border-white/10 text-[#F5F5F7] rounded-full text-xs font-bold shrink-0 shadow-xs flex items-center gap-1.5 transition-colors hover:border-[#F84464]/40 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#F84464]" />
              <span>Filters {hasActiveFilters && `(${activeFilterList.length})`}</span>
            </button>

            <span className="px-4 py-2 bg-[#F84464] text-white rounded-full text-xs font-bold shrink-0 shadow-xs">
              Now Showing ({filteredMovies.length})
            </span>
            <button
              onClick={() => alert('Coming Soon lineup: Fantastic Four, Superman, Avatar 3')}
              className="px-4 py-2 bg-[#20212B] border border-white/10 text-[#A6A8B3] hover:border-white/20 hover:text-[#F5F5F7] rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-colors"
            >
              Coming Soon
            </button>
            <button
              onClick={() => alert('Cinema chains in ' + selectedCity + ': PVR Inox, Cinepolis, Miraj, MovieMax')}
              className="px-4 py-2 bg-[#20212B] border border-white/10 text-[#A6A8B3] hover:border-white/20 hover:text-[#F5F5F7] rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-colors"
            >
              Cinemas
            </button>
          </div>
        </div>

        {/* Main Content Layout (Sidebar Filters + Movie Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">

          {/* Left Sidebar Filters Column (stretches to full height of movie grid) */}
          <aside className={`lg:col-span-1 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="lg:sticky lg:top-[124px] space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto overscroll-contain no-scrollbar pb-8 z-20">

              {/* Filters Box */}
              <div className="bg-[#1A1B24] rounded-2xl p-5 border border-white/10 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#F84464]" />
                  <h2 className="text-sm font-bold text-[#F5F5F7] my-0 uppercase tracking-wider">Filters</h2>
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
              <div className="py-4 border-b border-white/10">
                <button
                  onClick={() =>
                    setOpenSections((prev) => ({ ...prev, languages: !prev.languages }))
                  }
                  className="w-full flex items-center justify-between text-xs font-bold text-[#F5F5F7] cursor-pointer mb-3"
                >
                  <span className="uppercase tracking-wider text-[#A6A8B3]">Languages</span>
                  {openSections.languages ? (
                    <ChevronUp className="w-4 h-4 text-[#A6A8B3]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#A6A8B3]" />
                  )}
                </button>
                {openSections.languages && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {languagesList.map((lang) => {
                      const isChecked = selectedLanguages.includes(lang);
                      return (
                        <button
                          key={lang}
                          onClick={() => toggleFilter('languages', lang)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${isChecked
                              ? 'bg-[#F84464] text-white shadow-xs'
                              : 'bg-[#20212B] border border-white/10 hover:border-white/20 text-[#A6A8B3] hover:text-[#F5F5F7]'
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
              <div className="py-4 border-b border-white/10">
                <button
                  onClick={() =>
                    setOpenSections((prev) => ({ ...prev, genres: !prev.genres }))
                  }
                  className="w-full flex items-center justify-between text-xs font-bold text-[#F5F5F7] cursor-pointer mb-3"
                >
                  <span className="uppercase tracking-wider text-[#A6A8B3]">Genres</span>
                  {openSections.genres ? (
                    <ChevronUp className="w-4 h-4 text-[#A6A8B3]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#A6A8B3]" />
                  )}
                </button>
                {openSections.genres && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {genresList.map((genre) => {
                      const isChecked = selectedGenres.includes(genre);
                      return (
                        <button
                          key={genre}
                          onClick={() => toggleFilter('genres', genre)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${isChecked
                              ? 'bg-[#F84464] text-white shadow-xs'
                              : 'bg-[#20212B] border border-white/10 hover:border-white/20 text-[#A6A8B3] hover:text-[#F5F5F7]'
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
                  className="w-full flex items-center justify-between text-xs font-bold text-[#F5F5F7] cursor-pointer mb-3"
                >
                  <span className="uppercase tracking-wider text-[#A6A8B3]">Format</span>
                  {openSections.formats ? (
                    <ChevronUp className="w-4 h-4 text-[#A6A8B3]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#A6A8B3]" />
                  )}
                </button>
                {openSections.formats && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {formatsList.map((fmt) => {
                      const isChecked = selectedFormats.includes(fmt);
                      return (
                        <button
                          key={fmt}
                          onClick={() => toggleFilter('formats', fmt)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${isChecked
                              ? 'bg-[#F84464] text-white shadow-xs'
                              : 'bg-[#20212B] border border-white/10 hover:border-white/20 text-[#A6A8B3] hover:text-[#F5F5F7]'
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
            <div className="relative bg-gradient-to-br from-[#20212B] to-[#1A1B24] p-5 rounded-2xl text-[#F5F5F7] text-xs shadow-md border border-white/10 overflow-hidden">
              <p className="font-extrabold text-sm text-[#F84464]">BookMyShow Stream</p>
              <p className="text-[#A6A8B3] mt-2 leading-relaxed">
                Missed a blockbuster in theatres? Rent or buy straight to your screen!
              </p>
            </div>
          </div>
        </aside>

          {/* Right Movie Grid */}
          <div className="lg:col-span-3">

            {/* Sorting & Filter Tags Toolbar */}
            <div className="bg-[#1A1B24] p-4 rounded-2xl border border-white/10 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">

              {/* Active Filter Chips */}
              <div className="flex items-center gap-1.5 flex-wrap flex-1">
                {hasActiveFilters ? (
                  activeFilterList.map((chip) => (
                    <span
                      key={chip.label}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F84464]/15 text-[#F84464] border border-[#F84464]/30 rounded-full text-xs font-bold"
                    >
                      <span>{chip.label}</span>
                      <button
                        type="button"
                        onClick={chip.clear}
                        className="p-0.5 hover:bg-[#F84464]/30 rounded-full cursor-pointer transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#A6A8B3] font-medium">
                    Showing all available releases in {selectedCity}
                  </span>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 shrink-0 text-xs">
                <span className="text-[#A6A8B3] font-semibold flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#A6A8B3]" /> Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#20212B] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold text-[#F5F5F7] focus:outline-none focus:border-[#F84464] cursor-pointer"
                >
                  <option value="popularity" className="bg-[#20212B] text-[#F5F5F7]">Popularity</option>
                  <option value="rating" className="bg-[#20212B] text-[#F5F5F7]">Top Rated</option>
                  <option value="release" className="bg-[#20212B] text-[#F5F5F7]">New Releases</option>
                </select>
              </div>

            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-[#1A1B24] rounded-2xl border border-white/10 shadow-xs">
                <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mb-3" />
                <p className="text-xs text-[#A6A8B3] font-semibold">Loading movies in {selectedCity}...</p>
              </div>
            ) : filteredMovies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {filteredMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="bg-[#1A1B24] rounded-2xl p-10 sm:p-12 text-center border border-white/10 shadow-xs">
                <p className="text-base font-bold text-[#F5F5F7] mb-1.5">
                  No movies match your selected filters
                </p>
                <p className="text-xs text-[#A6A8B3] mb-6 max-w-sm mx-auto leading-relaxed">
                  Try adjusting or resetting your filter choices to explore more titles.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-[#F84464] hover:bg-[#E03A58] active:scale-[0.97] text-white text-xs font-bold py-2.5 px-6 rounded-xl cursor-pointer shadow-xs transition-all duration-200"
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