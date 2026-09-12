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
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

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
      <div className="min-h-[65vh] flex flex-col items-center justify-center bg-[#F5F5FA] px-4">
        <div className="flex flex-col items-center justify-center bg-white rounded-2xl px-10 py-9 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.1)] border border-gray-100">

          <div className="w-16 h-16 rounded-full bg-[#F84464]/10 flex items-center justify-center mb-5">
            <Loader2 className="w-8 h-8 text-[#F84464] animate-spin" />
          </div>

          <p className="text-base font-semibold text-[#222432]">
            Discovering entertainment
          </p>

          <p className="text-sm text-gray-500 mt-2 text-center">
            Finding movies, shows &amp; events in{' '}
            <span className="font-semibold text-gray-700">
              {selectedCity}
            </span>
          </p>

          <div className="flex items-center gap-1.5 mt-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F84464] animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#F84464] animate-pulse [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#F84464] animate-pulse [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 min-h-screen bg-[#F5F5FA] text-[#333545]">

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
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4">

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

              <span className="font-semibold text-[#222432]">
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
        <section className="w-full bg-[#222432]">
          <HeroCarousel banners={data.banners} />
        </section>
      )}

      {/* =========================
          MOVIES SECTION
      ========================= */}

      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        <div className="mb-6">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-[11px] sm:text-xs uppercase tracking-[1.5px] text-gray-400 font-bold mb-1.5">
                Top picks for you
              </p>

              <h2 className="text-xl sm:text-2xl font-bold text-[#222432] tracking-tight">
                Recommended Movies
              </h2>
            </div>

            <button
              onClick={() => navigate('/movies')}
              className="
                hidden sm:flex
                items-center
                gap-1
                text-sm
                font-semibold
                text-[#F84464]
                hover:text-[#E03A58]
                transition-colors duration-150
                cursor-pointer
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F84464] focus-visible:outline-offset-2 rounded
              "
            >
              See All
              <span className="text-base leading-none">›</span>
            </button>

          </div>

          <div className="w-10 h-1 bg-[#F84464] rounded-full mt-3" />

        </div>

        <div className="rounded-xl">
          <MovieSection
            movies={data.movies}
            onMovieClick={(movie) => {
              navigate(`/movies/${movie.id}`);
            }}
          />
        </div>

      </section>

      {/* =========================
          PROMOTIONAL BANNER
      ========================= */}

      {!searchQuery && (
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-9">

          <div className="
            rounded-xl
            overflow-hidden
            shadow-[0_4px_16px_-6px_rgba(0,0,0,0.1)]
            hover:shadow-[0_10px_28px_-8px_rgba(0,0,0,0.15)]
            transition-shadow duration-300
          ">
            <PromoBanner />
          </div>

        </section>
      )}

      {/* =========================
          LIVE EVENTS
      ========================= */}

      <section className="py-9 sm:py-11">

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-6">

            <p className="text-[11px] sm:text-xs uppercase tracking-[1.5px] text-gray-400 font-bold mb-1.5">
              Explore something new
            </p>

            <div className="flex items-center justify-between">

              <h2 className="text-xl sm:text-2xl font-bold text-[#222432] tracking-tight">
                The Best Of Live Events
              </h2>

              <span className="hidden sm:block text-sm text-[#F84464] font-semibold">
                Explore All ›
              </span>

            </div>

            <div className="w-10 h-1 bg-[#F84464] rounded-full mt-3" />

          </div>

          <LiveEventsSection events={data.events} />

        </div>

      </section>

      {/* =========================
          STREAM / PREMIERES
      ========================= */}

      {!searchQuery && (
        <section className="
          relative
          bg-[#121216]
          py-10 sm:py-12
          overflow-hidden
        ">

          {/* Background decoration */}
          <div className="
            absolute
            -top-24
            -right-24
            w-72
            h-72
            rounded-full
            bg-[#F84464]/10
            blur-3xl
            pointer-events-none
          " />

          <div className="
            absolute
            -bottom-32
            -left-20
            w-80
            h-80
            rounded-full
            bg-[#333545]/40
            blur-3xl
            pointer-events-none
          " />

          <div className="
            relative
            max-w-[1200px]
            mx-auto
            px-4
            sm:px-6
            lg:px-8
          ">
            <StreamSection premieres={data.premieres} />
          </div>

        </section>
      )}

    </main>
  );
}