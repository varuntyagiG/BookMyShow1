import React, { useState } from 'react';
import { Star, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function MovieCard({ movie, onSelect }) {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const { id, title, genre, rating, voteCount, posterUrl, certificate, isPromoted, language, formats } = movie;

  const handleClick = () => {
    if (onSelect) {
      onSelect(movie);
    } else {
      navigate(`/movies/${id}`);
    }
  };

  const handleHeartClick = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ y: -6, scale: 1.025 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="flex flex-col group cursor-pointer w-full"
    >
      {/* Poster wrapper */}
      <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-gray-200 shadow-sm border border-gray-100 group-hover:shadow-xl group-hover:border-gray-200 transition-all duration-300">
        <img
          src={posterUrl}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Badges: Promoted & Heart Wishlist */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
          {isPromoted ? (
            <div className="bg-[#F84464] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md pointer-events-auto">
              PROMOTED
            </div>
          ) : (
            <div />
          )}

          <motion.button
            type="button"
            onClick={handleHeartClick}
            whileTap={{ scale: 0.75 }}
            animate={isLiked ? { scale: [1, 1.35, 1] } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-xs flex items-center justify-center pointer-events-auto transition-colors cursor-pointer"
            aria-label="Add to wishlist"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${isLiked ? 'text-[#F84464] fill-[#F84464]' : 'text-white/90'}`}
            />
          </motion.button>
        </div>

        {/* Rating Overlay at bottom of poster with gradient */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-6 pb-2.5 px-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-1.5 font-bold text-xs">
            <Star className="w-3.5 h-3.5 fill-[#F84464] text-[#F84464]" />
            <span className="tracking-wide">{rating}/10</span>
          </div>
          <span className="text-[11px] text-gray-300 font-medium">{voteCount} Votes</span>
        </div>
      </div>

      {/* Details */}
      <div className="mt-3 px-0.5">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#F84464] transition-colors truncate tracking-tight">
          {title}
        </h3>

        <p className="text-xs text-gray-500 truncate mt-0.5 font-medium">
          {Array.isArray(genre) ? genre.join(', ') : genre}
        </p>

        {/* Format, Certificate, and Language badges */}
        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-gray-600 font-semibold flex-wrap">
          {certificate && (
            <span className="border border-gray-300 bg-gray-50 px-1.5 py-0.2 rounded text-[9px] text-gray-700">
              {certificate}
            </span>
          )}
          {language && (
            <span className="text-gray-500 truncate max-w-[120px]">
              {language.split(',')[0]}
            </span>
          )}
          {formats && formats.length > 0 && (
            <span className="text-[#F84464] font-bold">
              • {formats[0]}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
