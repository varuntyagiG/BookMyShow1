import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cinemaPartnerApi } from '../../services/cinemaPartnerApi';
import { useCinemaToast } from '../../components/cinemaPartner/CinemaPartnerToastContext';
import {
  Film,
  Search,
  Calendar,
  Clock,
  Star,
  Plus,
  Loader2,
  Filter
} from 'lucide-react';

export default function CinemaPartnerMoviesPage() {
  const toast = useCinemaToast();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const res = await cinemaPartnerApi.getAvailableMovies();
        if (res.success && res.movies) {
          setMovies(res.movies);
        }
      } catch (err) {
        toast.error('Catalog Error', err.message || 'Failed to load movie catalog.');
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, []);

  const languages = ['All', ...Array.from(new Set(movies.map((m) => m.language).filter(Boolean)))];

  const filteredMovies = movies.filter((m) => {
    const matchesSearch =
      m.title?.toLowerCase().includes(search.toLowerCase()) ||
      m.genre?.some((g) => g.toLowerCase().includes(search.toLowerCase()));
    const matchesLang = selectedLanguage === 'All' || m.language === selectedLanguage;
    return matchesSearch && matchesLang;
  });

  const handleScheduleShow = (movie) => {
    navigate(`/cinema-partner/shows?movieId=${movie._id}&movieTitle=${encodeURIComponent(movie.title)}`);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mb-3" />
        <p className="text-xs text-gray-500 font-medium">Loading Central Movie Catalog...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-[#222432] tracking-tight flex items-center gap-2.5">
            <Film className="w-6 h-6 text-[#F84464]" />
            <span>Central Movie Catalog</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Browse verified theatrical releases to schedule showtimes across your screens
          </p>
        </div>

        {/* Search & Language Filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search releases or genres..."
              className="pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-[#222432] placeholder-gray-400 focus:outline-none focus:border-[#F84464] w-48 sm:w-64 shadow-xs"
            />
          </div>

          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-[#222432] focus:outline-none focus:border-[#F84464] shadow-xs"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Movies Grid */}
      {filteredMovies.length === 0 ? (
        <div className="bg-white border border-[#EEEEF2] rounded-2xl p-12 text-center text-gray-500 text-xs shadow-sm">
          No theatrical releases match your search filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <div
              key={movie._id}
              className="bg-white border border-[#EEEEF2] rounded-3xl overflow-hidden flex flex-col justify-between hover:border-[#F84464]/40 hover:shadow-xl transition duration-300 group relative"
            >
              <div>
                {/* Poster matching BookMyShow movie card */}
                <div className="aspect-2/3 w-full bg-gray-100 relative overflow-hidden">
                  {movie.posterUrl ? (
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Film className="w-8 h-8" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {movie.certificate && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-[#222432]/90 text-white font-black text-[9px] uppercase backdrop-blur-xs border border-white/10">
                      {movie.certificate}
                    </span>
                  )}

                  {movie.rating && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-[#4ABD5D] text-white font-black text-[10px] flex items-center gap-1 shadow-md">
                      <Star className="w-3 h-3 fill-white text-white" />
                      <span>{movie.rating}/10</span>
                    </span>
                  )}
                </div>

                {/* Movie Details */}
                <div className="p-4">
                  <h3 className="text-sm font-black text-[#222432] group-hover:text-[#F84464] transition-colors leading-snug line-clamp-1">
                    {movie.title}
                  </h3>

                  <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1 font-medium">
                    <span>{movie.language || 'Hindi'}</span>
                    <span>•</span>
                    <span>{movie.duration || '2h 30m'}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {(movie.genre || []).slice(0, 2).map((g, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-gray-100/80 text-gray-700 text-[10px] font-semibold border border-gray-200/60"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Schedule Show CTA */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => handleScheduleShow(movie)}
                  className="w-full py-2.5 px-3 rounded-xl bg-linear-to-r from-[#F84464] to-[#e03a58] hover:opacity-95 text-white text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md shadow-[#F84464]/25 cursor-pointer active:scale-98"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Schedule Screening</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
