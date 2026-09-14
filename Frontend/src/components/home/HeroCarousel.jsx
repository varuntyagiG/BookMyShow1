import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Ticket, Sparkles, Star, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { playPop } from '../../utils/soundEffects';

export default function HeroCarousel({ banners = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const stageRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!banners.length || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length, isPaused]);

  if (!banners.length) return null;

  const prevSlide = () => {
    playPop();
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    playPop();
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const current = banners[currentIndex];

  const handleBannerClick = () => {
    playPop();
    if (current.movieId) {
      navigate(`/movies/${current.movieId}`);
    } else if (current.link) {
      navigate(current.link);
    }
  };

  const handleMouseMove = (e) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setMousePos({ x, y });
  };

  const rotateX = isHovered ? (0.5 - mousePos.y) * 10 : 0;
  const rotateY = isHovered ? (mousePos.x - 0.5) * 14 : 0;

  return (
    <section
      onMouseEnter={() => {
        setIsPaused(true);
        setIsHovered(true);
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setIsPaused(false);
        setIsHovered(false);
        setMousePos({ x: 0.5, y: 0.5 });
      }}
      className="relative w-full bg-[#E5E5EE] py-4 sm:py-6 select-none overflow-hidden"
    >
      {/* Ambient Theater Stage Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-36 bg-gradient-to-b from-[#F84464]/10 via-transparent to-transparent blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative" style={{ perspective: '1400px' }}>
        
        {/* 3D IMAX Stage Container */}
        <div 
          ref={stageRef}
          onClick={handleBannerClick}
          style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${isHovered ? 1.015 : 1}, ${isHovered ? 1.015 : 1}, 1)`,
            transformStyle: 'preserve-3d',
            transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="relative w-full h-[230px] sm:h-[320px] md:h-[380px] lg:h-[420px] rounded-3xl overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] cursor-pointer group bg-[#11131E] border border-white/10"
        >
          {/* Dynamic 3D Projector Specular Glare */}
          {isHovered && (
            <div
              className="pointer-events-none absolute inset-0 z-30 mix-blend-overlay transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 65%)`,
              }}
            />
          )}

          {/* Top Ambient Projector Light Beam Cone */}
          <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-white/[0.12] via-transparent to-transparent pointer-events-none z-20" />

          {/* Banner Backdrop Image (Base Layer translateZ(0)) */}
          <img
            src={current.imageUrl}
            alt={current.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            style={{ transform: 'translateZ(0px)' }}
          />

          {/* Multi-Plane Floating Content */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent flex items-end sm:items-center p-6 sm:p-10 md:p-14 z-20"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="max-w-xl text-white" style={{ transformStyle: 'preserve-3d' }}>
              
              {/* Category & 3D Badges (Floating translateZ(40px)) */}
              <div 
                className="flex items-center gap-2 flex-wrap mb-2 sm:mb-3"
                style={{ 
                  transform: isHovered ? 'translateZ(40px)' : 'translateZ(0px)',
                  transition: 'transform 0.4s ease-out'
                }}
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#F84464] to-[#ff3b5c] text-white text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg shadow-[#F84464]/30">
                  <Sparkles className="w-3 h-3" />
                  <span>In Cinemas Now</span>
                </div>

                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] sm:text-xs font-black uppercase tracking-wider">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>★ 9.4/10 IMAX</span>
                </div>
              </div>

              {/* Title (Floating translateZ(45px)) */}
              <h2 
                className="text-xl sm:text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg leading-tight"
                style={{ 
                  transform: isHovered ? 'translateZ(45px)' : 'translateZ(0px)',
                  transition: 'transform 0.4s ease-out',
                  textShadow: '0 10px 30px rgba(0,0,0,0.8)'
                }}
              >
                {current.title}
              </h2>

              {/* Subtitle / Description (Floating translateZ(30px)) */}
              {current.subtitle && (
                <p 
                  className="text-xs sm:text-sm md:text-base text-gray-200 mt-2 line-clamp-2 drop-shadow-md font-medium max-w-lg leading-relaxed"
                  style={{ 
                    transform: isHovered ? 'translateZ(30px)' : 'translateZ(0px)',
                    transition: 'transform 0.4s ease-out'
                  }}
                >
                  {current.subtitle}
                </p>
              )}

              {/* Primary 3D Action Button (Floating translateZ(55px)) */}
              <div 
                className="mt-4 sm:mt-6 flex items-center gap-3"
                style={{ 
                  transform: isHovered ? 'translateZ(55px)' : 'translateZ(0px)',
                  transition: 'transform 0.4s ease-out'
                }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBannerClick();
                  }}
                  className="bg-gradient-to-r from-[#F84464] via-[#ff4769] to-[#e03a58] hover:from-[#ff5274] hover:to-[#eb4363] text-white font-black text-xs sm:text-sm px-6 sm:px-8 py-3 rounded-xl transition-all shadow-[0_8px_25px_rgba(248,68,100,0.5)] hover:shadow-[0_12px_35px_rgba(248,68,100,0.7)] active:scale-95 flex items-center gap-2 cursor-pointer border border-white/20"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Book Tickets</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Carousel Left Navigation Arrow */}
        {banners.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/70 hover:bg-[#F84464] text-white flex items-center justify-center transition-all shadow-xl active:scale-95 cursor-pointer z-30 border border-white/10 hover:border-transparent backdrop-blur-md"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* Carousel Right Navigation Arrow */}
        {banners.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/70 hover:bg-[#F84464] text-white flex items-center justify-center transition-all shadow-xl active:scale-95 cursor-pointer z-30 border border-white/10 hover:border-transparent backdrop-blur-md"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* Bottom Pagination Dots */}
        {banners.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-3.5">
            {banners.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  playPop();
                  setCurrentIndex(index);
                }}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === index
                    ? 'w-7 bg-gradient-to-r from-[#F84464] to-[#ff5978] shadow-[0_0_10px_rgba(248,68,100,0.8)]'
                    : 'w-2 bg-gray-400/60 hover:bg-gray-500'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
