import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { playPop } from '../../utils/soundEffects';

export default function HeroCarousel({ banners = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!banners.length || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
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
    if (current.movieId) {
      navigate(`/movies/${current.movieId}`);
    } else if (current.link) {
      navigate(current.link);
    }
  };

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full bg-[#EBEBF2] py-4 select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Main Banner Slide Container */}
        <div 
          onClick={handleBannerClick}
          className="relative w-full h-[220px] sm:h-[300px] md:h-[360px] lg:h-[400px] rounded-2xl overflow-hidden shadow-md cursor-pointer group bg-gray-900"
        >
          {/* Banner Backdrop Image */}
          <img
            src={current.imageUrl}
            alt={current.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Left Dark Gradient for Typography */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent flex items-end sm:items-center p-6 sm:p-10 md:p-14">
            <div className="max-w-xl text-white">
              
              {/* Category / Release Tag */}
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#F84464] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 sm:mb-3 shadow-xs">
                <span>In Cinemas Now</span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md leading-tight">
                {current.title}
              </h2>

              {/* Subtitle / Description */}
              {current.subtitle && (
                <p className="text-xs sm:text-sm text-gray-200 mt-1.5 sm:mt-2 line-clamp-2 drop-shadow-sm font-medium">
                  {current.subtitle}
                </p>
              )}

              {/* Primary Book Tickets Button */}
              <div className="mt-4 sm:mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBannerClick();
                  }}
                  className="bg-[#F84464] hover:bg-[#E03A58] text-white font-bold text-xs sm:text-sm px-5 sm:px-7 py-2.5 rounded-lg transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
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
            className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-[#F84464] text-white flex items-center justify-center transition-all shadow-lg active:scale-95 cursor-pointer z-20"
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
            className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-[#F84464] text-white flex items-center justify-center transition-all shadow-lg active:scale-95 cursor-pointer z-20"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* Bottom Pagination Dots */}
        {banners.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-3">
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
                    ? 'w-6 bg-[#F84464]'
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
