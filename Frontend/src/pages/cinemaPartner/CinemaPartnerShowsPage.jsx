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
  Ticket,
  Sparkles
} from 'lucide-react';
import {
  PageHeader,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Modal,
  ConfirmModal,
  Input,
  Select,
  EmptyState,
  Skeleton,
  CopyButton,
  CopyBadge
} from '../../components/ui';

function getTimeOfDayBadge(timeStr) {
  if (!timeStr) return null;
  const lower = timeStr.toLowerCase();
  const isPM = lower.includes('pm');
  const hour = parseInt(timeStr, 10) || 0;
  if (!isPM || (hour === 12 && !isPM)) {
    return { label: 'Morning Show', style: 'bg-amber-50 text-amber-700 border-amber-200' };
  }
  if (isPM && (hour === 12 || hour < 4)) {
    return { label: 'Matinee', style: 'bg-sky-50 text-sky-700 border-sky-200' };
  }
  if (isPM && hour < 8) {
    return { label: 'Evening Prime', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  }
  return { label: 'Night Show', style: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
}

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

  // Delete Confirm State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [showToDelete, setShowToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [filterCinema, setFilterCinema] = useState('');

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

  const openDeleteConfirm = (show) => {
    setShowToDelete(show);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteShow = async () => {
    if (!showToDelete) return;
    setDeleting(true);
    try {
      const res = await cinemaPartnerApi.deleteShow(showToDelete._id);
      if (res.success) {
        toast.success('Show Deleted', 'Show removed from schedule.');
        setShows((prev) => prev.filter((s) => s._id !== showToDelete._id));
        setDeleteConfirmOpen(false);
        setShowToDelete(null);
      }
    } catch (err) {
      toast.error('Deletion Blocked', err.message);
    } finally {
      setDeleting(false);
    }
  };

  const filteredShows = shows.filter((s) => {
    return !filterCinema || (s.cinema?._id || s.cinema) === filterCinema;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Page Header */}
      <PageHeader
        title="Screening Timetable & Program Schedule"
        subtitle="Schedule movie screenings, configure tier pricing, and enforce screen hardware overlap locks."
        icon={Calendar}
        badge="Program Programming"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-56">
              <Select
                value={filterCinema}
                onChange={(e) => setFilterCinema(e.target.value)}
                options={[
                  { value: '', label: `All Multiplexes (${cinemas.length})` },
                  ...cinemas.map((c) => ({ value: c._id, label: c.name }))
                ]}
              />
            </div>
            <Button
              variant="primary"
              icon={Plus}
              onClick={handleOpenAdd}
            >
              Schedule Show
            </Button>
          </div>
        }
      />

      {/* Shows Stream */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
      ) : filteredShows.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            icon={Calendar}
            title="No Shows Scheduled"
            description="Select a movie release, auditorium hall, and start time to publish your first showtime to customers."
            actionLabel="Schedule Show"
            onAction={handleOpenAdd}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredShows.map((s) => {
            const cinemaName = s.cinema?.name || 'Cinema';
            const screenName = s.screen?.name || s.screen?.screenNumber || 'Screen 1';
            const capacity = s.screen?.totalCapacity || 120;
            const bookedCount = s.bookedSeats?.length || 0;
            const occupancyPct = capacity > 0 ? Math.round((bookedCount / capacity) * 100) : 0;

            const timeBadge = getTimeOfDayBadge(s.startTime);
            const showRef = `SHOW-${s._id.slice(-6).toUpperCase()}`;

            return (
              <Card
                key={s._id}
                className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:border-[#F84464]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group overflow-hidden"
              >
                {/* Left: Poster & Info */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-16 h-22 rounded-2xl bg-gray-100 shrink-0 overflow-hidden shadow-xs border border-gray-200">
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
                      <Badge variant="brand" className="text-[9px] uppercase px-1.5 py-0.5">
                        {s.format || '2D'}
                      </Badge>
                      {timeBadge && (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${timeBadge.style}`}>
                          {timeBadge.label}
                        </span>
                      )}
                      <CopyBadge text={showRef} size="xs" variant="neutral" />
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

                    {/* Showtime Pill with Real-time Occupancy Indicator */}
                    <div className="pt-1 flex items-center gap-2">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl border text-xs font-black ${
                        occupancyPct >= 80
                          ? 'bg-rose-50 border-rose-200 text-rose-700'
                          : occupancyPct >= 40
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          occupancyPct >= 80 ? 'bg-rose-500' : occupancyPct >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                        <span>{s.startTime}</span>
                        <span className="text-gray-400 font-normal text-[10px]">to</span>
                        <span className="text-gray-600 font-semibold text-[11px]">{s.endTime}</span>
                      </div>
                      <CopyButton
                        text={`${s.movieTitle} | ${s.showDate} at ${s.startTime} | ${cinemaName}`}
                        size="xs"
                        variant="ghost"
                        title="Copy show summary"
                      />
                    </div>
                  </div>
                </div>

                {/* Middle: Pricing & Inventory */}
                <div className="flex items-center justify-between sm:justify-start gap-8 lg:px-6 lg:border-x border-[#EEEEF2]">
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Base Ticket Rate</div>
                    <div className="text-base font-black text-[#222432] mt-0.5">
                      ₹{s.ticketPrice}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 font-medium">
                      Normal ₹{s.pricingTiers?.normal || s.ticketPrice} • Recliner ₹{s.pricingTiers?.recliner || (s.ticketPrice + 150)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Auditorium Occupancy</div>
                    <div className="text-base font-black text-sky-600 mt-0.5">
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
                <div className="flex items-center justify-end gap-1.5 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Edit2}
                    onClick={() => handleOpenEdit(s)}
                    title="Edit Show Details"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => openDeleteConfirm(s)}
                    className="text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Delete Show"
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Schedule Show Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingShow ? 'Update Show Details' : 'Program New Movie Screening'}
        description="Schedule showtimes with automatic screen conflict checking."
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={saving}
            >
              {editingShow ? 'Save Changes' : 'Schedule Show'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Movie Title *"
            required
            value={formData.movieId}
            onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
            options={[
              { value: '', label: 'Select Movie Release' },
              ...movies.map((m) => ({
                value: m._id,
                label: `${m.title} (${m.duration || '2h 30m'})`
              }))
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Multiplex Venue *"
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
              options={[
                { value: '', label: 'Select Cinema' },
                ...cinemas.map((c) => ({ value: c._id, label: c.name }))
              ]}
            />

            <Select
              label="Auditorium Screen *"
              required
              value={formData.screenId}
              onChange={(e) => setFormData({ ...formData, screenId: e.target.value })}
              options={[
                { value: '', label: 'Select Screen' },
                ...availableScreensForCinema.map((s) => ({
                  value: s._id,
                  label: `${s.name} (${s.screenNumber})`
                }))
              ]}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Show Date *"
              required
              value={formData.showDate}
              onChange={(e) => setFormData({ ...formData, showDate: e.target.value })}
              placeholder="Today"
            />

            <Input
              label="Start Time *"
              required
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              placeholder="07:30 PM"
            />

            <Input
              label="End Time *"
              required
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              placeholder="10:15 PM"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Format"
              value={formData.format}
              onChange={(e) => setFormData({ ...formData, format: e.target.value })}
              options={[
                { value: '2D', label: '2D Digital' },
                { value: '3D', label: '3D Digital' },
                { value: 'IMAX 2D', label: 'IMAX 2D' },
                { value: 'IMAX 3D', label: 'IMAX 3D Laser' },
                { value: '4DX', label: '4DX Dynamic' },
                { value: 'Gold Class', label: 'Gold Class Luxury' }
              ]}
            />

            <Input
              label="Base Ticket Price (₹) *"
              type="number"
              min="50"
              required
              value={formData.ticketPrice}
              onChange={(e) => setFormData({ ...formData, ticketPrice: parseInt(e.target.value, 10) || 0 })}
            />
          </div>

          {/* Tier Pricing */}
          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
            <div className="text-[11px] font-bold text-gray-700 uppercase">Tier Pricing Structure (₹)</div>
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <Input
                label="Normal Tier"
                type="number"
                value={formData.pricingTiers?.normal || 180}
                onChange={(e) => setFormData({
                  ...formData,
                  pricingTiers: { ...formData.pricingTiers, normal: parseInt(e.target.value, 10) || 0 }
                })}
                className="text-center"
              />

              <Input
                label="Premium Tier"
                type="number"
                value={formData.pricingTiers?.premium || 250}
                onChange={(e) => setFormData({
                  ...formData,
                  pricingTiers: { ...formData.pricingTiers, premium: parseInt(e.target.value, 10) || 0 }
                })}
                className="text-center"
              />

              <Input
                label="Recliner Tier"
                type="number"
                value={formData.pricingTiers?.recliner || 400}
                onChange={(e) => setFormData({
                  ...formData,
                  pricingTiers: { ...formData.pricingTiers, recliner: parseInt(e.target.value, 10) || 0 }
                })}
                className="text-center"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteShow}
        title="Delete Scheduled Show?"
        message={`Are you sure you want to delete the show for "${showToDelete?.movieTitle}" at ${showToDelete?.startTime}? Any existing seat holds will be released.`}
        confirmText="Confirm Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
