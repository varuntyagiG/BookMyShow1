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
  X,
  ArrowUpDown
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

function calculateEndTime(startTimeStr, durationStr = '2h 30m') {
  if (!startTimeStr) return '10:15 PM';

  const match = startTimeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return '10:15 PM';

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  let addMinutes = 150;
  const hMatch = durationStr.match(/(\d+)\s*h/i);
  const mMatch = durationStr.match(/(\d+)\s*m/i);

  if (hMatch || mMatch) {
    const durH = hMatch ? parseInt(hMatch[1], 10) : 0;
    const durM = mMatch ? parseInt(mMatch[1], 10) : 0;
    addMinutes = durH * 60 + durM + 15;
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('latest'); // 'latest' (Newest to Oldest) | 'oldest' (Oldest to Newest)
  const [viewMode, setViewMode] = useState('cards');
  const [isVenueDropdownOpen, setIsVenueDropdownOpen] = useState(false);
  const venueDropdownRef = useRef(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSeatMapModalOpen, setIsSeatMapModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState(null);
  const [seatMapData, setSeatMapData] = useState(null);
  const [seatMapLoading, setSeatMapLoading] = useState(false);
  const [seatMapTab, setSeatMapTab] = useState('seats');
  const [liveSelectingSeats, setLiveSelectingSeats] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    cinemaId: '',
    screenId: '',
    movieId: '',
    format: '2D',
    showDate: 'Today',
    customDate: '',
    startTime: '07:30 PM',
    endTime: '10:15 PM',
    normalPrice: 200,
    premiumPrice: 280,
    reclinerPrice: 450
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Close venue dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (venueDropdownRef.current && !venueDropdownRef.current.contains(event.target)) {
        setIsVenueDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadAllData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const params = {};
      if (selectedCinemaId) params.cinemaId = selectedCinemaId;
      if (selectedDate !== 'All') params.date = selectedDate;

      const [showsRes, cinemasRes, moviesRes] = await Promise.all([
        vendorApi.getShows(params),
        vendorApi.getCinemas(),
        vendorApi.getMovies()
      ]);

      if (showsRes.success && showsRes.data) {
        setShows(showsRes.data);
      }
      if (cinemasRes.success && cinemasRes.data) {
        setCinemas(cinemasRes.data);
      }
      if (moviesRes.success && moviesRes.data) {
        setMovies(moviesRes.data);
      }
    } catch (err) {
      console.error('Failed to load show scheduling data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [selectedCinemaId, selectedDate]);

  useRealtimeRefresh(['SHOW_MUTATION', 'BOOKING_MUTATION'], () => {
    loadAllData();
  });

  // Load screens whenever form cinemaId changes
  useEffect(() => {
    if (!formData.cinemaId) {
      setScreens([]);
      return;
    }
    const fetchScreens = async () => {
      try {
        const res = await vendorApi.getScreens({ cinemaId: formData.cinemaId });
        if (res.success && res.data) {
          setScreens(res.data);
          if (res.data.length > 0) {
            setFormData(prev => ({
              ...prev,
              screenId: res.data[0].id || res.data[0]._id,
              format: res.data[0].screenType || '2D'
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load screens for cinema:', err);
      }
    };
    fetchScreens();
  }, [formData.cinemaId]);

  // Update endTime when startTime or movie changes
  useEffect(() => {
    const selectedMovie = movies.find(m => (m.id || m._id) === formData.movieId);
    const duration = selectedMovie?.duration || '2h 30m';
    const computedEnd = calculateEndTime(formData.startTime, duration);
    setFormData(prev => ({ ...prev, endTime: computedEnd }));
  }, [formData.startTime, formData.movieId, movies]);

  const activeCinema = useMemo(() => {
    return cinemas.find(c => (c.id || c._id) === selectedCinemaId);
  }, [cinemas, selectedCinemaId]);

  // Open Add Modal
  const openAddModal = () => {
    const defaultCinemaId = selectedCinemaId || (cinemas[0]?.id || cinemas[0]?._id || '');
    const defaultMovieId = movieIdParam || (movies[0]?.id || movies[0]?._id || '');

    setFormData({
      cinemaId: defaultCinemaId,
      screenId: '',
      movieId: defaultMovieId,
      format: '2D',
      showDate: 'Today',
      customDate: '',
      startTime: '07:30 PM',
      endTime: '10:15 PM',
      normalPrice: 200,
      premiumPrice: 280,
      reclinerPrice: 450
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleMovieSelectChange = (movieId) => {
    setFormData(prev => ({ ...prev, movieId }));
  };

  const handleStartTimeSelect = (timeStr) => {
    setFormData(prev => ({ ...prev, startTime: timeStr }));
  };

  const openSeatMapModal = async (show) => {
    setSelectedShow(show);
    setIsSeatMapModalOpen(true);
    setSeatMapLoading(true);
    setSeatMapTab('seats');
    setLiveSelectingSeats([]);

    try {
      const showId = show.id || show._id;
      const res = await vendorApi.getShowSeatMap(showId);
      if (res.success && res.data) {
        setSeatMapData(res.data);
      }
    } catch (err) {
      console.error('Failed to load seat layout map:', err);
    } finally {
      setSeatMapLoading(false);
    }
  };

  // Live Socket listeners for the open seat map
  useEffect(() => {
    if (!isSeatMapModalOpen || !selectedShow) return;

    const socket = getSocket();
    if (!socket) return;

    const showId = selectedShow.id || selectedShow._id;

    socket.emit('join:show', { showId });

    const handleSeatHold = (data) => {
      if (data.showId === showId && data.seats) {
        setLiveSelectingSeats(prev => Array.from(new Set([...prev, ...data.seats])));
      }
    };

    const handleSeatRelease = (data) => {
      if (data.showId === showId && data.seats) {
        const releasedSet = new Set(data.seats.map(s => normalizeSeatCode(s)));
        setLiveSelectingSeats(prev => prev.filter(s => !releasedSet.has(normalizeSeatCode(s))));
      }
    };

    const handleBookingConfirmed = (data) => {
      if (data.showId === showId) {
        openSeatMapModal(selectedShow);
        loadAllData();
      }
    };

    socket.on('seat:hold', handleSeatHold);
    socket.on('seat:release', handleSeatRelease);
    socket.on('booking:confirmed', handleBookingConfirmed);

    return () => {
      socket.emit('leave:show', { showId });
      socket.off('seat:hold', handleSeatHold);
      socket.off('seat:release', handleSeatRelease);
      socket.off('booking:confirmed', handleBookingConfirmed);
    };
  }, [isSeatMapModalOpen, selectedShow]);

  const openCancelModal = (show) => {
    setSelectedShow(show);
    setIsCancelModalOpen(true);
  };

  const handleCreateShow = async (e) => {
    e.preventDefault();
    if (!formData.cinemaId || !formData.screenId || !formData.movieId || !formData.startTime) {
      setFormError('Multiplex, auditorium screen, film, and showtime are required.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      const payload = {
        cinemaId: formData.cinemaId,
        screenId: formData.screenId,
        movieId: formData.movieId,
        format: formData.format || '2D',
        showDate: formData.showDate === 'Custom' ? formData.customDate : formData.showDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        ticketPrice: Number(formData.normalPrice) || 200,
        pricingTiers: {
          normal: Number(formData.normalPrice) || 200,
          premium: Number(formData.premiumPrice) || 280,
          recliner: Number(formData.reclinerPrice) || 450
        }
      };

      const res = await vendorApi.createShow(payload);
      if (res.success) {
        setIsAddModalOpen(false);
        await loadAllData();
      } else {
        setFormError(res.message || 'Failed to schedule show.');
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

  // Computed Filtered Shows & Key Metrics (Arranged Latest to Old by default)
  const filteredShows = useMemo(() => {
    const list = shows.filter(show => {
      if (statusFilter === 'active' && show.status === 'cancelled') return false;
      if (statusFilter === 'cancelled' && show.status !== 'cancelled') return false;
      if (statusFilter === 'filling_fast' && (show.occupancyRate < 70 || show.status === 'cancelled')) return false;

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

    return list.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (sortOrder === 'latest') {
        if (timeA && timeB && timeA !== timeB) return timeB - timeA;
        return String(b.id || b._id || '').localeCompare(String(a.id || a._id || ''));
      } else {
        if (timeA && timeB && timeA !== timeB) return timeA - timeB;
        return String(a.id || a._id || '').localeCompare(String(b.id || b._id || ''));
      }
    });
  }, [shows, statusFilter, searchQuery, sortOrder]);

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

    Object.values(groups).forEach(g => {
      g.shows.sort((a, b) => {
        if (sortOrder === 'latest') {
          return (b.startTime || '').localeCompare(a.startTime || '');
        }
        return (a.startTime || '').localeCompare(b.startTime || '');
      });
    });

    return Object.values(groups);
  }, [filteredShows, sortOrder]);

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
      g.shows.sort((a, b) => {
        if (sortOrder === 'latest') {
          return (b.startTime || '').localeCompare(a.startTime || '');
        }
        return (a.startTime || '').localeCompare(b.startTime || '');
      });
      g.occupancyRate = g.totalCapacity > 0 ? Math.round((g.totalTickets / g.totalCapacity) * 100) : 0;
    });

    return Object.values(groups);
  }, [filteredShows, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Top Header (Admin Theme) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Film size={16} className="text-[#F84464]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Box Office Programming & Schedules
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Show Schedules & Timetables
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
            Program cinema showtimes across auditoriums. Published schedules immediately reflect on the BookMyShow customer booking app.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => loadAllData(true)}
            disabled={refreshing}
            className="p-2.5 text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition shadow-sm cursor-pointer"
            title="Refresh Schedules"
          >
            <RefreshCw size={17} className={refreshing ? 'animate-spin text-[#F84464]' : ''} />
          </button>

          <Button
            variant="primary"
            onClick={openAddModal}
            disabled={cinemas.length === 0}
            className="inline-flex items-center gap-2 font-bold bg-[#F84464] hover:bg-[#E03A58] px-4 py-2.5 rounded-lg text-white shadow-sm transition"
          >
            <Plus size={18} />
            <span>Schedule New Show</span>
          </Button>
        </div>
      </div>

      {/* KPI Performance Bar (Admin Theme) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Scheduled Shows */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:border-gray-300 transition-all flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <Calendar size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Shows
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight tabular-nums">
                {metrics.totalShowsCount}
              </span>
              <span className="text-[11px] font-bold text-emerald-600">
                {metrics.activeShowsCount} Live
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Tickets Booked */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:border-gray-300 transition-all flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#F84464] border border-rose-100 flex items-center justify-center shrink-0">
            <Ticket size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Tickets Booked
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight tabular-nums">
                {metrics.totalTicketsSold}
              </span>
              <span className="text-[11px] font-medium text-gray-500">
                Admissions
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Avg Occupancy */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:border-gray-300 transition-all flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Avg. Occupancy
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight tabular-nums">
                {metrics.avgOccupancy}%
              </span>
              <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden shrink-0">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${Math.min(metrics.avgOccupancy, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Metric 4: Est. Revenue */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:border-gray-300 transition-all flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <TrendingUp size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Est. Box Office
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight tabular-nums">
                ₹{metrics.estRevenue.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Gross
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Filter & View Controls (Admin Theme) */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 relative z-20">
        {/* Left: Date Selector & Search Input */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Date Segmented Control */}
          <div className="inline-flex p-1 bg-gray-100 rounded-lg border border-gray-200 text-xs">
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
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                    selectedDate === tab.id
                      ? 'bg-white text-[#F84464] shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      selectedDate === tab.id
                        ? 'bg-red-50 text-[#F84464]'
                        : 'bg-gray-200 text-gray-600'
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
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search movie, venue, screen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-7 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F84464]/20 focus:border-[#F84464] transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right: Venue Dropdown, Status Filter & 4-Way View Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative" ref={venueDropdownRef}>
            <button
              type="button"
              onClick={() => setIsVenueDropdownOpen(prev => !prev)}
              className={`px-3.5 py-1.5 rounded-lg border text-left transition-all duration-200 flex items-center justify-between gap-2.5 cursor-pointer text-xs shadow-xs ${
                selectedCinemaId
                  ? 'bg-red-50 border-[#F84464] text-gray-900 font-bold'
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-300 text-gray-800'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                  selectedCinemaId
                    ? 'bg-[#F84464] text-white border-[#F84464]'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}>
                  {selectedCinemaId ? <MapPin size={12} /> : <Building2 size={12} />}
                </div>
                <span className="font-bold text-gray-900 truncate max-w-[150px]">
                  {activeCinema ? activeCinema.name : 'All Multiplexes'}
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform duration-200 ${
                  isVenueDropdownOpen ? 'rotate-180 text-gray-700' : ''
                }`}
              />
            </button>

            {isVenueDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl border border-gray-200 shadow-xl py-2 z-50">
                <div className="px-3.5 py-1.5 border-b border-gray-100 flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider">
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
                        ? 'bg-red-50 text-[#F84464] font-bold'
                        : 'hover:bg-gray-50 text-gray-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className={!selectedCinemaId ? 'text-[#F84464]' : 'text-gray-400'} />
                      <span>All Multiplexes ({shows.length} Shows)</span>
                    </div>
                    {!selectedCinemaId && <Check size={14} className="text-[#F84464]" />}
                  </button>

                  <div className="my-1 border-t border-gray-100" />

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
                            ? 'bg-red-50 text-[#F84464] font-bold'
                            : 'hover:bg-gray-50 text-gray-700 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin size={14} className={isSelected ? 'text-[#F84464]' : 'text-gray-400'} />
                          <div className="truncate">
                            <p className="font-bold truncate text-gray-900">{c.name}</p>
                            <p className="text-[10px] text-gray-500 truncate">{c.city}</p>
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
              className="p-1.5 text-gray-400 hover:text-[#F84464] hover:bg-red-50 rounded-lg transition cursor-pointer"
              title="Clear cinema filter"
            >
              <X size={14} />
            </button>
          )}

          {/* Status Filter */}
          <div className="inline-flex p-1 bg-gray-100 rounded-lg border border-gray-200 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Live
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('filling_fast')}
              className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                statusFilter === 'filling_fast'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              &gt;70%
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('cancelled')}
              className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                statusFilter === 'cancelled'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cancelled
            </button>
          </div>

          {/* Sort Order: Latest to Old (Default) */}
          <button
            type="button"
            onClick={() => setSortOrder(prev => prev === 'latest' ? 'oldest' : 'latest')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
              sortOrder === 'latest'
                ? 'bg-red-50 text-[#F84464] border-red-200 hover:bg-red-100'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
            title={sortOrder === 'latest' ? 'Currently: Latest to Old. Click for Old to Latest.' : 'Currently: Old to Latest. Click for Latest to Old.'}
          >
            <ArrowUpDown size={13} className={sortOrder === 'latest' ? 'text-[#F84464]' : 'text-gray-500'} />
            <span>{sortOrder === 'latest' ? 'Latest to Old' : 'Old to Latest'}</span>
          </button>

          {/* 4-Way View Mode Switcher */}
          <div className="inline-flex p-1 bg-gray-100 rounded-lg border border-gray-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-[#F84464] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Detailed Wide Cards"
            >
              <Rows3 size={15} />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-[#F84464] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Compact Poster Grid"
            >
              <LayoutGrid size={15} />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white text-[#F84464] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Auditorium Screen Board"
            >
              <Calendar size={15} />
              <span className="hidden sm:inline">Screen Board</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('by_movie')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                viewMode === 'by_movie'
                  ? 'bg-white text-[#F84464] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
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
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#F84464] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-gray-900">Loading Scheduled Timetables...</p>
          <p className="text-xs text-gray-500">Connecting to cloud auditoriums & live seat matrices</p>
        </div>
      ) : cinemas.length === 0 ? (
        <EmptyState
          title="Add a Cinema Venue First"
          description="Create your multiplex venue and configure auditoriums before programming movie showtimes."
          actionText="Add Cinema Venue"
          onAction={() => window.location.href = '/vendor/cinemas'}
        />
      ) : filteredShows.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-xl bg-gray-100 border border-gray-200 text-[#F84464] flex items-center justify-center mx-auto">
            <Calendar size={26} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              No Showtimes Found for Current Filters
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
              {searchQuery
                ? `No scheduled show matches "${searchQuery}". Try changing search terms or filters.`
                : 'No movie shows match your selected date and status filters. Schedule a new show to start selling tickets.'}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-[#F84464] hover:bg-[#E03A58] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm"
          >
            <Plus size={15} />
            <span>Schedule Show Now</span>
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        /* COMPACT POSTER GRID CARDS (Admin Theme) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4.5">
          {filteredShows.map((show) => {
            const isCancelled = show.status === 'cancelled';
            const isFillingFast = show.occupancyRate > 70 && !isCancelled;
            const availableSeats = Math.max(0, (show.totalCapacity || 120) - (show.bookedSeatsCount || 0));

            return (
              <div
                key={show.id || show._id}
                className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
              >
                {/* Poster Header */}
                <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                  <img
                    src={
                      show.movie?.posterUrl ||
                      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={show.movieTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
                    <span className="bg-black/80 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-white/10 shadow-xs">
                      {show.format || '2D'}
                    </span>
                    {isCancelled ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                        Cancelled
                      </span>
                    ) : isFillingFast ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-xs">
                        {show.occupancyRate}% Full
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-xs">
                        Live
                      </span>
                    )}
                  </div>

                  {/* Showtime Overlay on Poster Bottom */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
                    <span className="font-extrabold tracking-tight tabular-nums flex items-center gap-1 drop-shadow-sm text-white">
                      <Clock size={12} className="text-[#F84464]" />
                      {show.startTime}
                    </span>
                    <span className="text-[11px] font-medium bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-gray-200">
                      {show.showDate}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-black text-gray-900 text-sm leading-snug group-hover:text-[#F84464] transition truncate" title={show.movieTitle}>
                      {show.movieTitle}
                    </h3>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                      {show.movie?.language || 'Hindi'} • {show.movie?.duration || '2h 30m'}
                    </p>

                    {/* Venue & Screen */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-2">
                      <MapPin size={12} className="text-[#F84464] shrink-0" />
                      <span className="truncate font-medium">{show.cinema?.name}</span>
                      <span className="text-gray-300">•</span>
                      <span className="font-bold text-indigo-600 text-[11px] shrink-0">{show.screen?.name}</span>
                    </div>
                  </div>

                  {/* Occupancy Progress */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-500 font-medium">Occupancy</span>
                      <div className="flex items-center gap-1">
                        <span className="font-black text-gray-900 tabular-nums">{show.bookedSeatsCount}</span>
                        <span className="text-gray-400 font-normal">/{show.totalCapacity}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ml-0.5 tabular-nums ${
                          show.occupancyRate >= 80
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : show.occupancyRate >= 50
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {show.occupancyRate}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(show.occupancyRate, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-500">
                      <span className="font-medium">{availableSeats} seats open</span>
                      <span className="font-bold text-gray-900 tabular-nums">From ₹{show.pricingTiers?.normal || show.ticketPrice || 200}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={() => openSeatMapModal(show)}
                    className="w-full py-2 bg-red-50 hover:bg-[#F84464] text-[#F84464] hover:text-white rounded-lg text-xs font-bold border border-red-200 hover:border-[#F84464] transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer group/btn"
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
        /* AUDITORIUM SCREEN TIMETABLE MATRIX (Admin Theme) */
        <div className="space-y-4">
          {groupedByScreen.map(group => (
            <div
              key={group.key}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                    <Tv size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {group.screen?.name || 'Auditorium Screen'}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin size={11} className="text-[#F84464]" />
                      <span>{group.cinema?.name}</span>
                      <span>•</span>
                      <span>Capacity: {group.screen?.totalCapacity || 120} Seats</span>
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg self-start sm:self-auto border border-indigo-200">
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
                          ? 'bg-gray-50 border-gray-200 opacity-50'
                          : 'bg-gray-50 hover:bg-gray-100/80 border-gray-200 hover:border-[#F84464]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold tracking-tight tabular-nums text-xs text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">
                          {show.startTime}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {show.format || '2D'}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-gray-800 break-words group-hover:text-[#F84464] transition">
                        {show.movieTitle}
                      </p>

                      <div className="flex items-center justify-between text-[11px] mt-2.5 pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-gray-900 tabular-nums">{show.bookedSeatsCount}</span>
                          <span className="text-gray-400 font-normal">/{show.totalCapacity}</span>
                          <span className="text-gray-500 font-medium text-[10px] ml-0.5">booked</span>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border tabular-nums ${
                          show.occupancyRate >= 80
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : show.occupancyRate >= 50
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {show.occupancyRate}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === 'by_movie' ? (
        /* GROUPED BY MOVIE SHOWCASE (Admin Theme) */
        <div className="space-y-4">
          {groupedByMovie.map(group => (
            <div
              key={group.movieId}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4"
            >
              {/* Movie Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-16 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-gray-200 shadow-xs">
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
                      <h3 className="text-base font-black text-gray-900 truncate">
                        {group.movieTitle}
                      </h3>
                      {group.movie?.certificate && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-gray-100 text-gray-700 border border-gray-200 shrink-0">
                          {group.movie.certificate}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {group.movie?.language || 'Hindi'} • {group.movie?.duration || '2h 30m'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-50 text-gray-700 border border-gray-200">
                    {group.shows.length} {group.shows.length === 1 ? 'Show' : 'Shows'}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 tabular-nums">
                    {group.totalTickets} Tickets Booked ({group.occupancyRate}%)
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-50 text-gray-800 border border-gray-200 tabular-nums">
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
                    className="p-3.5 bg-gray-50 hover:bg-gray-100/80 rounded-xl border border-gray-200 hover:border-[#F84464] transition-all cursor-pointer group shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold tracking-tight text-xs text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200 tabular-nums">
                        {show.startTime}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {show.format || '2D'}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-gray-900 truncate mt-1">
                      {show.screen?.name}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate flex items-center gap-1 mt-0.5">
                      <MapPin size={10} className="text-[#F84464]" />
                      <span>{show.cinema?.name}</span>
                    </p>

                    <div className="flex items-center justify-between text-[11px] mt-2.5 pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-gray-900 tabular-nums">{show.bookedSeatsCount}</span>
                        <span className="text-gray-400 font-normal">/{show.totalCapacity}</span>
                        <span className="text-gray-500 font-medium text-[10px] ml-0.5">seats</span>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border tabular-nums ${
                        show.occupancyRate >= 80
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : show.occupancyRate >= 50
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {show.occupancyRate}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* DETAILED SHOW CARDS (DEFAULT) */
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
                className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group p-5 sm:p-6 space-y-4"
              >
                {/* ROW 1: FILM IDENTITY & TIMETABLES */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="relative w-20 sm:w-24 aspect-[2/3] rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-gray-200 shadow-xs group-hover:scale-102 transition-transform duration-300">
                      <img
                        src={
                          show.movie?.posterUrl ||
                          'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80'
                        }
                        alt={show.movieTitle}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1.5 left-1.5">
                        <span className="bg-black/80 backdrop-blur-xs text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-xs border border-white/10">
                          {show.format || '2D'}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isCancelled ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                            Cancelled
                          </span>
                        ) : isAlmostFull ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
                            Almost Full ({show.occupancyRate}%)
                          </span>
                        ) : isFillingFast ? (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Filling Fast ({show.occupancyRate}%)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Live on BookMyShow
                          </span>
                        )}

                        {show.movie?.certificate && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                            {show.movie.certificate}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg sm:text-xl font-black text-gray-900 leading-snug group-hover:text-[#F84464] transition-colors break-words">
                        {show.movieTitle}
                      </h3>

                      <p className="text-xs text-gray-500 font-medium">
                        {show.movie?.language || 'Hindi, English'} • {show.movie?.duration || '2h 30m'}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                          <MapPin size={13} className="text-[#F84464] shrink-0" />
                          <span>{show.cinema?.name || 'Multiplex Venue'}</span>
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md text-indigo-700 font-bold text-xs">
                          <Tv size={12} className="text-indigo-600 shrink-0" />
                          <span>{show.screen?.name || 'Screen 1'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 md:text-right flex flex-col items-start md:items-end justify-center bg-gray-50 border border-gray-200 p-3 sm:p-3.5 rounded-xl min-w-[210px]">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
                      <Clock size={13} />
                      <span>Programmed Slot</span>
                    </div>

                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base sm:text-lg font-black text-gray-900 tracking-tight tabular-nums">
                        {show.startTime}
                      </span>
                      <span className="text-gray-400 font-medium text-xs">to</span>
                      <span className="text-sm sm:text-base font-bold text-gray-700 tracking-tight tabular-nums">
                        {show.endTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-bold bg-white px-2.5 py-0.5 rounded-md border border-gray-200 text-gray-700 shadow-xs">
                        {show.showDate}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-500">
                        {show.format || '2D'} Format
                      </span>
                    </div>
                  </div>
                </div>

                {/* ROW 2: CAPACITY, PRICING TIERS & ACTIONS */}
                <div className="border-t border-gray-100 pt-3.5 mt-2 bg-gray-50/70 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 p-4 sm:p-5 rounded-b-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="lg:w-[320px] xl:w-[350px] shrink-0 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">
                        Auditorium Capacity
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="font-black text-gray-900 text-xs sm:text-sm tabular-nums">
                          {show.bookedSeatsCount}
                        </span>
                        <span className="text-gray-400 font-normal text-xs">
                          / {show.totalCapacity}
                        </span>
                        <span className="text-gray-500 font-medium text-xs ml-0.5">
                          booked
                        </span>
                        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded border ml-1.5 tabular-nums ${
                          show.occupancyRate >= 80
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : show.occupancyRate >= 50
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {show.occupancyRate}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2 rounded-full overflow-hidden bg-gray-200">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          isCancelled
                            ? 'bg-gray-400'
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
                      <span className="text-emerald-700 font-bold text-[11px] tabular-nums">
                        {availableSeats} seats open for booking
                      </span>
                      <span className="text-gray-600 font-semibold text-[11px] tabular-nums">
                        ₹{estShowRevenue.toLocaleString('en-IN')} <span className="text-gray-400 font-normal">Gross</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 lg:px-4 border-t lg:border-t-0 lg:border-l lg:border-r border-gray-200 pt-3 lg:pt-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Configured Ticket Tiers
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-xs text-xs">
                        <span className="text-gray-500 font-medium">Normal:</span>
                        <span className="font-bold text-gray-900 tabular-nums">
                          ₹{show.pricingTiers?.normal || show.ticketPrice || 200}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-xs text-xs">
                        <span className="text-gray-500 font-medium">Premium:</span>
                        <span className="font-bold text-gray-900 tabular-nums">
                          ₹{show.pricingTiers?.premium || 280}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-xs text-xs">
                        <span className="text-gray-500 font-medium">Recliner:</span>
                        <span className="font-bold text-gray-900 tabular-nums">
                          ₹{show.pricingTiers?.recliner || 450}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-200 justify-end">
                    <button
                      type="button"
                      onClick={() => openSeatMapModal(show)}
                      className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[#F84464] hover:bg-[#E03A58] px-4 py-2 rounded-lg transition shadow-sm cursor-pointer"
                      title="View Live Seat Layout & Heatmap"
                    >
                      <Armchair size={15} />
                      <span>Live Seat Map</span>
                    </button>

                    {show.status !== 'cancelled' ? (
                      <button
                        type="button"
                        onClick={() => openCancelModal(show)}
                        className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-lg border border-gray-300 transition cursor-pointer"
                        title="Cancel Showtime"
                      >
                        <Ban size={14} />
                        <span>Cancel Show</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-gray-500 uppercase px-3 py-2 bg-gray-100 rounded-lg border border-gray-200">
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

      {/* SCHEDULE SHOW SLIDE-OVER DRAWER (Admin Theme) */}
      <SlideOverDrawer
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Movie Showtime"
        subtitle="Assign auditorium screen, format, pricing, and timetable"
        maxWidth="max-w-xl"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-500" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateShow} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Select Film from Catalog <span className="text-[#F84464]">*</span>
            </label>
            <select
              value={formData.movieId}
              onChange={(e) => handleMovieSelectChange(e.target.value)}
              className="w-full text-xs p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#F84464] focus:border-[#F84464]"
              required
            >
              {movies.map(m => (
                <option key={m.id || m._id} value={m.id || m._id} className="bg-white text-gray-900">
                  {m.title} ({m.language || 'Hindi'} • {m.duration || '2h 30m'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Cinema Multiplex <span className="text-[#F84464]">*</span>
              </label>
              <select
                value={formData.cinemaId}
                onChange={(e) => setFormData({ ...formData, cinemaId: e.target.value })}
                className="w-full text-xs p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#F84464] focus:border-[#F84464]"
                required
              >
                {cinemas.map(c => (
                  <option key={c.id || c._id} value={c.id || c._id} className="bg-white text-gray-900">
                    {c.name} ({c.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Auditorium Screen <span className="text-[#F84464]">*</span>
              </label>
              <select
                value={formData.screenId}
                onChange={(e) => setFormData({ ...formData, screenId: e.target.value })}
                className="w-full text-xs p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#F84464] focus:border-[#F84464]"
                required
                disabled={screens.length === 0}
              >
                {screens.map(s => (
                  <option key={s.id || s._id} value={s.id || s._id} className="bg-white text-gray-900">
                    {s.name} ({s.screenType} • {s.totalCapacity} seats)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Screening Date <span className="text-[#F84464]">*</span>
              </label>
              <select
                value={formData.showDate}
                onChange={(e) => setFormData({ ...formData, showDate: e.target.value })}
                className="w-full text-xs p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#F84464] focus:border-[#F84464]"
              >
                <option value="Today">Today (Live)</option>
                <option value="Tomorrow">Tomorrow</option>
                <option value="Custom">Specific Calendar Date</option>
              </select>
            </div>

            {formData.showDate === 'Custom' ? (
              <Input
                label="Pick Date"
                type="date"
                required
                value={formData.customDate}
                onChange={(e) => setFormData({ ...formData, customDate: e.target.value })}
              />
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Projection Format
                </label>
                <select
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#F84464] focus:border-[#F84464]"
                >
                  <option value="2D">Standard 2D</option>
                  <option value="3D">Digital 3D</option>
                  <option value="IMAX 2D">IMAX 2D</option>
                  <option value="IMAX 3D">IMAX 3D</option>
                  <option value="4DX">4DX Motion</option>
                </select>
              </div>
            )}
          </div>

          {/* Quick Showtime Pills */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Select Start Showtime Slot
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-gray-50 rounded-lg border border-gray-200">
              {COMMON_SHOWTIMES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleStartTimeSelect(t)}
                  className={`text-xs px-2.5 py-1 rounded-md font-mono transition cursor-pointer ${
                    formData.startTime === t
                      ? 'bg-[#F84464] text-white font-bold shadow-xs'
                      : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Showtime"
              required
              placeholder="e.g. 07:30 PM"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />
            <Input
              label="Estimated End Time"
              placeholder="e.g. 10:15 PM"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            />
          </div>

          {/* Pricing Tiers */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs font-bold text-gray-900 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Ticket size={14} className="text-[#F84464]" />
                <span>Ticket Pricing Structure (₹)</span>
              </span>
              <span className="text-[10px] text-gray-500 font-normal">Per Seat Basis</span>
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

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={formLoading}
              className="bg-[#F84464] hover:bg-[#E03A58] text-white font-bold shadow-sm"
            >
              Publish Showtime Live
            </Button>
          </div>
        </form>
      </SlideOverDrawer>

      {/* LIVE SEAT MAP & CUSTOMER MANIFEST MODAL (Admin Theme) */}
      <Modal
        isOpen={isSeatMapModalOpen}
        onClose={() => setIsSeatMapModalOpen(false)}
        title={`Auditorium Seat Manifest • ${selectedShow?.movieTitle || 'Show'}`}
        maxWidth="max-w-2xl"
      >
        {seatMapLoading ? (
          <div className="py-16 text-center text-xs text-gray-500 space-y-3">
            <div className="w-8 h-8 border-2 border-[#F84464] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-bold text-gray-800">Loading real-time auditorium matrix & bookings...</p>
          </div>
        ) : seatMapData ? (() => {
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

            const rowsToRender = (seatMapData.screen?.seatingLayout && seatMapData.screen.seatingLayout.length > 0)
              ? seatMapData.screen.seatingLayout
              : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((r) => ({
                  row: r,
                  seatsCount: 12
                }));

            return (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs gap-3">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      {seatMapData.cinema?.name}
                    </p>
                    <p className="text-gray-500 text-[11px] mt-0.5">
                      {seatMapData.screen?.name} • {selectedShow?.startTime} ({selectedShow?.showDate}) • <span className="font-bold text-[#F84464]">{selectedShow?.format || '2D'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-2.5">
                    {liveSelectingSeats.length > 0 && (
                      <span className="text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 animate-pulse flex items-center gap-1.5 text-[11px]">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                        <span>{liveSelectingSeats.length} Selecting Live</span>
                      </span>
                    )}
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      {totalAvailableCount} Available
                    </span>
                    <span className="text-rose-700 font-bold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                      {totalBookedCount} Booked
                    </span>
                  </div>
                </div>

                {/* Modal Tabs */}
                <div className="flex items-center border-b border-gray-200">
                  <button
                    onClick={() => setSeatMapTab('seats')}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                      seatMapTab === 'seats'
                        ? 'border-[#F84464] text-[#F84464]'
                        : 'border-transparent text-gray-500 hover:text-gray-900'
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
                        : 'border-transparent text-gray-500 hover:text-gray-900'
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
                      <div className="w-3/4 mx-auto h-2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-t-full shadow-xs" />
                      <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1.5 font-mono">
                        All Eyes This Way Please (Projection Screen)
                      </p>
                    </div>

                    {/* Rows and Seats Grid */}
                    <div className="space-y-2 max-h-72 overflow-y-auto p-3.5 bg-gray-50 rounded-xl border border-gray-200 custom-scrollbar">
                      {rowsToRender.map((row) => (
                        <div key={row.row} className="flex items-center gap-2 justify-center">
                          <span className="w-5 text-center font-mono font-bold text-xs text-gray-500">
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
                                      ? 'bg-rose-500 text-white shadow-xs'
                                      : isLiveSelecting
                                        ? 'bg-amber-400 text-amber-950 border-2 border-amber-300 font-black animate-pulse'
                                        : 'bg-white border border-gray-300 text-gray-700 hover:border-[#F84464] hover:text-[#F84464]'
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
                    <div className="flex items-center justify-center gap-5 pt-2 border-t border-gray-200 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 bg-white border border-gray-300 rounded" />
                        <span>Available Seat</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 bg-amber-400 border border-amber-300 rounded animate-pulse" />
                        <span className="font-semibold text-amber-700">Selecting Live</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 bg-rose-500 rounded" />
                        <span className="font-semibold text-rose-600">Booked</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Manifest View */
                  <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                    {(!seatMapData.recentBookings || seatMapData.recentBookings.length === 0) ? (
                      <p className="text-center text-xs text-gray-500 py-10">
                        No confirmed reservations on this showtime yet.
                      </p>
                    ) : (
                      seatMapData.recentBookings.map((b, idx) => (
                        <div
                          key={b.bookingId || idx}
                          className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs hover:border-gray-300 transition"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900">{b.customerName}</span>
                              <span className="text-[10px] font-mono bg-white text-gray-700 px-1.5 py-0.5 rounded border border-gray-200">
                                {b.bookingId}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-600 mt-1">
                              Seats: <strong className="text-gray-900">{b.seats?.join(', ')}</strong>
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-bold text-gray-900">₹{b.totalAmount}</span>
                            <div className={`text-[10px] font-semibold mt-0.5 ${b.ticketValidated ? 'text-emerald-600' : 'text-amber-600'}`}>
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

      {/* CANCEL SHOWTIME CONFIRMATION MODAL (Admin Theme) */}
      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelShow}
        title="Cancel Scheduled Showtime"
        description={`Are you sure you want to cancel '${selectedShow?.movieTitle}' at ${selectedShow?.startTime} on ${selectedShow?.showDate}? Customers will no longer be able to book this show, and current status will be marked as cancelled.`}
        confirmText="Yes, Cancel Showtime"
        variant="destructive"
      />
    </div>
  );
}
