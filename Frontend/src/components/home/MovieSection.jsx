import React, { useState, useRef } from 'react';
import { ChevronRight, ChevronLeft, Sparkles, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MovieCard from './MovieCard';
import { playPop } from '../../utils/soundEffects';

export default function MovieSection({ movies = [], onMovieClick }) {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [hoveredMovie, setHoveredMovie] = useState(null);
  const navigate = useNavigate();
  const top10Ref = useRef(null);

  const filterTabs = [
    { id: 'All', label: 'All' },
    { id: 'Hindi', label: 'Hindi' },
    { id: 'English', label: 'English' },
    { id: 'Telugu', label: 'Telugu' },
    { id: 'Tamil', label: 'Tamil' },
    { id: 'IMAX', label: '⚡ IMAX 3D' },
    { id: 'Action', label: 'Action' },
    { id: 'Comedy', label: 'Comedy' },
  ];

  const scrollRow = (ref, offset) => {
    playPop();
    if (ref.current) {
      ref.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const getAuraColor = (movie) => {
    if (!movie) return 'transparent';
    const text = `${movie.title || ''} ${(movie.genre || []).join(' ')}`.toLowerCase();
    if (text.includes('dune') || text.includes('kalki') || text.includes('sci-fi')) return 'rgba(245, 158, 11, 0.22)';
    if (text.includes('stree') || text.includes('horror') || text.includes('thriller')) return 'rgba(168, 85, 247, 0.22)';
    if (text.includes('deadpool') || text.includes('action')) return 'rgba(248, 68, 100, 0.24)';
    return 'rgba(6, 182, 212, 0.18)';
  };

  const filteredMovies = movies.filter((m) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'IMAX') {
      const formatStr = Array.isArray(m.formats) ? m.formats.join(' ') : (m.formats || '');
      return formatStr.toUpperCase().includes('IMAX');
    }
    if (selectedFilter === 'Action' || selectedFilter === 'Comedy') {
      const genreStr = Array.isArray(m.genre) ? m.genre.join(' ') : (m.genre || '');
      return genreStr.toLowerCase().includes(selectedFilter.toLowerCase());
    }
    return m.language && m.language.toLowerCase().includes(selectedFilter.toLowerCase());
  });

  // Top 10 Movies: Sort by highest rating/votes or take first 10
  const top10Movies = [...movies]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 10);

  return (
    <section className="py-10 sm:py-12 bg-[#141414] text-white relative overflow-hidden transition-colors duration-700">
      {/* Netflix / Apple TV-Style Ambient Aura Bloom */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-700 blur-3xl z-0"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${getAuraColor(hoveredMovie)} 0%, transparent 70%)`,
          opacity: hoveredMovie ? 1 : 0,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ========================================================
            ROW 1: ICONIC NETFLIX "TOP 10 IN INDIA TODAY" ROW
            ======================================================== */}
        {top10Movies.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  <span className="text-[#F84464]">Top 10</span> Movies in India Today
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[#F84464]/20 border border-[#F84464]/40 px-2.5 py-0.5 text-[10px] font-black uppercase text-[#F84464] backdrop-blur-md">
                  <Flame className="w-3 h-3 text-amber-400" /> Nationwide Demand
                </span>
              </div>
            </div>

            {/* Top 10 Horizontal Row with Glass Peek Paddles */}
            <div className="relative group/paddle">
              {/* Left Paddle */}
              <button
                type="button"
                onClick={() => scrollRow(top10Ref, -520)}
                className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-30 w-10 sm:w-12 h-20 bg-black/80 hover:bg-[#F84464] border border-white/20 text-white rounded-r-2xl opacity-0 group-hover/paddle:opacity-100 transition-all flex items-center justify-center backdrop-blur-md cursor-pointer shadow-2xl active:scale-95"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div
                ref={top10Ref}
                className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-4 px-1 scroll-smooth"
              >
                {top10Movies.map((movie, idx) => (
                  <div 
                    key={movie.id || movie._id || idx} 
                    className="shrink-0 w-48 sm:w-56 md:w-60"
                    onMouseEnter={() => setHoveredMovie(movie)}
                    onMouseLeave={() => setHoveredMovie(null)}
                  >
                    <MovieCard
                      movie={movie}
                      rankingNumber={idx + 1}
                      onSelect={onMovieClick}
                    />
                  </div>
                ))}
              </div>

              {/* Right Paddle */}
              <button
                type="button"
                onClick={() => scrollRow(top10Ref, 520)}
                className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-30 w-10 sm:w-12 h-20 bg-black/80 hover:bg-[#F84464] border border-white/20 text-white rounded-l-2xl opacity-0 group-hover/paddle:opacity-100 transition-all flex items-center justify-center backdrop-blur-md cursor-pointer shadow-2xl active:scale-95"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            ROW 2: TRENDING NOW IN MULTIPLEXES
            ======================================================== */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Trending Now in Multiplexes
              </h2>
              <div className="w-10 h-1 bg-[#F84464] rounded-full mt-1.5" />
            </div>

            <button
              onClick={() => navigate('/movies')}
              className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#F84464] hover:text-[#ff6b85] transition-colors cursor-pointer group"
            >
              <span>See All</span>
              <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* 0ms Instant Filter Ribbon */}
          <div className="flex items-center gap-2 mb-7 overflow-x-auto no-scrollbar pb-1">
            {filterTabs.map((tab) => {
              const isActive = selectedFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    playPop();
                    setSelectedFilter(tab.id);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer shrink-0 active:scale-95 flex items-center gap-1 ${
                    isActive
                      ? 'bg-[#F84464] text-white shadow-[0_4px_16px_rgba(248,68,100,0.5)] scale-[1.02]'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border border-white/10'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Movies Grid with Smooth Animated Layout Reorder */}
          {filteredMovies.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
            >
              <AnimatePresence>
                {filteredMovies.map((movie) => (
                  <motion.div
                    key={movie.id || movie._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    onMouseEnter={() => setHoveredMovie(movie)}
                    onMouseLeave={() => setHoveredMovie(null)}
                  >
                    <MovieCard
                      movie={movie}
                      onSelect={onMovieClick}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="py-14 text-center text-gray-400 text-xs bg-white/[0.03] rounded-2xl border border-white/10 animate-in fade-in">
              <p className="font-bold text-white text-sm">No movies found in "{selectedFilter}"</p>
              <p className="text-gray-400 mt-1">Try selecting another filter or explore all movies in your city.</p>
              <button
                onClick={() => setSelectedFilter('All')}
                className="mt-3 px-4 py-1.5 bg-[#F84464] text-white rounded-full font-bold text-xs hover:bg-[#e03a58] transition-colors cursor-pointer active:scale-95 shadow-md"
              >
                Show All Movies
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

