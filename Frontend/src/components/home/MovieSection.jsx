import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

export default function MovieSection({ movies = [], onMovieClick }) {
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const languages = ['All', 'Hindi', 'English', 'Telugu'];

  const filteredMovies = selectedLanguage === 'All'
    ? movies
    : movies.filter(m => m.language && m.language.toLowerCase().includes(selectedLanguage.toLowerCase()));

  return (
    <section className="py-8 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Recommended Movies
            </h2>
          </div>
          <button
            onClick={() => alert('Viewing all recommended movies')}
            className="flex items-center gap-0.5 text-xs sm:text-sm font-semibold text-[#F84464] hover:underline cursor-pointer"
          >
            <span>See All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Language Filter Pills */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                selectedLanguage === lang
                  ? 'bg-[#F84464] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Movies Grid */}
        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={onMovieClick}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500 text-sm">
            No movies available matching the selected filter.
          </div>
        )}

      </div>
    </section>
  );
}

