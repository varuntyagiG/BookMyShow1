import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export default function HeroCarousel({ banners = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!banners.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (!banners.length) return null;

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const current = banners[currentIndex];

  return (
    <div className="relative w-full bg-[#121212] overflow-hidden group select-none">
      {/* Banner Slide */}
      <div
        onClick={() => {
          if (current.movieId) {
            window.location.href = `/movies/${current.movieId}`;
          } else if (current.link) {
            window.location.href = current.link;
          }
        }}
        className="relative h-[240px] sm:h-[340px] md:h-[400px] w-full cursor-pointer"
      >
        <img
          src={current.imageUrl}
          alt={current.title}
          className="w-full h-full object-cover opacity-85 transition-opacity duration-500"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-black/40 to-transparent flex items-end">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-10">
            {current.tag && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F84464] text-white text-[11px] font-bold rounded-sm mb-2 shadow-sm uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>{current.tag}</span>
              </div>
            )}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white drop-shadow-md my-0">
              {current.title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 mt-1 max-w-xl line-clamp-2 drop-shadow-sm">
              {current.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Prev / Next Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
        aria-label="Previous banner"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
        aria-label="Next banner"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicator Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              currentIndex === idx ? 'w-6 bg-[#F84464]' : 'w-2 bg-white/50 hover:bg-white'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

