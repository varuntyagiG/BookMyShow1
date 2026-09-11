import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cinemaPartnerApi } from '../../services/cinemaPartnerApi';
import { useCinemaToast } from '../../components/cinemaPartner/CinemaPartnerToastContext';
import {
  Film,
  Search,
  Calendar,
  Clock,
  Star,
  Plus,
  Sparkles
} from 'lucide-react';
import {
  PageHeader,
  Button,
  Card,
  Badge,
  Input,
  Select,
  EmptyState,
  Skeleton
} from '../../components/ui';

export default function CinemaPartnerMoviesPage() {
  const toast = useCinemaToast();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const res = await cinemaPartnerApi.getAvailableMovies();
        if (res.success && res.movies) {
          setMovies(res.movies);
        }
      } catch (err) {
        toast.error('Catalog Error', err.message || 'Failed to load movie catalog.');
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, []);

  const languages = ['All', ...Array.from(new Set(movies.map((m) => m.language).filter(Boolean)))];

  const filteredMovies = movies.filter((m) => {
    const matchesSearch =
      m.title?.toLowerCase().includes(search.toLowerCase()) ||
      m.genre?.some((g) => g.toLowerCase().includes(search.toLowerCase()));
    const matchesLang = selectedLanguage === 'All' || m.language === selectedLanguage;
    return matchesSearch && matchesLang;
  });

  const handleScheduleShow = (movie) => {
    navigate(`/cinema-partner/shows?movieId=${movie._id}&movieTitle=${encodeURIComponent(movie.title)}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Header */}
      <PageHeader
        title="Verified Theatrical Releases Catalog"
        subtitle="Browse certified movie titles to program showtimes and sell tickets across your auditoriums."
        icon={Film}
        badge="Title Catalog"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-56">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search releases or genres..."
                icon={Search}
              />
            </div>
            <div className="w-36">
              <Select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                options={languages.map((l) => ({ value: l, label: l }))}
              />
            </div>
          </div>
        }
      />

      {/* Movies Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-3xl" />
          ))}
        </div>
      ) : filteredMovies.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            icon={Film}
            title="No Theatrical Releases Found"
            description="Try changing your search query or language filter."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <Card
              key={movie._id}
              className="overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300 group"
            >
              <div>
                {/* Poster Container matching Customer Panel */}
                <div className="aspect-2/3 w-full bg-gray-100 relative overflow-hidden">
                  {movie.posterUrl ? (
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Film className="w-8 h-8" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {movie.certificate && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-[#222432]/90 text-white font-black text-[9px] uppercase backdrop-blur-xs border border-white/10">
                      {movie.certificate}
                    </span>
                  )}

                  {movie.rating && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-[#4ABD5D] text-white font-black text-[11px] flex items-center gap-1 shadow-md">
                      <Star className="w-3 h-3 fill-white text-white" />
                      <span>{movie.rating}/10</span>
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-4">
                  <h3 className="text-sm font-black text-[#222432] group-hover:text-[#F84464] transition-colors leading-snug line-clamp-1">
                    {movie.title}
                  </h3>

                  <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1 font-medium">
                    <span>{movie.language || 'Hindi'}</span>
                    <span>•</span>
                    <span>{movie.duration || '2h 30m'}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {(movie.genre || []).slice(0, 2).map((g, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-semibold border border-gray-200/60"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 pt-0">
                <Button
                  variant="primary"
                  size="md"
                  icon={Calendar}
                  className="w-full justify-center shadow-md shadow-[#F84464]/25"
                  onClick={() => handleScheduleShow(movie)}
                >
                  Schedule Screening
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
