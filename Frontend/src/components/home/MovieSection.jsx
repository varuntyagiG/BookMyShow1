import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MovieCard from './MovieCard';

export default function MovieSection({ movies = [], onMovieClick }) {
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const navigate = useNavigate();
  const languages = ['All', 'Hindi', 'English', 'Telugu'];

  const filteredMovies = selectedLanguage === 'All'
    ? movies
    : movies.filter(m => m.language && m.language.toLowerCase().includes(selectedLanguage.toLowerCase()));

  return (
    <section className="py-10 bg-white border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Recommended Movies
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Explore the latest theatrical releases and trending hits</p>
          </div>
          <button
            onClick={() => navigate('/movies')}
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#F84464] hover:text-[#e03a58] transition-colors cursor-pointer group"
          >
            <span>See All</span>
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Language Filter Pills */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                selectedLanguage === lang
                  ? 'bg-[#F84464] text-white shadow-sm shadow-red-500/20'
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
          <div className="py-16 text-center text-gray-500 text-sm bg-gray-50 rounded-xl border border-gray-100">
            <p className="font-semibold text-gray-800">No movies found matching "{selectedLanguage}"</p>
            <p className="text-xs text-gray-400 mt-1">Try selecting another language filter or view all movies.</p>
          </div>
        )}

      </div>
    </section>
  );
}

