import React, { useState, useMemo } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MovieCard from './MovieCard';
import { playPop } from '../../utils/soundEffects';

export default function MovieSection({ movies = [], onMovieClick }) {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Filter categories
  const filterPills = ['All', 'Hindi', 'English', 'Telugu', 'Action', 'Comedy', 'Thriller'];

  // Filter movies
  const filteredMovies = useMemo(() => {
    if (selectedFilter === 'All') return movies;
    return movies.filter((m) => {
      const matchLang = m.language && m.language.toLowerCase().includes(selectedFilter.toLowerCase());
      const matchGenre = m.genre && (Array.isArray(m.genre) ? m.genre : [m.genre]).some(g => g.toLowerCase().includes(selectedFilter.toLowerCase()));
      return matchLang || matchGenre;
    });
  }, [movies, selectedFilter]);

  if (!movies.length) return null;

  return (
    <section className="py-10 bg-[#12131A] text-[#F5F5F7] select-none border-t border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 bg-[#F84464] rounded-full" />
            <h2 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-[#F5F5F7] tracking-tight flex items-center gap-2">
              <span>Recommended Movies</span>
              <Sparkles className="w-4 h-4 text-[#F84464]" />
            </h2>
          </div>

          <button
            onClick={() => {
              playPop();
              navigate('/movies');
            }}
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#F84464] hover:text-[#ff6b85] transition-colors cursor-pointer self-start sm:self-auto group"
          >
            <span>See All</span>
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-5">
          {filterPills.map((pill) => {
            const isSelected = selectedFilter === pill;
            return (
              <button
                key={pill}
                onClick={() => {
                  playPop();
                  setSelectedFilter(pill);
                }}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-[13px] font-medium shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#F84464] text-white border border-[#F84464] shadow-none active:scale-95 font-semibold'
                    : 'bg-[#20212B] text-[#A6A8B3] hover:text-[#F5F5F7] hover:bg-[#292B35] border border-white/10 active:scale-95'
                }`}
              >
                {pill}
              </button>
            );
          })}
        </div>

        {/* 5-Column Movie Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredMovies.slice(0, 10).map((movie) => (
            <MovieCard
              key={movie.id || movie._id}
              movie={movie}
              onSelect={onMovieClick}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
