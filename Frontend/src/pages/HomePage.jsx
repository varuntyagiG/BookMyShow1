import React, { useState, useEffect } from 'react';
import { contentApi } from '../services/api';
import { useCity } from '../context/CityContext';
import HeroCarousel from '../components/home/HeroCarousel';
import MovieSection from '../components/home/MovieSection';
import LiveEventsSection from '../components/home/LiveEventsSection';
import StreamSection from '../components/home/StreamSection';
import PromoBanner from '../components/home/PromoBanner';
import { Loader2 } from 'lucide-react';

export default function HomePage({ searchQuery }) {
  const { selectedCity } = useCity();
  const [data, setData] = useState({
    banners: [],
    movies: [],
    events: [],
    premieres: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadHomeContent() {
      setLoading(true);
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
        setError('Could not connect to the backend server. Please make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    }

    loadHomeContent();
  }, [selectedCity, searchQuery]);

  if (loading && !data.movies.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#F84464] animate-spin mb-3" />
        <p className="text-sm text-gray-500 font-medium">Loading entertainment in {selectedCity}...</p>
      </div>
    );
  }

  return (
    <main className="flex-1">
      {/* Search notification when active */}
      {searchQuery && (
        <div className="bg-red-50 border-b border-red-100 py-3 px-4 text-center">
          <p className="text-xs text-red-700">
            Showing search results for "<span className="font-bold">{searchQuery}</span>" in {selectedCity}
          </p>
        </div>
      )}

      {/* Hero Banner Carousel (hidden if search is active) */}
      {!searchQuery && data.banners && (
        <HeroCarousel banners={data.banners} />
      )}

      {/* Recommended Movies Section */}
      <MovieSection
        movies={data.movies}
        onMovieClick={(movie) => {
          alert(`🎬 ${movie.title}\n\nRating: ${movie.rating}/10 (${movie.voteCount})\nDuration: ${movie.duration}\nCertificate: ${movie.certificate}\nLanguages: ${movie.language}\n\nProceed to Seat Selection & Booking!`);
        }}
      />

      {/* Promotional Banner */}
      {!searchQuery && <PromoBanner />}

      {/* Live Events Section */}
      <LiveEventsSection events={data.events} />

      {/* BookMyShow Stream / Premieres (Signature Dark Section) */}
      {!searchQuery && <StreamSection premieres={data.premieres} />}
    </main>
  );
}

