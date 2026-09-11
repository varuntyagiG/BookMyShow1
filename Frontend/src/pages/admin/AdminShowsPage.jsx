import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import {
  Calendar,
  Search,
  Store,
  Tv,
  Film,
  Loader2,
  Clock,
  IndianRupee,
  AlertTriangle,
  XCircle,
  CheckCircle,
  X
} from 'lucide-react';

export default function AdminShowsPage() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Cancel Modal State
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    show: null,
    reason: '',
    submitting: false
  });

  const fetchShows = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getShows({ status: statusFilter });
      if (res.success) {
        setShows(res.shows || []);
      }
    } catch (err) {
      console.error('Error fetching shows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShows();
  }, [statusFilter]);

  const filteredShows = shows.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (s.movieTitle && s.movieTitle.toLowerCase().includes(q)) ||
      (s.cinema?.name && s.cinema.name.toLowerCase().includes(q)) ||
      (s.cinema?.city && s.cinema.city.toLowerCase().includes(q))
    );
  });

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelModal.show) return;

    setCancelModal((prev) => ({ ...prev, submitting: true }));
    try {
      const res = await adminApi.cancelShow(cancelModal.show._id, cancelModal.reason);
      if (res.success) {
        setShows((prev) =>
          prev.map((s) => (s._id === cancelModal.show._id ? { ...s, status: 'cancelled' } : s))
        );
        setCancelModal({ isOpen: false, show: null, reason: '', submitting: false });
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel show.');
      setCancelModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#222432] tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#F84464]" />
            <span>Screening Schedule &amp; Inventory Monitor</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Global monitoring of auditorium schedules, occupancy rates, and conflict prevention across all circuits.
          </p>
        </div>

        <span className="font-bold text-[#222432] bg-white px-3.5 py-2 rounded-xl border border-[#EEEEF2] shadow-xs text-xs">
          Active Screenings: {filteredShows.length}
        </span>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#EEEEF2] p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search movie title or cinema venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#222432] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-gray-500">Show Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-xs text-[#222432] font-semibold px-3 py-2 rounded-xl focus:bg-white focus:outline-none focus:border-[#F84464] transition"
          >
            <option value="all">All Shows</option>
            <option value="active">Active Screenings</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Shows Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-400">
          <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mx-auto mb-2" />
          <p className="text-xs">Loading screening schedule...</p>
        </div>
      ) : filteredShows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredShows.map((show) => (
            <div
              key={show._id}
              className="bg-white border border-[#EEEEF2] rounded-3xl p-5 hover:shadow-md transition flex flex-col justify-between shadow-sm relative overflow-hidden group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#F84464] tracking-wider">
                      {show.format || '2D'} • {show.showDate}
                    </span>
                    <h3 className="text-sm font-bold text-[#222432] leading-snug">{show.movieTitle}</h3>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shrink-0 ${
                      show.status === 'active'
                        ? 'bg-[#4ABD5D]/10 text-[#4ABD5D] border border-[#4ABD5D]/20'
                        : 'bg-[#F84464]/10 text-[#F84464] border border-[#F84464]/20'
                    }`}
                  >
                    {show.status}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#222432] mb-1">
                  <Store className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-semibold">{show.cinema?.name || 'Multiplex Venue'}</span>
                  <span className="text-gray-400">({show.cinema?.city})</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                  <Tv className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>{show.screen?.name || 'Screen 1'}</span>
                  <span className="text-gray-300">•</span>
                  <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="font-mono text-[#222432] font-bold">{show.startTime} - {show.endTime}</span>
                </div>

                {/* Occupancy Rate Bar */}
                <div className="bg-[#F9F9FB] p-3 rounded-2xl border border-[#EEEEF2] mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Auditorium Occupancy:</span>
                    <span className="font-mono font-bold text-[#222432]">{show.occupancyRate || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-1">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        (show.occupancyRate || 0) > 75
                          ? 'bg-[#F84464]'
                          : (show.occupancyRate || 0) > 40
                          ? 'bg-amber-500'
                          : 'bg-[#4ABD5D]'
                      }`}
                      style={{ width: `${Math.min(show.occupancyRate || 0, 100)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-gray-400 text-right">
                    {show.bookedSeats?.length || 0} seats booked of {show.capacity || 120} capacity
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-[#222432]">
                  Base: ₹{show.ticketPrice || 200}
                </span>

                {show.status === 'active' && (
                  <button
                    onClick={() => setCancelModal({ isOpen: true, show, reason: '', submitting: false })}
                    className="px-3 py-1 bg-[#F84464]/10 hover:bg-[#F84464] text-[#F84464] hover:text-white rounded-lg font-bold text-xs transition cursor-pointer"
                  >
                    Cancel Show
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#EEEEF2] rounded-3xl p-12 text-center text-gray-400 shadow-sm">
          No scheduled shows found.
        </div>
      )}

      {/* Cancel Show Confirmation Modal */}
      {cancelModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#EEEEF2] rounded-3xl p-6 shadow-2xl text-[#222432]">
            <h3 className="text-base font-black text-[#222432] mb-1">
              Cancel Scheduled Screening
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Cancelling <strong className="text-[#222432]">{cancelModal.show?.movieTitle}</strong> at{' '}
              {cancelModal.show?.cinema?.name} ({cancelModal.show?.startTime}).
            </p>

            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Cancellation Reason
                </label>
                <textarea
                  rows="3"
                  value={cancelModal.reason}
                  onChange={(e) => setCancelModal((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g. Auditorium projector failure, special event booking..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#222432] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCancelModal({ isOpen: false, show: null, reason: '', submitting: false })}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#222432] rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={cancelModal.submitting}
                  className="flex-1 py-2.5 bg-[#F84464] hover:bg-[#E03A58] text-white rounded-xl text-xs font-bold transition shadow-lg shadow-[#F84464]/30 cursor-pointer"
                >
                  {cancelModal.submitting ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

