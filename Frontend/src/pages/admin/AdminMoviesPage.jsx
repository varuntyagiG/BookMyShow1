import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { adminApi } from '../../services/adminApi';
import { useRealtimeRefresh } from '../../services/realtimeSync';
import {
  Film,
  Search,
  Plus,
  Star,
  Sparkles,
  Trash2,
  Edit,
  Clock,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw
} from 'lucide-react';

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [modalError, setModalError] = useState('');

  // Form State
  const initialFormState = {
    title: '',
    description: '',
    duration: 120,
    genre: 'Action, Thriller',
    language: 'Hindi, English',
    releaseDate: new Date().toISOString().split('T')[0],
    rating: 8.5,
    posterUrl: '',
    bannerUrl: '',
    trailerUrl: '',
    isPromoted: false,
    status: 'published'
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getMovies({ search, genre: genreFilter });
      if (res.success && res.data) {
        setMovies(res.data);
      }
    } catch (err) {
      console.error('Failed to load movies:', err);
    } finally {
      setLoading(false);
    }
  }, [search, genreFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMovies();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchMovies]);

  // Real-time reactive sync across tabs & portals
  useRealtimeRefresh(['MOVIE_MUTATION'], () => {
    fetchMovies();
  });

  const handleOpenAdd = () => {
    setEditingMovie(null);
    setFormData(initialFormState);
    setModalError('');
    setShowModal(true);
  };

  const handleOpenEdit = (movie) => {
    setEditingMovie(movie);
    setModalError('');
    setFormData({
      title: movie.title || '',
      description: movie.description || '',
      duration: movie.duration || 120,
      genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : (movie.genre || ''),
      language: Array.isArray(movie.language) ? movie.language.join(', ') : (movie.language || ''),
      releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().split('T')[0] : '',
      rating: movie.rating || 8.0,
      posterUrl: movie.posterUrl || '',
      bannerUrl: movie.bannerUrl || '',
      trailerUrl: movie.trailerUrl || '',
      isPromoted: !!movie.isPromoted,
      status: movie.status === 'released' ? 'published' : (movie.status || 'published')
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalError('');
    try {
      const payload = {
        ...formData,
        genre: formData.genre.split(',').map(g => g.trim()).filter(Boolean),
        language: formData.language.trim() || 'Hindi',
        duration: Number(formData.duration) || 120,
        rating: Number(formData.rating) || 8.0,
        status: 'published'
      };

      if (editingMovie) {
        await adminApi.updateMovie(editingMovie._id || editingMovie.id, payload);
        setToastMessage('Movie updated successfully in registry');
      } else {
        await adminApi.createMovie(payload);
        setToastMessage('New movie title published to Central Registry');
      }

      setShowModal(false);
      setTimeout(() => setToastMessage(null), 3000);
      fetchMovies();
    } catch (err) {
      setModalError(err.message || 'Failed to save movie');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePromote = async (movieId) => {
    try {
      const res = await adminApi.togglePromoteMovie(movieId);
      if (res.success) {
        setToastMessage(res.message || 'Carousel Spotlight updated');
        setTimeout(() => setToastMessage(null), 3000);
        fetchMovies();
      }
    } catch (err) {
      alert(err.message || 'Failed to update spotlight');
    }
  };

  const handleDeleteMovie = async (movieId, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}" from the registry?`)) {
      return;
    }
    try {
      await adminApi.deleteMovie(movieId);
      setToastMessage('Movie removed from platform catalog');
      setTimeout(() => setToastMessage(null), 3000);
      fetchMovies();
    } catch (err) {
      alert(err.message || 'Failed to delete movie');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Film size={16} className="text-[#F84464]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Master CineData Registry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Central Film Registry CMS
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Manage global movie catalog metadata & spotlight titles on the customer homepage carousel
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-[#F84464] hover:bg-[#d83552] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition"
          >
            <Plus size={16} />
            <span>Add New Film</span>
          </button>

          <button
            onClick={() => fetchMovies()}
            className="p-2 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 rounded-xl border border-gray-300 shadow-sm transition"
            title="Refresh List"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-[#F84464]' : ''} />
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search movie titles across registry..."
            className="w-full bg-white border border-gray-300 focus:border-[#F84464] text-gray-900 pl-10 pr-4 py-2.5 rounded-xl text-sm placeholder:text-gray-400 outline-none shadow-sm"
          />
        </div>

        <select
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
          className="bg-white border border-gray-300 text-gray-700 text-xs font-semibold px-3 py-2.5 rounded-xl outline-none focus:border-[#F84464] shadow-sm"
        >
          <option value="all">All Genres</option>
          <option value="Action">Action</option>
          <option value="Drama">Drama</option>
          <option value="Sci-Fi">Sci-Fi</option>
          <option value="Comedy">Comedy</option>
          <option value="Thriller">Thriller</option>
          <option value="Romance">Romance</option>
        </select>
      </div>

      {/* Film Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-[#F84464] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Loading CineData Film Registry...</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500 shadow-sm">
          <Film size={36} className="mx-auto text-gray-400 mb-3" />
          <p className="text-sm font-semibold text-gray-700">No films match your search</p>
          <p className="text-xs text-gray-500 mt-1">Try clearing filters or add a new film entry.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((m) => {
            const movieId = m._id || m.id;
            return (
              <motion.div
                key={movieId}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="flex flex-col group w-full"
              >
                {/* Poster wrapper with Customer Storefront styling */}
                <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-gray-200 shadow-sm border border-gray-100 group-hover:shadow-xl group-hover:border-gray-200 transition-all duration-300">
                  <img
                    src={m.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop'}
                    alt={m.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop';
                    }}
                  />

                  {/* Top Badges: Promoted Pill & Spotlight Toggle */}
                  <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                    {m.isPromoted ? (
                      <div className="bg-[#F84464] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md pointer-events-auto flex items-center gap-1">
                        <Sparkles size={10} className="fill-current text-white" />
                        <span>PROMOTED</span>
                      </div>
                    ) : (
                      <span className="bg-black/40 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {m.certificate || 'UA'}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePromote(movieId);
                      }}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md pointer-events-auto transition-all cursor-pointer ${
                        m.isPromoted
                          ? 'bg-amber-400 text-amber-950 shadow-amber-400/30'
                          : 'bg-black/60 hover:bg-black/80 text-white/90 backdrop-blur-xs'
                      }`}
                      title="Click to toggle Homepage Spotlight"
                    >
                      <Sparkles size={11} className={m.isPromoted ? 'fill-current text-amber-950' : 'text-amber-400'} />
                      <span>{m.isPromoted ? 'Spotlight ON' : 'Spotlight'}</span>
                    </button>
                  </div>

                  {/* Rating Overlay at bottom of poster with gradient */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-8 pb-2.5 px-3 flex items-center justify-between text-white pointer-events-none">
                    <div className="flex items-center gap-1.5 font-black text-xs">
                      <Star className="w-3.5 h-3.5 fill-[#F84464] text-[#F84464]" />
                      <span className="tracking-wide text-white">{m.rating || '8.0'}/10</span>
                    </div>
                    <span className="text-[11px] text-gray-300 font-medium">
                      {m.voteCount || (m.duration ? `${m.duration} min` : '10K Votes')}
                    </span>
                  </div>
                </div>

                {/* Details below poster */}
                <div className="mt-3 px-1 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#F84464] transition-colors truncate tracking-tight"
                      title={m.title}
                    >
                      {m.title}
                    </h3>

                    <p className="text-xs text-gray-500 truncate mt-0.5 font-medium">
                      {Array.isArray(m.genre) ? m.genre.join(', ') : (m.genre || 'Action, Thriller')}
                    </p>

                    {/* Format, Certificate, and Language badges */}
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-gray-600 font-semibold flex-wrap">
                      {m.certificate && (
                        <span className="border border-gray-300 bg-gray-50 px-1.5 py-0.2 rounded text-[9px] text-gray-700">
                          {m.certificate}
                        </span>
                      )}
                      <span className="text-gray-500 truncate max-w-[120px]">
                        {Array.isArray(m.language) ? m.language.join(', ') : (m.language || 'Hindi')}
                      </span>
                      {m.formats && m.formats.length > 0 && (
                        <span className="text-[#F84464] font-bold">
                          • {m.formats[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Administrative Action Row */}
                  <div className="mt-3 pt-2.5 border-t border-gray-200/70 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="flex-1 py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Edit size={13} />
                      <span>Edit Film</span>
                    </button>

                    <button
                      onClick={() => handleDeleteMovie(movieId, m.title)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 transition cursor-pointer"
                      title="Delete Film"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Movie Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Film size={18} className="text-[#F84464]" />
                <span>{editingMovie ? 'Edit CineData Registry Entry' : 'Add New Film to Catalog'}</span>
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-center justify-between">
                  <span>{modalError}</span>
                  <button
                    type="button"
                    onClick={() => setModalError('')}
                    className="text-rose-500 hover:text-rose-800 ml-2 font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Movie Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Gladiator II"
                  className="w-full bg-white border border-gray-300 text-gray-900 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-[#F84464]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Description / Synopsis
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief synopsis of the film..."
                  className="w-full bg-white border border-gray-300 text-gray-900 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-[#F84464] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-900 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-[#F84464]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Rating (1-10)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-900 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-[#F84464]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Genres (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    placeholder="Action, Sci-Fi"
                    className="w-full bg-white border border-gray-300 text-gray-900 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-[#F84464]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Languages (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    placeholder="Hindi, English"
                    className="w-full bg-white border border-gray-300 text-gray-900 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-[#F84464]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Poster Image URL
                </label>
                <input
                  type="url"
                  value={formData.posterUrl}
                  onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-white border border-gray-300 text-gray-900 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-[#F84464]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Carousel Wide Banner URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.bannerUrl}
                  onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-white border border-gray-300 text-gray-900 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-[#F84464]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="promoteCheck"
                  checked={formData.isPromoted}
                  onChange={(e) => setFormData({ ...formData, isPromoted: e.target.checked })}
                  className="w-4 h-4 rounded text-[#F84464] focus:ring-[#F84464] border-gray-300"
                />
                <label htmlFor="promoteCheck" className="text-xs font-bold text-gray-700 flex items-center gap-1.5 cursor-pointer">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Spotlight on Customer Homepage Carousel (Featured Premiere)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#F84464] hover:bg-[#d83552] rounded-xl shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingMovie ? 'Update Registry' : 'Publish Title'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
