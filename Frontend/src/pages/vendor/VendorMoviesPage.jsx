import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { vendorApi } from '../../services/vendorApi';
import { useRealtimeRefresh } from '../../services/realtimeSync';
import {
  PageHeader,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Modal,
  Input,
  Select,
  EmptyState
} from '../../components/ui';
import {
  Film,
  Plus,
  Calendar,
  Star,
  Clock,
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const GENRE_OPTIONS = ['Action', 'Sci-Fi', 'Drama', 'Comedy', 'Thriller', 'Adventure', 'Romance', 'Horror', 'Animation'];
const LANGUAGE_OPTIONS = ['Hindi', 'English', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Punjabi'];
const CERTIFICATE_OPTIONS = ['U', 'UA', 'A'];
const FORMAT_OPTIONS = ['2D', '3D', 'IMAX 2D', 'IMAX 3D', '4DX'];

const DEMO_POSTERS = [
  {
    label: 'Sci-Fi Space',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: 'Action Thriller',
    url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: 'Neon Cyberpunk',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: 'Cinematic Drama',
    url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80'
  }
];

export default function VendorMoviesPage() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'mine'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    synopsis: '',
    genre: ['Action', 'Thriller'],
    language: 'Hindi',
    certificate: 'UA',
    duration: '2h 30m',
    rating: '8.5',
    posterUrl: DEMO_POSTERS[0].url,
    formats: ['2D', 'IMAX 2D'],
    cities: ['Mumbai', 'Delhi-NCR', 'Bengaluru']
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchMovies = async () => {
    try {
      const res = await vendorApi.getMovies();
      if (res.success && res.data) {
        setMovies(res.data);
      }
    } catch (err) {
      console.error('Failed to load movies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // Real-time reactive sync across tabs & portals
  useRealtimeRefresh(['MOVIE_MUTATION'], () => {
    fetchMovies();
  });

  const openAddModal = () => {
    setFormData({
      title: '',
      synopsis: '',
      genre: ['Action', 'Thriller'],
      language: 'Hindi',
      certificate: 'UA',
      duration: '2h 30m',
      rating: '8.5',
      posterUrl: DEMO_POSTERS[0].url,
      formats: ['2D', 'IMAX 2D'],
      cities: ['Mumbai', 'Delhi-NCR', 'Bengaluru']
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const toggleGenre = (g) => {
    setFormData(prev => ({
      ...prev,
      genre: prev.genre.includes(g)
        ? prev.genre.filter(item => item !== g)
        : [...prev.genre, g]
    }));
  };

  const toggleFormat = (fmt) => {
    setFormData(prev => ({
      ...prev,
      formats: prev.formats.includes(fmt)
        ? prev.formats.filter(item => item !== fmt)
        : [...prev.formats, fmt]
    }));
  };

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      setFormError('Movie title is required.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      const res = await vendorApi.createMovie(formData);
      if (res.success) {
        setIsAddModalOpen(false);
        await fetchMovies();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to publish movie.');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredMovies = movies.filter(m => {
    if (filterType === 'mine') return m.isCreatedByYou;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Movie Catalog & Scheduling
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse active platform releases or publish new titles directly to the BookMyTrip customer network.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={openAddModal}
          className="inline-flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Publish New Movie</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`text-xs px-3.5 py-2 rounded-lg font-semibold transition ${
            filterType === 'all'
              ? 'bg-[#333545] text-white shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          All Catalog Titles ({movies.length})
        </button>

        <button
          onClick={() => setFilterType('mine')}
          className={`text-xs px-3.5 py-2 rounded-lg font-semibold transition ${
            filterType === 'mine'
              ? 'bg-[#F84464] text-white shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Published by Your Chain ({movies.filter(m => m.isCreatedByYou).length})
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-500">
          Loading movie catalog...
        </div>
      ) : filteredMovies.length === 0 ? (
        <EmptyState
          title="No Movies Found"
          description="You can publish a new movie to the platform or schedule existing movies at your multiplexes."
          actionText="Publish Movie"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => {
            const movieId = movie.id || movie._id;
            return (
              <motion.div
                key={movieId}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="flex flex-col group w-full"
              >
                {/* Poster wrapper with Customer Storefront styling */}
                <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-sm border border-slate-200/90 group-hover:shadow-xl group-hover:border-slate-300 transition-all duration-300">
                  <img
                    src={movie.posterUrl || DEMO_POSTERS[0].url}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = DEMO_POSTERS[0].url;
                    }}
                  />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                    {movie.isCreatedByYou ? (
                      <span className="bg-[#F84464] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md border border-white/20">
                        Chain Exclusive
                      </span>
                    ) : (
                      <span className="bg-black/50 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-white/10">
                        {movie.certificate || 'UA'}
                      </span>
                    )}

                    <span className="bg-black/50 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-white/10">
                      {movie.language || 'Hindi'}
                    </span>
                  </div>

                  {/* Rating Overlay at bottom of poster with gradient */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-8 pb-2.5 px-3 flex items-center justify-between text-white pointer-events-none">
                    <div className="flex items-center gap-1.5 font-black text-xs">
                      <Star className="w-3.5 h-3.5 fill-[#F84464] text-[#F84464]" />
                      <span className="tracking-wide text-white">{movie.rating || '8.5'}/10</span>
                    </div>
                    <span className="text-[11px] text-gray-300 font-medium">
                      {movie.duration || '2h 30m'}
                    </span>
                  </div>
                </div>

                {/* Details below poster */}
                <div className="mt-3 px-1 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#F84464] transition-colors truncate tracking-tight"
                      title={movie.title}
                    >
                      {movie.title}
                    </h3>

                    <p className="text-xs text-gray-500 truncate mt-0.5 font-medium">
                      {Array.isArray(movie.genre) ? movie.genre.join(', ') : (movie.genre || 'Action, Thriller')}
                    </p>

                    {/* Format badges */}
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-600 font-semibold flex-wrap">
                      {(movie.formats || ['2D']).slice(0, 3).map((fmt) => (
                        <span
                          key={fmt}
                          className="bg-gray-100 text-gray-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-gray-200"
                        >
                          {fmt}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Vendor Action Row */}
                  <div className="mt-3 pt-2.5 border-t border-gray-200/70 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-gray-500 font-medium">
                      {movie.isCreatedByYou ? 'Your Title' : 'CineData Master'}
                    </span>

                    <Link
                      to={`/vendor/shows?movieId=${movieId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#F84464] hover:bg-[#d83552] px-3.5 py-1.5 rounded-xl transition-all duration-200 shadow-sm cursor-pointer"
                    >
                      <Calendar size={12} />
                      <span>Schedule Shows</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Movie Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Publish New Movie to Platform"
        maxWidth="max-w-xl"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateMovie} className="space-y-4">
          <Input
            label="Movie Title"
            required
            placeholder="e.g. Fighter 2: High Altitude"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Synopsis / Overview
            </label>
            <textarea
              rows={2}
              className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#F84464] focus:border-[#F84464]"
              placeholder="Brief summary of the movie storyline..."
              value={formData.synopsis}
              onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Language"
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              options={LANGUAGE_OPTIONS.map(l => ({ value: l, label: l }))}
            />
            <Select
              label="Certificate"
              value={formData.certificate}
              onChange={(e) => setFormData({ ...formData, certificate: e.target.value })}
              options={CERTIFICATE_OPTIONS.map(c => ({ value: c, label: c }))}
            />
            <Input
              label="Duration"
              placeholder="2h 30m"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Genre (Select applicable)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {GENRE_OPTIONS.map((g) => {
                const isSelected = formData.genre.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
                      isSelected
                        ? 'bg-[#F84464] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Available Formats
            </label>
            <div className="flex flex-wrap gap-2">
              {FORMAT_OPTIONS.map((fmt) => {
                const isSelected = formData.formats.includes(fmt);
                return (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => toggleFormat(fmt)}
                    className={`text-xs px-3 py-1 rounded-md font-semibold border transition ${
                      isSelected
                        ? 'border-[#F84464] bg-rose-50 text-[#F84464]'
                        : 'border-gray-200 bg-white text-gray-700'
                    }`}
                  >
                    {fmt}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Select Preset Poster or Enter Custom URL
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {DEMO_POSTERS.map((p) => (
                <div
                  key={p.label}
                  onClick={() => setFormData({ ...formData, posterUrl: p.url })}
                  className={`cursor-pointer rounded-lg border-2 p-1 overflow-hidden transition ${
                    formData.posterUrl === p.url ? 'border-[#F84464]' : 'border-transparent'
                  }`}
                >
                  <img src={p.url} alt={p.label} className="w-full aspect-[2/3] object-cover rounded" />
                  <p className="text-[10px] text-center text-gray-600 mt-1 line-clamp-1">{p.label}</p>
                </div>
              ))}
            </div>
            <Input
              placeholder="Or paste direct image URL (https://...)"
              value={formData.posterUrl}
              onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={formLoading}
            >
              Publish Live To Customers
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
