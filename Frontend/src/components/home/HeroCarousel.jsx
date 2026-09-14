import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Ticket, Play, Volume2, VolumeX, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { playTudum, playPop, isSoundEnabled, toggleSound, subscribeSoundChange } from '../../utils/soundEffects';

export default function HeroCarousel({ banners = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const navigate = useNavigate();
  const bannerRef = useRef(null);

  useEffect(() => {
    return subscribeSoundChange(setSoundOn);
  }, []);

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

  const handleMouseMove = (e) => {
    if (!bannerRef.current) return;
    const rect = bannerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseTilt({ x: x * 6, y: -y * 6 });
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    setMouseTilt({ x: 0, y: 0 });
  };

  const current = banners[currentIndex];
  const prevIndex = (currentIndex - 1 + banners.length) % banners.length;
  const nextIndex = (currentIndex + 1) % banners.length;
  const prevBanner = banners[prevIndex];
  const nextBanner = banners[nextIndex];

  const handleBannerClick = (banner) => {
    const target = banner || current;
    if (target.movieId) {
      navigate(`/movies/${target.movieId}`);
    } else if (target.link) {
      navigate(target.link);
    }
  };

  const handleWatchTrailer = (e) => {
    e.stopPropagation();
    playTudum();
    const targetId = current.movieId || 'm1';
    navigate(`/movies/${targetId}?trailer=true`);
  };

  const handleSoundToggle = (e) => {
    e.stopPropagation();
    const next = toggleSound();
    setSoundOn(next);
  };

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={handleMouseLeave}
      className="group relative w-full overflow-hidden bg-[#141414] select-none py-3 sm:py-5"
    >
      {/* 3D Perspective Stage Viewport */}
      <div 
        className="relative max-w-[1400px] mx-auto px-3 sm:px-6 h-[320px] sm:h-[420px] md:h-[480px] lg:h-[520px] flex items-center justify-center"
        style={{ perspective: '1200px' }}
      >
        {/* Left Wing 3D Coverflow Preview (Desktop) */}
        {banners.length > 1 && (
          <div
            onClick={prevSlide}
            className="hidden lg:block absolute left-4 w-[280px] xl:w-[320px] h-[80%] rounded-3xl overflow-hidden cursor-pointer transition-all duration-700 ease-out z-10 opacity-35 hover:opacity-75 shadow-2xl border border-white/10"
            style={{
              transform: 'translateX(-22%) translateZ(-100px) rotateY(24deg)',
              transformStyle: 'preserve-3d',
            }}
          >
            <img
              src={prevBanner.imageUrl}
              alt={prevBanner.title}
              className="w-full h-full object-cover filter blur-[1px] brightness-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-xs font-bold text-white/90 line-clamp-1">{prevBanner.title}</span>
            </div>
          </div>
        )}

        {/* Center Stage Netflix Billboard Active Card */}
        <div
          ref={bannerRef}
          onMouseMove={handleMouseMove}
          onClick={() => handleBannerClick(current)}
          className="relative w-full lg:w-[94%] xl:w-[91%] h-full rounded-3xl cursor-pointer overflow-hidden shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9)] border border-white/10 z-20 transition-transform duration-200 ease-out"
          style={{
            transform: `rotateY(${mouseTilt.x}deg) rotateX(${mouseTilt.y}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Background Poster/Backdrop Image */}
          <img
            key={current.id || currentIndex}
            src={current.imageUrl}
            alt={current.title}
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
          />

          {/* Netflix Signature Deep Gradients (Edge-to-Edge Black Fades) */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/95 via-[#141414]/65 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent" />

          {/* Ambient Cinema Lighting Bloom */}
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-80 w-80 rounded-full bg-[#F84464]/20 blur-3xl animate-pulse" />

          {/* Layered Content (Floats forward on Z-axis) */}
          <div 
            className="absolute inset-0 flex items-end p-6 sm:p-10 lg:p-12"
            style={{ transform: 'translateZ(30px)' }}
          >
            <div className="max-w-2xl">
              {/* Netflix-style Metadata & Match Badges */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {/* 98% Match Pill */}
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-400 backdrop-blur-md shadow-xs">
                  <Sparkles className="h-3 w-3 text-emerald-400" />
                  <span>98% Match</span>
                </span>

                {/* Top 10 in India Today Pill */}
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F84464] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
                  <Flame className="h-3 w-3 text-amber-300" />
                  <span>#1 in Theaters Today</span>
                </span>

                {/* Specs Pills */}
                <span className="text-[10px] font-mono font-bold text-gray-300 bg-white/10 px-2 py-0.5 rounded border border-white/10">
                  IMAX Laser
                </span>
                <span className="text-[10px] font-mono font-bold text-gray-300 bg-white/10 px-2 py-0.5 rounded border border-white/10">
                  Dolby Atmos
                </span>
                <span className="text-[10px] font-mono font-bold text-gray-400 border border-white/20 px-1.5 py-0.5 rounded">
                  U/A 16+
                </span>
              </div>

              {/* Bold Billboard Title */}
              <h1 className="m-0 max-w-2xl text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.06] tracking-tight text-white drop-shadow-[0_6px_20px_rgba(0,0,0,0.8)] font-sans">
                {current.title}
              </h1>

              {current.subtitle && (
                <p className="mt-2.5 line-clamp-2 max-w-xl text-xs sm:text-sm md:text-base font-medium leading-relaxed text-gray-300 drop-shadow-md">
                  {current.subtitle}
                </p>
              )}

              {/* Netflix Action Button Pair */}
              <div className="mt-6 flex items-center gap-3 sm:gap-4 flex-wrap">
                {/* Play Trailer Primary Pill */}
                <button
                  type="button"
                  onClick={handleWatchTrailer}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-white hover:bg-gray-100 px-6 py-2.5 text-xs sm:text-sm font-black text-black shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-black text-black" />
                  <span>Play Trailer</span>
                </button>

                {/* Book Tickets Secondary Pill */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playPop();
                    handleBannerClick(current);
                  }}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#F84464] hover:bg-[#E03A58] px-6 py-2.5 text-xs sm:text-sm font-black text-white shadow-[0_4px_20px_rgba(248,68,100,0.4)] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Ticket className="h-4 w-4" />
                  <span>Book Tickets</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sound Mute/Unmute Pill (Bottom-Right) */}
          <div className="absolute bottom-6 right-6 z-30">
            <button
              type="button"
              onClick={handleSoundToggle}
              className="h-9 w-9 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
              title={soundOn ? 'Mute Theatrical Audio' : 'Unmute Theatrical Audio'}
            >
              {soundOn ? <Volume2 className="h-4 w-4 text-white" /> : <VolumeX className="h-4 w-4 text-gray-400" />}
            </button>
          </div>
        </div>

        {/* Right Wing 3D Coverflow Preview (Desktop) */}
        {banners.length > 1 && (
          <div
            onClick={nextSlide}
            className="hidden lg:block absolute right-4 w-[280px] xl:w-[320px] h-[80%] rounded-3xl overflow-hidden cursor-pointer transition-all duration-700 ease-out z-10 opacity-35 hover:opacity-75 shadow-2xl border border-white/10"
            style={{
              transform: 'translateX(22%) translateZ(-100px) rotateY(-24deg)',
              transformStyle: 'preserve-3d',
            }}
          >
            <img
              src={nextBanner.imageUrl}
              alt={nextBanner.title}
              className="w-full h-full object-cover filter blur-[1px] brightness-60"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/80 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-right">
              <span className="text-xs font-bold text-white/90 line-clamp-1">{nextBanner.title}</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        className="absolute left-3 sm:left-6 top-1/2 z-30 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full border border-white/10 bg-black/60 text-white shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-110 hover:border-[#F84464] hover:bg-[#F84464] active:scale-95 cursor-pointer"
        aria-label="Previous banner"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
        className="absolute right-3 sm:right-6 top-1/2 z-30 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full border border-white/10 bg-black/60 text-white shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-110 hover:border-[#F84464] hover:bg-[#F84464] active:scale-95 cursor-pointer"
        aria-label="Next banner"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Pagination Indicator Bars (Netflix-style segmented progress) */}
      <div className="flex justify-center items-center gap-2 mt-4 z-20 relative">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              playPop();
              setCurrentIndex(idx);
            }}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              currentIndex === idx
                ? 'w-10 bg-[#F84464] shadow-[0_0_12px_rgba(248,68,100,0.8)]'
                : 'w-3 bg-white/20 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

