import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Ticket, 
  Star, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Film, 
  Tv, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { playPop } from '../../utils/soundEffects';

// Curated high-speed lightweight cinematic video loops
const CINEMA_TRAILER_LOOPS = {
  m1: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4', // Dune: Part Two
  m2: 'https://vjs.zencdn.net/v/oceans.mp4',                 // Kalki 2898 AD / Odyssey
  b1: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
  b2: 'https://vjs.zencdn.net/v/oceans.mp4',
  default: 'https://media.w3.org/2010/05/video/movie_300.mp4'
};

export default function HeroCarousel({ banners = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!banners.length || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [banners.length, isPaused]);

  // Sync video play/pause when slide changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Browser autoplay policy graceful fallback
      });
      setIsPlaying(true);
    }
  }, [currentIndex]);

  if (!banners.length) return null;

  const current = banners[currentIndex];
  const currentVideoUrl = current.videoUrl || CINEMA_TRAILER_LOOPS[current.movieId] || CINEMA_TRAILER_LOOPS[current.id] || CINEMA_TRAILER_LOOPS[current.customId];

  const prevSlide = () => {
    playPop();
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    playPop();
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handleBannerClick = () => {
    playPop();
    if (current.movieId) {
      navigate(`/movies/${current.movieId}`);
    } else if (current.link) {
      navigate(current.link);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    playPop();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlay = (e) => {
    e.stopPropagation();
    playPop();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full min-h-[540px] sm:min-h-[580px] md:min-h-[640px] lg:min-h-[680px] bg-[#07080c] select-none overflow-hidden flex items-center border-b border-white/[0.06]"
    >
      {/* =========================================================================
          1. FULL-WIDTH CINEMATIC BACKDROP (VIDEO TRAILER OR HIGH-RES IMAGE)
      ========================================================================= */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {currentVideoUrl ? (
          <video
            ref={videoRef}
            key={currentVideoUrl}
            src={currentVideoUrl}
            poster={current.imageUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            preload="auto"
            className="w-full h-full object-cover scale-105 transition-all duration-1000 opacity-80"
          />
        ) : (
          <img
            src={current.imageUrl}
            alt={current.title}
            className="w-full h-full object-cover scale-105 transition-all duration-1000 opacity-80"
          />
        )}

        {/* Left Dark Gradient Scrim (Ensures 100% Readable Text on Left) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07080c] via-[#07080c]/85 via-45% sm:via-[#07080c]/60 to-transparent z-10" />

        {/* Bottom Dark Gradient Scrim (Blends seamlessly into page below) */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0b0c14] via-[#0b0c14]/70 to-transparent z-10" />

        {/* Top Dark Header Scrim */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 via-transparent to-transparent z-10" />

        {/* Subtle Ambient Red Theatre Glow Cone */}
        <div className="absolute -left-20 top-1/4 w-[500px] h-[500px] bg-[#F84464]/10 rounded-full blur-[140px] pointer-events-none z-10" />
      </div>

      {/* =========================================================================
          2. MAIN CONTENT: LEFT-SIDE MOVIE INFORMATION + OPEN VIDEO AREA ON RIGHT
      ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full py-12 sm:py-16 lg:py-20">
        <div className="max-w-2xl lg:max-w-3xl space-y-4 sm:space-y-6 text-left">
          
          {/* Top Badges Row */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-md">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>★ 9.4/10 IMDb</span>
            </div>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Tv className="w-3 h-3" />
              <span>IMAX 3D Laser</span>
            </span>
          </div>

          {/* Giant Cinematic Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.05] drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)]">
            {current.title}
          </h1>

          {/* Movie Spec Ribbon: Rating, Certificate & Languages */}
          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300 flex-wrap font-semibold">
            <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-200 text-[11px] font-black uppercase">
              UA 16+
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-200">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              2h 46m
            </span>
            <span>•</span>
            <span className="text-slate-300">
              {current.category || 'Action, Sci-Fi, Adventure'}
            </span>
            <span>•</span>
            <span className="text-slate-400">
              Hindi, English, Telugu, Tamil
            </span>
          </div>

          {/* Movie Synopsis / Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-slate-300 font-normal leading-relaxed max-w-xl line-clamp-3 drop-shadow-md">
            {current.subtitle || current.description || 'Experience the visually majestic cinematic spectacle with breathtaking world-building, razor-sharp IMAX projections, and ground-shaking Dolby sound.'}
          </p>

          {/* Action Buttons Row */}
          <div className="pt-2 flex items-center gap-3 sm:gap-4 flex-wrap">
            <button
              type="button"
              onClick={handleBannerClick}
              className="bg-gradient-to-r from-[#F84464] via-[#ff4769] to-[#e03a58] hover:from-[#ff5274] hover:to-[#eb4363] text-white font-black text-sm sm:text-base px-7 sm:px-9 py-3.5 sm:py-4 rounded-2xl transition-all shadow-[0_10px_30px_rgba(248,68,100,0.5)] hover:shadow-[0_15px_40px_rgba(248,68,100,0.7)] active:scale-95 flex items-center gap-2.5 cursor-pointer border border-white/20"
            >
              <Ticket className="w-5 h-5" />
              <span>Book Tickets Now</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>

            <button
              type="button"
              onClick={handleBannerClick}
              className="bg-white/10 hover:bg-white/15 text-white font-bold text-sm sm:text-base px-6 py-3.5 sm:py-4 rounded-2xl transition-all backdrop-blur-md active:scale-95 flex items-center gap-2 cursor-pointer border border-white/15 shadow-lg"
            >
              <Film className="w-4 h-4 text-amber-300" />
              <span>Movie Details</span>
            </button>
          </div>

        </div>
      </div>

      {/* =========================================================================
          3. CAROUSEL NAVIGATION CONTROLS & PAGINATION
      ========================================================================= */}
      
      {/* Left Navigation Arrow */}
      {banners.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/80 hover:bg-[#F84464] text-white flex items-center justify-center transition-all shadow-2xl active:scale-90 cursor-pointer z-30 border border-slate-700 hover:border-transparent backdrop-blur-md"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}

      {/* Right Navigation Arrow */}
      {banners.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/80 hover:bg-[#F84464] text-white flex items-center justify-center transition-all shadow-2xl active:scale-90 cursor-pointer z-30 border border-slate-700 hover:border-transparent backdrop-blur-md"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}

      {/* Bottom Center Pagination Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 inset-x-0 flex items-center justify-center gap-2 z-30 pointer-events-auto">
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
                  ? 'w-8 bg-gradient-to-r from-[#F84464] to-[#ff5978] shadow-[0_0_12px_rgba(248,68,100,0.8)]'
                  : 'w-2 bg-slate-700/80 hover:bg-slate-500'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Bottom Right Sound & Playback Controls */}
      {currentVideoUrl && (
        <div 
          className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8 z-30 flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={toggleMute}
            className="px-3.5 py-1.5 rounded-full bg-black/75 hover:bg-black text-white border border-white/20 text-xs font-bold backdrop-blur-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-xl"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
            aria-label={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-[11px] text-slate-300">Unmute</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#F84464] animate-pulse" />
                <span className="text-[11px] text-[#F84464]">Sound On</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-black/75 hover:bg-black text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-xl"
            title={isPlaying ? "Pause Trailer" : "Play Trailer"}
            aria-label={isPlaying ? "Pause Trailer" : "Play Trailer"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-slate-200" /> : <Play className="w-3.5 h-3.5 ml-0.5 fill-white text-white" />}
          </button>
        </div>
      )}

    </section>
  );
}
