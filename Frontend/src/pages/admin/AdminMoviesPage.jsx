import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import {
  Film,
  Search,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Calendar,
  Star,
  CheckCircle,
  Archive,
  X,
  Sparkles
} from 'lucide-react';

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Add / Edit Modal State
  const [modal, setModal] = useState({
    isOpen: false,
    isEdit: false,
    movieId: null,
    submitting: false,
    formData: {
      title: '',
      synopsis: '',
      genre: 'Action, Adventure',
      language: 'Hindi',
      certificate: 'UA',
      duration: '2h 30m',
      releaseDate: 'Coming Soon',
      rating: 8.5,
      posterUrl: '',
      backdropUrl: '',
      formats: '2D, 3D, IMAX',
      cities: 'Mumbai, Delhi-NCR, Bengaluru',
      status: 'published'
    }
  });

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getMovies({ search, status: statusFilter });
      if (res.success) {
        setMovies(res.movies || []);
      }
    } catch (err) {
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [search, statusFilter]);

  const handleOpenAdd = () => {
    setModal({
      isOpen: true,
      isEdit: false,
      movieId: null,
      submitting: false,
      formData: {
        title: '',
        synopsis: '',
        genre: 'Action, Adventure',
        language: 'Hindi',
        certificate: 'UA',
        duration: '2h 30m',
        releaseDate: '15 Oct, 2026',
        rating: 8.5,
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
        backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop',
        formats: '2D, 3D, IMAX',
        cities: 'Mumbai, Delhi-NCR, Bengaluru',
        status: 'published'
      }
    });
  };

  const handleOpenEdit = (movie) => {
    setModal({
      isOpen: true,
      isEdit: true,
      movieId: movie._id,
      submitting: false,
      formData: {
        title: movie.title || '',
        synopsis: movie.synopsis || '',
        genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : (movie.genre || ''),
        language: movie.language || 'Hindi',
        certificate: movie.certificate || 'UA',
        duration: movie.duration || '',
        releaseDate: movie.releaseDate || '',
        rating: movie.rating || 8.0,
        posterUrl: movie.posterUrl || '',
        backdropUrl: movie.backdropUrl || '',
        formats: Array.isArray(movie.formats) ? movie.formats.join(', ') : '2D',
        cities: Array.isArray(movie.cities) ? movie.cities.join(', ') : 'Mumbai',
        status: movie.status || 'published'
      }
    });
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    setModal((prev) => ({ ...prev, submitting: true }));

    try {
      const payload = {
        ...modal.formData,
        genre: modal.formData.genre.split(',').map((g) => g.trim()).filter(Boolean),
        formats: modal.formData.formats.split(',').map((f) => f.trim()).filter(Boolean),
        cities: modal.formData.cities.split(',').map((c) => c.trim()).filter(Boolean),
        rating: Number(modal.formData.rating) || 8.0
      };

      if (modal.isEdit) {
        const res = await adminApi.updateMovie(modal.movieId, payload);
        if (res.success) {
          fetchMovies();
          setModal({ isOpen: false, isEdit: false, movieId: null, submitting: false, formData: {} });
        }
      } else {
        const res = await adminApi.createMovie(payload);
        if (res.success) {
          fetchMovies();
          setModal({ isOpen: false, isEdit: false, movieId: null, submitting: false, formData: {} });
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to save movie record.');
      setModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleArchive = async (movie) => {
    if (!window.confirm(`Archive "${movie.title}"? Cinema partners will no longer be able to schedule new shows for this movie.`)) return;
    try {
      const res = await adminApi.deleteMovie(movie._id);
      if (res.success) {
        fetchMovies();
      }
    } catch (err) {
      alert(err.message || 'Failed to archive movie.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#222432] tracking-tight flex items-center gap-2">
            <Film className="w-6 h-6 text-[#F84464]" />
            <span>Global Movie Master Catalog</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Global theatrical titles curated for all B2B Cinema Partners to schedule and screen.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold transition shadow-lg shadow-[#F84464]/30 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Master Release</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#EEEEF2] p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search movie title, language, or genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#222432] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-gray-500">Catalog Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-xs text-[#222432] font-semibold px-3 py-2 rounded-xl focus:bg-white focus:outline-none focus:border-[#F84464] transition"
          >
            <option value="all">All Releases</option>
            <option value="published">Published &amp; Active</option>
            <option value="draft">Drafts</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-400">
          <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mx-auto mb-2" />
          <p className="text-xs">Loading global movie catalog...</p>
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {movies.map((movie) => (
            <div
              key={movie._id}
              className="bg-white border border-[#EEEEF2] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                {/* Poster Canvas */}
                <div className="relative aspect-16/9 bg-gray-100 overflow-hidden">
                  <img
                    src={movie.backdropUrl || movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

                  {/* Rating Chip */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-[#4ABD5D]">
                    <Star className="w-3.5 h-3.5 fill-[#4ABD5D]" />
                    <span>{movie.rating}/10</span>
                  </div>

                  {/* Certificate */}
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded">
                    {movie.certificate}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-[#222432] text-sm leading-snug line-clamp-1">{movie.title}</h3>
                  <div className="text-[11px] text-gray-500 mt-1 line-clamp-1">
                    {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre} • {movie.language}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    Duration: {movie.duration || '2h'} • Release: {movie.releaseDate}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-gray-500 text-[11px]">Partner Screenings:</span>
                    <span className="font-mono font-bold text-[#F84464] bg-[#F84464]/10 px-2 py-0.5 rounded">
                      {movie.activeShowsCount || 0} Shows Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenEdit(movie)}
                  className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#222432] text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Metadata</span>
                </button>
                <button
                  onClick={() => handleArchive(movie)}
                  className="p-2 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-xl transition cursor-pointer"
                  title="Archive Movie"
                >
                  <Archive className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#EEEEF2] rounded-3xl p-12 text-center text-gray-400 shadow-sm">
          No movies found matching criteria.
        </div>
      )}

      {/* Add / Edit Movie Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-[#EEEEF2] rounded-3xl p-6 shadow-2xl my-8 text-[#222432]">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <h3 className="text-base font-black text-[#222432]">
                {modal.isEdit ? 'Edit Movie Master Record' : 'Add New Movie to Master Catalog'}
              </h3>
              <button
                onClick={() => setModal({ isOpen: false, isEdit: false, movieId: null, submitting: false, formData: {} })}
                className="p-1.5 text-gray-400 hover:text-[#222432] hover:bg-gray-100 rounded-lg cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Movie Title *</label>
                  <input
                    type="text"
                    value={modal.formData.title}
                    onChange={(e) => setModal((prev) => ({ ...prev, formData: { ...prev.formData, title: e.target.value } }))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Language *</label>
                  <input
                    type="text"
                    value={modal.formData.language}
                    onChange={(e) => setModal((prev) => ({ ...prev, formData: { ...prev.formData, language: e.target.value } }))}
                    placeholder="e.g. Hindi, English"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Certificate *</label>
                  <select
                    value={modal.formData.certificate}
                    onChange={(e) => setModal((prev) => ({ ...prev, formData: { ...prev.formData, certificate: e.target.value } }))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] transition"
                  >
                    <option value="U">U (Universal)</option>
                    <option value="UA">UA (Parental Guidance)</option>
                    <option value="UA16+">UA16+</option>
                    <option value="A">A (Adults Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Duration *</label>
                  <input
                    type="text"
                    value={modal.formData.duration}
                    onChange={(e) => setModal((prev) => ({ ...prev, formData: { ...prev.formData, duration: e.target.value } }))}
                    placeholder="e.g. 2h 45m"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Rating Score</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={modal.formData.rating}
                    onChange={(e) => setModal((prev) => ({ ...prev, formData: { ...prev.formData, rating: e.target.value } }))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Genres (comma separated)</label>
                <input
                  type="text"
                  value={modal.formData.genre}
                  onChange={(e) => setModal((prev) => ({ ...prev, formData: { ...prev.formData, genre: e.target.value } }))}
                  placeholder="Action, Sci-Fi, Thriller"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Synopsis / Storyline</label>
                <textarea
                  rows="3"
                  value={modal.formData.synopsis}
                  onChange={(e) => setModal((prev) => ({ ...prev, formData: { ...prev.formData, synopsis: e.target.value } }))}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Poster Image URL</label>
                  <input
                    type="url"
                    value={modal.formData.posterUrl}
                    onChange={(e) => setModal((prev) => ({ ...prev, formData: { ...prev.formData, posterUrl: e.target.value } }))}
                    placeholder="https://..."
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Backdrop Image URL</label>
                  <input
                    type="url"
                    value={modal.formData.backdropUrl}
                    onChange={(e) => setModal((prev) => ({ ...prev, formData: { ...prev.formData, backdropUrl: e.target.value } }))}
                    placeholder="https://..."
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModal({ isOpen: false, isEdit: false, movieId: null, submitting: false, formData: {} })}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#222432] rounded-xl font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modal.submitting}
                  className="flex-1 py-2.5 bg-[#F84464] hover:bg-[#E03A58] text-white rounded-xl font-bold transition shadow-lg shadow-[#F84464]/30 cursor-pointer"
                >
                  {modal.submitting ? 'Saving...' : modal.isEdit ? 'Save Changes' : 'Publish Movie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

