import React, { useState, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
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
    <section className="py-10 bg-[#F5F5FA] text-[#222432] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#222432] tracking-tight">
              Recommended Movies
            </h2>
          </div>

          <button
            onClick={() => {
              playPop();
              navigate('/movies');
            }}
            className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#F84464] hover:text-[#e03a58] transition-colors cursor-pointer self-start sm:self-auto group"
          >
            <span>See All</span>
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-4">
          {filterPills.map((pill) => {
            const isSelected = selectedFilter === pill;
            return (
              <button
                key={pill}
                onClick={() => {
                  playPop();
                  setSelectedFilter(pill);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#F84464] text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {pill}
              </button>
            );
          })}
        </div>

        {/* 5-Column Movie Grid (Pure BookMyShow) */}
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
