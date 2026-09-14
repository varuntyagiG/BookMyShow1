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
import MultiplexTicker from '../components/home/MultiplexTicker';
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
     LOADING UI
  ========================= */

  if (loading && !data.movies.length) {
    return (
      <main className="flex-1 min-h-screen bg-[#F5F5FA] py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Shimmer Status */}
        <div className="flex items-center gap-2 mb-6 px-1">
          <span className="w-2 h-2 rounded-full bg-[#F84464] animate-pulse" />
          <span className="text-xs font-semibold text-gray-500">
            Fetching blockbusters &amp; experiences in <strong className="text-gray-800">{selectedCity}</strong>...
          </span>
        </div>

        {/* Hero Carousel Skeleton */}
        <div className="w-full h-56 sm:h-72 md:h-80 rounded-2xl bg-gray-200 animate-pulse mb-10 shadow-xs" />

        {/* Recommended Movies Header Skeleton */}
        <div className="flex items-center justify-between mb-5 px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 bg-[#F84464] rounded-full" />
            <div className="w-48 h-6 rounded-lg bg-gray-200 animate-pulse" />
          </div>
          <div className="w-16 h-4 rounded-md bg-gray-200 animate-pulse hidden sm:block" />
        </div>

        {/* 5-Column Movie Poster Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 mb-12">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex flex-col gap-2.5">
              <div className="w-full aspect-[2/3] rounded-xl bg-gray-200 animate-pulse shadow-xs" />
              <div className="w-4/5 h-4 rounded-md bg-gray-200 animate-pulse" />
              <div className="w-1/2 h-3 rounded-md bg-gray-200 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Live Events Section Skeleton */}
        <div className="flex items-center justify-between mb-5 px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 bg-[#F84464] rounded-full" />
            <div className="w-40 h-6 rounded-lg bg-gray-200 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex flex-col gap-2.5">
              <div className="w-full aspect-[2/3] rounded-xl bg-gray-200 animate-pulse shadow-xs" />
              <div className="w-3/4 h-4 rounded-md bg-gray-200 animate-pulse" />
              <div className="w-2/5 h-3 rounded-md bg-gray-200 animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 min-h-screen bg-[#F5F5FA] text-[#222432]">

      {/* =========================
          BACKEND ERROR
      ========================= */}

      {error && (
        <div className="bg-[#F84464]/[0.06] border-b border-[#F84464]/20">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-center gap-3">

            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#B4233D]">
              <div className="w-7 h-7 rounded-full bg-[#F84464]/15 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 text-[#F84464]" />
              </div>

              <span>{error}</span>
            </div>

            <button
              onClick={loadHomeContent}
              className="
                flex items-center gap-1.5
                px-3.5 py-1.5
                rounded-md
                text-xs font-bold
                text-[#F84464]
                bg-white
                border border-[#F84464]
                hover:bg-[#F84464]
                hover:text-white
                active:scale-[0.97]
                transition-all duration-200
                cursor-pointer
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464] focus-visible:outline-offset-2
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
        <div className="bg-white border-b border-gray-200 shadow-xs">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3.5">

            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs sm:text-sm">

              <span className="text-gray-500">
                Showing search results for
              </span>

              <span className="font-bold text-[#F84464]">
                "{searchQuery}"
              </span>

              <span className="text-gray-500">
                in
              </span>

              <span className="font-semibold text-gray-800">
                {selectedCity}
              </span>

            </div>

          </div>
        </div>
      )}

      {/* =========================
          HERO SECTION
      ========================= */}

      {!searchQuery && data.banners && (
        <section className="w-full bg-[#EBEBF2]">
          <HeroCarousel banners={data.banners} />
        </section>
      )}

      {/* =========================
          REAL-TIME MULTIPLEX VITALITY TICKER
      ========================= */}
      <MultiplexTicker />

      {/* =========================
          3D QUICK CATEGORY DISCOVERY RIBBON
      ========================= */}
      {!searchQuery && (
        <CategoryDiscovery3D />
      )}

      {/* =========================
          MOVIES SECTION
      ========================= */}

      <MovieSection
        movies={data.movies}
        onMovieClick={(movie) => {
          navigate(`/movies/${movie.id}`);
        }}
      />

      {/* =========================
          3D GOURMET CONCESSIONS STRIP
      ========================= */}
      {!searchQuery && (
        <ConcessionsShowcase3D />
      )}

      {/* =========================
          PROMOTIONAL BANNER
      ========================= */}

      {!searchQuery && (
        <PromoBanner />
      )}

      {/* =========================
          VIP 3D CINEMA EXPERIENCE
      ========================= */}
      {!searchQuery && (
        <VIPCinema3DSection />
      )}

      {/* =========================
          LIVE EVENTS
      ========================= */}

      <LiveEventsSection events={data.events} />

      {/* =========================
          STREAM / PREMIERES
      ========================= */}

      {!searchQuery && (
        <StreamSection premieres={data.premieres} />
      )}

      {/* =========================
          CINEBOT VIP CONCIERGE SPOTLIGHT (3D Interactive)
      ========================= */}
      {!searchQuery && (
        <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" style={{ perspective: '1200px' }}>
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
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F84464]/20 border border-[#F84464]/40 text-[#F84464] text-[10px] font-black uppercase tracking-wider mb-2 shadow-xs">
                  <Sparkles className="w-3 h-3" />
                  <span>Meet CineBot • Your 3D Cinema Companion</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
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
              className="shrink-0 bg-gradient-to-r from-[#F84464] via-[#ff4769] to-[#E03A58] hover:from-[#ff5576] hover:to-[#eb4464] text-white text-xs font-black py-3.5 px-6 rounded-2xl transition-all shadow-[0_8px_25px_rgba(248,68,100,0.5)] active:scale-95 flex items-center gap-2 cursor-pointer z-10 border border-white/20"
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