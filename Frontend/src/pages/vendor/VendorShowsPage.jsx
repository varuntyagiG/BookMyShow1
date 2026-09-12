import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { vendorApi } from '../../services/vendorApi';
import {
  Button,
  Card,
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
  CheckCircle2,
  RefreshCw,
  Search,
  LayoutGrid,
  ListFilter,
  Armchair,
  TrendingUp,
  Ticket,
  ChevronRight,
  Sparkles,
  Info,
  DollarSign
} from 'lucide-react';

const COMMON_SHOWTIMES = [
  '09:30 AM',
  '10:15 AM',
  '11:45 AM',
  '12:45 PM',
  '01:30 PM',
  '03:15 PM',
  '04:00 PM',
  '05:00 PM',
  '06:45 PM',
  '07:30 PM',
  '08:45 PM',
  '10:15 PM',
  '10:45 PM'
];

/**
 * Helper to calculate estimated end time based on start time and movie runtime
 */
function calculateEndTime(startTimeStr, durationStr = '2h 30m') {
  if (!startTimeStr) return '10:15 PM';

  // Parse start time (e.g. "07:30 PM")
  const match = startTimeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return '10:15 PM';

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  // Parse duration (e.g. "2h 46m" or "2h 30m" or "150m")
  let addMinutes = 150; // default 2.5 hours
  const hMatch = durationStr.match(/(\d+)\s*h/i);
  const mMatch = durationStr.match(/(\d+)\s*m/i);

  if (hMatch || mMatch) {
    const durH = hMatch ? parseInt(hMatch[1], 10) : 0;
    const durM = mMatch ? parseInt(mMatch[1], 10) : 0;
    addMinutes = durH * 60 + durM + 15; // 15 mins for cleaning/intermission
  }

  const totalStartMinutes = hours * 60 + minutes;
  const totalEndMinutes = (totalStartMinutes + addMinutes) % (24 * 60);

  let endH = Math.floor(totalEndMinutes / 60);
  const endM = totalEndMinutes % 60;
  const endPeriod = endH >= 12 ? 'PM' : 'AM';

  if (endH > 12) endH -= 12;
  if (endH === 0) endH = 12;

  const padH = String(endH).padStart(2, '0');
  const padM = String(endM).padStart(2, '0');

  return `${padH}:${padM} ${endPeriod}`;
}

