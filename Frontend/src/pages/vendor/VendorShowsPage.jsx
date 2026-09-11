import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { vendorApi } from '../../services/vendorApi';
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
  ConfirmModal,
  Input,
  Select,
  EmptyState
} from '../../components/ui';
import {
  Calendar,
  Plus,
  Tv,
  Clock,
  MapPin,
  Film,
  Users,
  AlertCircle,
  Eye,
  Ban,
  CheckCircle
} from 'lucide-react';

const COMMON_SHOWTIMES = [
  '09:30 AM',
  '12:45 PM',
  '04:00 PM',
  '07:30 PM',
  '10:45 PM'
];

export default function VendorShowsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const movieIdParam = searchParams.get('movieId') || '';

  const [shows, setShows] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [screens, setScreens] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedCinemaId, setSelectedCinemaId] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSeatMapModalOpen, setIsSeatMapModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState(null);
  const [seatMapData, setSeatMapData] = useState(null);
  const [seatMapLoading, setSeatMapLoading] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    cinemaId: '',
    screenId: '',
    movieId: movieIdParam,
    showDate: 'Today',
    startTime: '07:30 PM',
    endTime: '10:15 PM',
    format: '2D',
    ticketPrice: 220,
    normalPrice: 200,
    premiumPrice: 280,
    reclinerPrice: 450
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const loadAllData = async () => {
    try {
      const [cinemasRes, moviesRes, showsRes] = await Promise.all([
        vendorApi.getCinemas(),
        vendorApi.getMovies(),
        vendorApi.getShows({
          ...(selectedDate && selectedDate !== 'All' ? { date: selectedDate } : {}),
          ...(selectedCinemaId ? { cinemaId: selectedCinemaId } : {})
        })
      ]);

      if (cinemasRes.success) setCinemas(cinemasRes.data);
      if (moviesRes.success) setMovies(moviesRes.data);
      if (showsRes.success) setShows(showsRes.data);
    } catch (err) {
      console.error('Failed to load shows data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [selectedDate, selectedCinemaId]);

  // When cinema changes in Add Show modal, fetch its screens
  useEffect(() => {
    async function fetchScreensForCinema() {
      if (formData.cinemaId) {
        try {
          const res = await vendorApi.getScreens(formData.cinemaId);
          if (res.success) {
            setScreens(res.data);
            if (res.data.length > 0) {
              setFormData(prev => ({ ...prev, screenId: res.data[0].id || res.data[0]._id }));
            } else {
              setFormData(prev => ({ ...prev, screenId: '' }));
            }
          }
        } catch (_e) {}
      } else {
        setScreens([]);
      }
    }
    fetchScreensForCinema();
  }, [formData.cinemaId]);

  const openAddModal = () => {
    const firstCinemaId = cinemas[0]?.id || cinemas[0]?._id || '';
    const firstMovieId = movieIdParam || (movies[0]?.id || movies[0]?._id || '');

    setFormData({
      cinemaId: firstCinemaId,
      screenId: '',
      movieId: firstMovieId,
      showDate: 'Today',
      startTime: '07:30 PM',
      endTime: '10:15 PM',
      format: '2D',
      ticketPrice: 220,
      normalPrice: 200,
      premiumPrice: 280,
      reclinerPrice: 450
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const openSeatMapModal = async (show) => {
    setSelectedShow(show);
    setIsSeatMapModalOpen(true);
    setSeatMapLoading(true);

    try {
      const res = await vendorApi.getShowSeatMap(show.id || show._id);
      if (res.success && res.data) {
        setSeatMapData(res.data);
      }
    } catch (err) {
      console.error('Failed to load show seat map:', err);
    } finally {
      setSeatMapLoading(false);
    }
  };

  const openCancelModal = (show) => {
    setSelectedShow(show);
    setIsCancelModalOpen(true);
  };

  const handleCreateShow = async (e) => {
    e.preventDefault();
    if (!formData.cinemaId || !formData.screenId || !formData.movieId || !formData.startTime) {
      setFormError('Cinema, screen, movie, and showtime are required.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      const res = await vendorApi.createShow({
        cinemaId: formData.cinemaId,
        screenId: formData.screenId,
        movieId: formData.movieId,
        showDate: formData.showDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        format: formData.format,
        ticketPrice: Number(formData.normalPrice) || 200,
        pricingTiers: {
          normal: Number(formData.normalPrice) || 200,
          premium: Number(formData.premiumPrice) || 280,
          recliner: Number(formData.reclinerPrice) || 450
        }
      });

      if (res.success) {
        setIsAddModalOpen(false);
        await loadAllData();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to schedule show.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelShow = async () => {
    if (!selectedShow) return;
    try {
      const res = await vendorApi.cancelShow(selectedShow.id || selectedShow._id);
      if (res.success) {
        setIsCancelModalOpen(false);
        await loadAllData();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel show');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Show Schedules & Timetables
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Program movie showtimes across auditoriums. Scheduled shows instantly appear for customer booking.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={openAddModal}
          disabled={cinemas.length === 0}
          className="inline-flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Schedule New Show</span>
        </Button>
      </div>

      {/* Date and Cinema Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          {['Today', 'Tomorrow', 'All'].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                selectedDate === d
                  ? 'bg-[#F84464] text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {d === 'Today' ? 'Today (Live)' : d}
            </button>
          ))}
        </div>

        {cinemas.length > 1 && (
          <div className="w-full sm:w-64">
            <select
              value={selectedCinemaId}
              onChange={(e) => setSelectedCinemaId(e.target.value)}
              className="w-full text-xs p-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="">All Multiplexes</option>
              {cinemas.map(c => (
                <option key={c.id || c._id} value={c.id || c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-500">
          Loading scheduled timetables...
        </div>
      ) : cinemas.length === 0 ? (
        <EmptyState
          title="Add a Cinema Venue First"
          description="Create your multiplex venue and auditoriums before programming showtimes."
          actionText="Add Cinema Venue"
          onAction={() => window.location.href = '/vendor/cinemas'}
        />
      ) : shows.length === 0 ? (
        <EmptyState
          title="No Shows Scheduled For Selected Date"
          description="Schedule a movie showtime on any of your configured auditoriums. Customers can immediately book seats."
          actionText="Schedule Show"
          onAction={openAddModal}
        />
      ) : (
        <div className="space-y-4">
          {shows.map((show) => (
            <Card key={show.id || show._id} className="shadow-sm border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Movie & Venue Info */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-22 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                    <img
                      src={show.movie?.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80'}
                      alt={show.movieTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-gray-900">
                        {show.movieTitle}
                      </span>
                      <Badge variant="info" className="text-[10px]">
                        {show.format || '2D'}
                      </Badge>
                      {show.status === 'cancelled' && (
                        <Badge variant="danger" className="text-[10px]">
                          Cancelled
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1">
                      <MapPin size={13} className="text-[#F84464]" />
                      <span>{show.cinema?.name || 'Multiplex'}</span>
                      <span>•</span>
                      <span className="font-medium text-indigo-600">{show.screen?.name || 'Screen 1'}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span className="font-semibold text-gray-800">{show.startTime}</span>
                        <span>- {show.endTime}</span>
                      </div>
                      <span>•</span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px] font-medium text-gray-700">
                        {show.showDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Capacity & Occupancy Progress */}
                <div className="md:w-56 flex flex-col justify-center">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500 font-medium">Occupancy</span>
                    <span className="font-bold text-gray-900">
                      {show.bookedSeatsCount} / {show.totalCapacity} Seats ({show.occupancyRate}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        show.occupancyRate > 80
                          ? 'bg-rose-500'
                          : show.occupancyRate > 40
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(show.occupancyRate, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                    <span>From ₹{show.pricingTiers?.normal || show.ticketPrice}</span>
                    <span className="text-emerald-600 font-medium">Live for Booking</span>
                  </div>
                </div>

                {/* Show Actions */}
                <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <button
                    onClick={() => openSeatMapModal(show)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition"
                    title="View Live Seat Layout & Heatmap"
                  >
                    <Eye size={14} />
                    <span>Live Seat Map</span>
                  </button>

                  {show.status !== 'cancelled' && (
                    <button
                      onClick={() => openCancelModal(show)}
                      className="p-2 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Cancel Show"
                    >
                      <Ban size={15} />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Schedule Show Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Movie Show"
        maxWidth="max-w-lg"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateShow} className="space-y-4">
          <Select
            label="Movie"
            required
            value={formData.movieId}
            onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
            options={movies.map(m => ({ value: m.id || m._id, label: m.title }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Cinema Multiplex"
              required
              value={formData.cinemaId}
              onChange={(e) => setFormData({ ...formData, cinemaId: e.target.value })}
              options={cinemas.map(c => ({ value: c.id || c._id, label: c.name }))}
            />

            <Select
              label="Auditorium Screen"
              required
              value={formData.screenId}
              onChange={(e) => setFormData({ ...formData, screenId: e.target.value })}
              options={screens.map(s => ({ value: s.id || s._id, label: `${s.name} (${s.totalCapacity} seats)` }))}
              disabled={screens.length === 0}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Date"
              value={formData.showDate}
              onChange={(e) => setFormData({ ...formData, showDate: e.target.value })}
              options={[
                { value: 'Today', label: 'Today' },
                { value: 'Tomorrow', label: 'Tomorrow' }
              ]}
            />

            <Select
              label="Start Time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              options={COMMON_SHOWTIMES.map(t => ({ value: t, label: t }))}
            />

            <Select
              label="Format"
              value={formData.format}
              onChange={(e) => setFormData({ ...formData, format: e.target.value })}
              options={[
                { value: '2D', label: '2D' },
                { value: '3D', label: '3D' },
                { value: 'IMAX 2D', label: 'IMAX 2D' },
                { value: 'IMAX 3D', label: 'IMAX 3D' },
                { value: '4DX', label: '4DX' }
              ]}
            />
          </div>

          {/* Pricing Tiers */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Ticket Pricing Tiers (₹)
            </p>
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Normal Tier"
                type="number"
                value={formData.normalPrice}
                onChange={(e) => setFormData({ ...formData, normalPrice: e.target.value })}
              />
              <Input
                label="Premium Tier"
                type="number"
                value={formData.premiumPrice}
                onChange={(e) => setFormData({ ...formData, premiumPrice: e.target.value })}
              />
              <Input
                label="Recliner Tier"
                type="number"
                value={formData.reclinerPrice}
                onChange={(e) => setFormData({ ...formData, reclinerPrice: e.target.value })}
              />
            </div>
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
              Publish Showtime Live
            </Button>
          </div>
        </form>
      </Modal>

      {/* Live Seat Map Modal */}
      <Modal
        isOpen={isSeatMapModalOpen}
        onClose={() => setIsSeatMapModalOpen(false)}
        title={`Live Seat Map • ${selectedShow?.movieTitle}`}
        maxWidth="max-w-2xl"
      >
        {seatMapLoading ? (
          <div className="py-16 text-center text-sm text-gray-500">
            Loading real-time auditorium seat matrix...
          </div>
        ) : seatMapData ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs">
              <div>
                <span className="font-semibold text-gray-900">{seatMapData.cinema?.name}</span>
                <span className="text-gray-500"> • {seatMapData.screen?.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-emerald-700 font-semibold">
                  {seatMapData.totalCapacity - seatMapData.totalBookedSeats} Available
                </span>
                <span className="text-rose-700 font-semibold">
                  {seatMapData.totalBookedSeats} Booked
                </span>
              </div>
            </div>

            {/* Screen Direction */}
            <div className="text-center py-2">
              <div className="w-3/4 mx-auto h-2 bg-gradient-to-b from-indigo-300 to-transparent rounded-t-full" />
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                All Eyes This Way Please (Screen)
              </p>
            </div>

            {/* Rows and Seats Preview */}
            <div className="space-y-2 max-h-72 overflow-y-auto p-2 bg-gray-50/50 rounded-lg border border-gray-100">
              {(seatMapData.screen?.seatingLayout || []).map((row) => (
                <div key={row.row} className="flex items-center gap-2 justify-center">
                  <span className="w-5 text-center font-mono font-bold text-xs text-gray-500">
                    {row.row}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: row.seatsCount || 12 }).map((_, idx) => {
                      const seatCode = `${row.row}-${idx + 1}`;
                      const isBooked = (seatMapData.show?.bookedSeats || []).includes(seatCode);
                      return (
                        <div
                          key={seatCode}
                          className={`w-6 h-6 rounded text-[9px] font-mono flex items-center justify-center font-semibold transition ${
                            isBooked
                              ? 'bg-rose-500 text-white shadow-sm'
                              : 'bg-white border border-gray-300 text-gray-700 hover:border-indigo-400'
                          }`}
                          title={`${seatCode} • ${isBooked ? 'Booked' : 'Available'}`}
                        >
                          {idx + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 pt-2 border-t border-gray-100 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 bg-white border border-gray-300 rounded" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 bg-rose-500 rounded" />
                <span>Booked by Customer</span>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Cancel Show Modal */}
      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelShow}
        title="Cancel Scheduled Show"
        message={`Are you sure you want to cancel '${selectedShow?.movieTitle}' at ${selectedShow?.startTime}? Customers will no longer be able to book this show.`}
        confirmText="Yes, Cancel Show"
        type="danger"
      />
    </div>
  );
}
