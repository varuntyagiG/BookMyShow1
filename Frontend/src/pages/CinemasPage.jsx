import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCity } from '../context/CityContext';
import { contentApi } from '../services/api';
import {
  Building2,
  MapPin,
  Search,
  Film,
  Clock,
  Sparkles,
  ChevronRight,
  Ticket,
  Utensils,
  Smartphone,
  Accessibility,
  Volume2,
  RefreshCw,
  SlidersHorizontal,
  X
} from 'lucide-react';

export default function CinemasPage() {
  const { selectedCity, setIsCityModalOpen } = useCity();
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState('All');
  const [onlyActiveShows, setOnlyActiveShows] = useState(false);

  const fetchCinemas = async () => {
    setLoading(true);
    try {
      const res = await contentApi.getCinemas({
        city: selectedCity,
        search: searchQuery
      });
      if (res.success && Array.isArray(res.data)) {
        setCinemas(res.data);
      } else {
        setCinemas([]);
      }
    } catch (err) {
      console.error('Failed to load cinemas:', err);
      setCinemas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, [selectedCity, searchQuery]);

  // Client-side facility & active shows filters
  const filteredCinemas = cinemas.filter((cinema) => {
    if (onlyActiveShows && (!cinema.activeShows || cinema.activeShows.length === 0)) {
      return false;
    }
    if (selectedFacility !== 'All') {
      const facilities = cinema.facilities || [];
      const match = facilities.some(f => f.toLowerCase().includes(selectedFacility.toLowerCase()));
      if (!match) return false;
    }
    return true;
  });

  const facilityOptions = ['All', 'M-Ticket', 'Food & Beverage', 'Recliner', 'Dolby Atmos', 'Wheelchair'];

  return (
    <div className="min-h-screen bg-[#F5F5FA] text-[#222432] pb-16">
      {/* Top Banner with City and Search */}
      <div className="bg-[#222432] text-white border-b border-[#333545] pt-8 pb-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#F84464]/20 text-[#F84464] border border-[#F84464]/30">
                  Real-time Directory
                </span>
                <span className="text-xs text-gray-400">
                  Updated Live
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Theatres & Multiplexes in <span className="text-[#F84464]">{selectedCity}</span>
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Explore partner screens, sound specifications, amenities, and current showtimes.
              </p>
            </div>

            <button
              onClick={() => setIsCityModalOpen(true)}
              className="self-start md:self-auto flex items-center gap-2 px-4 py-2 bg-[#333545] hover:bg-[#3f4155] border border-gray-600/40 rounded-lg text-sm font-medium transition cursor-pointer text-white shadow-xs"
            >
              <MapPin className="w-4 h-4 text-[#F84464]" />
              <span>Change City ({selectedCity})</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Search bar & quick filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by cinema name, mall, or landmark..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-[#1b1d28] border border-gray-700/60 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#F84464] transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={fetchCinemas}
              title="Refresh Theatres"
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1b1d28] hover:bg-[#2d3042] border border-gray-700/60 rounded-lg text-sm text-gray-300 hover:text-white transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#F84464]' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Facility Filter Pills */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
            <span className="text-gray-400 text-xs font-semibold flex items-center gap-1 shrink-0 mr-1">
              <SlidersHorizontal className="w-3 h-3" /> Filter:
            </span>
            {facilityOptions.map((fac) => (
              <button
                key={fac}
                onClick={() => setSelectedFacility(fac)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition cursor-pointer font-medium ${
                  selectedFacility === fac
                    ? 'bg-[#F84464] text-white font-semibold'
                    : 'bg-[#333545] text-gray-300 hover:bg-[#3e4154]'
                }`}
              >
                {fac}
              </button>
            ))}

            <button
              onClick={() => setOnlyActiveShows(!onlyActiveShows)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition cursor-pointer font-medium ml-auto ${
                onlyActiveShows
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-[#333545] text-gray-300 hover:bg-[#3e4154]'
              }`}
            >
              ✓ Currently Running Shows Only
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Count Bar */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-2 border-b border-gray-200">
          <div>
            Showing <span className="font-bold text-gray-800">{filteredCinemas.length}</span> theatres in{' '}
            <span className="font-semibold text-gray-700">{selectedCity}</span>
          </div>
          {filteredCinemas.length > 0 && (
            <div className="text-emerald-700 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All Partner Theatres Synchronized
            </div>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="h-6 w-64 bg-gray-200 rounded"></div>
                    <div className="h-4 w-96 bg-gray-100 rounded"></div>
                  </div>
                  <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <div className="h-8 w-20 bg-gray-100 rounded-md"></div>
                  <div className="h-8 w-20 bg-gray-100 rounded-md"></div>
                  <div className="h-8 w-20 bg-gray-100 rounded-md"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCinemas.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center max-w-2xl mx-auto my-8 shadow-xs">
            <div className="w-16 h-16 bg-rose-50 text-[#F84464] rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">No Cinemas Found in {selectedCity}</h3>
            <p className="text-sm text-gray-500 mt-2">
              {searchQuery
                ? `No theatres matched "${searchQuery}". Try changing your search query or clear filters.`
                : `We haven't listed partner theatres in ${selectedCity} yet, or none match the selected filter.`}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition cursor-pointer"
                >
                  Clear Search
                </button>
              )}
              <button
                onClick={() => setIsCityModalOpen(true)}
                className="px-4 py-2 bg-[#F84464] hover:bg-[#d63553] text-white text-sm font-semibold rounded-lg shadow-sm transition cursor-pointer"
              >
                Switch to Mumbai or Delhi
              </button>
              <Link
                to="/movies"
                className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition"
              >
                Browse All Movies
              </Link>
            </div>
          </div>
        ) : (
          /* Cinemas List */
          <div className="space-y-5">
            {filteredCinemas.map((cinema) => {
              // Group active shows by movie
              const showsByMovie = {};
              (cinema.activeShows || []).forEach((show) => {
                const key = show.movieId || show.movieTitle;
                if (!showsByMovie[key]) {
                  showsByMovie[key] = {
                    movieId: show.movieId,
                    title: show.movieTitle,
                    posterUrl: show.posterUrl,
                    duration: show.duration,
                    rating: show.rating,
                    shows: []
                  };
                }
                showsByMovie[key].shows.push(show);
              });
              const movieGroups = Object.values(showsByMovie);

              return (
                <div
                  key={cinema._id || cinema.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition duration-200 overflow-hidden"
                >
                  {/* Cinema Header */}
                  <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-rose-50 text-[#F84464] rounded-xl shrink-0 mt-0.5 border border-rose-100">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                            {cinema.name}
                          </h2>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Cinema Partner
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{cinema.address || `${cinema.city}, India`}</span>
                        </div>

                        {/* Facilities tags */}
                        {cinema.facilities && cinema.facilities.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                            {cinema.facilities.map((fac, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[11px] font-medium flex items-center gap-1"
                              >
                                {fac.toLowerCase().includes('ticket') && <Smartphone className="w-3 h-3 text-gray-500" />}
                                {fac.toLowerCase().includes('food') && <Utensils className="w-3 h-3 text-gray-500" />}
                                {fac.toLowerCase().includes('audio') || fac.toLowerCase().includes('dolby') ? <Volume2 className="w-3 h-3 text-gray-500" /> : null}
                                {fac.toLowerCase().includes('wheelchair') && <Accessibility className="w-3 h-3 text-gray-500" />}
                                <span>{fac}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center md:flex-col md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                      <div className="text-xs text-gray-500">Total Screens</div>
                      <div className="text-sm font-bold text-gray-800">
                        {cinema.totalScreens || 1} Audi{cinema.totalScreens > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  {/* Scheduled Movies & Shows */}
                  <div className="p-5 sm:p-6 bg-gray-50/50">
                    {movieGroups.length === 0 ? (
                      <div className="flex items-center justify-between py-2 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <Film className="w-4 h-4 text-gray-400" />
                          <span>No live shows scheduled for today at this theatre.</span>
                        </div>
                        <Link
                          to="/movies"
                          className="text-[#F84464] font-semibold hover:underline flex items-center gap-1"
                        >
                          Browse movies in {selectedCity} <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Film className="w-3.5 h-3.5 text-[#F84464]" />
                          <span>Now Showing at this Multiplex</span>
                        </div>

                        {movieGroups.map((group, gIdx) => (
                          <div
                            key={gIdx}
                            className="bg-white p-4 rounded-lg border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-gray-300 transition"
                          >
                            {/* Movie Info */}
                            <div className="flex items-center gap-3">
                              {group.posterUrl ? (
                                <img
                                  src={group.posterUrl}
                                  alt={group.title}
                                  className="w-12 h-16 object-cover rounded shadow-xs shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center shrink-0 text-gray-400">
                                  <Film className="w-6 h-6" />
                                </div>
                              )}
                              <div>
                                <Link
                                  to={group.movieId ? `/movies/${group.movieId}` : '/movies'}
                                  className="text-sm font-bold text-gray-900 hover:text-[#F84464] transition line-clamp-1"
                                >
                                  {group.title}
                                </Link>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                  {group.rating && (
                                    <span className="font-semibold text-gray-700">★ {group.rating}/10</span>
                                  )}
                                  {group.duration && <span>• {group.duration}</span>}
                                </div>
                              </div>
                            </div>

                            {/* Showtimes Pills */}
                            <div className="flex flex-wrap items-center gap-2">
                              {group.shows.map((show, sIdx) => (
                                <Link
                                  key={sIdx}
                                  to={group.movieId ? `/movies/${group.movieId}` : '/movies'}
                                  className="group flex flex-col items-center px-3 py-1.5 bg-gray-50 hover:bg-rose-50 border border-gray-200 hover:border-[#F84464] rounded-lg transition text-center cursor-pointer shadow-2xs"
                                  title={`Book ${show.movieTitle} at ${show.startTime} (${show.format || '2D'})`}
                                >
                                  <span className="text-xs font-bold text-gray-800 group-hover:text-[#F84464] transition">
                                    {show.startTime}
                                  </span>
                                  <span className="text-[10px] text-gray-500 font-medium group-hover:text-gray-700">
                                    {show.format || '2D'} • ₹{show.ticketPrice || 250}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
