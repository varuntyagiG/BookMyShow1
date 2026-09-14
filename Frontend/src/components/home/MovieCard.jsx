import React, { useState } from 'react';
import { Star, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { contentApi } from '../../services/api';
import { playPop } from '../../utils/soundEffects';

export default function MovieCard({ movie, onSelect }) {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const { id, title, genre, rating, voteCount, posterUrl, certificate, language } = movie;

  const handleClick = () => {
    playPop();
    if (onSelect) {
      onSelect(movie);
    } else {
      navigate(`/movies/${id}`);
    }
  };

  const handleHeartClick = (e) => {
    e.stopPropagation();
    playPop();
    setIsLiked(!isLiked);
  };

  // Predictive prefetch on hover for instant navigation
  const handlePointerEnter = () => {
    try {
      contentApi.getMovie(id).catch(() => {});
    } catch (_) {}
  };

  // Format vote count e.g. "120.5K Votes"
  const formattedVotes = voteCount 
    ? (voteCount > 1000 ? `${(voteCount / 1000).toFixed(1)}K` : voteCount) + ' Votes'
    : '50K+ Votes';

  return (
    <div
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      className="flex flex-col group cursor-pointer w-full select-none"
    >
      {/* Movie Poster Card */}
      <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-gray-200 shadow-xs group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1 border border-gray-100">
        
        {/* Poster Image */}
        <img
          src={posterUrl}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
        />

        {/* Top Right Wishlist Heart */}
        <button
          type="button"
          onClick={handleHeartClick}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white backdrop-blur-xs transition-all active:scale-90"
          title={isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isLiked ? 'fill-[#F84464] text-[#F84464]' : 'text-white'
            }`}
          />
        </button>

        {/* Bottom Rating Pill Overlay (Pure BookMyShow) */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2.5 pt-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{rating ? `${rating}/10` : '8.8/10'}</span>
            <span className="text-[10px] text-gray-300 font-normal">({formattedVotes})</span>
          </div>
        </div>

      </div>

      {/* Movie Information Below Poster */}
      <div className="mt-2.5 px-0.5">
        <h3 className="text-sm sm:text-base font-bold text-[#222432] group-hover:text-[#F84464] transition-colors truncate">
          {title}
        </h3>

        {/* Certificate & Languages */}
        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
          {certificate && (
            <span className="px-1.5 py-0.2 rounded border border-gray-300 text-[10px] font-bold text-gray-600 uppercase">
              {certificate}
            </span>
          )}
          <span className="truncate">{language || 'Hindi, English'}</span>
        </div>

        {/* Genres */}
        {genre && genre.length > 0 && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {Array.isArray(genre) ? genre.join(', ') : genre}
          </p>
        )}
      </div>

    </div>
  );
}
