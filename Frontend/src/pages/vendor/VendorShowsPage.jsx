import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { vendorApi } from '../../services/vendorApi';
import { useRealtimeRefresh } from '../../services/realtimeSync';
import { getSocket } from '../../services/socketClient';
import {
  Button,
  Modal,
  ConfirmModal,
  Input,
  EmptyState,
  SlideOverDrawer
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
  Ban,
  RefreshCw,
  Search,
  LayoutGrid,
  Rows3,
  Armchair,
  TrendingUp,
  Ticket,
  Building2,
  ChevronDown,
  Check,
  X
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

/**
 * Normalizes seat identifiers to ensure seamless matching regardless of hyphens/spacing
 * e.g., "B1", "B-1", "b 1" all normalize to "B1"
 */
function normalizeSeatCode(seat) {
  if (!seat) return '';
  return String(seat).replace(/[-\s]/g, '').toUpperCase();
}

export default function VendorShowsPage() {
  const [searchParams] = useSearchParams();
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
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'grid' | 'timeline' | 'by_movie'
  const [isVenueDropdownOpen, setIsVenueDropdownOpen] = useState(false);
  const venueDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (venueDropdownRef.current && !venueDropdownRef.current.contains(event.target)) {
        setIsVenueDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeCinema = useMemo(() => {
    return cinemas.find(c => (c.id || c._id) === selectedCinemaId);
  }, [cinemas, selectedCinemaId]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSeatMapModalOpen, setIsSeatMapModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState(null);
  const [seatMapData, setSeatMapData] = useState(null);
  const [seatMapLoading, setSeatMapLoading] = useState(false);
  const [seatMapTab, setSeatMapTab] = useState('seats'); // 'seats' | 'manifest'
  const [liveSelectingSeats, setLiveSelectingSeats] = useState([]);

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

  // Real-time reactive sync across tabs & portals
  useRealtimeRefresh(['SHOW_MUTATION', 'BOOKING_MUTATION', 'MOVIE_MUTATION', 'SCREEN_MUTATION', 'SEAT_SELECTION_UPDATED'], async () => {
    loadAllData(false);
    if (isSeatMapModalOpen && selectedShow) {
      try {
        const res = await vendorApi.getShowSeatMap(selectedShow.id || selectedShow._id);
        if (res.success && res.data) {
          setSeatMapData(res.data);
        }
      } catch (_e) {}
    }
  });

  // Real-time WebSocket connection for live Heat Map & Seat Locking
  useEffect(() => {
    if (!isSeatMapModalOpen || !selectedShow) return;

    const showId = String(selectedShow.id || selectedShow._id);
    let socket = null;
    try {
      socket = getSocket();
    } catch (_socketErr) {
      console.warn('Socket client initialization warning:', _socketErr);
    }

    if (socket) {
      // Join real-time room for this showtime
      socket.emit('join_show', showId);

      // 1. Listen for immediate seat locking by any customer
      const handleSeatsLocked = (data) => {
        if (data && String(data.showId) === showId) {
          setSeatMapData((prev) => {
            if (!prev) return prev;
            const updatedBooked = Array.from(new Set([...(prev.show?.bookedSeats || []), ...(data.seats || [])]));
            return {
              ...prev,
              show: { ...prev.show, bookedSeats: updatedBooked },
              totalBookedSeats: updatedBooked.length
            };
          });
          // Remove booked seats from live selecting
          setLiveSelectingSeats((prev) => prev.filter((s) => !(data.seats || []).includes(s)));
          loadAllData(false);
        }
      };

      // 2. Listen for in-progress seat selection by customer (Live Heatmap glow)
      const handleSeatsSelecting = (data) => {
        if (data && String(data.showId) === showId) {
          setLiveSelectingSeats(Array.isArray(data.seats) ? data.seats : []);
        }
      };

      // 3. Listen for new ticket sale to refresh manifest
      const handleNewSale = () => {
        vendorApi.getShowSeatMap(showId).then((res) => {
          if (res.success && res.data) {
            setSeatMapData(res.data);
          }
        }).catch(() => {});
        loadAllData(false);
      };

      socket.on('SEATS_LOCKED', handleSeatsLocked);
      socket.on('SEATS_SELECTING', handleSeatsSelecting);
      socket.on('NEW_TICKET_SALE', handleNewSale);

      return () => {
        socket.emit('leave_show', showId);
        socket.off('SEATS_LOCKED', handleSeatsLocked);
        socket.off('SEATS_SELECTING', handleSeatsSelecting);
        socket.off('NEW_TICKET_SALE', handleNewSale);
      };
    }
  }, [isSeatMapModalOpen, selectedShow]);

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
    setLiveSelectingSeats([]);

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

  // Group shows by Movie for Movie Showcase View
  const groupedByMovie = useMemo(() => {
    const groups = {};
    filteredShows.forEach(show => {
      const movieId = show.movie?.id || show.movie?._id || show.movieId || show.movieTitle;
      if (!groups[movieId]) {
        groups[movieId] = {
          movieId,
          movieTitle: show.movieTitle,
          movie: show.movie,
          shows: [],
          totalTickets: 0,
          totalCapacity: 0,
          totalRevenue: 0
        };
      }
      groups[movieId].shows.push(show);
      groups[movieId].totalTickets += (show.bookedSeatsCount || 0);
      groups[movieId].totalCapacity += (show.totalCapacity || 120);
      const baseRate = show.pricingTiers?.normal || show.ticketPrice || 200;
      groups[movieId].totalRevenue += ((show.bookedSeatsCount || 0) * baseRate);
    });

    Object.values(groups).forEach(g => {
      g.shows.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
      g.occupancyRate = g.totalCapacity > 0 ? Math.round((g.totalTickets / g.totalCapacity) * 100) : 0;
    });

    return Object.values(groups);
  }, [filteredShows]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#131624]/90 backdrop-blur-xl p-5 sm:p-6 rounded-2xl border border-white/[0.08] shadow-xl text-white">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-rose-500/10 text-[#F84464] border border-rose-500/20">
              <Film size={12} />
              Box Office Programming
            </span>
            <span className="text-white/20">•</span>
            <span className="text-xs text-slate-400 font-medium">Real-Time Sync</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Show Schedules & Timetables
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Program cinema showtimes across auditoriums. Published schedules immediately reflect on the BookMyTrip customer booking app.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => loadAllData(true)}
            disabled={refreshing}
            className="p-2.5 text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl transition shadow-2xs cursor-pointer"
            title="Refresh Schedules"
          >
            <RefreshCw size={17} className={refreshing ? 'animate-spin text-[#F84464]' : ''} />
          </button>

          <Button
            variant="primary"
            onClick={openAddModal}
            disabled={cinemas.length === 0}
            className="inline-flex items-center gap-2 shadow-[0_4px_20px_rgba(248,68,100,0.35)] font-bold bg-[#F84464] hover:bg-[#E23454] px-4 py-2.5 rounded-xl text-white transition"
          >
            <Plus size={18} />
            <span>Schedule New Show</span>
          </Button>
        </div>
      </div>

      {/* KPI Performance Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Scheduled Shows */}
        <div className="bg-[#131624]/90 backdrop-blur-xl p-4.5 rounded-2xl border border-white/[0.08] shadow-xl hover:border-white/20 transition-all flex items-center gap-3.5 text-white">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Calendar size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Shows
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-white">
                {metrics.totalShowsCount}
              </span>
              <span className="text-[11px] font-bold text-emerald-400">
                {metrics.activeShowsCount} Live
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Tickets Booked */}
        <div className="bg-[#131624]/90 backdrop-blur-xl p-4.5 rounded-2xl border border-white/[0.08] shadow-xl hover:border-white/20 transition-all flex items-center gap-3.5 text-white">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-[#F84464] border border-rose-500/20 flex items-center justify-center shrink-0">
            <Ticket size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tickets Booked
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-white">
                {metrics.totalTicketsSold}
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                Admissions
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Avg Occupancy */}
        <div className="bg-[#131624]/90 backdrop-blur-xl p-4.5 rounded-2xl border border-white/[0.08] shadow-xl hover:border-white/20 transition-all flex items-center gap-3.5 text-white">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Avg. Occupancy
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-white">
                {metrics.avgOccupancy}%
              </span>
              <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden shrink-0">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${Math.min(metrics.avgOccupancy, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Metric 4: Est. Revenue */}
        <div className="bg-[#131624]/90 backdrop-blur-xl p-4.5 rounded-2xl border border-white/[0.08] shadow-xl hover:border-white/20 transition-all flex items-center gap-3.5 text-white">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <TrendingUp size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Est. Box Office
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-white">
                ₹{metrics.estRevenue.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                Gross
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Filter & View Controls */}
      <div className="bg-[#131624]/90 backdrop-blur-xl p-3.5 sm:p-4 rounded-2xl border border-white/[0.08] shadow-xl flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 relative z-20 text-white">
        {/* Left: Date Selector & Search Input */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Date Segmented Control */}
          <div className="inline-flex p-1 bg-[#0b0d17] rounded-xl border border-white/[0.08]">
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedDate === tab.id
                      ? 'bg-[#F84464] text-white shadow-[0_2px_10px_rgba(248,68,100,0.35)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      selectedDate === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-white/10 text-slate-400'
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
              placeholder="Search movie, venue, screen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-7 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-slate-400 focus:bg-[#0c0e17] focus:outline-none focus:ring-2 focus:ring-[#F84464]/30 focus:border-[#F84464] transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right: Venue Dropdown, Status Filter & 4-Way View Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Custom Multiplex Selector Dropdown */}
          <div className="relative" ref={venueDropdownRef}>
            <button
              type="button"
              onClick={() => setIsVenueDropdownOpen(prev => !prev)}
              className={`px-3.5 py-2 rounded-xl border text-left transition-all duration-200 flex items-center justify-between gap-2.5 cursor-pointer text-xs shadow-2xs ${
                selectedCinemaId
                  ? 'bg-rose-500/10 border-[#F84464] ring-2 ring-[#F84464]/20 text-white'
                  : 'bg-white/[0.04] hover:bg-white/[0.07] border-white/10 text-white'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                  selectedCinemaId
                    ? 'bg-[#F84464] text-white border-[#F84464]'
                    : 'bg-white/10 text-slate-300 border-white/10'
                }`}>
                  {selectedCinemaId ? <MapPin size={12} /> : <Building2 size={12} />}
                </div>
                <span className="font-bold text-white truncate max-w-[150px]">
                  {activeCinema ? activeCinema.name : 'All Multiplexes'}
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform duration-200 ${
                  isVenueDropdownOpen ? 'rotate-180 text-white' : ''
                }`}
              />
            </button>

            {isVenueDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-[#121524]/98 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3.5 py-1.5 border-b border-white/[0.08] flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Multiplex Venues</span>
                  <span>{cinemas.length} Venues</span>
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCinemaId('');
                      setIsVenueDropdownOpen(false);
                    }}
                    className={`w-full px-3.5 py-2 flex items-center justify-between text-left transition text-xs cursor-pointer ${
                      !selectedCinemaId
                        ? 'bg-rose-500/15 text-[#F84464] font-bold'
                        : 'hover:bg-white/[0.06] text-slate-300 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className={!selectedCinemaId ? 'text-[#F84464]' : 'text-slate-400'} />
                      <span>All Multiplexes ({shows.length} Shows)</span>
                    </div>
                    {!selectedCinemaId && <Check size={14} className="text-[#F84464]" />}
                  </button>

                  <div className="my-1 border-t border-white/[0.06]" />

                  {cinemas.map(c => {
                    const id = c.id || c._id;
                    const isSelected = selectedCinemaId === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          setSelectedCinemaId(id);
                          setIsVenueDropdownOpen(false);
                        }}
                        className={`w-full px-3.5 py-2 flex items-center justify-between text-left transition text-xs cursor-pointer ${
                          isSelected
                            ? 'bg-rose-500/15 text-[#F84464] font-bold'
                            : 'hover:bg-white/[0.06] text-slate-300 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin size={14} className={isSelected ? 'text-[#F84464]' : 'text-slate-400'} />
                          <div className="truncate">
                            <p className="font-bold truncate text-white">{c.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{c.city}</p>
                          </div>
                        </div>
                        {isSelected && <Check size={14} className="text-[#F84464] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {selectedCinemaId && (
            <button
              type="button"
              onClick={() => setSelectedCinemaId('')}
              className="p-2 text-slate-400 hover:text-[#F84464] hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
              title="Clear cinema filter"
            >
              <X size={14} />
            </button>
          )}

          {/* Status Filter */}
          <div className="inline-flex p-1 bg-[#0b0d17] rounded-xl border border-white/[0.08] text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white/10 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Live
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('filling_fast')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                statusFilter === 'filling_fast'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              &gt;70%
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('cancelled')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                statusFilter === 'cancelled'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cancelled
            </button>
          </div>

          {/* 4-Way View Mode Switcher */}
          <div className="inline-flex p-1 bg-[#0b0d17] rounded-xl border border-white/[0.08] text-xs">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-[#F84464] text-white shadow-[0_2px_10px_rgba(248,68,100,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Detailed Wide Cards"
            >
              <Rows3 size={15} />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#F84464] text-white shadow-[0_2px_10px_rgba(248,68,100,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Compact Poster Grid"
            >
              <LayoutGrid size={15} />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-[#F84464] text-white shadow-[0_2px_10px_rgba(248,68,100,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Auditorium Screen Board"
            >
              <Calendar size={15} />
              <span className="hidden sm:inline">Screen Board</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('by_movie')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                viewMode === 'by_movie'
                  ? 'bg-[#F84464] text-white shadow-[0_2px_10px_rgba(248,68,100,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Grouped by Movie Showcase"
            >
              <Film size={15} />
              <span className="hidden sm:inline">By Movie</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-[#131624]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] p-16 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#F84464] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-white">Loading Scheduled Timetables...</p>
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
        <div className="bg-[#131624]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] p-12 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-[#F84464] flex items-center justify-center mx-auto shadow-2xs">
            <Calendar size={26} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              No Showtimes Found for Current Filters
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {searchQuery
                ? `No scheduled show matches "${searchQuery}". Try changing search terms or filters.`
                : 'No movie shows match your selected date and status filters. Schedule a new show to start selling tickets.'}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-[#F84464] hover:bg-[#E23454] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-[0_4px_16px_rgba(248,68,100,0.35)]"
          >
            <Plus size={15} />
            <span>Schedule Show Now</span>
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        /* ========================================================
           VIEW MODE 2: COMPACT POSTER GRID CARDS
           ======================================================== */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4.5">
          {filteredShows.map((show) => {
            const isCancelled = show.status === 'cancelled';
            const isFillingFast = show.occupancyRate > 70 && !isCancelled;
            const availableSeats = Math.max(0, (show.totalCapacity || 120) - (show.bookedSeatsCount || 0));

            return (
              <div
                key={show.id || show._id}
                className="bg-[#131624]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] hover:border-white/20 shadow-xl hover:shadow-2xl transition-all duration-200 overflow-hidden flex flex-col justify-between group text-white"
              >
                {/* Poster Header */}
                <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
                  <img
                    src={
                      show.movie?.posterUrl ||
                      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={show.movieTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f1a] via-[#0d0f1a]/30 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
                    <span className="bg-black/80 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-white/10 shadow-xs">
                      {show.format || '2D'}
                    </span>
                    {isCancelled ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/10">
                        Cancelled
                      </span>
                    ) : isFillingFast ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-xs animate-pulse">
                        {show.occupancyRate}% Full
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/90 text-white shadow-xs">
                        Live
                      </span>
                    )}
                  </div>

                  {/* Showtime Overlay on Poster Bottom */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
                    <span className="font-mono font-bold flex items-center gap-1 drop-shadow-sm text-white">
                      <Clock size={12} className="text-[#F84464]" />
                      {show.startTime}
                    </span>
                    <span className="text-[11px] font-medium bg-white/15 backdrop-blur-xs px-2 py-0.5 rounded text-slate-200">
                      {show.showDate}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-black text-white text-sm leading-snug group-hover:text-[#F84464] transition truncate" title={show.movieTitle}>
                      {show.movieTitle}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {show.movie?.language || 'Hindi'} • {show.movie?.duration || '2h 30m'}
                    </p>

                    {/* Venue & Screen */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-2">
                      <MapPin size={12} className="text-[#F84464] shrink-0" />
                      <span className="truncate font-medium">{show.cinema?.name}</span>
                      <span className="text-white/20">•</span>
                      <span className="font-bold text-indigo-400 text-[11px] shrink-0">{show.screen?.name}</span>
                    </div>
                  </div>

                  {/* Occupancy Progress */}
                  <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Occupancy</span>
                      <span className="font-mono font-bold text-white">
                        {show.bookedSeatsCount}/{show.totalCapacity} ({show.occupancyRate}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(show.occupancyRate, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{availableSeats} seats open</span>
                      <span className="font-bold text-slate-200">From ₹{show.pricingTiers?.normal || show.ticketPrice || 200}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={() => openSeatMapModal(show)}
                    className="w-full py-2 bg-rose-500/10 hover:bg-[#F84464] text-[#F84464] hover:text-white rounded-xl text-xs font-bold border border-rose-500/20 hover:border-[#F84464] transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer group/btn"
                  >
                    <Armchair size={14} className="group-hover/btn:scale-110 transition-transform" />
                    <span>View Seat Layout</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'timeline' ? (
        /* ========================================================
           VIEW MODE 3: AUDITORIUM SCREEN TIMETABLE MATRIX
           ======================================================== */
        <div className="space-y-4">
          {groupedByScreen.map(group => (
            <div
              key={group.key}
              className="bg-[#131624]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-xl p-5 space-y-3 text-white"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                    <Tv size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {group.screen?.name || 'Auditorium Screen'}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin size={11} className="text-[#F84464]" />
                      <span>{group.cinema?.name}</span>
                      <span>•</span>
                      <span>Capacity: {group.screen?.totalCapacity || 120} Seats</span>
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded-lg self-start sm:self-auto border border-indigo-500/30">
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
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer group ${
                        isCancelled
                          ? 'bg-white/[0.02] border-white/5 opacity-50'
                          : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono font-bold text-xs text-white bg-white/10 px-2 py-0.5 rounded">
                          {show.startTime}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                          {show.format || '2D'}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-slate-200 break-words group-hover:text-[#F84464] transition">
                        {show.movieTitle}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2.5 pt-2 border-t border-white/[0.06]">
                        <span>{show.bookedSeatsCount} / {show.totalCapacity} Booked</span>
                        <span className="font-bold text-emerald-400">{show.occupancyRate}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === 'by_movie' ? (
        /* ========================================================
           VIEW MODE 4: GROUPED BY MOVIE SHOWCASE
           ======================================================== */
        <div className="space-y-4">
          {groupedByMovie.map(group => (
            <div
              key={group.movieId}
              className="bg-[#131624]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-xl p-5 space-y-4 text-white"
            >
              {/* Movie Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-16 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-white/10 shadow-2xs">
                    <img
                      src={
                        group.movie?.posterUrl ||
                        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={group.movieTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white truncate">
                        {group.movieTitle}
                      </h3>
                      {group.movie?.certificate && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/10 text-slate-300 border border-white/10 shrink-0">
                          {group.movie.certificate}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {group.movie?.language || 'Hindi'} • {group.movie?.duration || '2h 30m'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 border border-white/10">
                    {group.shows.length} {group.shows.length === 1 ? 'Show' : 'Shows'}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                    {group.totalTickets} Tickets Booked ({group.occupancyRate}%)
                  </span>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white/5 text-slate-200 border border-white/10">
                    ₹{group.totalRevenue.toLocaleString('en-IN')} Gross
                  </span>
                </div>
              </div>

              {/* Showtimes Grid for this Movie */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {group.shows.map(show => (
                  <div
                    key={show.id || show._id}
                    onClick={() => openSeatMapModal(show)}
                    className="p-3.5 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-black text-xs text-white bg-white/10 px-2 py-0.5 rounded border border-white/10 shadow-2xs">
                        {show.startTime}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                        {show.format || '2D'}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-white truncate mt-1">
                      {show.screen?.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                      <MapPin size={10} className="text-[#F84464]" />
                      <span>{show.cinema?.name}</span>
                    </p>

                    <div className="flex items-center justify-between text-[10px] mt-2.5 pt-2 border-t border-white/[0.06]">
                      <span className="text-slate-400 font-medium">{show.bookedSeatsCount}/{show.totalCapacity} Seats</span>
                      <span className="font-bold text-emerald-400">{show.occupancyRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ========================================================
           VIEW MODE 1: DETAILED, ELEGANTLY ALIGNED SHOW CARDS (DEFAULT)
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
                className="bg-[#131624]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] hover:border-white/20 shadow-xl hover:shadow-[0_20px_45px_-8px_rgba(0,0,0,0.8)] transition-all duration-200 overflow-hidden group p-5 sm:p-6 space-y-4 text-white"
              >
                {/* ROW 1: FILM IDENTITY & TIMETABLES */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left + Center: Poster & Film Metadata */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {/* 2:3 Vertical Poster */}
                    <div className="relative w-20 sm:w-24 aspect-[2/3] rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-white/10 shadow-xs group-hover:scale-102 transition-transform duration-300">
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
                        <span className="bg-black/85 backdrop-blur-xs text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-xs border border-white/10">
                          {show.format || '2D'}
                        </span>
                      </div>
                    </div>

                    {/* Movie Details */}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isCancelled ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-400 border border-white/10">
                            Cancelled
                          </span>
                        ) : isAlmostFull ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                            Almost Full ({show.occupancyRate}%)
                          </span>
                        ) : isFillingFast ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            Filling Fast ({show.occupancyRate}%)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Live on BookMyTrip
                          </span>
                        )}

                        {show.movie?.certificate && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10">
                            {show.movie.certificate}
                          </span>
                        )}
                      </div>

                      {/* Full Movie Title */}
                      <h3 className="text-lg sm:text-xl font-black text-white leading-snug group-hover:text-[#F84464] transition-colors break-words">
                        {show.movieTitle}
                      </h3>

                      {/* Language & Runtime */}
                      <p className="text-xs text-slate-400 font-medium">
                        {show.movie?.language || 'Hindi, English'} • {show.movie?.duration || '2h 30m'}
                      </p>

                      {/* Multiplex Venue & Screen */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                          <MapPin size={13} className="text-[#F84464] shrink-0" />
                          <span>{show.cinema?.name || 'Multiplex Venue'}</span>
                        </span>
                        <span className="text-white/20">•</span>
                        <span className="inline-flex items-center gap-1 bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 rounded-md text-indigo-300 font-bold text-xs">
                          <Tv size={12} className="text-indigo-400 shrink-0" />
                          <span>{show.screen?.name || 'Screen 1'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Dedicated Showtime Slot Box */}
                  <div className="shrink-0 md:text-right flex flex-col items-start md:items-end justify-center bg-white/[0.03] border border-white/10 p-3 sm:p-3.5 rounded-xl min-w-[210px]">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                      <Clock size={13} />
                      <span>Programmed Slot</span>
                    </div>

                    <div className="flex items-baseline gap-1.5 font-mono">
                      <span className="text-base sm:text-lg font-black text-white">
                        {show.startTime}
                      </span>
                      <span className="text-slate-400 font-bold text-xs">to</span>
                      <span className="text-sm sm:text-base font-bold text-slate-300">
                        {show.endTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-bold bg-white/10 px-2.5 py-0.5 rounded-md border border-white/10 text-slate-200 shadow-2xs">
                        {show.showDate}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {show.format || '2D'} Format
                      </span>
                    </div>
                  </div>
                </div>

                {/* ROW 2: CAPACITY, PRICING TIERS & ACTIONS */}
                <div className="border-t border-white/[0.08] pt-3.5 mt-2 bg-[#0e111d]/90 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 p-4 sm:p-5 rounded-b-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Capacity & Hall Occupancy Progress */}
                  <div className="lg:w-[320px] xl:w-[350px] shrink-0 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                        Auditorium Capacity
                      </span>
                      <span className="font-bold text-white font-mono text-xs">
                        {show.bookedSeatsCount} / {show.totalCapacity} Booked ({show.occupancyRate}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          isCancelled
                            ? 'bg-slate-600'
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
                      <span className="text-emerald-400 font-bold text-[11px]">
                        {availableSeats} seats open for booking
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        ₹{estShowRevenue.toLocaleString('en-IN')} Gross
                      </span>
                    </div>
                  </div>

                  {/* Center: Ticket Pricing Matrix */}
                  <div className="flex-1 min-w-0 lg:px-4 border-t lg:border-t-0 lg:border-l lg:border-r border-white/[0.08] pt-3 lg:pt-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Configured Ticket Tiers
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10 shadow-2xs text-xs">
                        <span className="text-slate-400 font-medium">Normal:</span>
                        <span className="font-mono font-black text-white">
                          ₹{show.pricingTiers?.normal || show.ticketPrice || 200}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10 shadow-2xs text-xs">
                        <span className="text-slate-400 font-medium">Premium:</span>
                        <span className="font-mono font-black text-white">
                          ₹{show.pricingTiers?.premium || 280}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10 shadow-2xs text-xs">
                        <span className="text-slate-400 font-medium">Recliner:</span>
                        <span className="font-mono font-black text-white">
                          ₹{show.pricingTiers?.recliner || 450}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Operational Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/[0.08] justify-end">
                    <button
                      type="button"
                      onClick={() => openSeatMapModal(show)}
                      className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[#F84464] hover:bg-[#E23454] px-4 py-2.5 rounded-xl transition shadow-[0_4px_14px_rgba(248,68,100,0.3)] cursor-pointer"
                      title="View Live Seat Layout & Heatmap"
                    >
                      <Armchair size={15} />
                      <span>Live Seat Map</span>
                    </button>

                    {show.status !== 'cancelled' ? (
                      <button
                        type="button"
                        onClick={() => openCancelModal(show)}
                        className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 px-3 py-2.5 rounded-xl border border-white/10 hover:border-rose-500/30 transition cursor-pointer"
                        title="Cancel Showtime"
                      >
                        <Ban size={14} />
                        <span>Cancel Show</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 uppercase px-3 py-2 bg-white/5 rounded-xl border border-white/10">
                        Show Cancelled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          SCHEDULE SHOW SLIDE-OVER DRAWER
          ======================================================== */}
      <SlideOverDrawer
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Movie Showtime"
        subtitle="Assign auditorium screen, format, pricing, and timetable"
        maxWidth="max-w-xl"
        theme="dark"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateShow} className="space-y-4 text-white">
          {/* Movie Picker with thumbnail preview */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Select Film from Catalog <span className="text-[#F84464]">*</span>
            </label>
            <select
              value={formData.movieId}
              onChange={(e) => handleMovieSelectChange(e.target.value)}
              className="w-full text-xs p-2.5 border border-white/10 rounded-xl bg-[#0B0D14]/90 text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#F84464]/30 focus:border-[#F84464]"
              required
            >
              {movies.map(m => (
                <option key={m.id || m._id} value={m.id || m._id} className="bg-[#121524] text-white">
                  {m.title} ({m.language || 'Hindi'} • {m.duration || '2h 30m'})
                </option>
              ))}
            </select>
          </div>

          {/* Cinema & Screen Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Cinema Multiplex <span className="text-[#F84464]">*</span>
              </label>
              <select
                value={formData.cinemaId}
                onChange={(e) => setFormData({ ...formData, cinemaId: e.target.value })}
                className="w-full text-xs p-2.5 border border-white/10 rounded-xl bg-[#0B0D14]/90 text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#F84464]/30 focus:border-[#F84464]"
                required
              >
                {cinemas.map(c => (
                  <option key={c.id || c._id} value={c.id || c._id} className="bg-[#121524] text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Auditorium Screen <span className="text-[#F84464]">*</span>
              </label>
              <select
                value={formData.screenId}
                onChange={(e) => setFormData({ ...formData, screenId: e.target.value })}
                className="w-full text-xs p-2.5 border border-white/10 rounded-xl bg-[#0B0D14]/90 text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#F84464]/30 focus:border-[#F84464]"
                required
                disabled={screens.length === 0}
              >
                {screens.length === 0 ? (
                  <option value="" className="bg-[#121524] text-slate-400">No screens created for cinema</option>
                ) : (
                  screens.map(s => (
                    <option key={s.id || s._id} value={s.id || s._id} className="bg-[#121524] text-white">
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
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Date
              </label>
              <select
                value={formData.showDate}
                onChange={(e) => setFormData({ ...formData, showDate: e.target.value })}
                className="w-full text-xs p-2.5 border border-white/10 rounded-xl bg-[#0B0D14]/90 text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#F84464]/30 focus:border-[#F84464]"
              >
                <option value="Today" className="bg-[#121524] text-white">Today (Live)</option>
                <option value="Tomorrow" className="bg-[#121524] text-white">Tomorrow</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Start Time
              </label>
              <select
                value={formData.startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="w-full text-xs p-2.5 border border-white/10 rounded-xl bg-[#0B0D14]/90 text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#F84464]/30 focus:border-[#F84464]"
              >
                {COMMON_SHOWTIMES.map(t => (
                  <option key={t} value={t} className="bg-[#121524] text-white">{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Projection Format
              </label>
              <select
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                className="w-full text-xs p-2.5 border border-white/10 rounded-xl bg-[#0B0D14]/90 text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#F84464]/30 focus:border-[#F84464]"
              >
                <option value="2D" className="bg-[#121524] text-white">2D</option>
                <option value="3D" className="bg-[#121524] text-white">3D</option>
                <option value="IMAX 2D" className="bg-[#121524] text-white">IMAX 2D</option>
                <option value="IMAX 3D" className="bg-[#121524] text-white">IMAX 3D</option>
                <option value="4DX" className="bg-[#121524] text-white">4DX</option>
              </select>
            </div>
          </div>

          {/* Estimated End Time Notice */}
          <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/10 text-xs text-slate-300">
            <span className="flex items-center gap-2">
              <Clock size={14} className="text-[#F84464]" />
              <span>Calculated Runtime & End Time:</span>
            </span>
            <span className="font-mono font-bold text-emerald-400">
              {formData.endTime}
            </span>
          </div>

          {/* Pricing Tiers */}
          <div className="p-3.5 bg-white/[0.03] rounded-xl border border-white/10">
            <p className="text-xs font-bold text-white mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Ticket size={14} className="text-[#F84464]" />
                <span>Ticket Pricing Structure (₹)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Per Seat Basis</span>
            </p>
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Normal (Classic)"
                type="number"
                className="!bg-[#0B0D14]/90 !border-white/10 !text-white"
                value={formData.normalPrice}
                onChange={(e) => setFormData({ ...formData, normalPrice: e.target.value })}
              />
              <Input
                label="Premium"
                type="number"
                className="!bg-[#0B0D14]/90 !border-white/10 !text-white"
                value={formData.premiumPrice}
                onChange={(e) => setFormData({ ...formData, premiumPrice: e.target.value })}
              />
              <Input
                label="Recliner (VIP)"
                type="number"
                className="!bg-[#0B0D14]/90 !border-white/10 !text-white"
                value={formData.reclinerPrice}
                onChange={(e) => setFormData({ ...formData, reclinerPrice: e.target.value })}
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="!border-white/10 !text-slate-300 hover:!bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={formLoading}
              className="bg-gradient-to-r from-[#F84464] to-[#ff637e] hover:from-[#E23454] hover:to-[#f04f6e] text-white font-bold shadow-[0_4px_16px_rgba(248,68,100,0.35)]"
            >
              Publish Showtime Live
            </Button>
          </div>
        </form>
      </SlideOverDrawer>

      {/* ========================================================
          LIVE SEAT MAP & CUSTOMER MANIFEST MODAL
          ======================================================== */}
      <Modal
        isOpen={isSeatMapModalOpen}
        onClose={() => setIsSeatMapModalOpen(false)}
        title={`Auditorium Seat Manifest • ${selectedShow?.movieTitle || 'Show'}`}
        maxWidth="max-w-2xl"
        theme="dark"
      >
        {seatMapLoading ? (
          <div className="py-16 text-center text-xs text-slate-400 space-y-3">
            <div className="w-9 h-9 border-2 border-[#F84464] border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_15px_rgba(248,68,100,0.4)]" />
            <p className="font-bold text-slate-200">Loading real-time auditorium matrix & bookings...</p>
          </div>
        ) : seatMapData ? (() => {
            // Aggregate all booked seats from show and confirmed bookings
            const allBookedSeats = new Set();
            (seatMapData.show?.bookedSeats || []).forEach((s) => allBookedSeats.add(normalizeSeatCode(s)));
            (seatMapData.recentBookings || []).forEach((b) => {
              (b.seats || []).forEach((s) => allBookedSeats.add(normalizeSeatCode(s)));
            });

            const liveSelectingSet = new Set();
            (liveSelectingSeats || []).forEach((s) => liveSelectingSet.add(normalizeSeatCode(s)));

            const totalBookedCount = allBookedSeats.size;
            const totalCapacity = seatMapData.totalCapacity || seatMapData.screen?.totalCapacity || 120;
            const totalAvailableCount = Math.max(0, totalCapacity - totalBookedCount);

            // Safe fallback layout if screen.seatingLayout is not configured
            const rowsToRender = (seatMapData.screen?.seatingLayout && seatMapData.screen.seatingLayout.length > 0)
              ? seatMapData.screen.seatingLayout
              : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((r) => ({
                  row: r,
                  seatsCount: 12
                }));

            return (
              <div className="space-y-4">
                {/* Show Header Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white/[0.03] rounded-xl border border-white/10 text-xs gap-3">
                  <div>
                    <p className="font-bold text-white text-sm">
                      {seatMapData.cinema?.name}
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {seatMapData.screen?.name} • {selectedShow?.startTime} ({selectedShow?.showDate}) • <span className="font-bold text-[#F84464]">{selectedShow?.format || '2D'}</span>
                    </p>
                  </div>

                  {/* Real-time Counts */}
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    {liveSelectingSeats.length > 0 && (
                      <span className="text-amber-300 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 animate-pulse flex items-center gap-1.5 text-[11px]">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                        <span>{liveSelectingSeats.length} Selecting Live</span>
                      </span>
                    )}
                    <span className="text-emerald-300 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                      {totalAvailableCount} Available
                    </span>
                    <span className="text-rose-300 font-bold bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/30">
                      {totalBookedCount} Booked
                    </span>
                  </div>
                </div>

                {/* Modal Tabs: Seat Grid vs Booking Manifest */}
                <div className="flex items-center border-b border-white/10">
                  <button
                    onClick={() => setSeatMapTab('seats')}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                      seatMapTab === 'seats'
                        ? 'border-[#F84464] text-[#F84464]'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <Armchair size={14} />
                    <span>Auditorium Layout</span>
                  </button>
                  <button
                    onClick={() => setSeatMapTab('manifest')}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                      seatMapTab === 'manifest'
                        ? 'border-[#F84464] text-[#F84464]'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <Ticket size={14} />
                    <span>Bookings Manifest ({seatMapData.recentBookings?.length || 0})</span>
                  </button>
                </div>

                {seatMapTab === 'seats' ? (
                  <div className="space-y-3">
                    {/* Curved Movie Screen Visual */}
                    <div className="text-center py-3">
                      <div className="w-3/4 mx-auto h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-t-full shadow-[0_0_16px_rgba(34,211,238,0.6)]" />
                      <p className="text-[9px] text-cyan-300/60 uppercase tracking-widest mt-1.5 font-mono">
                        All Eyes This Way Please (Projection Screen)
                      </p>
                    </div>

                    {/* Rows and Seats Grid */}
                    <div className="space-y-2 max-h-72 overflow-y-auto p-3.5 bg-[#0B0D14]/70 rounded-xl border border-white/10 custom-scrollbar">
                      {rowsToRender.map((row) => (
                        <div key={row.row} className="flex items-center gap-2 justify-center">
                          <span className="w-5 text-center font-mono font-bold text-xs text-slate-500">
                            {row.row}
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap justify-center">
                            {Array.from({ length: row.seatsCount || 12 }).map((_, idx) => {
                              const seatNum = idx + 1;
                              const codeStandard = `${row.row}${seatNum}`;
                              const codeHyphen = `${row.row}-${seatNum}`;

                              const isBooked =
                                allBookedSeats.has(normalizeSeatCode(codeStandard)) ||
                                allBookedSeats.has(normalizeSeatCode(codeHyphen));

                              const isLiveSelecting =
                                !isBooked &&
                                (liveSelectingSet.has(normalizeSeatCode(codeStandard)) ||
                                  liveSelectingSet.has(normalizeSeatCode(codeHyphen)));

                              return (
                                <div
                                  key={codeStandard}
                                  className={`w-6 h-6 rounded text-[9px] font-mono flex items-center justify-center font-bold transition-all duration-150 ${
                                    isBooked
                                      ? 'bg-rose-500 text-white shadow-[0_0_6px_rgba(244,63,94,0.4)]'
                                      : isLiveSelecting
                                        ? 'bg-amber-400 text-amber-950 border-2 border-amber-300 font-black animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                                        : 'bg-white/5 border border-white/15 text-slate-300 hover:border-[#F84464] hover:text-white hover:bg-white/10'
                                  }`}
                                  title={`${codeStandard} • ${
                                    isBooked
                                      ? 'Booked (Confirmed Ticket)'
                                      : isLiveSelecting
                                        ? 'Selecting Live by Customer'
                                        : 'Available'
                                  }`}
                                >
                                  {seatNum}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-5 pt-2 border-t border-white/10 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 bg-white/5 border border-white/20 rounded" />
                        <span>Available Seat</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 bg-amber-400 border border-amber-300 rounded animate-pulse" />
                        <span className="font-semibold text-amber-300">Selecting Live</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 bg-rose-500 rounded shadow-[0_0_6px_rgba(244,63,94,0.5)]" />
                        <span className="font-semibold text-rose-400">Booked</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Manifest View */
                  <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                    {(!seatMapData.recentBookings || seatMapData.recentBookings.length === 0) ? (
                      <p className="text-center text-xs text-slate-400 py-10">
                        No confirmed reservations on this showtime yet.
                      </p>
                    ) : (
                      seatMapData.recentBookings.map((b, idx) => (
                        <div
                          key={b.bookingId || idx}
                          className="p-3 bg-white/[0.03] rounded-xl border border-white/10 flex items-center justify-between text-xs hover:border-white/20 transition"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{b.customerName}</span>
                              <span className="text-[10px] font-mono bg-white/10 text-slate-300 px-1.5 py-0.5 rounded border border-white/10">
                                {b.bookingId}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">
                              Seats: <strong className="text-white">{b.seats?.join(', ')}</strong>
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-bold text-white">₹{b.totalAmount}</span>
                            <div className={`text-[10px] font-semibold mt-0.5 ${b.ticketValidated ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {b.ticketValidated ? '✓ Scanned at Gate' : 'Pending Entry'}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })() : null}
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
        theme="dark"
      />
    </div>
  );
}

