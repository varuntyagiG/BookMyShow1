import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import {
  IndianRupee,
  Ticket,
  Film,
  Users,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Plus,
  Calendar,
  Sparkles,
  Loader2,
  AlertCircle,
  Clapperboard,
  ShieldCheck,
  Building2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Star,
  Activity,
  BarChart3,
  Flame,
  ChevronRight,
  Tv,
  Compass
} from 'lucide-react';

function formatTimeAgo(dateString) {
  if (!dateString) return 'Just now';
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const [statsRes, moviesRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getMovies()
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      } else {
        setError(statsRes.message || 'Failed to load statistics.');
      }

      if (moviesRes.success) {
        setMovies(moviesRes.movies || []);
      }
    } catch (err) {
      setError(err.message || 'Network error syncing admin dashboard metrics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Top ranked movies by rating
  const rankedMovies = useMemo(() => {
    if (!movies || movies.length === 0) return [];
    return [...movies]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5);
  }, [movies]);

  // Featured spotlight film (Highest rated / first movie)
  const spotlightMovie = useMemo(() => {
    if (!movies || movies.length === 0) return null;
    return movies.find(m => m.isPromoted) || movies[0];
  }, [movies]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-gray-500">
        <div className="relative">
          <Loader2 className="w-10 h-10 text-[#F84464] animate-spin mb-3" />
          <div className="absolute inset-0 blur-lg bg-[#F84464]/20 rounded-full animate-pulse" />
        </div>
        <p className="text-xs font-bold tracking-wide text-gray-600 mt-2">
          Syncing Box Office Telemetry from MongoDB Atlas...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 text-xs font-medium">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
        <button
          onClick={() => loadDashboardData()}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const confirmedCount = stats?.confirmedCount || 0;
  const cancelledCount = stats?.cancelledCount || 0;
  const totalBookings = stats?.totalBookings || 0;
  const confirmedPercent = totalBookings > 0 ? Math.round((confirmedCount / totalBookings) * 100) : 100;
  const totalRevenue = stats?.totalRevenue || 0;
  const avgOrderValue = confirmedCount > 0 ? Math.round(totalRevenue / confirmedCount) : 0;
  const movieBookings = stats?.movieBookingsCount || 0;
  const otherBookings = stats?.otherBookingsCount || 0;
  const totalCategoryBookings = movieBookings + otherBookings;
  const movieBookingsPercent = totalCategoryBookings > 0 ? Math.round((movieBookings / totalCategoryBookings) * 100) : 85;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* 1. Header Bar with Live Telemetry Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Atlas Live Telemetry
            </span>
            <span className="text-[11px] text-gray-400 font-medium hidden md:inline">
              &bull; BookMyShow Super Admin Console
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1F222E]">
            Executive Cinema Command Center
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time analytics of box office ticket sales, customer transactions, and multiplex schedules
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-700 hover:text-[#1F222E] border border-gray-200 text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#F84464] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Data'}</span>
          </button>

          <Link
            to="/admin/movies"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold transition shadow-md shadow-[#F84464]/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Movie</span>
          </Link>
        </div>
      </div>

      {/* 2. Executive KPI Cards (High Contrast, Deep Color Accents, Micro Charts) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Gross Ticket Sales (Hero Dark Slate Gradient) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1F222E] via-[#262A38] to-[#191B24] text-white shadow-md relative overflow-hidden flex flex-col justify-between group hover:shadow-lg transition-all border border-[#2F3244]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
              Gross Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>₹{avgOrderValue}</span>
              </span>
              <span className="text-[10px] text-gray-400 font-medium">avg per ticket order</span>
            </div>
          </div>

          {/* Micro Visual Bar */}
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full w-[85%] rounded-full" />
          </div>
        </div>

        {/* KPI 2: Bookings Volume & Settlement Rate */}
        <div className="p-5 rounded-2xl bg-white shadow-xs hover:shadow-md transition-shadow border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
              Ticket Bookings
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-[#1F222E] tracking-tight">
              {totalBookings}
            </div>
            <div className="flex items-center justify-between text-[11px] mt-1 font-semibold">
              <span className="text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {confirmedCount} settled
              </span>
              <span className="text-rose-500">{cancelledCount} refunded</span>
            </div>
          </div>

          {/* Segmented Settlement Bar */}
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${confirmedPercent}%` }}
            />
            <div
              className="bg-rose-400 h-full transition-all duration-500"
              style={{ width: `${100 - confirmedPercent}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Movies in Catalog */}
        <div className="p-5 rounded-2xl bg-white shadow-xs hover:shadow-md transition-shadow border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
              Active Films
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#F84464]/10 text-[#F84464] border border-[#F84464]/20 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-[#1F222E] tracking-tight">
              {stats?.totalMovies || 0}
            </div>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500 font-semibold">
              <span className="px-1.5 py-0.2 rounded bg-gray-100 text-[9px] font-black uppercase tracking-wider text-gray-700">
                IMAX • 4DX • 2D
              </span>
              <span>formats active</span>
            </div>
          </div>

          <Link
            to="/admin/movies"
            className="text-[11px] font-bold text-[#F84464] hover:text-[#E03A58] flex items-center gap-1 transition"
          >
            <span>Browse film catalog</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* KPI 4: Audience Network */}
        <div className="p-5 rounded-2xl bg-white shadow-xs hover:shadow-md transition-shadow border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
              Audience Network
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-[#1F222E] tracking-tight">
              {stats?.totalUsers || 0}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-500 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <span>Registered accounts</span>
            </div>
          </div>

          <Link
            to="/admin/users"
            className="text-[11px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 transition"
          >
            <span>Manage permissions</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 3. Cinema Spotlight Showcase (Visual Anchor for Movie Platform) */}
      {spotlightMovie && (
        <div className="relative rounded-3xl overflow-hidden shadow-sm border border-gray-200/80 bg-gradient-to-r from-[#14161D] via-[#1E212D] to-[#161821] text-white">
          {/* Backdrop Image with Dark Multi-Gradient */}
          <div className="absolute inset-0 opacity-25 mix-blend-luminosity overflow-hidden pointer-events-none">
            <img
              src={spotlightMovie.backdropUrl || spotlightMovie.posterUrl}
              alt={spotlightMovie.title}
              className="w-full h-full object-cover scale-105"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#14161D] via-[#14161D]/90 to-transparent pointer-events-none" />

          <div className="relative z-10 p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              {/* Poster Thumbnail */}
              <img
                src={spotlightMovie.posterUrl}
                alt={spotlightMovie.title}
                className="w-18 h-26 sm:w-20 sm:h-28 object-cover rounded-xl shadow-2xl border border-white/20 shrink-0"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop';
                }}
              />

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F84464] text-white font-black text-[9px] uppercase tracking-wider shadow-sm">
                    <Flame className="w-3 h-3" /> Spotlight Film
                  </span>
                  {spotlightMovie.certificate && (
                    <span className="px-2 py-0.5 rounded bg-white/10 text-gray-300 font-bold text-[10px] border border-white/10">
                      {spotlightMovie.certificate}
                    </span>
                  )}
                  <span className="text-xs text-gray-300 font-semibold">
                    {spotlightMovie.language || 'Hindi'} &bull; {spotlightMovie.duration || '2h 30m'}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {spotlightMovie.title}
                </h2>

                <p className="text-xs text-gray-300 max-w-xl line-clamp-1 font-medium">
                  {Array.isArray(spotlightMovie.genre) ? spotlightMovie.genre.join(', ') : spotlightMovie.genre}
                  {spotlightMovie.synopsis && ` — ${spotlightMovie.synopsis}`}
                </p>

                <div className="flex items-center gap-4 pt-1 text-xs">
                  <div className="flex items-center gap-1 font-black text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{spotlightMovie.rating || 8.0} / 10</span>
                  </div>
                  <span className="text-gray-400">&bull;</span>
                  <span className="text-gray-300 font-medium">
                    {spotlightMovie.theatres?.length || 0} Theatres Scheduling Shows
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
              <Link
                to={`/admin/shows?movie=${spotlightMovie.id || spotlightMovie._id}`}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold transition shadow-lg shadow-[#F84464]/30 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Theatres</span>
              </Link>
              <Link
                to="/admin/movies"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition border border-white/15 cursor-pointer backdrop-blur-xs"
              >
                <span>Full Catalog</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 4. Asymmetric 2-Column Section (Left: Orders Ledger; Right: Leaderboard & Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ====================================================
            LEFT COLUMN (8 / 12) - Box Office Orders Stream
        ==================================================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* Recent Orders Box Office Table */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F84464]/10 text-[#F84464] flex items-center justify-center">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-[#1F222E]">Live Customer Transactions</h2>
                  <p className="text-[11px] text-gray-500">
                    Direct real-time box office bookings placed on BookMyShow
                  </p>
                </div>
              </div>

              <Link
                to="/admin/bookings"
                className="text-xs font-bold text-[#F84464] hover:text-[#E03A58] flex items-center gap-1 transition"
              >
                <span>All Orders</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {stats?.recentBookings?.length === 0 ? (
              <p className="text-xs text-gray-400 py-10 text-center font-medium">
                No customer bookings recorded in database yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 uppercase text-[9px] tracking-wider bg-gray-50/70 font-bold">
                      <th className="py-2.5 px-3">Order Ref</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Movie &amp; Venue</th>
                      <th className="py-2.5 px-3">Seats</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stats?.recentBookings?.map((b) => (
                      <tr key={b._id} className="hover:bg-gray-50/60 transition">
                        <td className="py-3 px-3">
                          <span className="font-mono text-[#F84464] font-black text-xs block">
                            {b.bookingId}
                          </span>
                          <span className="text-[10px] text-gray-400 font-sans block">
                            {formatTimeAgo(b.createdAt)}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-[#1F222E] leading-tight">
                            {b.user?.name || 'Customer'}
                          </p>
                          <p className="text-[10px] text-gray-400">{b.user?.email || 'N/A'}</p>
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-[#1F222E] line-clamp-1">{b.movieTitle}</p>
                          <p className="text-[10px] text-gray-500 line-clamp-1">
                            {b.theatreName} &bull; {b.showtime}
                          </p>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 font-mono text-[10px] font-bold text-gray-700">
                            {b.seats?.join(', ') || `${b.seatsCount} pass(es)`}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-black text-[#1F222E] text-xs">
                          ₹{b.totalAmount}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <AdminStatusBadge status={b.bookingStatus} size="xs" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Real-Time Booking Pulse Feed */}
          {stats?.recentBookings?.length > 0 && (
            <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-black text-[#1F222E] uppercase tracking-wider">
                  Live Ticket Sales Activity Pulse
                </h3>
              </div>
              <div className="space-y-2">
                {stats.recentBookings.slice(0, 3).map((b) => (
                  <div
                    key={b._id}
                    className="flex items-center justify-between text-xs py-2 px-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 text-gray-600"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span className="font-bold text-[#1F222E]">{b.user?.name || 'Customer'}</span>
                      <span className="text-gray-400">booked</span>
                      <span className="font-bold text-gray-800 line-clamp-1">{b.movieTitle}</span>
                      <span className="text-gray-400 text-[11px] hidden sm:inline">
                        ({b.seats?.join(', ') || `${b.seatsCount} seats`})
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0 font-medium ml-2">
                      {formatTimeAgo(b.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ====================================================
            RIGHT COLUMN (4 / 12) - Leaderboard & Ratios
        ==================================================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. Top Rated Movies Leaderboard (Real Posters as Visual Anchors) */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h3 className="text-sm font-black text-[#1F222E]">Top Box Office Releases</h3>
              </div>
              <Link
                to="/admin/movies"
                className="text-[11px] font-bold text-[#F84464] hover:underline"
              >
                Catalog
              </Link>
            </div>

            {rankedMovies.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center font-medium">
                No films in catalog yet.
              </p>
            ) : (
              <div className="space-y-3.5">
                {rankedMovies.map((movie, index) => {
                  const movieId = movie.id || movie._id;
                  const theatreCount = Array.isArray(movie.theatres) ? movie.theatres.length : 0;
                  const rankNumber = String(index + 1).padStart(2, '0');

                  return (
                    <div
                      key={movieId}
                      className="flex items-center gap-3 p-2 rounded-2xl hover:bg-gray-50 transition group"
                    >
                      {/* Rank Index */}
                      <span className="text-xs font-black text-gray-400 w-5 shrink-0 group-hover:text-[#F84464] transition">
                        {rankNumber}
                      </span>

                      {/* Movie Poster */}
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-10 h-14 object-cover rounded-xl bg-gray-100 border border-gray-200 shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop';
                        }}
                      />

                      {/* Movie Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/admin/shows?movie=${movieId}`}
                          className="font-black text-xs text-[#1F222E] hover:text-[#F84464] transition line-clamp-1 leading-tight"
                          title={movie.title}
                        >
                          {movie.title}
                        </Link>
                        <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                          {Array.isArray(movie.genre) ? movie.genre.join(', ') : (movie.genre || 'Action')}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>{movie.rating || 8.0}</span>
                          </span>
                          <span className="text-gray-300 text-[9px]">&bull;</span>
                          <span className="text-[10px] font-medium text-gray-500">
                            {theatreCount} {theatreCount === 1 ? 'Venue' : 'Venues'}
                          </span>
                        </div>
                      </div>

                      {/* Quick Shows Link */}
                      <Link
                        to={`/admin/shows?movie=${movieId}`}
                        className="p-2 rounded-xl bg-gray-100 hover:bg-[#F84464]/10 text-gray-500 hover:text-[#F84464] transition shrink-0"
                        title="Schedule Shows"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Platform Telemetry Breakdown (Category & Settlement Ratios) */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-black text-[#1F222E]">Category &amp; Settlement Ratios</h3>
            </div>

            {/* Category Split: Movies vs Live Experiences */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1.5">
                <span className="flex items-center gap-1">
                  <Film className="w-3.5 h-3.5 text-[#F84464]" />
                  <span>Cinema vs Live Events</span>
                </span>
                <span className="text-gray-500">{movieBookingsPercent}% Movies</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden flex">
                <div
                  className="bg-[#F84464] h-full transition-all duration-500"
                  style={{ width: `${movieBookingsPercent}%` }}
                />
                <div
                  className="bg-purple-500 h-full transition-all duration-500"
                  style={{ width: `${100 - movieBookingsPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1 font-medium">
                <span>{movieBookings} movie bookings</span>
                <span>{otherBookings} live event passes</span>
              </div>
            </div>

            {/* Settlement Split: Confirmed vs Refunded */}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1.5">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Settlement Health</span>
                </span>
                <span className="text-emerald-700">{confirmedPercent}% Confirmed</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${confirmedPercent}%` }}
                />
                <div
                  className="bg-rose-400 h-full transition-all duration-500"
                  style={{ width: `${100 - confirmedPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1 font-medium">
                <span className="text-emerald-600">{confirmedCount} confirmed</span>
                <span className="text-rose-500">{cancelledCount} refunded</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
