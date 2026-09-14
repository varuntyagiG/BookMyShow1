import React, { useState, useRef } from 'react';
import { Star, Heart, Zap, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { contentApi } from '../../services/api';
import { playPop } from '../../utils/soundEffects';

export default function MovieCard({ movie, onSelect }) {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const cardRef = useRef(null);

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

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setMousePos({ x, y });
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

  const rotX = isHovered ? (0.5 - mousePos.y) * 14 : 0;
  const rotY = isHovered ? (mousePos.x - 0.5) * 14 : 0;

  return (
    <div
      onClick={handleClick}
      onPointerEnter={() => {
        setIsHovered(true);
        handlePointerEnter();
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0.5, y: 0.5 });
      }}
      className="flex flex-col group cursor-pointer w-full select-none"
      style={{ perspective: '900px' }}
    >
      {/* 3D Movie Poster Card */}
      <div 
        ref={cardRef}
        style={{
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(${isHovered ? 1.04 : 1}, ${isHovered ? 1.04 : 1}, 1)`,
          transformStyle: 'preserve-3d',
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#181A24] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.15)] group-hover:shadow-[0_25px_50px_-10px_rgba(248,68,100,0.3)] transition-shadow duration-300 border border-gray-200/80 group-hover:border-[#F84464]/60"
      >
        {/* Dynamic 3D Glare Sheen */}
        {isHovered && (
          <div
            className="pointer-events-none absolute inset-0 z-30 mix-blend-overlay transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 65%)`,
            }}
          />
        )}

        {/* Poster Image (Base Layer translateZ(0)) */}
        <img
          src={posterUrl}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ transform: 'translateZ(0px)' }}
        />

        {/* Top Right Wishlist Heart (Floating translateZ(28px)) */}
        <button
          type="button"
          onClick={handleHeartClick}
          style={{ 
            transform: isHovered ? 'translateZ(28px)' : 'translateZ(0px)',
            transition: 'transform 0.3s ease-out'
          }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white backdrop-blur-md transition-all active:scale-90 z-20 border border-white/20"
          title={isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isLiked ? 'fill-[#F84464] text-[#F84464]' : 'text-white'
            }`}
          />
        </button>

        {/* Hover "Quick Book" Floating Overlay (Floating translateZ(34px)) */}
        <div 
          style={{
            transform: isHovered ? 'translateZ(34px)' : 'translateZ(0px)',
            transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
            opacity: isHovered ? 1 : 0,
            pointerEvents: isHovered ? 'auto' : 'none',
          }}
          className="absolute inset-x-3 bottom-12 flex justify-center z-20"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#F84464] to-[#e03a58] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(248,68,100,0.6)] active:scale-95 border border-white/20"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>Quick Book</span>
          </button>
        </div>

        {/* Bottom Rating Pill Overlay (Floating translateZ(24px)) */}
        <div 
          style={{ 
            transform: isHovered ? 'translateZ(24px)' : 'translateZ(0px)',
            transition: 'transform 0.3s ease-out'
          }}
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/65 to-transparent p-2.5 pt-7 flex items-center justify-between text-white z-10"
        >
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
