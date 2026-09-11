import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { cinemaPartnerApi } from '../../services/cinemaPartnerApi';
import { useCinemaToast } from '../../components/cinemaPartner/CinemaPartnerToastContext';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Building2,
  Tv,
  Film,
  Clock,
  IndianRupee,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Ticket
} from 'lucide-react';

export default function CinemaPartnerShowsPage() {
  const toast = useCinemaToast();
  const location = useLocation();

  const [shows, setShows] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [screens, setScreens] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShow, setEditingShow] = useState(null);
  const [saving, setSaving] = useState(false);

  // Filters
  const [filterCinema, setFilterCinema] = useState('');
  const [filterDate, setFilterDate] = useState('all');

  // Form State
  const [formData, setFormData] = useState({
    cinemaId: '',
    screenId: '',
    movieId: '',
    showDate: 'Today',
    startTime: '07:30 PM',
    endTime: '10:15 PM',
    format: '2D',
    ticketPrice: 200,
    pricingTiers: { normal: 180, premium: 250, recliner: 400 }
  });

  const fetchData = async () => {
    try {
      const [cinemasRes, screensRes, moviesRes, showsRes] = await Promise.all([
        cinemaPartnerApi.getCinemas(),
        cinemaPartnerApi.getScreens(),
        cinemaPartnerApi.getAvailableMovies(),
        cinemaPartnerApi.getShows()
      ]);

      if (cinemasRes.success) setCinemas(cinemasRes.cinemas || []);
      if (screensRes.success) setScreens(screensRes.screens || []);
      if (moviesRes.success) setMovies(moviesRes.movies || []);
      if (showsRes.success) setShows(showsRes.shows || []);
    } catch (err) {
      toast.error('Load Error', err.message || 'Failed to fetch shows data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle pre-selection from Movie Catalog navigation
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const preMovieId = params.get('movieId');
    if (preMovieId && movies.length > 0 && cinemas.length > 0) {
      const matchedCinema = cinemas[0];
      const matchedScreens = screens.filter(s => (s.cinema?._id || s.cinema) === matchedCinema._id);

      setFormData((prev) => ({
        ...prev,
        movieId: preMovieId,
        cinemaId: matchedCinema._id,
        screenId: matchedScreens[0]?._id || '',
      }));
      setModalOpen(true);
    }
  }, [location.search, movies, cinemas, screens]);

  const availableScreensForCinema = formData.cinemaId
    ? screens.filter((s) => (s.cinema?._id || s.cinema) === formData.cinemaId)
    : screens;

  const handleOpenAdd = () => {
    setEditingShow(null);
    const firstCinema = cinemas[0]?._id || '';
    const firstScreens = screens.filter(s => (s.cinema?._id || s.cinema) === firstCinema);

    setFormData({
      cinemaId: firstCinema,
      screenId: firstScreens[0]?._id || '',
      movieId: movies[0]?._id || '',
      showDate: 'Today',
      startTime: '07:30 PM',
      endTime: '10:15 PM',
      format: '2D',
      ticketPrice: 200,
      pricingTiers: { normal: 180, premium: 250, recliner: 400 }
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (show) => {
    setEditingShow(show);
    setFormData({
      cinemaId: show.cinema?._id || show.cinema,
      screenId: show.screen?._id || show.screen,
      movieId: show.movie?._id || show.movie,
      showDate: show.showDate,
      startTime: show.startTime,
      endTime: show.endTime,
      format: show.format,
      ticketPrice: show.ticketPrice,
      pricingTiers: show.pricingTiers || { normal: 180, premium: 250, recliner: 400 }
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingShow) {
        const res = await cinemaPartnerApi.updateShow(editingShow._id, formData);
        if (res.success) {
          toast.success('Show Updated', 'Show schedule updated successfully.');
          fetchData();
          setModalOpen(false);
        }
      } else {
        const res = await cinemaPartnerApi.createShow(formData);
        if (res.success) {
          toast.success('Show Scheduled', 'Show successfully scheduled.');
          fetchData();
          setModalOpen(false);
        }
      }
    } catch (err) {
      toast.error('Scheduling Conflict / Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (show) => {
    if (!window.confirm(`Delete show "${show.movieTitle}" at ${show.startTime}?`)) return;
    try {
      const res = await cinemaPartnerApi.deleteShow(show._id);
      if (res.success) {
        toast.success('Show Deleted', 'Show removed from schedule.');
        setShows((prev) => prev.filter((s) => s._id !== show._id));
      }
    } catch (err) {
      toast.error('Deletion Blocked', err.message);
    }
  };

  const filteredShows = shows.filter((s) => {
    const matchesCinema = !filterCinema || (s.cinema?._id || s.cinema) === filterCinema;
    const matchesDate = filterDate === 'all' || s.showDate === filterDate;
    return matchesCinema && matchesDate;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mb-3" />
        <p className="text-xs text-gray-500 font-medium">Loading Scheduled Showtimes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-[#222432] tracking-tight flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-[#F84464]" />
            <span>Show Management &amp; Scheduling</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Program showtimes, manage pricing tiers, and prevent screen auditorium time conflicts
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Cinema Filter */}
          <select
            value={filterCinema}
            onChange={(e) => setFilterCinema(e.target.value)}
            className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-[#222432] focus:outline-none focus:border-[#F84464] shadow-xs"
          >
            <option value="">All Cinemas ({cinemas.length})</option>
            {cinemas.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold transition shadow-md shadow-[#F84464]/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Show</span>
          </button>
        </div>
      </div>

      {/* Shows List */}
      {filteredShows.length === 0 ? (
        <div className="bg-white border border-[#EEEEF2] rounded-2xl p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#F84464]/10 text-[#F84464] flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#222432] mb-1">No Shows Scheduled</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
            Select a movie, auditorium screen, and time slot to publish your first show.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold rounded-xl shadow-md shadow-[#F84464]/25 cursor-pointer transition"
          >
            Schedule Show
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredShows.map((s) => {
            const cinemaName = s.cinema?.name || 'Cinema';
            const screenName = s.screen?.name || s.screen?.screenNumber || 'Screen 1';
            const capacity = s.screen?.totalCapacity || 120;
            const bookedCount = s.bookedSeats?.length || 0;
            const occupancyPct = capacity > 0 ? Math.round((bookedCount / capacity) * 100) : 0;

            return (
              <div
                key={s._id}
                className="bg-white border border-[#EEEEF2] rounded-3xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:border-[#F84464]/40 hover:shadow-lg transition group relative overflow-hidden"
              >
                {/* Left: Movie Poster & Metadata */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-16 h-22 rounded-2xl bg-gray-100 shrink-0 overflow-hidden shadow-sm border border-gray-200">
                    {s.movie?.posterUrl ? (
                      <img
                        src={s.movie.posterUrl}
                        alt={s.movieTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Film className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-[#222432] group-hover:text-[#F84464] transition-colors truncate">
                        {s.movieTitle}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md bg-[#F84464]/10 text-[#F84464] font-black text-[9px] uppercase border border-[#F84464]/20">
                        {s.format || '2D'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        <strong className="font-bold text-gray-700">{cinemaName}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Tv className="w-3.5 h-3.5 text-[#F84464]" />
                        <span className="font-semibold text-gray-700">{screenName}</span>
                      </span>
                      <span>•</span>
                      <span className="text-[#F84464] font-black">{s.showDate}</span>
                    </div>

                    {/* BookMyShow Showtime Chip with Live Availability Indicator */}
                    <div className="pt-1">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-black shadow-xs ${
                        occupancyPct >= 80
                          ? 'bg-rose-50 border-rose-300 text-rose-700'
                          : occupancyPct >= 40
                          ? 'bg-amber-50 border-amber-300 text-amber-800'
                          : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          occupancyPct >= 80 ? 'bg-rose-500' : occupancyPct >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                        <span>{s.startTime}</span>
                        <span className="text-gray-400 font-normal text-[10px]">to</span>
                        <span className="text-gray-600 font-semibold text-[11px]">{s.endTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle: Pricing & Seat Inventory */}
                <div className="flex items-center justify-between sm:justify-start gap-8 lg:px-6 lg:border-x border-gray-100">
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Ticket Rates</div>
                    <div className="text-sm font-black text-[#222432] mt-0.5">
                      ₹{s.ticketPrice} <span className="text-[10px] text-gray-400 font-normal">(Base)</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 font-medium">
                      Normal ₹{s.pricingTiers?.normal || s.ticketPrice} • Recliner ₹{s.pricingTiers?.recliner || (s.ticketPrice + 150)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Occupancy</div>
                    <div className="text-sm font-black text-sky-600 mt-0.5">
                      {bookedCount} / {capacity} Seats
                    </div>
                    <div className="w-24 bg-gray-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          occupancyPct >= 80 ? 'bg-[#E53935]' : occupancyPct >= 40 ? 'bg-[#F5A623]' : 'bg-[#4ABD5D]'
                        }`}
                        style={{ width: `${Math.min(occupancyPct, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold block mt-0.5">{occupancyPct}% Full</span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-end gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition cursor-pointer"
                    title="Edit Show"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(s)}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer"
                    title="Delete Show"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Show Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#333545] px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#F84464]" />
                <h3 className="text-sm font-bold">
                  {editingShow ? 'Update Show Details' : 'Program New Movie Screening'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Release / Movie
                </label>
                <select
                  required
                  value={formData.movieId}
                  onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20"
                >
                  <option value="">Select Movie</option>
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>{m.title} ({m.duration || '2h 30m'})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Cinema
                  </label>
                  <select
                    required
                    value={formData.cinemaId}
                    onChange={(e) => {
                      const newCinema = e.target.value;
                      const nextScreens = screens.filter(s => (s.cinema?._id || s.cinema) === newCinema);
                      setFormData({
                        ...formData,
                        cinemaId: newCinema,
                        screenId: nextScreens[0]?._id || ''
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20"
                  >
                    <option value="">Select Cinema</option>
                    {cinemas.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Screen / Audi
                  </label>
                  <select
                    required
                    value={formData.screenId}
                    onChange={(e) => setFormData({ ...formData, screenId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20"
                  >
                    <option value="">Select Screen</option>
                    {availableScreensForCinema.map((s) => (
                      <option key={s._id} value={s._id}>{s.name} ({s.screenNumber})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.showDate}
                    onChange={(e) => setFormData({ ...formData, showDate: e.target.value })}
                    placeholder="Today"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#222432] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    placeholder="07:30 PM"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#222432] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    placeholder="10:15 PM"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#222432] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Format
                  </label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20"
                  >
                    {['2D', '3D', 'IMAX 2D', 'IMAX 3D', '4DX', 'Gold Class'].map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Base Ticket Price (₹)
                  </label>
                  <input
                    type="number"
                    min="50"
                    required
                    value={formData.ticketPrice}
                    onChange={(e) => setFormData({ ...formData, ticketPrice: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20"
                  />
                </div>
              </div>

              {/* Tier Pricing Inputs */}
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <div className="text-[11px] font-bold text-gray-700 uppercase">Tier Pricing Rates (₹)</div>
                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">Normal</label>
                    <input
                      type="number"
                      value={formData.pricingTiers?.normal || 180}
                      onChange={(e) => setFormData({
                        ...formData,
                        pricingTiers: { ...formData.pricingTiers, normal: parseInt(e.target.value, 10) || 0 }
                      })}
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-[#222432] text-center focus:outline-none focus:border-[#F84464]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">Premium</label>
                    <input
                      type="number"
                      value={formData.pricingTiers?.premium || 250}
                      onChange={(e) => setFormData({
                        ...formData,
                        pricingTiers: { ...formData.pricingTiers, premium: parseInt(e.target.value, 10) || 0 }
                      })}
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-[#222432] text-center focus:outline-none focus:border-[#F84464]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">Recliner</label>
                    <input
                      type="number"
                      value={formData.pricingTiers?.recliner || 400}
                      onChange={(e) => setFormData({
                        ...formData,
                        pricingTiers: { ...formData.pricingTiers, recliner: parseInt(e.target.value, 10) || 0 }
                      })}
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-[#222432] text-center focus:outline-none focus:border-[#F84464]"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#F84464] hover:bg-[#E03A58] text-xs font-bold text-white shadow-md shadow-[#F84464]/25 disabled:opacity-50 transition cursor-pointer"
                >
                  {saving ? 'Validating...' : editingShow ? 'Save Changes' : 'Schedule Show'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
