import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { useAdminToast } from '../../components/admin/AdminToastContext';
import AdminConfirmModal from '../../components/admin/AdminConfirmModal';
import AdminPagination from '../../components/admin/AdminPagination';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import AdminMovieCard from '../../components/admin/AdminMovieCard';
import {
  Film,
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  Star,
  Loader2,
  X,
  Eye,
  EyeOff,
  Archive,
  LayoutGrid,
  List,
  Ticket,
  Image as ImageIcon,
  Sparkles,
  Clapperboard,
  SlidersHorizontal
} from 'lucide-react';

export default function AdminMoviesPage() {
  const toast = useAdminToast();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Modal State (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState('info'); // 'info' | 'media' | 'release'
  const [editingMovie, setEditingMovie] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    movie: null,
    isLoading: false,
  });

  const initialForm = {
    title: '',
    synopsis: '',
    genre: 'Action, Sci-Fi',
    language: 'Hindi, English',
    certificate: 'UA',
    duration: '2h 30m',
    releaseDate: '15 Oct, 2024',
    rating: 8.5,
    voteCount: '50K',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop',
    formats: '2D, 3D, IMAX 3D',
    cities: 'Mumbai, Delhi-NCR, Bengaluru, Pune',
    isPromoted: false,
    status: 'published'
  };

  const [formData, setFormData] = useState(initialForm);

  const loadMovies = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getMovies();
      if (res.success) {
        setMovies(res.movies || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load movies from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  // Reset pagination on filter or view mode change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, viewMode]);

  const handleOpenCreate = () => {
    setEditingMovie(null);
    setFormData(initialForm);
    setActiveFormTab('info');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m) => {
    setEditingMovie(m);
    setFormData({
      title: m.title || '',
      synopsis: m.synopsis || '',
      genre: Array.isArray(m.genre) ? m.genre.join(', ') : (m.genre || ''),
      language: m.language || '',
      certificate: m.certificate || 'UA',
      duration: m.duration || '',
      releaseDate: m.releaseDate || '',
      rating: m.rating || 8.0,
      voteCount: m.voteCount || '10K',
      posterUrl: m.posterUrl || '',
      backdropUrl: m.backdropUrl || '',
      formats: Array.isArray(m.formats) ? m.formats.join(', ') : (m.formats || ''),
      cities: Array.isArray(m.cities) ? m.cities.join(', ') : (m.cities || ''),
      isPromoted: !!m.isPromoted,
      status: m.status || 'published'
    });
    setActiveFormTab('info');
    setIsModalOpen(true);
  };

  // Local state update on status change (No full-table refetch)
  const handleStatusChange = async (movie, newStatus) => {
    const originalStatus = movie.status || 'published';
    const movieId = movie.id || movie._id;

    // Optimistic UI update
    setMovies((prev) =>
      prev.map((m) =>
        (m.id === movieId || m._id === movieId) ? { ...m, status: newStatus } : m
      )
    );

    try {
      await adminApi.updateMovieStatus(movieId, newStatus);
      toast.success(`"${movie.title}" status changed to ${newStatus.toUpperCase()}`);
    } catch (err) {
      // Revert on error
      setMovies((prev) =>
        prev.map((m) =>
          (m.id === movieId || m._id === movieId) ? { ...m, status: originalStatus } : m
        )
      );
      toast.error(err.message || 'Failed to update movie status.');
    }
  };

  // Open custom React confirmation dialog
  const handleRequestDelete = (movie) => {
    setDeleteModal({
      isOpen: true,
      movie,
      isLoading: false,
    });
  };

  // Execute deletion with local state removal (No full-page reload)
  const handleConfirmDelete = async () => {
    const movie = deleteModal.movie;
    if (!movie) return;
    const movieId = movie.id || movie._id;

    setDeleteModal((prev) => ({ ...prev, isLoading: true }));
    try {
      const res = await adminApi.deleteMovie(movieId);
      if (res.success) {
        // Remove locally from state array
        setMovies((prev) => prev.filter((m) => (m.id || m._id) !== movieId));
        toast.success(`"${movie.title}" deleted from catalog.`);
        setDeleteModal({ isOpen: false, movie: null, isLoading: false });
      }
    } catch (err) {
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
      toast.error(err.message || 'Safe-Delete Protection: Cannot delete movie with active customer bookings.');
    }
  };

  // Submit Handler for Create & Edit with local array updates
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);

    const payload = {
      ...formData,
      genre: formData.genre.split(',').map((g) => g.trim()).filter(Boolean),
      formats: formData.formats.split(',').map((f) => f.trim()).filter(Boolean),
      cities: formData.cities.split(',').map((c) => c.trim()).filter(Boolean),
      rating: parseFloat(formData.rating) || 8.0,
    };

    try {
      if (editingMovie) {
        const id = editingMovie.id || editingMovie._id;
        const res = await adminApi.updateMovie(id, payload);
        if (res.success && res.movie) {
          // Local update
          setMovies((prev) =>
            prev.map((m) => ((m.id || m._id) === id ? res.movie : m))
          );
          toast.success(`Updated "${res.movie.title}" successfully.`);
          setIsModalOpen(false);
        }
      } else {
        const res = await adminApi.createMovie(payload);
        if (res.success && res.movie) {
          // Local prepend
          setMovies((prev) => [res.movie, ...prev]);
          toast.success(`"${res.movie.title}" added to catalog.`);
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save movie.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const publishedCount = useMemo(
    () => movies.filter((m) => (m.status || 'published') === 'published').length,
    [movies]
  );
  const draftCount = useMemo(
    () => movies.filter((m) => m.status === 'draft').length,
    [movies]
  );
  const archivedCount = useMemo(
    () => movies.filter((m) => m.status === 'archived').length,
    [movies]
  );

  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      const matchesSearch =
        m.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.language?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (Array.isArray(m.genre) ? m.genre.join(' ') : (m.genre || '')).toLowerCase().includes(searchTerm.toLowerCase());

      const currentStatus = m.status || 'published';
      const matchesStatus = statusFilter === 'all' ? true : currentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [movies, searchTerm, statusFilter]);

  // Paginated slice
  const paginatedMovies = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredMovies.slice(startIndex, startIndex + pageSize);
  }, [filteredMovies, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        badgeIcon={Film}
        badgeText="Cinema Management"
        title="Movie Catalog"
        description="Oversee active films, formats, showtime visibility, and publication states across all multiplexes"
      >
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold transition shadow-md shadow-[#F84464]/25 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Movie</span>
        </button>
      </AdminPageHeader>

      {/* Filter & View Toolbar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer shrink-0 ${
              statusFilter === 'all'
                ? 'bg-[#F84464] text-white shadow-xs'
                : 'text-gray-600 hover:text-[#222432]'
            }`}
          >
            All ({movies.length})
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              statusFilter === 'published'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-emerald-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live ({publishedCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              statusFilter === 'draft'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-gray-600 hover:text-amber-700'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Drafts ({draftCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('archived')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              statusFilter === 'archived'
                ? 'bg-gray-700 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archived ({archivedCount})</span>
          </button>
        </div>

        {/* Right Side: Search + View Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, genre..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#222432] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-1 focus:ring-[#F84464] transition"
            />
          </div>

          {/* Grid vs Table View Mode Switch */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => {
                setViewMode('grid');
                setPageSize(12);
              }}
              title="Poster Card Grid View"
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-[#F84464] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setViewMode('table');
                setPageSize(10);
              }}
              title="Compact Table View"
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#F84464] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-2xl p-16 text-center text-gray-400 flex flex-col items-center justify-center shadow-xs">
          <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mb-3" />
          <span className="text-xs font-semibold text-gray-500">
            Syncing BookMyShow cinema catalog from Atlas...
          </span>
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xs">
          <AdminEmptyState
            icon={Film}
            title={searchTerm ? 'No matching films found' : 'No movies in catalog yet'}
            description={
              searchTerm
                ? `We couldn't find any movie matching "${searchTerm}". Try adjusting your search term or clear the filter.`
                : 'Get started by adding your first movie release to the BookMyShow catalog.'
            }
            actionText={searchTerm ? 'Clear Filters' : 'Add First Movie'}
            onAction={
              searchTerm
                ? () => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }
                : handleOpenCreate
            }
          />
        </div>
      ) : viewMode === 'grid' ? (
        /* ====================================================
           1. POSTER CARD GRID VIEW (BookMyShow Cinematic Feel)
        ==================================================== */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-5">
            {paginatedMovies.map((movie) => (
              <AdminMovieCard
                key={movie.id || movie._id}
                movie={movie}
                onEdit={handleOpenEdit}
                onStatusChange={handleStatusChange}
                onDelete={handleRequestDelete}
              />
            ))}
          </div>

          <AdminPagination
            totalItems={filteredMovies.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        </div>
      ) : (
        /* ====================================================
           2. COMPACT DATA TABLE VIEW
        ==================================================== */
        <div className="bg-white rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-500 uppercase text-[10px] tracking-wider font-bold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Movie Details</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Language &amp; Runtime</th>
                  <th className="py-3 px-4">Venues</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedMovies.map((m) => {
                  const currentStatus = m.status || 'published';
                  const theatreCount = Array.isArray(m.theatres) ? m.theatres.length : 0;
                  const movieId = m.id || m._id;

                  return (
                    <tr key={movieId} className="hover:bg-gray-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={m.posterUrl}
                            alt={m.title}
                            className="w-10 h-14 object-cover rounded-lg bg-gray-100 border border-gray-200 shrink-0 shadow-2xs"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop';
                            }}
                          />
                          <div>
                            <p className="font-black text-[#222432] text-sm leading-snug">{m.title}</p>
                            <p className="text-[11px] text-gray-500">
                              {Array.isArray(m.genre) ? m.genre.join(', ') : (m.genre || 'Action')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="font-bold text-[#222432]">{m.rating || 8.0}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 font-medium">
                        <p className="text-[#222432] font-semibold">{m.language || 'Hindi'}</p>
                        <p className="text-[10px] text-gray-400">{m.duration || '2h 15m'}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/admin/shows?movie=${movieId}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-[#F84464]/10 hover:text-[#F84464] font-bold text-gray-700 transition"
                        >
                          <Ticket className="w-3.5 h-3.5 text-[#F84464]" />
                          <span>{theatreCount} Theatres</span>
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <AdminStatusBadge status={currentStatus} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {currentStatus === 'published' ? (
                            <button
                              onClick={() => handleStatusChange(m, 'archived')}
                              className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition cursor-pointer"
                              title="Archive"
                            >
                              <EyeOff className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(m, 'published')}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition cursor-pointer"
                              title="Publish"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRequestDelete(m)}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-rose-50 text-gray-600 hover:text-rose-600 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <AdminPagination
            totalItems={filteredMovies.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={deleteModal.isOpen}
        title={`Delete "${deleteModal.movie?.title}"?`}
        message={`Are you sure you want to delete this film from the BookMyShow catalog? If active customer bookings exist, Safe-Delete protection will safeguard it.`}
        confirmText="Yes, Delete Film"
        isDestructive={true}
        loading={deleteModal.isLoading}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModal({ isOpen: false, movie: null, isLoading: false })}
      />

      {/* ====================================================
          STRUCTURED MOVIE FORM MODAL (3 ORGANIZED SECTIONS)
      ==================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-[#333545] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F84464] flex items-center justify-center text-white shadow-md shadow-[#F84464]/30">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">
                    {editingMovie ? `Edit Movie: ${editingMovie.title}` : 'Add New Movie to Catalog'}
                  </h2>
                  <p className="text-[11px] text-gray-300">
                    Saves directly to MongoDB Atlas single source of truth
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Section Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-gray-100 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setActiveFormTab('info')}
                className={`pb-2.5 text-xs font-bold transition border-b-2 cursor-pointer ${
                  activeFormTab === 'info'
                    ? 'border-[#F84464] text-[#F84464]'
                    : 'border-transparent text-gray-500 hover:text-[#222432]'
                }`}
              >
                1. Movie Basics &amp; Synopsis
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('media')}
                className={`pb-2.5 text-xs font-bold transition border-b-2 cursor-pointer ${
                  activeFormTab === 'media'
                    ? 'border-[#F84464] text-[#F84464]'
                    : 'border-transparent text-gray-500 hover:text-[#222432]'
                }`}
              >
                2. Media Assets &amp; Posters
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('release')}
                className={`pb-2.5 text-xs font-bold transition border-b-2 cursor-pointer ${
                  activeFormTab === 'release'
                    ? 'border-[#F84464] text-[#F84464]'
                    : 'border-transparent text-gray-500 hover:text-[#222432]'
                }`}
              >
                3. Theatrical Release &amp; Formats
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              {/* TAB 1: MOVIE INFORMATION */}
              {activeFormTab === 'info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">
                        Movie Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Dune: Part Two"
                        className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-1 focus:ring-[#F84464] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">
                        Languages (comma separated) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        placeholder="Hindi, English, Telugu"
                        className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-1 focus:ring-[#F84464] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">
                      Synopsis / Storyline
                    </label>
                    <textarea
                      rows={4}
                      value={formData.synopsis}
                      onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                      placeholder="Enter the plot summary of the film as shown on the BookMyShow customer page..."
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-1 focus:ring-[#F84464] transition leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">
                        Genres (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.genre}
                        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                        placeholder="Action, Sci-Fi, Thriller"
                        className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">
                        Runtime Duration
                      </label>
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="2h 45m"
                        className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] transition"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MEDIA ASSETS */}
              {activeFormTab === 'media' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">
                          Poster Image URL *
                        </label>
                        <input
                          type="url"
                          required
                          value={formData.posterUrl}
                          onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] transition font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">
                          Backdrop / Hero Banner URL
                        </label>
                        <input
                          type="url"
                          value={formData.backdropUrl}
                          onChange={(e) => setFormData({ ...formData, backdropUrl: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] transition font-mono text-xs"
                        />
                      </div>

                      <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl">
                        <input
                          type="checkbox"
                          id="isPromoted"
                          checked={formData.isPromoted}
                          onChange={(e) => setFormData({ ...formData, isPromoted: e.target.checked })}
                          className="w-4 h-4 text-[#F84464] rounded focus:ring-[#F84464] accent-[#F84464] cursor-pointer"
                        />
                        <label htmlFor="isPromoted" className="text-xs font-bold text-[#222432] cursor-pointer">
                          Promote as Trending / Hero Carousel Banner
                        </label>
                      </div>
                    </div>

                    {/* Live Preview Box */}
                    <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                        Poster Live Preview
                      </span>
                      <div className="w-28 h-40 rounded-lg overflow-hidden bg-gray-200 shadow-sm border border-gray-300 shrink-0">
                        <img
                          src={formData.posterUrl}
                          alt="Poster Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop';
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: THEATRICAL RELEASE & FORMATS */}
              {activeFormTab === 'release' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">
                        Censor Certificate
                      </label>
                      <select
                        value={formData.certificate}
                        onChange={(e) => setFormData({ ...formData, certificate: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] font-bold"
                      >
                        <option value="U">U (Universal)</option>
                        <option value="UA">UA (Parental Guidance)</option>
                        <option value="UA16+">UA16+</option>
                        <option value="A">A (Adults Only)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">
                        Release Date String
                      </label>
                      <input
                        type="text"
                        value={formData.releaseDate}
                        onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                        placeholder="e.g. 15 Oct, 2024"
                        className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464]"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">
                        Audience Rating (1-10)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="10"
                        value={formData.rating}
                        onChange={(e) =>
                          setFormData({ ...formData, rating: parseFloat(e.target.value) || 8.0 })
                        }
                        className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#222432] font-semibold focus:outline-none focus:border-[#F84464]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">
                        Screen Formats (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.formats}
                        onChange={(e) => setFormData({ ...formData, formats: e.target.value })}
                        placeholder="2D, 3D, IMAX 3D, 4DX"
                        className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464]"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">
                        Available Cities (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.cities}
                        onChange={(e) => setFormData({ ...formData, cities: e.target.value })}
                        placeholder="Mumbai, Delhi-NCR, Bengaluru"
                        className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464]"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl space-y-1">
                    <label className="block text-gray-700 font-bold uppercase text-[10px]">
                      Publication Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-[#222432] font-semibold focus:outline-none focus:border-[#F84464]"
                    >
                      <option value="published">Published (Live on BookMyShow customer portal)</option>
                      <option value="draft">Draft (Private admin preview only)</option>
                      <option value="archived">Archived (Ended theatrical run)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Bottom Actions Bar */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {activeFormTab !== 'info' && (
                    <button
                      type="button"
                      onClick={() => setActiveFormTab(activeFormTab === 'release' ? 'media' : 'info')}
                      className="px-3 py-1.5 rounded-xl text-gray-600 hover:bg-gray-100 font-bold text-xs cursor-pointer"
                    >
                      Back
                    </button>
                  )}
                  {activeFormTab !== 'release' && (
                    <button
                      type="button"
                      onClick={() => setActiveFormTab(activeFormTab === 'info' ? 'media' : 'release')}
                      className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs cursor-pointer"
                    >
                      Next Step
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-5 py-2 rounded-xl bg-[#F84464] hover:bg-[#E03A58] text-white font-bold cursor-pointer disabled:opacity-50 shadow-md shadow-[#F84464]/25"
                  >
                    {formSubmitting
                      ? 'Saving to Atlas...'
                      : editingMovie
                      ? 'Save Changes'
                      : 'Publish Movie'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
