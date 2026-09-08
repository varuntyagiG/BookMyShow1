import React from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MovieCard({ movie, onSelect }) {
  const navigate = useNavigate();
  const { id, title, genre, rating, voteCount, posterUrl, certificate, isPromoted, language } = movie;

  const handleClick = () => {
    if (onSelect) {
      onSelect(movie);
    } else {
      navigate(`/movies/${id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="flex flex-col group cursor-pointer w-full transition-transform duration-200 hover:-translate-y-1"
    >
      {/* Poster wrapper */}
      <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-gray-200 shadow-sm">
        <img
          src={posterUrl}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Promoted Tag */}
        {isPromoted && (
          <div className="absolute top-2 left-2 bg-[#F84464] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-xs uppercase tracking-wider shadow-xs">
            Promoted
          </div>
        )}

        {/* Rating Overlay at bottom of poster */}
        <div className="absolute bottom-0 inset-x-0 bg-black/85 px-3 py-1.5 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1 font-bold">
            <Star className="w-3.5 h-3.5 fill-[#F84464] text-[#F84464]" />
            <span>{rating}/10</span>
          </div>
          <span className="text-[11px] text-gray-300">{voteCount} Votes</span>
        </div>
      </div>

      {/* Details */}
      <div className="mt-2.5">
        <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#F84464] transition-colors truncate">
          {title}
        </h3>
        <p className="text-xs text-gray-500 truncate mt-0.5">
          {Array.isArray(genre) ? genre.join('/') : genre}
        </p>
        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-400 font-medium">
          {certificate && <span className="border border-gray-300 px-1 py-0.2 rounded-xs">{certificate}</span>}
          {language && <span className="truncate">{language}</span>}
        </div>
      </div>
    </div>
  );
}
