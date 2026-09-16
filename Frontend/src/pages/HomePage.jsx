import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contentApi } from '../services/api';
import { useRealtimeRefresh } from '../services/realtimeSync';
import { useCity } from '../context/CityContext';
import HeroCarousel from '../components/home/HeroCarousel';
import MovieSection from '../components/home/MovieSection';
import LiveEventsSection from '../components/home/LiveEventsSection';
import StreamSection from '../components/home/StreamSection';
import PromoBanner from '../components/home/PromoBanner';
import VIPCinema3DSection from '../components/home/VIPCinema3DSection';
import CategoryDiscovery3D from '../components/home/CategoryDiscovery3D';
import ConcessionsShowcase3D from '../components/home/ConcessionsShowcase3D';
import { Loader2, AlertCircle, RefreshCw, Sparkles, ChevronRight } from 'lucide-react';

export default function HomePage({ searchQuery }) {
  const { selectedCity } = useCity();
  const navigate = useNavigate();

  const [data, setData] = useState({
    banners: [],
    movies: [],
    events: [],
    premieres: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHomeContent = React.useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);

    try {
      const res = await contentApi.getHomeData({
        city: selectedCity,
        search: searchQuery || '',
      });

      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load home data:', err);
      if (!silent) {
        setError(
          'Could not connect to the backend server. Please make sure the backend is running.'
        );
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [selectedCity, searchQuery]);

  useEffect(() => {
    loadHomeContent();
  }, [loadHomeContent]);

  // Real-time reactive sync across tabs/portals
  useRealtimeRefresh(['MOVIE_MUTATION', 'SHOW_MUTATION'], () => {
    loadHomeContent(true);
  });

  /* =========================
     LOADING UI (Dark Cinema Shimmer)
  ========================= */

  if (loading && !data.movies.length) {
    return (
      <main className="flex-1 min-h-screen bg-[#0b0c14] py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Shimmer Status */}
        <div className="flex items-center gap-2 mb-6 px-1">
          <span className="w-2 h-2 rounded-full bg-[#F84464] animate-pulse" />
          <span className="text-xs font-semibold text-slate-400">
            Fetching blockbusters &amp; experiences in <strong className="text-white">{selectedCity}</strong>...
          </span>
        </div>

        {/* Hero Carousel Skeleton */}
        <div className="w-full h-56 sm:h-72 md:h-80 rounded-3xl bg-slate-900/80 border border-slate-800 animate-pulse mb-10 shadow-xl" />

        {/* Recommended Movies Header Skeleton */}
        <div className="flex items-center justify-between mb-5 px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 bg-[#F84464] rounded-full" />
            <div className="w-48 h-6 rounded-lg bg-slate-800/80 animate-pulse" />
          </div>
          <div className="w-16 h-4 rounded-md bg-slate-800/80 animate-pulse hidden sm:block" />
        </div>

        {/* 5-Column Movie Poster Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 mb-12">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex flex-col gap-2.5">
              <div className="w-full aspect-[2/3] rounded-2xl bg-slate-900/80 border border-slate-800 animate-pulse" />
              <div className="w-4/5 h-4 rounded-md bg-slate-800/80 animate-pulse" />
              <div className="w-1/2 h-3 rounded-md bg-slate-800/80 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Live Events Section Skeleton */}
        <div className="flex items-center justify-between mb-5 px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 bg-[#F84464] rounded-full" />
            <div className="w-40 h-6 rounded-lg bg-slate-800/80 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex flex-col gap-2.5">
              <div className="w-full aspect-[2/3] rounded-2xl bg-slate-900/80 border border-slate-800 animate-pulse" />
              <div className="w-3/4 h-4 rounded-md bg-slate-800/80 animate-pulse" />
              <div className="w-2/5 h-3 rounded-md bg-slate-800/80 animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 min-h-screen bg-[#0b0c14] text-white relative selection:bg-[#F84464] selection:text-white">

      {/* Ambient Theater Lighting Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 left-1/4 w-[600px] h-[600px] bg-[#F84464]/[0.035] rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-violet-600/[0.03] rounded-full blur-[150px]" />
        <div className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-amber-500/[0.025] rounded-full blur-[140px]" />
      </div>

      {/* =========================
          BACKEND ERROR
      ========================= */}

      {error && (
        <div className="bg-rose-950/40 border-b border-rose-800/50 backdrop-blur-md relative z-10">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-center gap-3">

            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-rose-300">
              <div className="w-7 h-7 rounded-full bg-rose-500/15 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 text-rose-400" />
              </div>

              <span>{error}</span>
            </div>

            <button
              onClick={loadHomeContent}
              className="
                flex items-center gap-1.5
                px-3.5 py-1.5
                rounded-lg
                text-xs font-bold
                text-white
                bg-[#F84464]
                hover:bg-rose-600
                active:scale-[0.97]
                transition-all duration-200
                cursor-pointer shadow-md shadow-rose-950/50
              "
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>

          </div>
        </div>
      )}

      {/* =========================
          SEARCH RESULT BAR
      ========================= */}

      {searchQuery && (
        <div className="bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md relative z-10">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3.5">

            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs sm:text-sm">

              <span className="text-slate-400">
                Showing search results for
              </span>

              <span className="font-bold text-[#F84464]">
                "{searchQuery}"
              </span>

              <span className="text-slate-400">
                in
              </span>

              <span className="font-semibold text-white">
                {selectedCity}
              </span>

            </div>

          </div>
        </div>
      )}

      {/* =========================
          HERO SECTION (Cinematic Video Stage)
      ========================= */}

      {!searchQuery && data.banners && (
        <section className="w-full bg-[#0b0c14] relative z-10">
          <HeroCarousel banners={data.banners} />
        </section>
      )}

      {/* =========================
          3D QUICK CATEGORY DISCOVERY RIBBON
      ========================= */}
      {!searchQuery && (
        <div className="relative z-10">
          <CategoryDiscovery3D />
        </div>
      )}

      {/* =========================
          MOVIES SECTION (Dark Cinema Grid)
      ========================= */}

      <div className="relative z-10">
        <MovieSection
          movies={data.movies}
          onMovieClick={(movie) => {
            navigate(`/movies/${movie.id}`);
          }}
        />
      </div>

      {/* =========================
          3D GOURMET CONCESSIONS STRIP
      ========================= */}
      {!searchQuery && (
        <div className="relative z-10">
          <ConcessionsShowcase3D />
        </div>
      )}

      {/* =========================
          PROMOTIONAL BANNER
      ========================= */}

      {!searchQuery && (
        <div className="relative z-10">
          <PromoBanner />
        </div>
      )}

      {/* =========================
          VIP 3D CINEMA EXPERIENCE
      ========================= */}
      {!searchQuery && (
        <div className="relative z-10">
          <VIPCinema3DSection />
        </div>
      )}

      {/* =========================
          LIVE EVENTS
      ========================= */}

      <div className="relative z-10">
        <LiveEventsSection events={data.events} />
      </div>

      {/* =========================
          STREAM / PREMIERES
      ========================= */}

      {!searchQuery && (
        <div className="relative z-10">
          <StreamSection premieres={data.premieres} />
        </div>
      )}

      {/* =========================
          CINEBOT VIP CONCIERGE SPOTLIGHT (3D Interactive)
      ========================= */}
      {!searchQuery && (
        <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10" style={{ perspective: '1200px' }}>
          <div 
            className="rounded-3xl bg-gradient-to-r from-[#171A29] via-[#202538] to-[#171A29] p-6 sm:p-8 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 hover:border-[#F84464]/50 group"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-[#F84464]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-center gap-6 z-10 text-center sm:text-left" style={{ transformStyle: 'preserve-3d' }}>
              <div 
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden p-1 bg-gradient-to-tr from-[#F84464]/50 via-white/25 to-amber-400/50 border border-white/25 shadow-[0_15px_35px_rgba(0,0,0,0.6)] shrink-0 transition-transform duration-500 group-hover:scale-105"
                style={{ transform: 'translateZ(25px)' }}
              >
                <img
                  src="/assets/graphics/cinema_mascot.jpg"
                  alt="CineBot 3D Cinema Concierge"
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>

              <div style={{ transform: 'translateZ(20px)' }}>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F84464]/20 border border-[#F84464]/40 text-[#F84464] text-[10px] font-bold uppercase tracking-wider mb-2 shadow-xs">
                  <Sparkles className="w-3 h-3" />
                  <span>Meet CineBot • Your 3D Cinema Companion</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Hosting a Corporate Premiere or Private Screen?
                </h3>
                <p className="text-xs text-gray-300 mt-1 max-w-xl leading-relaxed">
                  Book entire IMAX or Gold Class auditoriums with custom F&amp;B catering, dedicated red-carpet reception, and priority gate access.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => alert('BookMyShow Private Screenings: Connect with our VIP Concierge team at vip@bookmyshow.com or +91 22 6144 5050 for custom auditoriums.')}
              style={{ transform: 'translateZ(30px)' }}
              className="shrink-0 bg-gradient-to-r from-[#F84464] via-[#ff4769] to-[#E03A58] hover:from-[#ff5576] hover:to-[#eb4464] text-white text-xs sm:text-sm font-bold py-3.5 px-6 rounded-2xl transition-all shadow-[0_8px_25px_rgba(248,68,100,0.5)] active:scale-95 flex items-center gap-2 cursor-pointer z-10 border border-white/20"
            >
              <span>Enquire Private Screen</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

    </main>
  );
}