export default function VendorShowsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const movieIdParam = searchParams.get('movieId') || '';

  const [shows, setShows] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [screens, setScreens] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [selectedDate, setSelectedDate] = useState('All');
  const [selectedCinemaId, setSelectedCinemaId] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'filling_fast' | 'cancelled'
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'timeline'

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSeatMapModalOpen, setIsSeatMapModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState(null);
  const [seatMapData, setSeatMapData] = useState(null);
  const [seatMapLoading, setSeatMapLoading] = useState(false);
  const [seatMapTab, setSeatMapTab] = useState('seats'); // 'seats' | 'manifest'

  // Form State for Adding Show
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

  const loadAllData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const [cinemasRes, moviesRes, showsRes] = await Promise.all([
        vendorApi.getCinemas(),
        vendorApi.getMovies(),
        vendorApi.getShows({
          ...(selectedDate && selectedDate !== 'All' ? { date: selectedDate } : {}),
          ...(selectedCinemaId ? { cinemaId: selectedCinemaId } : {})
        })
      ]);

      if (cinemasRes.success) setCinemas(cinemasRes.data || []);
      if (moviesRes.success) setMovies(moviesRes.data || []);
      if (showsRes.success) setShows(showsRes.data || []);
    } catch (err) {
      console.error('Failed to load shows data:', err);
    } finally {
      setLoading(false);
      if (isManualRefresh) setRefreshing(false);
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
          if (res.success && res.data) {
            setScreens(res.data);
            if (res.data.length > 0) {
              const firstScreen = res.data[0];
              const screenId = firstScreen.id || firstScreen._id;
              setFormData(prev => ({
                ...prev,
                screenId,
                format: firstScreen.screenType?.includes('IMAX') ? 'IMAX 2D' : '2D'
              }));
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

  // Auto-calculate end time when movie or start time changes in Add Modal
  const handleStartTimeChange = (newStartTime) => {
    const selectedMovie = movies.find(m => (m.id || m._id) === formData.movieId);
    const calculatedEnd = calculateEndTime(newStartTime, selectedMovie?.duration || '2h 30m');
    setFormData(prev => ({
      ...prev,
      startTime: newStartTime,
      endTime: calculatedEnd
    }));
  };

  const handleMovieSelectChange = (newMovieId) => {
    const selectedMovie = movies.find(m => (m.id || m._id) === newMovieId);
    const calculatedEnd = calculateEndTime(formData.startTime, selectedMovie?.duration || '2h 30m');
    const defaultFormat = selectedMovie?.formats?.[0] || '2D';
    setFormData(prev => ({
      ...prev,
      movieId: newMovieId,
      endTime: calculatedEnd,
      format: defaultFormat
    }));
  };

  const openAddModal = () => {
    const firstCinemaId = cinemas[0]?.id || cinemas[0]?._id || '';
    const firstMovieId = movieIdParam || (movies[0]?.id || movies[0]?._id || '');
    const firstMovie = movies.find(m => (m.id || m._id) === firstMovieId);

    setFormData({
      cinemaId: firstCinemaId,
      screenId: '',
      movieId: firstMovieId,
      showDate: 'Today',
      startTime: '07:30 PM',
      endTime: calculateEndTime('07:30 PM', firstMovie?.duration || '2h 30m'),
      format: firstMovie?.formats?.[0] || '2D',
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
    setSeatMapTab('seats');

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

  // ----------------------------------------------------
  // Computed Filtered Shows & Key Metrics
  // ----------------------------------------------------
  const filteredShows = useMemo(() => {
    return shows.filter(show => {
      // 1. Status Filter
      if (statusFilter === 'active' && show.status === 'cancelled') return false;
      if (statusFilter === 'cancelled' && show.status !== 'cancelled') return false;
      if (statusFilter === 'filling_fast' && (show.occupancyRate < 70 || show.status === 'cancelled')) return false;

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = (show.movieTitle || show.movie?.title || '').toLowerCase().includes(query);
        const cinemaMatch = (show.cinema?.name || '').toLowerCase().includes(query);
        const screenMatch = (show.screen?.name || '').toLowerCase().includes(query);
        const formatMatch = (show.format || '').toLowerCase().includes(query);
        if (!titleMatch && !cinemaMatch && !screenMatch && !formatMatch) return false;
      }

      return true;
    });
  }, [shows, statusFilter, searchQuery]);

  // Aggregate Metrics across loaded shows
  const metrics = useMemo(() => {
    const totalShowsCount = shows.length;
    const activeShows = shows.filter(s => s.status !== 'cancelled');
    const totalTicketsSold = shows.reduce((acc, s) => acc + (s.bookedSeatsCount || 0), 0);
    const totalCapacity = shows.reduce((acc, s) => acc + (s.totalCapacity || 120), 0);
    const avgOccupancy = totalCapacity > 0 ? Math.round((totalTicketsSold / totalCapacity) * 100) : 0;

    const estRevenue = shows.reduce((acc, s) => {
      const baseRate = s.pricingTiers?.normal || s.ticketPrice || 200;
      return acc + ((s.bookedSeatsCount || 0) * baseRate);
    }, 0);

    return {
      totalShowsCount,
      activeShowsCount: activeShows.length,
      totalTicketsSold,
      avgOccupancy,
      estRevenue
    };
  }, [shows]);

  // Group shows by Cinema & Screen for Timetable View
  const groupedByScreen = useMemo(() => {
    const groups = {};
    filteredShows.forEach(show => {
      const cinemaName = show.cinema?.name || 'Multiplex';
      const screenName = show.screen?.name || 'Main Audi';
      const key = `${cinemaName} • ${screenName}`;
      if (!groups[key]) {
        groups[key] = {
          cinema: show.cinema,
          screen: show.screen,
          key,
          shows: []
        };
      }
      groups[key].shows.push(show);
    });

    // Sort shows inside each screen chronologically
    Object.values(groups).forEach(g => {
      g.shows.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    });

    return Object.values(groups);
  }, [filteredShows]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-rose-50 text-[#F84464] border border-rose-100">
              <Film size={12} />
              Box Office Programming
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">Real-Time Sync</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Show Schedules & Timetables
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Program cinema showtimes across auditoriums. Published schedules immediately reflect on the BookMyTrip customer booking app.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => loadAllData(true)}
            disabled={refreshing}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition shadow-2xs"
            title="Refresh Schedules"
          >
            <RefreshCw size={17} className={refreshing ? 'animate-spin text-[#F84464]' : ''} />
          </button>

          <Button
            variant="primary"
            onClick={openAddModal}
            disabled={cinemas.length === 0}
            className="inline-flex items-center gap-2 shadow-sm font-bold bg-[#F84464] hover:bg-[#E23454] px-4 py-2.5 rounded-xl text-white transition"
          >
            <Plus size={18} />
            <span>Schedule New Show</span>
          </Button>
        </div>
      </div>

      {/* KPI Performance Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Scheduled Shows */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <Calendar size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Shows
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                {metrics.totalShowsCount}
              </span>
              <span className="text-[11px] font-bold text-emerald-600">
                {metrics.activeShowsCount} Live
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Tickets Booked */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#F84464] border border-rose-100 flex items-center justify-center shrink-0">
            <Ticket size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tickets Booked
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                {metrics.totalTicketsSold}
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                Admissions
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Avg Occupancy */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Avg. Occupancy
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                {metrics.avgOccupancy}%
              </span>
              <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${Math.min(metrics.avgOccupancy, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Metric 4: Est. Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <TrendingUp size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Est. Box Office
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                ₹{metrics.estRevenue.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                Gross
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Filter & View Controls */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        {/* Left: Date Selector & Search Input */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Date Segmented Control */}
          <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/70">
            {[
              { id: 'All', label: 'All Dates' },
              { id: 'Today', label: 'Today (Live)' },
              { id: 'Tomorrow', label: 'Tomorrow' }
            ].map(tab => {
              const count = tab.id === 'All'
                ? shows.length
                : shows.filter(s => s.showDate === tab.id).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedDate(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    selectedDate === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      selectedDate === tab.id
                        ? 'bg-[#F84464] text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search movie or screen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F84464]/20 focus:border-[#F84464] transition"
            />
          </div>
        </div>

        {/* Right: Venue Filter, Status Filter & View Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Cinema Filter (if multiple) */}
          {cinemas.length > 1 && (
            <select
              value={selectedCinemaId}
              onChange={(e) => setSelectedCinemaId(e.target.value)}
              className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:bg-white focus:outline-none focus:border-[#F84464]"
            >
              <option value="">All Multiplex Venues</option>
              {cinemas.map(c => (
                <option key={c.id || c._id} value={c.id || c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {/* Status Filter */}
          <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/70 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                statusFilter === 'active'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live
            </button>
            <button
              onClick={() => setStatusFilter('filling_fast')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                statusFilter === 'filling_fast'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              &gt;70%
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                statusFilter === 'cancelled'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cancelled
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/70">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Detailed Cards Layout"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'timeline'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Screen Timetable View"
            >
              <Calendar size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#F84464] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-700">Loading Scheduled Timetables...</p>
          <p className="text-xs text-slate-400">Connecting to cloud auditoriums & live seat matrices</p>
        </div>
      ) : cinemas.length === 0 ? (
        <EmptyState
          title="Add a Cinema Venue First"
          description="Create your multiplex venue and configure auditoriums before programming movie showtimes."
          actionText="Add Cinema Venue"
          onAction={() => window.location.href = '/vendor/cinemas'}
        />
      ) : filteredShows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-[#F84464] flex items-center justify-center mx-auto shadow-2xs">
            <Calendar size={26} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              No Showtimes Found for Current Filters
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {searchQuery
                ? `No scheduled show matches "${searchQuery}". Try changing search terms or filters.`
                : 'No movie shows match your selected date and status filters. Schedule a new show to start selling tickets.'}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-[#F84464] hover:bg-[#E23454] text-white px-4 py-2 rounded-xl text-xs font-bold"
          >
            <Plus size={15} />
            <span>Schedule Show Now</span>
          </Button>
        </div>
      ) : viewMode === 'cards' ? (
        /* ========================================================
           VIEW MODE 1: DETAILED, ELEGANTLY ALIGNED SHOW CARDS
           ======================================================== */
        <div className="space-y-3.5">
          {filteredShows.map((show) => {
            const isCancelled = show.status === 'cancelled';
            const isFillingFast = show.occupancyRate > 70 && !isCancelled;
            const isAlmostFull = show.occupancyRate > 90 && !isCancelled;
            const availableSeats = Math.max(0, (show.totalCapacity || 120) - (show.bookedSeatsCount || 0));
            const estShowRevenue = (show.bookedSeatsCount || 0) * (show.pricingTiers?.normal || show.ticketPrice || 200);

            return (
              <div
                key={show.id || show._id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden relative group"
              >
                {/* Status Indicator Stripe on Left */}
                <div
                  className={`absolute top-0 bottom-0 left-0 w-1.5 transition-colors ${
                    isCancelled
                      ? 'bg-rose-500'
                      : isAlmostFull
                      ? 'bg-gradient-to-b from-purple-500 to-rose-500'
                      : isFillingFast
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />

                <div className="p-4 sm:p-5 pl-5 sm:pl-6 space-y-4">
                  {/* =========================================================================
                      ROW 1: FILM IDENTITY & TIMETABLES (Spacious, Zero Cut-offs)
                      ========================================================================= */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Left + Center: Poster & Film Metadata */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      {/* 2:3 Vertical Poster */}
                      <div className="relative w-20 sm:w-24 aspect-[2/3] rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80 shadow-xs group-hover:scale-105 transition-transform duration-300">
                        <img
                          src={
                            show.movie?.posterUrl ||
                            'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80'
                          }
                          alt={show.movieTitle}
                          className="w-full h-full object-cover"
                        />
                        {/* Format Badge Overlay */}
                        <div className="absolute top-1.5 left-1.5">
                          <span className="bg-black/85 backdrop-blur-xs text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-xs">
                            {show.format || '2D'}
                          </span>
                        </div>
                      </div>

                      {/* Movie Details (Zero Truncation, Natural Line Wrap) */}
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isCancelled ? (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                              Cancelled
                            </span>
                          ) : isAlmostFull ? (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
                              Almost Full ({show.occupancyRate}%)
                            </span>
                          ) : isFillingFast ? (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Filling Fast ({show.occupancyRate}%)
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Live on BookMyTrip
                            </span>
                          )}

                          {show.movie?.certificate && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {show.movie.certificate}
                            </span>
                          )}
                        </div>

                        {/* Full Movie Title (NO truncate, NO line-clamp) */}
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug group-hover:text-[#F84464] transition-colors break-words">
                          {show.movieTitle}
                        </h3>

                        {/* Language & Runtime */}
                        <p className="text-xs text-slate-500 font-medium">
                          {show.movie?.language || 'Hindi, English'} • {show.movie?.duration || '2h 30m'}
                        </p>

                        {/* Multiplex Venue & Screen (Full names, wrapping naturally) */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                            <MapPin size={13} className="text-[#F84464] shrink-0" />
                            <span>{show.cinema?.name || 'Multiplex Venue'}</span>
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-100/80 px-2.5 py-0.5 rounded-md text-indigo-900 font-bold text-xs">
                            <Tv size={12} className="text-indigo-600 shrink-0" />
                            <span>{show.screen?.name || 'Screen 1'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Dedicated Showtime Slot Box */}
                    <div className="shrink-0 md:text-right flex flex-col items-start md:items-end justify-center bg-slate-50/90 border border-slate-200/80 p-3 sm:p-3.5 rounded-xl min-w-[210px]">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                        <Clock size={13} />
                        <span>Programmed Slot</span>
                      </div>

                      <div className="flex items-baseline gap-1.5 font-mono">
                        <span className="text-base sm:text-lg font-black text-slate-950">
                          {show.startTime}
                        </span>
                        <span className="text-slate-400 font-bold text-xs">to</span>
                        <span className="text-sm sm:text-base font-bold text-slate-700">
                          {show.endTime}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-bold bg-white px-2.5 py-0.5 rounded-md border border-slate-200 text-slate-800 shadow-2xs">
                          {show.showDate}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {show.format || '2D'} Format
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* =========================================================================
                      ROW 2: CAPACITY, PRICING TIERS & ACTIONS (Zero Truncation, Multi-Column)
                      ========================================================================= */}
                  <div className="border-t border-slate-100/90 pt-3.5 mt-2 bg-slate-50/60 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-4 sm:p-5 rounded-b-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Capacity & Hall Occupancy Progress */}
                    <div className="lg:w-[320px] xl:w-[350px] shrink-0 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                          Auditorium Capacity
                        </span>
                        <span className="font-bold text-slate-900 font-mono text-xs">
                          {show.bookedSeatsCount} / {show.totalCapacity} Booked ({show.occupancyRate}%)
                        </span>
                      </div>

                      {/* Gradient Progress Bar */}
                      <div className="w-full h-2.5 bg-slate-200/90 rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            isCancelled
                              ? 'bg-slate-300'
                              : show.occupancyRate > 80
                              ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                              : show.occupancyRate > 40
                              ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(show.occupancyRate, 100)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-emerald-700 font-bold text-[11px]">
                          {availableSeats} seats open for booking
                        </span>
                        <span className="text-slate-500 font-mono text-[11px]">
                          ₹{estShowRevenue.toLocaleString('en-IN')} Gross
                        </span>
                      </div>
                    </div>

                    {/* Center: Ticket Pricing Matrix (All Tiers Visible, No Cut-Offs) */}
                    <div className="flex-1 min-w-0 lg:px-4 border-t lg:border-t-0 lg:border-l lg:border-r border-slate-200/70 pt-3 lg:pt-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Configured Ticket Tiers
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs text-xs">
                          <span className="text-slate-500 font-medium">Normal:</span>
                          <span className="font-mono font-black text-slate-900">
                            ₹{show.pricingTiers?.normal || show.ticketPrice || 200}
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs text-xs">
                          <span className="text-slate-500 font-medium">Premium:</span>
                          <span className="font-mono font-black text-slate-900">
                            ₹{show.pricingTiers?.premium || 280}
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs text-xs">
                          <span className="text-slate-500 font-medium">Recliner:</span>
                          <span className="font-mono font-black text-slate-900">
                            ₹{show.pricingTiers?.recliner || 450}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Operational Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200/70 justify-end">
                      <button
                        onClick={() => openSeatMapModal(show)}
                        className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/90 px-4 py-2.5 rounded-xl transition shadow-2xs"
                        title="View Live Seat Layout & Heatmap"
                      >
                        <Armchair size={15} className="text-indigo-600" />
                        <span>Live Seat Map</span>
                      </button>

                      {show.status !== 'cancelled' ? (
                        <button
                          onClick={() => openCancelModal(show)}
                          className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-2.5 rounded-xl border border-slate-200/80 hover:border-rose-200 transition"
                          title="Cancel Showtime"
                        >
                          <Ban size={14} />
                          <span>Cancel Show</span>
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-rose-500 uppercase px-3 py-2 bg-rose-50 rounded-xl border border-rose-100">
                          Show Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ========================================================
           VIEW MODE 2: CHRONOLOGICAL SCREEN TIMETABLE MATRIX
           ======================================================== */
        <div className="space-y-4">
          {groupedByScreen.map(group => (
            <div
              key={group.key}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                    <Tv size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {group.screen?.name || 'Auditorium Screen'}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={11} className="text-[#F84464]" />
                      <span>{group.cinema?.name}</span>
                      <span>•</span>
                      <span>Capacity: {group.screen?.totalCapacity || 120} Seats</span>
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                  {group.shows.length} Showtimes Programmed
                </span>
              </div>

              {/* Showtimes Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
                {group.shows.map(show => {
                  const isCancelled = show.status === 'cancelled';
                  return (
                    <div
                      key={show.id || show._id}
                      onClick={() => openSeatMapModal(show)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                        isCancelled
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {show.startTime}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700">
                          {show.format || '2D'}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-slate-800 break-words group-hover:text-[#F84464] transition">
                        {show.movieTitle}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                        <span>{show.bookedSeatsCount} / {show.totalCapacity} Booked</span>
                        <span className="font-bold text-slate-800">{show.occupancyRate}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================
          SCHEDULE SHOW MODAL
          ======================================================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Movie Showtime"
        maxWidth="max-w-xl"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateShow} className="space-y-4">
          {/* Movie Picker with thumbnail preview */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Film from Catalog <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.movieId}
              onChange={(e) => handleMovieSelectChange(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#F84464]/20 focus:border-[#F84464]"
              required
            >
              {movies.map(m => (
                <option key={m.id || m._id} value={m.id || m._id}>
                  {m.title} ({m.language || 'Hindi'} • {m.duration || '2h 30m'})
                </option>
              ))}
            </select>
          </div>

          {/* Cinema & Screen Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Cinema Multiplex <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.cinemaId}
                onChange={(e) => setFormData({ ...formData, cinemaId: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white font-medium"
                required
              >
                {cinemas.map(c => (
                  <option key={c.id || c._id} value={c.id || c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Auditorium Screen <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.screenId}
                onChange={(e) => setFormData({ ...formData, screenId: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white font-medium"
                required
                disabled={screens.length === 0}
              >
                {screens.length === 0 ? (
                  <option value="">No screens created for cinema</option>
                ) : (
                  screens.map(s => (
                    <option key={s.id || s._id} value={s.id || s._id}>
                      {s.name} ({s.totalCapacity || 120} seats)
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Date, Start Time & Format */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Date
              </label>
              <select
                value={formData.showDate}
                onChange={(e) => setFormData({ ...formData, showDate: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white font-medium"
              >
                <option value="Today">Today (Live)</option>
                <option value="Tomorrow">Tomorrow</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Start Time
              </label>
              <select
                value={formData.startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white font-medium"
              >
                {COMMON_SHOWTIMES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Projection Format
              </label>
              <select
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white font-medium"
              >
                <option value="2D">2D</option>
                <option value="3D">3D</option>
                <option value="IMAX 2D">IMAX 2D</option>
                <option value="IMAX 3D">IMAX 3D</option>
                <option value="4DX">4DX</option>
              </select>
            </div>
          </div>

          {/* Estimated End Time Notice */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-slate-400" />
              <span>Calculated Runtime & End Time:</span>
            </span>
            <span className="font-mono font-bold text-slate-900">
              {formData.endTime}
            </span>
          </div>

          {/* Pricing Tiers */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
            <p className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>Ticket Pricing Structure (₹)</span>
              <span className="text-[10px] text-slate-500 font-normal">Per Seat Basis</span>
            </p>
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Normal (Classic)"
                type="number"
                value={formData.normalPrice}
                onChange={(e) => setFormData({ ...formData, normalPrice: e.target.value })}
              />
              <Input
                label="Premium"
                type="number"
                value={formData.premiumPrice}
                onChange={(e) => setFormData({ ...formData, premiumPrice: e.target.value })}
              />
              <Input
                label="Recliner (VIP)"
                type="number"
                value={formData.reclinerPrice}
                onChange={(e) => setFormData({ ...formData, reclinerPrice: e.target.value })}
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
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
              className="bg-[#F84464] hover:bg-[#E23454] text-white font-bold"
            >
              Publish Showtime Live
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================
          LIVE SEAT MAP & CUSTOMER MANIFEST MODAL
          ======================================================== */}
      <Modal
        isOpen={isSeatMapModalOpen}
        onClose={() => setIsSeatMapModalOpen(false)}
        title={`Auditorium Seat Manifest • ${selectedShow?.movieTitle || 'Show'}`}
        maxWidth="max-w-2xl"
      >
        {seatMapLoading ? (
          <div className="py-16 text-center text-xs text-slate-500 space-y-2">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-bold">Loading real-time auditorium matrix & bookings...</p>
          </div>
        ) : seatMapData ? (
          <div className="space-y-4">
            {/* Show Header Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs gap-3">
              <div>
                <p className="font-bold text-slate-900 text-sm">
                  {seatMapData.cinema?.name}
                </p>
                <p className="text-slate-500 text-[11px]">
                  {seatMapData.screen?.name} • {selectedShow?.startTime} ({selectedShow?.showDate}) • {selectedShow?.format || '2D'}
                </p>
              </div>

              {/* Real-time Counts */}
              <div className="flex items-center gap-3">
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {Math.max(0, (seatMapData.totalCapacity || 120) - (seatMapData.totalBookedSeats || 0))} Available
                </span>
                <span className="text-rose-700 font-bold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                  {seatMapData.totalBookedSeats || 0} Booked
                </span>
              </div>
            </div>

            {/* Modal Tabs: Seat Grid vs Booking Manifest */}
            <div className="flex items-center border-b border-slate-200">
              <button
                onClick={() => setSeatMapTab('seats')}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition ${
                  seatMapTab === 'seats'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Armchair size={14} />
                <span>Auditorium Layout</span>
              </button>
              <button
                onClick={() => setSeatMapTab('manifest')}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition ${
                  seatMapTab === 'manifest'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Ticket size={14} />
                <span>Bookings Manifest ({seatMapData.recentBookings?.length || 0})</span>
              </button>
            </div>

            {seatMapTab === 'seats' ? (
              <div className="space-y-3">
                {/* Curved Movie Screen Visual */}
                <div className="text-center py-2">
                  <div className="w-3/4 mx-auto h-2 bg-gradient-to-b from-indigo-400 via-indigo-300 to-transparent rounded-t-full shadow-sm" />
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1 font-mono">
                    All Eyes This Way Please (Screen)
                  </p>
                </div>

                {/* Rows and Seats Grid */}
                <div className="space-y-2 max-h-72 overflow-y-auto p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                  {(seatMapData.screen?.seatingLayout || []).map((row) => (
                    <div key={row.row} className="flex items-center gap-2 justify-center">
                      <span className="w-5 text-center font-mono font-bold text-xs text-slate-400">
                        {row.row}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap justify-center">
                        {Array.from({ length: row.seatsCount || 12 }).map((_, idx) => {
                          const seatCode = `${row.row}-${idx + 1}`;
                          const isBooked = (seatMapData.show?.bookedSeats || []).includes(seatCode);

                          return (
                            <div
                              key={seatCode}
                              className={`w-6 h-6 rounded text-[9px] font-mono flex items-center justify-center font-bold transition ${
                                isBooked
                                  ? 'bg-rose-500 text-white shadow-xs'
                                  : 'bg-white border border-slate-300 text-slate-700 hover:border-indigo-500'
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
                <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 bg-white border border-slate-300 rounded" />
                    <span>Available Seat</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 bg-rose-500 rounded" />
                    <span>Booked Seat</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Manifest View */
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {(!seatMapData.recentBookings || seatMapData.recentBookings.length === 0) ? (
                  <p className="text-center text-xs text-slate-400 py-8">
                    No confirmed reservations on this showtime yet.
                  </p>
                ) : (
                  seatMapData.recentBookings.map((b, idx) => (
                    <div
                      key={b.bookingId || idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{b.customerName}</span>
                          <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded">
                            {b.bookingId}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Seats: <strong className="text-slate-800">{b.seats?.join(', ')}</strong>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900">₹{b.totalAmount}</span>
                        <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                          {b.ticketValidated ? '✓ Scanned at Gate' : 'Pending Entry'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* ========================================================
          CANCEL SHOWTIME CONFIRMATION MODAL
          ======================================================== */}
      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelShow}
        title="Cancel Scheduled Showtime"
        message={`Are you sure you want to cancel '${selectedShow?.movieTitle}' at ${selectedShow?.startTime} on ${selectedShow?.showDate}? Customers will no longer be able to book this show, and current status will be marked as cancelled.`}
        confirmText="Yes, Cancel Showtime"
        type="danger"
      />
    </div>
  );
}
