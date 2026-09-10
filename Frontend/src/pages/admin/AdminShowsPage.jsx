import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { useAdminToast } from '../../components/admin/AdminToastContext';
import AdminConfirmModal from '../../components/admin/AdminConfirmModal';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import {
  Calendar,
  Film,
  Building2,
  Clock,
  Plus,
  Trash2,
  Loader2,
  X,
  Armchair,
  MapPin,
  Sparkles,
  Ticket,
  ChevronDown,
  Tv
} from 'lucide-react';

export default function AdminShowsPage() {
  const toast = useAdminToast();
  const [searchParams] = useSearchParams();
  const initialMovieId = searchParams.get('movie') || '';

  const [movies, setMovies] = useState([]);
  const [selectedMovieId, setSelectedMovieId] = useState(initialMovieId);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal states for adding
  const [isAddTheatreOpen, setIsAddTheatreOpen] = useState(false);
  const [theatreForm, setTheatreForm] = useState({
    name: '',
    distance: '2.5 km away',
    facilities: 'M-Ticket, F&B, Dolby Atmos'
  });

  const [isAddShowOpen, setIsAddShowOpen] = useState(false);
  const [activeTheatreId, setActiveTheatreId] = useState('');
  const [showForm, setShowForm] = useState({
    time: '10:15 AM',
    format: '2D',
    price: '₹450',
    status: 'available'
  });

  // Reusable React Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    onConfirm: null,
    isLoading: false,
    isDestructive: true
  });

  const loadMovies = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getMovies();
      if (res.success) {
        setMovies(res.movies || []);
        if (!selectedMovieId && res.movies?.length > 0) {
          setSelectedMovieId(res.movies[0].id || res.movies[0]._id);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load movie shows.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const selectedMovie = movies.find((m) => (m.id || m._id) === selectedMovieId);

  // Local update on Add Theatre (No full-page reload)
  const handleAddTheatre = async (e) => {
    e.preventDefault();
    if (!selectedMovieId) return;
    setSubmitting(true);

    try {
      const res = await adminApi.addTheatre(selectedMovieId, theatreForm);
      if (res.success && res.movie) {
        // Update local state with returned movie object
        setMovies((prev) =>
          prev.map((m) =>
            (m.id === selectedMovieId || m._id === selectedMovieId) ? res.movie : m
          )
        );
        toast.success(`Attached "${theatreForm.name}" successfully.`);
        setIsAddTheatreOpen(false);
        setTheatreForm({ name: '', distance: '2.5 km away', facilities: 'M-Ticket, F&B, Dolby Atmos' });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add theatre.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open confirmation for Theatre Deletion
  const handleRequestDeleteTheatre = (theatreId, name) => {
    setConfirmModal({
      isOpen: true,
      title: `Delete "${name}"?`,
      message: `Are you sure you want to remove ${name} and all its scheduled showtimes for this film?`,
      confirmText: 'Delete Theatre',
      isDestructive: true,
      onConfirm: () => executeDeleteTheatre(theatreId, name),
      isLoading: false,
    });
  };

  const executeDeleteTheatre = async (theatreId, name) => {
    setConfirmModal((prev) => ({ ...prev, isLoading: true }));
    try {
      const res = await adminApi.deleteTheatre(selectedMovieId, theatreId);
      if (res.success && res.movie) {
        setMovies((prev) =>
          prev.map((m) =>
            (m.id === selectedMovieId || m._id === selectedMovieId) ? res.movie : m
          )
        );
        toast.success(`Removed venue "${name}".`);
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, isLoading: false, isDestructive: true });
      }
    } catch (err) {
      setConfirmModal((prev) => ({ ...prev, isLoading: false }));
      toast.error(err.message || 'Safe-Delete: Cannot delete this theatre with active bookings.');
    }
  };

  const handleOpenAddShow = (theatreId) => {
    setActiveTheatreId(theatreId);
    setShowForm({
      time: '10:15 AM',
      format: '2D',
      price: '₹450',
      status: 'available'
    });
    setIsAddShowOpen(true);
  };

  // Local update on Add Showtime (No full-page reload)
  const handleAddShowtime = async (e) => {
    e.preventDefault();
    if (!selectedMovieId || !activeTheatreId) return;
    setSubmitting(true);

    try {
      const res = await adminApi.addShowtime(selectedMovieId, activeTheatreId, showForm);
      if (res.success && res.movie) {
        setMovies((prev) =>
          prev.map((m) =>
            (m.id === selectedMovieId || m._id === selectedMovieId) ? res.movie : m
          )
        );
        toast.success(`Showtime ${showForm.time} added to schedule.`);
        setIsAddShowOpen(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add showtime.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open confirmation for Showtime Deletion
  const handleRequestDeleteShowtime = (theatreId, showtimeId, time) => {
    setConfirmModal({
      isOpen: true,
      title: `Delete ${time} Show?`,
      message: `Are you sure you want to cancel and remove the ${time} showtime from this cinema hall?`,
      confirmText: 'Remove Show',
      isDestructive: true,
      onConfirm: () => executeDeleteShowtime(theatreId, showtimeId, time),
      isLoading: false,
    });
  };

  const executeDeleteShowtime = async (theatreId, showtimeId, time) => {
    setConfirmModal((prev) => ({ ...prev, isLoading: true }));
    try {
      const res = await adminApi.deleteShowtime(selectedMovieId, theatreId, showtimeId);
      if (res.success && res.movie) {
        setMovies((prev) =>
          prev.map((m) =>
            (m.id === selectedMovieId || m._id === selectedMovieId) ? res.movie : m
          )
        );
        toast.success(`Showtime ${time} removed.`);
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, isLoading: false, isDestructive: true });
      }
    } catch (err) {
      setConfirmModal((prev) => ({ ...prev, isLoading: false }));
      toast.error(err.message || 'Failed to delete showtime.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        badgeIcon={Calendar}
        badgeText="Cinema Operations"
        title="Theatres &amp; Showtimes"
        description="Schedule cinema halls, screening formats (IMAX, 4DX, 3D), ticket prices, and show timings"
      >
        <div className="flex items-center gap-3">
          {/* Movie Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedMovieId}
              onChange={(e) => setSelectedMovieId(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-[#222432] font-black focus:outline-none focus:border-[#F84464] shadow-xs cursor-pointer appearance-none pr-9 min-w-[200px]"
            >
              {movies.map((m) => (
                <option key={m.id || m._id} value={m.id || m._id}>
                  {m.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => setIsAddTheatreOpen(true)}
            disabled={!selectedMovieId}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold transition shadow-md shadow-[#F84464]/25 cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Venue / Hall</span>
          </button>
        </div>
      </AdminPageHeader>

      {/* Selected Movie Hero Banner */}
      {selectedMovie && (
        <div className="bg-gradient-to-r from-[#333545] to-[#222432] rounded-2xl p-5 text-white shadow-xs flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <img
              src={selectedMovie.posterUrl}
              alt={selectedMovie.title}
              className="w-16 h-22 object-cover rounded-xl shadow-md border border-white/10 shrink-0"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop';
              }}
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                {selectedMovie.certificate && (
                  <span className="px-2 py-0.5 rounded bg-white/20 text-white font-black text-[10px] uppercase">
                    {selectedMovie.certificate}
                  </span>
                )}
                <span className="text-xs text-gray-300 font-semibold">
                  {selectedMovie.language || 'Hindi'}
                </span>
                <span className="text-gray-400">&bull;</span>
                <span className="text-xs text-gray-300">{selectedMovie.duration || '2h 30m'}</span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white leading-tight">
                {selectedMovie.title}
              </h2>
              <p className="text-xs text-gray-300 mt-1 max-w-xl line-clamp-1">
                {Array.isArray(selectedMovie.genre) ? selectedMovie.genre.join(', ') : selectedMovie.genre}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10 shrink-0 self-end md:self-center">
            <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-xs text-center border border-white/10">
              <span className="block text-lg font-black text-white">
                {selectedMovie.theatres?.length || 0}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">
                Venues Active
              </span>
            </div>
            <Link
              to="/admin/movies"
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/15 cursor-pointer"
            >
              Change Movie
            </Link>
          </div>
        </div>
      )}

      {/* Main Theatres List */}
      {loading ? (
        <div className="bg-white rounded-2xl p-16 text-center text-gray-400 flex flex-col items-center justify-center shadow-xs">
          <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mb-3" />
          <span className="text-xs font-semibold text-gray-500">
            Syncing theatre schedules from MongoDB Atlas...
          </span>
        </div>
      ) : !selectedMovie ? (
        <div className="bg-white rounded-2xl shadow-xs">
          <AdminEmptyState
            icon={Film}
            title="No Movie Selected"
            description="Please select a film to schedule cinema halls and showtimes."
            actionText="Go to Movie Catalog"
            onAction={() => window.location.assign('/admin/movies')}
          />
        </div>
      ) : selectedMovie.theatres?.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xs">
          <AdminEmptyState
            icon={Building2}
            title={`No Theatres Attached to "${selectedMovie.title}"`}
            description="This film doesn't have any multiplexes or showtimes scheduled yet. Add your first cinema venue to make it available for booking."
            actionText="Add Cinema Venue"
            onAction={() => setIsAddTheatreOpen(true)}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {selectedMovie.theatres.map((theatre) => {
            const theatreId = theatre.id || theatre._id;
            const showtimes = theatre.showtimes || [];

            return (
              <div
                key={theatreId}
                className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 space-y-4 hover:border-gray-200 transition-colors"
              >
                {/* Theatre Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-[#F84464]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#222432] leading-tight flex items-center gap-2">
                        <span>{theatre.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {theatre.distance || '2.5 km away'}
                        </span>
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {theatre.facilities || 'M-Ticket, F&B, Dolby Atmos'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleOpenAddShow(theatreId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Showtime</span>
                    </button>
                    <button
                      onClick={() => handleRequestDeleteTheatre(theatreId, theatre.name)}
                      className="p-1.5 rounded-xl bg-gray-100 hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition cursor-pointer"
                      title="Delete Theatre Venue"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Showtimes Grid */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Daily Scheduled Screenings ({showtimes.length})
                  </div>

                  {showtimes.length === 0 ? (
                    <div className="p-6 rounded-xl bg-gray-50 text-center text-xs text-gray-400">
                      No showtimes scheduled for this venue yet. Click "+ Add Showtime" to attach a screening.
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2.5">
                      {showtimes.map((show) => {
                        const showId = show.id || show._id;

                        return (
                          <div
                            key={showId}
                            className="group relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200/80 transition-all hover:border-[#F84464]/30"
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-[#222432]">
                                  {show.time}
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-[#F84464]/10 text-[#F84464]">
                                  {show.format || '2D'}
                                </span>
                              </div>
                              <div className="text-[10px] text-gray-500 font-semibold">
                                {show.price || '₹450'}
                              </div>
                            </div>

                            {/* Delete Showtime Trigger */}
                            <button
                              onClick={() => handleRequestDeleteShowtime(theatreId, showId, show.time)}
                              title="Delete Showtime"
                              className="ml-1 p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition opacity-60 group-hover:opacity-100 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      <AdminConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDestructive={confirmModal.isDestructive}
        loading={confirmModal.isLoading}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Add Theatre Modal */}
      {isAddTheatreOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-[#333545] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#F84464]" />
                <h3 className="text-sm font-black text-white">Attach Cinema Venue / Multiplex</h3>
              </div>
              <button
                onClick={() => setIsAddTheatreOpen(false)}
                className="p-1 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTheatre} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">
                  Theatre / Multiplex Name *
                </label>
                <input
                  type="text"
                  required
                  value={theatreForm.name}
                  onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })}
                  placeholder="e.g. PVR: Phoenix Marketcity, Kurla"
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">
                  Distance / Location Description
                </label>
                <input
                  type="text"
                  value={theatreForm.distance}
                  onChange={(e) => setTheatreForm({ ...theatreForm, distance: e.target.value })}
                  placeholder="e.g. 2.5 km away"
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">
                  Facilities Available
                </label>
                <input
                  type="text"
                  value={theatreForm.facilities}
                  onChange={(e) => setTheatreForm({ ...theatreForm, facilities: e.target.value })}
                  placeholder="e.g. M-Ticket, F&B, Dolby Atmos, Recliner"
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464]"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTheatreOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#F84464] hover:bg-[#E03A58] text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Attaching...' : 'Attach Theatre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Showtime Modal */}
      {isAddShowOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-[#333545] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F84464]" />
                <h3 className="text-sm font-black text-white">Schedule New Showtime</h3>
              </div>
              <button
                onClick={() => setIsAddShowOpen(false)}
                className="p-1 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddShowtime} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">
                  Showtime (e.g. 10:15 AM, 04:30 PM) *
                </label>
                <input
                  type="text"
                  required
                  value={showForm.time}
                  onChange={(e) => setShowForm({ ...showForm, time: e.target.value })}
                  placeholder="10:15 AM"
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">
                    Screen Format
                  </label>
                  <select
                    value={showForm.format}
                    onChange={(e) => setShowForm({ ...showForm, format: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] font-bold"
                  >
                    <option value="2D">2D</option>
                    <option value="3D">3D</option>
                    <option value="IMAX 2D">IMAX 2D</option>
                    <option value="IMAX 3D">IMAX 3D</option>
                    <option value="4DX">4DX</option>
                    <option value="ICE">ICE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">
                    Ticket Price
                  </label>
                  <input
                    type="text"
                    required
                    value={showForm.price}
                    onChange={(e) => setShowForm({ ...showForm, price: e.target.value })}
                    placeholder="₹450"
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddShowOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#F84464] hover:bg-[#E03A58] text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Scheduling...' : 'Add Showtime'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
