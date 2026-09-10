import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HeroCarousel({ banners = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!banners.length || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [banners.length, isPaused]);

  if (!banners.length) return null;

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
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
      className="group relative w-full overflow-hidden bg-[#121216] select-none"
    >
      <div
        onClick={handleBannerClick}
        className="relative h-[280px] w-full cursor-pointer overflow-hidden sm:h-[390px] md:h-[470px] lg:h-[510px]"
      >
        <img
          key={current.id || currentIndex}
          src={current.imageUrl}
          alt={current.title}
          className="absolute inset-0 h-full w-full object-cover object-center opacity-90 transition-transform duration-700 ease-out group-hover:scale-[1.015]"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#121216]/95 via-[#121216]/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-[#121216]/20 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent" />

        <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-[#F84464]/10 blur-3xl" />

        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8 sm:pb-14 lg:px-10 lg:pb-16">
            <div className="max-w-2xl">
              {current.tag && (
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#F84464]/30 bg-[#F84464]/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-lg backdrop-blur-md sm:text-[11px]">
                  <Sparkles className="h-3.5 w-3.5 text-[#ff8097]" />
                  <span>{current.tag}</span>
                </div>
              )}

              <h1 className="m-0 max-w-2xl text-2xl font-extrabold leading-[1.1] tracking-[-0.025em] text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.45)] sm:text-4xl md:text-5xl lg:text-6xl">
                {current.title}
              </h1>

              {current.subtitle && (
                <p className="mt-3 line-clamp-2 max-w-xl text-xs font-medium leading-6 text-white/80 drop-shadow-md sm:text-sm md:text-base">
                  {current.subtitle}
                </p>
              )}

              <div className="mt-5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBannerClick();
                  }}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#F84464] px-5 py-2.5 text-xs font-bold text-white shadow-[0_8px_24px_rgba(248,68,100,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#E03A58] hover:shadow-[0_12px_30px_rgba(248,68,100,0.35)] active:translate-y-0 active:scale-[0.98] sm:px-6 sm:text-sm"
                >
                  <Ticket className="h-4 w-4" />
                  <span>
                    {current.movieId ? 'Book Tickets' : 'Explore Event'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-[#F84464]/60 hover:bg-[#F84464] active:scale-95 md:flex md:left-5 lg:left-7"
        aria-label="Previous banner"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
        className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-[#F84464]/60 hover:bg-[#F84464] active:scale-95 md:flex md:right-5 lg:right-7"
        aria-label="Next banner"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute right-4 top-4 z-20 flex gap-2 md:hidden">
        <button
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-[#F84464]"
          aria-label="Previous banner"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-[#F84464]"
          aria-label="Next banner"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-2.5 py-2 backdrop-blur-md sm:bottom-5">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(idx);
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              currentIndex === idx
                ? 'w-7 bg-[#F84464] shadow-[0_0_10px_rgba(248,68,100,0.7)]'
                : 'w-1.5 bg-white/40 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 h-px bg-gradient-to-r from-transparent via-[#F84464]/50 to-transparent" />
    </section>
  );
}
