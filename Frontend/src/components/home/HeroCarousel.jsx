import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Ticket, Sparkles, Star, Volume2, VolumeX, Play, Pause } from 'lucide-react';
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
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const stageRef = useRef(null);
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
        // Autoplay policy fallback
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

  const handleMouseMove = (e) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setMousePos({ x, y });
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

  const rotateX = isHovered ? (0.5 - mousePos.y) * 8 : 0;
  const rotateY = isHovered ? (mousePos.x - 0.5) * 12 : 0;

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
      className="relative w-full bg-[#0b0c14] py-4 sm:py-6 select-none overflow-hidden"
    >
      {/* Ambient Theater Stage Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-44 bg-gradient-to-b from-[#F84464]/15 via-violet-600/[0.04] to-transparent blur-3xl pointer-events-none" />

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
          className="relative w-full h-[250px] sm:h-[340px] md:h-[400px] lg:h-[440px] rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] cursor-pointer group bg-[#0f111a] border border-slate-800 hover:border-[#F84464]/50 transition-colors"
        >
          {/* Dynamic 3D Projector Specular Glare */}
          {isHovered && (
            <div
              className="pointer-events-none absolute inset-0 z-30 mix-blend-overlay transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 65%)`,
              }}
            />
          )}

          {/* Top Ambient Projector Light Beam Cone */}
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/[0.08] via-transparent to-transparent pointer-events-none z-20" />

          {/* Live Looping Video Layer or Fallback Poster Image */}
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
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              style={{ transform: 'translateZ(0px)' }}
            />
          ) : (
            <img
              src={current.imageUrl}
              alt={current.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              style={{ transform: 'translateZ(0px)' }}
            />
          )}

          {/* Dark Vignette Scrim (Ensures 100% Text & Button Contrast) */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c14] via-transparent to-transparent z-15 pointer-events-none" />

          {/* Multi-Plane Floating Content */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-[#0b0c14]/95 via-[#0b0c14]/70 sm:via-[#0b0c14]/50 to-transparent flex items-end sm:items-center p-6 sm:p-10 md:p-14 z-20"
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
                  <span>Now Playing in Theatres</span>
                </div>

                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-md">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>★ 9.4/10 IMAX 3D</span>
                </div>

                {currentVideoUrl && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    Live Cinema Trailer
                  </span>
                )}
              </div>

              {/* Title (Floating translateZ(45px)) */}
              <h2 
                className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-xl leading-tight"
                style={{ 
                  transform: isHovered ? 'translateZ(45px)' : 'translateZ(0px)',
                  transition: 'transform 0.4s ease-out',
                  textShadow: '0 10px 30px rgba(0,0,0,0.9)'
                }}
              >
                {current.title}
              </h2>

              {/* Subtitle / Description (Floating translateZ(30px)) */}
              {current.subtitle && (
                <p 
                  className="text-xs sm:text-sm md:text-base text-slate-300 mt-2 line-clamp-2 drop-shadow-md font-medium max-w-lg leading-relaxed"
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
                  className="bg-gradient-to-r from-[#F84464] via-[#ff4769] to-[#e03a58] hover:from-[#ff5274] hover:to-[#eb4363] text-white font-black text-xs sm:text-sm px-6 sm:px-8 py-3.5 rounded-xl transition-all shadow-[0_8px_25px_rgba(248,68,100,0.5)] hover:shadow-[0_12px_35px_rgba(248,68,100,0.7)] active:scale-95 flex items-center gap-2 cursor-pointer border border-white/20"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Book Tickets</span>
                </button>
              </div>

            </div>
          </div>

          {/* Ambient Sound & Playback Controls in Bottom Right Corner */}
          {currentVideoUrl && (
            <div 
              className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={toggleMute}
                className="px-3 py-1.5 rounded-full bg-black/75 hover:bg-black text-white border border-white/20 text-xs font-bold backdrop-blur-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-xl"
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

        </div>

        {/* Carousel Left Navigation Arrow */}
        {banners.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-900/80 hover:bg-[#F84464] text-white flex items-center justify-center transition-all shadow-xl active:scale-95 cursor-pointer z-30 border border-slate-700 hover:border-transparent backdrop-blur-md"
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
            className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-900/80 hover:bg-[#F84464] text-white flex items-center justify-center transition-all shadow-xl active:scale-95 cursor-pointer z-30 border border-slate-700 hover:border-transparent backdrop-blur-md"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* Bottom Pagination Dots */}
        {banners.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
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
                    : 'w-2 bg-slate-700 hover:bg-slate-600'
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
