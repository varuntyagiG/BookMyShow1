import React, { useState } from 'react';
import { Star, Heart, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { contentApi } from '../../services/api';
import { playPop } from '../../utils/soundEffects';

export default function MovieCard({ movie, onSelect }) {
  const navigate = useNavigate();
  const { id, title, genre, rating, voteCount, posterUrl, certificate, language, formats } = movie;
  const movieId = id || movie._id || movie.customId;

  const [isLiked, setIsLiked] = useState(() => {
    try {
      const saved = localStorage.getItem('bms_favorite_movies');
      const favorites = saved ? JSON.parse(saved) : [];
      return movieId ? favorites.includes(movieId) : false;
    } catch (_) {
      return false;
    }
  });

  const [isHovered, setIsHovered] = useState(false);

  const primaryFormat = Array.isArray(formats) && formats.length > 0 
    ? formats[0] 
    : (movie.format || null);

  const handleClick = () => {
    playPop();
    if (onSelect) {
      onSelect(movie);
    } else {
      navigate(`/movies/${id || movieId}`);
    }
  };

  const handleHeartClick = (e) => {
    e.stopPropagation();
    playPop();
    setIsLiked((prev) => {
      const nextState = !prev;
      if (movieId) {
        try {
          const saved = localStorage.getItem('bms_favorite_movies');
          let favorites = saved ? JSON.parse(saved) : [];
          if (nextState) {
            if (!favorites.includes(movieId)) favorites.push(movieId);
          } else {
            favorites = favorites.filter((favId) => favId !== movieId);
          }
          localStorage.setItem('bms_favorite_movies', JSON.stringify(favorites));
        } catch (_) {}
      }
      return nextState;
    });
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
      onPointerEnter={() => {
        setIsHovered(true);
        handlePointerEnter();
      }}
      onMouseLeave={() => setIsHovered(false)}
      className="flex flex-col group cursor-pointer w-full select-none"
    >
      {/* Cinematic Movie Poster Card */}
      <div 
        style={{
          transform: isHovered ? 'translateY(-6px) scale(1.025)' : 'translateY(0px) scale(1)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease-out',
        }}
        className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#181924] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] group-hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.85)] border border-white/10 group-hover:border-white/20 transition-all duration-300"
      >
        {/* Poster Image */}
        <img
          src={posterUrl}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Top Left Cinema Experience Format Badge */}
        {primaryFormat && (
          <div className="absolute top-2.5 left-2.5 z-20">
            <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider text-[#F5B800] border border-[#F5B800]/40 shadow-xs select-none">
              {primaryFormat}
            </span>
          </div>
        )}

        {/* Top Right Wishlist Heart */}
        <button
          type="button"
          onClick={handleHeartClick}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white backdrop-blur-md transition-all active:scale-90 z-20 border border-white/15 shadow-sm cursor-pointer"
          title={isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label="Wishlist"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isLiked ? 'fill-[#F84464] text-[#F84464]' : 'text-[#F5F5F7]'
            }`}
          />
        </button>

        {/* Hover "Book Tickets" Floating Slide-up Action */}
        <div 
          className={`absolute inset-x-3 bottom-12 flex justify-center z-20 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="w-full py-2 px-3 rounded-xl bg-[#F84464] hover:bg-[#ff5274] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(248,68,100,0.4)] active:scale-95 cursor-pointer transition-all border border-white/15"
          >
            <Ticket className="w-3.5 h-3.5 text-white" />
            <span>Book Tickets</span>
          </button>
        </div>

        {/* Bottom Rating Pill Overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-2.5 pt-8 flex items-center justify-between text-[#F5F5F7] z-10">
          <div className="flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-[#F5F5F7]">{rating ? `${rating}/10` : '8.8/10'}</span>
            <span className="text-[10px] sm:text-[11px] text-[#A6A8B3] font-normal">({formattedVotes})</span>
          </div>
        </div>

      </div>

      {/* Movie Information Below Poster */}
      <div className="mt-2.5 px-0.5">
        <h3 className="text-[15px] sm:text-[16px] font-bold text-[#F5F5F7] group-hover:text-[#F84464] transition-colors truncate tracking-tight">
          {title}
        </h3>

        {/* Certificate & Languages */}
        <div className="flex items-center gap-1.5 mt-1 text-xs sm:text-[13px] text-[#A6A8B3] font-medium">
          {certificate && (
            <span className="px-1.5 py-0.5 rounded border border-white/15 bg-white/5 text-[10px] font-bold text-[#F5F5F7] uppercase tracking-wider">
              {certificate}
            </span>
          )}
          <span className="truncate">{language || 'Hindi, English'}</span>
        </div>

        {/* Genres */}
        {genre && (
          <p className="text-xs sm:text-[13px] text-[#A6A8B3] font-normal mt-0.5 truncate">
            {Array.isArray(genre) ? genre.join(', ') : genre}
          </p>
        )}
      </div>

    </div>
  );
}
