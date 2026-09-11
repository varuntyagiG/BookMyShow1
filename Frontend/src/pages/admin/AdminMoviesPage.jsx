import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../services/adminApi';
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
    status: 'released'
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

  const handleOpenAdd = () => {
    setEditingMovie(null);
    setFormData(initialFormState);
    setShowModal(true);
  };

  const handleOpenEdit = (movie) => {
    setEditingMovie(movie);
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
      status: movie.status || 'released'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        genre: formData.genre.split(',').map(g => g.trim()).filter(Boolean),
        language: formData.language.split(',').map(l => l.trim()).filter(Boolean),
        duration: Number(formData.duration),
        rating: Number(formData.rating)
      };

      if (editingMovie) {
        await adminApi.updateMovie(editingMovie._id, payload);
        setToastMessage('Movie updated successfully in registry');
      } else {
        await adminApi.createMovie(payload);
        setToastMessage('New movie title published to Central Registry');
      }

      setShowModal(false);
      setTimeout(() => setToastMessage(null), 3000);
      fetchMovies();
    } catch (err) {
      alert(err.message || 'Failed to save movie');
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#121622] border border-[#23293C] rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Film size={16} className="text-[#F84464]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Master CineData Registry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Central Film Registry CMS
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Manage global movie catalog metadata & spotlight titles on the customer homepage carousel
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-[#F84464] hover:bg-[#d83552] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-[#F84464]/25 transition"
          >
            <Plus size={16} />
            <span>Add New Film</span>
          </button>

          <button
            onClick={() => fetchMovies()}
            className="p-2 bg-[#181D2D] hover:bg-[#22293E] text-gray-300 hover:text-white rounded-xl border border-[#2B344D] transition"
            title="Refresh List"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-[#F84464]' : ''} />
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search movie titles across registry..."
            className="w-full bg-[#121622] border border-[#23293C] focus:border-[#F84464] text-white pl-10 pr-4 py-2.5 rounded-xl text-sm placeholder:text-gray-500 outline-none"
          />
        </div>

        <select
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
          className="bg-[#121622] border border-[#23293C] text-gray-300 text-xs font-semibold px-3 py-2.5 rounded-xl outline-none focus:border-[#F84464]"
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
          <p className="text-xs text-gray-400">Loading CineData Film Registry...</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="bg-[#121622] border border-[#23293C] rounded-2xl p-12 text-center text-gray-400">
          <Film size={36} className="mx-auto text-gray-600 mb-3" />
          <p className="text-sm font-semibold text-gray-300">No films match your search</p>
          <p className="text-xs text-gray-500 mt-1">Try clearing filters or add a new film entry.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {movies.map((m) => (
            <div
              key={m._id}
              className="bg-[#121622] border border-[#23293C] hover:border-[#F84464]/40 rounded-2xl overflow-hidden shadow-lg transition flex flex-col justify-between group"
            >
              <div>
                {/* Poster Container */}
                <div className="relative aspect-[2/3] w-full bg-[#181D2D] overflow-hidden">
                  <img
                    src={m.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop'}
                    alt={m.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop';
                    }}
                  />
                  {/* Rating Tag */}
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1 text-xs font-black text-amber-400">
                    <Star size={12} className="fill-current text-amber-400" />
                    <span>{m.rating || '8.0'}</span>
                  </div>

                  {/* Spotlight Banner Toggle */}
                  <button
                    onClick={() => handleTogglePromote(m._id)}
                    className={`absolute top-3 right-3 px-2 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg transition ${
                      m.isPromoted
                        ? 'bg-amber-500 text-black border-amber-400 font-extrabold shadow-amber-500/30'
                        : 'bg-black/80 text-gray-300 border-white/10 hover:text-white'
                    }`}
                    title="Click to toggle Homepage Spotlight"
                  >
                    <Sparkles size={11} className={m.isPromoted ? 'fill-current' : ''} />
                    <span>{m.isPromoted ? 'Spotlight ON' : 'Spotlight'}</span>
                  </button>
                </div>

                {/* Movie Info */}
                <div className="p-4">
                  <h3 className="text-base font-extrabold text-white truncate" title={m.title}>
                    {m.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {m.duration} min
                    </span>
                    <span>•</span>
                    <span className="text-gray-300">
                      {Array.isArray(m.language) ? m.language.join(', ') : m.language}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                    {m.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 border-t border-[#1C2232] flex items-center justify-between gap-2 mt-2">
                <button
                  onClick={() => handleOpenEdit(m)}
                  className="flex-1 py-1.5 px-3 bg-[#181D2D] hover:bg-[#22293E] text-gray-200 hover:text-white text-xs font-semibold rounded-lg border border-[#2B344D] flex items-center justify-center gap-1.5 transition"
                >
                  <Edit size={13} />
                  <span>Edit Metadata</span>
                </button>

                <button
                  onClick={() => handleDeleteMovie(m._id, m.title)}
                  className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg border border-rose-500/20 transition"
                  title="Delete Movie"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Movie Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#121622] border border-[#23293C] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#23293C]">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Film size={18} className="text-[#F84464]" />
                <span>{editingMovie ? 'Edit CineData Registry Entry' : 'Add New Film to Catalog'}</span>
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1C2132] rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Movie Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Gladiator II"
                  className="w-full bg-[#181D2D] border border-[#2B344D] text-white px-3.5 py-2 rounded-xl text-sm outline-none focus:border-[#F84464]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Description / Synopsis
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief synopsis of the film..."
                  className="w-full bg-[#181D2D] border border-[#2B344D] text-white px-3.5 py-2 rounded-xl text-sm outline-none focus:border-[#F84464] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full bg-[#181D2D] border border-[#2B344D] text-white px-3.5 py-2 rounded-xl text-sm outline-none focus:border-[#F84464]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Rating (1-10)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full bg-[#181D2D] border border-[#2B344D] text-white px-3.5 py-2 rounded-xl text-sm outline-none focus:border-[#F84464]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Genres (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    placeholder="Action, Sci-Fi"
                    className="w-full bg-[#181D2D] border border-[#2B344D] text-white px-3.5 py-2 rounded-xl text-sm outline-none focus:border-[#F84464]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Languages (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    placeholder="Hindi, English"
                    className="w-full bg-[#181D2D] border border-[#2B344D] text-white px-3.5 py-2 rounded-xl text-sm outline-none focus:border-[#F84464]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Poster Image URL
                </label>
                <input
                  type="url"
                  value={formData.posterUrl}
                  onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#181D2D] border border-[#2B344D] text-white px-3.5 py-2 rounded-xl text-sm outline-none focus:border-[#F84464]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Carousel Wide Banner URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.bannerUrl}
                  onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#181D2D] border border-[#2B344D] text-white px-3.5 py-2 rounded-xl text-sm outline-none focus:border-[#F84464]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="promoteCheck"
                  checked={formData.isPromoted}
                  onChange={(e) => setFormData({ ...formData, isPromoted: e.target.checked })}
                  className="w-4 h-4 rounded text-[#F84464] focus:ring-[#F84464] bg-[#181D2D] border-[#2B344D]"
                />
                <label htmlFor="promoteCheck" className="text-xs font-bold text-gray-300 flex items-center gap-1.5 cursor-pointer">
                  <Sparkles size={14} className="text-amber-400" />
                  <span>Spotlight on Customer Homepage Carousel (Featured Premiere)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#23293C]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white bg-[#181D2D] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#F84464] hover:bg-[#d83552] rounded-xl shadow-lg shadow-[#F84464]/20 disabled:opacity-50"
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
