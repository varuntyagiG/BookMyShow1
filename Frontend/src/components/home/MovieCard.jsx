import React, { useState } from 'react';
import { Star, Heart, Ticket, Play, Info, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { contentApi } from '../../services/api';
import { playTudum, playPop } from '../../utils/soundEffects';

export default function MovieCard({ movie, onSelect, rankingNumber }) {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const { id, title, genre, rating, voteCount, posterUrl, certificate, isPromoted, language, formats, duration } = movie;

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

  const handleTrailerClick = (e) => {
    e.stopPropagation();
    playTudum();
    navigate(`/movies/${id}?trailer=true`);
  };

  // Predictive prefetch on hover for 0ms transition
  const handlePointerEnter = () => {
    setIsHovered(true);
    try {
      contentApi.getMovie(id).catch(() => {});
    } catch (_) {}
  };

  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  };

  const rotateX = isHovered ? (0.5 - mousePos.y) * 12 : 0;
  const rotateY = isHovered ? (mousePos.x - 0.5) * 12 : 0;

  // Compute realistic dynamic match percentage based on rating
  const matchScore = Math.min(99, Math.max(85, Math.round(Number(rating || 8.5) * 10.2)));

  return (
    <div className="flex items-center group/rank select-none w-full">
      {/* Netflix Top 10 Stroked Number (Refined & Balanced) */}
      {rankingNumber && (
        <div className="shrink-0 flex items-center justify-center select-none pointer-events-none -mr-2 sm:-mr-3.5 z-10">
          <span
            className="text-5xl sm:text-6xl md:text-7xl font-black font-sans leading-none drop-shadow-[0_6px_14px_rgba(0,0,0,0.85)] transition-transform duration-300 group-hover/rank:scale-105"
            style={{
              WebkitTextStroke: '2.5px #71717a',
              color: '#141414',
              letterSpacing: '-0.06em',
            }}
          >
            {rankingNumber}
          </span>
        </div>
      )}

      {/* Main Card Container */}
      <div
        onClick={handleClick}
        onPointerEnter={handlePointerEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setIsHovered(false);
          setMousePos({ x: 0.5, y: 0.5 });
        }}
        className="flex flex-col group cursor-pointer w-full select-none relative"
        style={{ perspective: '900px' }}
      >
        {/* 3D Poster wrapper */}
        <motion.div
          animate={{
            rotateX,
            rotateY,
            scale: isHovered ? 1.05 : 1,
            y: isHovered ? -8 : 0,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 26 }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#1f222e] shadow-md border border-white/10 group-hover:border-white/30 group-hover:shadow-[0_20px_45px_rgba(0,0,0,0.85)] transition-all duration-300 z-10"
        >
          <img
            src={posterUrl}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Dynamic 3D Glare Sheen */}
          {isHovered && (
            <div
              className="pointer-events-none absolute inset-0 mix-blend-overlay transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 65%)`,
              }}
            />
          )}

          {/* Netflix Hover Expansion Overlay Dock */}
          {isHovered && (
            <div
              className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30 p-3 sm:p-4 flex flex-col justify-between pointer-events-auto z-20 animate-in fade-in duration-200"
              style={{ transform: 'translateZ(35px)' }}
            >
              {/* Top Row: Quick Match Score & Wishlist */}
              <div className="flex items-center justify-between">
                <span className="bg-emerald-500/25 border border-emerald-400/40 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-md">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>{matchScore}% Match</span>
                </span>

                <button
                  type="button"
                  onClick={handleHeartClick}
                  className="w-7 h-7 rounded-full bg-black/60 hover:bg-[#F84464] border border-white/20 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                  title="Save to My List"
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white text-white' : 'text-white'}`} />
                </button>
              </div>

              {/* Center Play Trailer Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleTrailerClick}
                  className="w-11 h-11 rounded-full bg-white hover:bg-gray-200 text-black flex items-center justify-center shadow-[0_4px_16px_rgba(255,255,255,0.4)] transition-all hover:scale-110 active:scale-95 cursor-pointer"
                  title="Watch Trailer"
                >
                  <Play className="w-5 h-5 fill-black text-black ml-0.5" />
                </button>
              </div>

              {/* Bottom Quick Book CTA */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playPop();
                    navigate(`/movies/${id}?book=true`);
                  }}
                  className="w-full py-2 bg-gradient-to-r from-[#F84464] to-[#E03A58] hover:from-[#ff5576] hover:to-[#eb4464] text-white text-[11px] font-black rounded-xl shadow-[0_4px_16px_rgba(248,68,100,0.5)] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>⚡ Quick Book</span>
                </button>
              </div>
            </div>
          )}

          {/* Top Permanent Badges (When not hovered) */}
          {!isHovered && (
            <div
              className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none z-10"
              style={{ transform: 'translateZ(30px)' }}
            >
              <div className="flex items-center gap-1 flex-wrap">
                {isPromoted && (
                  <div className="bg-[#F84464] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md pointer-events-auto">
                    PROMOTED
                  </div>
                )}
                {formats?.some((f) => f.toLowerCase().includes('imax')) && (
                  <div className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md pointer-events-auto flex items-center gap-0.5 border border-yellow-200/60">
                    <span>👑 IMAX Laser</span>
                  </div>
                )}
                {!isPromoted && !formats?.some((f) => f.toLowerCase().includes('imax')) && rating >= 9.0 && (
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md pointer-events-auto flex items-center gap-0.5 border border-emerald-300/40">
                    <span>★ Blockbuster</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rating Overlay at bottom of poster with gradient (When not hovered) */}
          {!isHovered && (
            <div
              className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/85 to-transparent pt-8 pb-2.5 px-3 flex items-center justify-between text-white z-10"
              style={{ transform: 'translateZ(25px)' }}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Star className="w-3.5 h-3.5 fill-[#F84464] text-[#F84464]" />
                <span className="tracking-wide font-extrabold">{rating}/10</span>
              </div>
              <span className="text-[11px] text-gray-300 font-semibold">{voteCount} Votes</span>
            </div>
          )}
        </motion.div>

        {/* Details Card (High-Contrast Midnight Legibility) */}
        <div className="mt-2.5 px-0.5">
          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#F84464] transition-colors truncate tracking-tight">
            {title}
          </h3>

          <p className="text-xs text-gray-400 truncate mt-0.5 font-medium">
            {Array.isArray(genre) ? genre.join(', ') : genre}
          </p>

          {/* Netflix Specs & Format Pills */}
          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-400 font-semibold flex-wrap">
            <span className="text-emerald-400 font-black">
              {matchScore}% Match
            </span>
            {certificate && (
              <span className="border border-white/20 bg-white/5 px-1.5 py-0.2 rounded text-[9px] text-gray-300">
                {certificate}
              </span>
            )}
            {language && (
              <span className="text-gray-400 truncate max-w-[100px]">
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
      </div>
    </div>
  );
}

