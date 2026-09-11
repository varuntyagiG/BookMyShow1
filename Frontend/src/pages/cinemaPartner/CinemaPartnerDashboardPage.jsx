import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cinemaPartnerApi } from '../../services/cinemaPartnerApi';
import {
  Building2,
  Tv,
  Users,
  Calendar,
  Ticket,
  TrendingUp,
  Percent,
  IndianRupee,
  Clock,
  QrCode,
  ArrowUpRight,
  Plus,
  Film,
  RefreshCw,
  Loader2,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Activity,
  Layers
} from 'lucide-react';

export default function CinemaPartnerDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await cinemaPartnerApi.getDashboard();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mb-3" />
        <p className="text-xs text-gray-500 font-medium">Connecting to Multiplex Operations Telemetry...</p>
      </div>
    );
  }

  const d = stats || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* BookMyShow Multiplex Operations Hero Banner */}
      <div className="bg-[#222432] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-white/5">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-linear-to-l from-[#F84464]/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#F84464] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                Partner Hub
              </span>
              <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4ABD5D]" />
                BookMyShow Verified Multiplex Network
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Multiplex Operations Control Center
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
              Real-time monitoring of box office collections, auditorium seat occupancy, and turnstile admissions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition cursor-pointer border border-white/10 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#F84464]' : ''}`} />
              <span>Refresh Telemetry</span>
            </button>

            <Link
              to="/cinema-partner/scanner"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold transition shadow-lg shadow-[#F84464]/30"
            >
              <QrCode className="w-4 h-4" />
              <span>Launch Gate Scanner</span>
            </Link>
          </div>
        </div>

        {/* Live Sub-metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-white/10 text-xs">
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Network Status</span>
            <span className="font-bold text-[#4ABD5D] flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#4ABD5D] animate-ping" />
              Active &amp; Online
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Managed Theatres</span>
            <span className="font-bold text-white mt-0.5">{d.totalCinemas || 0} Cinemas</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Active Auditoriums</span>
            <span className="font-bold text-white mt-0.5">{d.totalScreens || 0} Screens</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Network Capacity</span>
            <span className="font-bold text-white mt-0.5">{d.totalSeats || 0} Total Seats</span>
          </div>
        </div>
      </div>

      {/* BookMyShow High-Contrast KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Today's Gross Box Office */}
        <div className="bg-white border border-[#EEEEF2] p-5 rounded-3xl shadow-sm hover:shadow-md transition relative overflow-hidden group">
          <div className="w-full h-1 bg-[#4ABD5D] absolute top-0 left-0" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Today's Box Office</span>
            <div className="w-9 h-9 rounded-xl bg-[#4ABD5D]/10 text-[#4ABD5D] flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#222432] tracking-tight">
            ₹{(d.todayRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-[11px] text-gray-500">
            <span className="text-[#4ABD5D] font-bold">Week: ₹{(d.weeklyRevenue || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Admissions & Tickets Sold */}
        <div className="bg-white border border-[#EEEEF2] p-5 rounded-3xl shadow-sm hover:shadow-md transition relative overflow-hidden group">
          <div className="w-full h-1 bg-[#F84464] absolute top-0 left-0" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Today's Admissions</span>
            <div className="w-9 h-9 rounded-xl bg-[#F84464]/10 text-[#F84464] flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#222432] tracking-tight">
            {d.ticketsSoldToday || 0}
          </div>
          <div className="mt-2.5 text-[11px] text-gray-500">
            <span>Bookings created: </span>
            <strong className="text-[#222432]">{d.todayBookingsCount || 0}</strong>
          </div>
        </div>

        {/* Seating Occupancy Rate */}
        <div className="bg-white border border-[#EEEEF2] p-5 rounded-3xl shadow-sm hover:shadow-md transition relative overflow-hidden group">
          <div className="w-full h-1 bg-sky-500 absolute top-0 left-0" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Multiplex Occupancy</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#222432] tracking-tight">
            {d.occupancyRate || 0}%
          </div>
          <div className="mt-2.5 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(d.occupancyRate || 0, 100)}%` }}
            />
          </div>
        </div>

        {/* Screen Network */}
        <div className="bg-white border border-[#EEEEF2] p-5 rounded-3xl shadow-sm hover:shadow-md transition relative overflow-hidden group">
          <div className="w-full h-1 bg-amber-500 absolute top-0 left-0" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Screens &amp; Halls</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Tv className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#222432] tracking-tight">
            {d.totalScreens || 0} <span className="text-sm font-bold text-gray-400">Screens</span>
          </div>
          <div className="mt-2.5 text-[11px] text-gray-500">
            <span>Across </span>
            <strong className="text-amber-600">{d.totalCinemas || 0} Cinema Venues</strong>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Upcoming Shows & Recent Admissions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Upcoming Screenings Departure Board */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#EEEEF2] rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#F84464]" />
                <h2 className="text-sm font-black text-[#222432] uppercase tracking-wider">
                  Upcoming Screening Schedule
                </h2>
              </div>
              <Link
                to="/cinema-partner/shows"
                className="text-xs font-bold text-[#F84464] hover:text-[#E03A58] flex items-center gap-1"
              >
                <span>View All Shows</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {(!d.upcomingShows || d.upcomingShows.length === 0) ? (
              <div className="py-12 text-center text-gray-500 text-xs">
                No upcoming shows scheduled yet.{' '}
                <Link to="/cinema-partner/shows" className="text-[#F84464] font-bold underline ml-1">
                  Schedule your first show
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {d.upcomingShows.map((show) => {
                  const booked = show.bookedSeats?.length || 0;
                  const total = show.screen?.totalCapacity || 120;
                  const pct = total > 0 ? Math.round((booked / total) * 100) : 0;
                  const isFillingFast = pct >= 40 && pct < 80;
                  const isAlmostFull = pct >= 80;

                  return (
                    <div
                      key={show._id}
                      className="p-4 bg-gray-50/80 border border-gray-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#F84464]/30 hover:bg-white transition"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-16 rounded-xl bg-gray-200 shrink-0 overflow-hidden shadow-xs">
                          {show.movie?.posterUrl ? (
                            <img
                              src={show.movie.posterUrl}
                              alt={show.movieTitle}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Film className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-[#222432] truncate">{show.movieTitle}</h4>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
                            <span className="px-2 py-0.5 rounded-md bg-[#F84464]/10 text-[#F84464] font-black text-[9px] uppercase">
                              {show.format || '2D'}
                            </span>
                            <span className="font-semibold text-gray-700">{show.screen?.name || 'Screen 1'}</span>
                            <span>•</span>
                            <span className="text-[#F84464] font-bold">{show.showDate}</span>
                            <span>•</span>
                            <span className="font-black text-[#222432]">{show.startTime}</span>
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            {isAlmostFull ? (
                              <span className="text-[10px] font-bold text-[#E53935] bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                                Almost Full ({pct}%)
                              </span>
                            ) : isFillingFast ? (
                              <span className="text-[10px] font-bold text-[#F5A623] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                Filling Fast ({pct}%)
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-[#4ABD5D] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                Available ({pct}%)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-black text-[#222432]">₹{show.ticketPrice}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {booked} seats reserved
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Performing Releases */}
          <div className="bg-white border border-[#EEEEF2] rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-[#4ABD5D]" />
                <h2 className="text-sm font-black text-[#222432] uppercase tracking-wider">
                  Top Performing Box Office Releases
                </h2>
              </div>
              <Link to="/cinema-partner/reports" className="text-xs font-bold text-[#4ABD5D] hover:underline">
                Full Analytics
              </Link>
            </div>

            {(!d.bestPerformingMovies || d.bestPerformingMovies.length === 0) ? (
              <div className="py-8 text-center text-gray-500 text-xs">
                No customer bookings recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {d.bestPerformingMovies.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/70 border border-gray-200/80">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-white text-gray-800 text-[11px] font-black flex items-center justify-center shadow-xs border border-gray-200">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-[#222432]">{m.title}</span>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <span className="text-xs text-gray-500">{m.tickets} tickets</span>
                      <span className="text-xs font-black text-[#4ABD5D]">₹{(m.revenue || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Launch Shortcuts & Live Admissions Pulse */}
        <div className="space-y-6">
          {/* Quick Operations Shortcuts */}
          <div className="bg-white border border-[#EEEEF2] rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">
              Operator Quick Launch
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/cinema-partner/cinemas"
                className="p-4 bg-gray-50/80 border border-gray-200 rounded-2xl text-center hover:border-[#F84464] hover:bg-white transition group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F84464]/10 text-[#F84464] flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-800 block">Manage Cinemas</span>
              </Link>

              <Link
                to="/cinema-partner/screens"
                className="p-4 bg-gray-50/80 border border-gray-200 rounded-2xl text-center hover:border-[#F84464] hover:bg-white transition group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F84464]/10 text-[#F84464] flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                  <Tv className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-800 block">Screens &amp; Seats</span>
              </Link>

              <Link
                to="/cinema-partner/shows"
                className="p-4 bg-gray-50/80 border border-gray-200 rounded-2xl text-center hover:border-sky-500 hover:bg-white transition group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-800 block">Schedule Show</span>
              </Link>

              <Link
                to="/cinema-partner/scanner"
                className="p-4 bg-gray-50/80 border border-gray-200 rounded-2xl text-center hover:border-[#4ABD5D] hover:bg-white transition group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#4ABD5D]/10 text-[#4ABD5D] flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                  <QrCode className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-800 block">Gate Scanner</span>
              </Link>
            </div>
          </div>

          {/* Recent Bookings Feed */}
          <div className="bg-white border border-[#EEEEF2] rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
              <h3 className="text-xs font-black text-[#222432] uppercase tracking-wider flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-[#F84464]" />
                <span>Live Bookings Pulse</span>
              </h3>
              <Link to="/cinema-partner/bookings" className="text-xs text-[#F84464] font-bold hover:underline">
                View All
              </Link>
            </div>

            {(!d.recentBookings || d.recentBookings.length === 0) ? (
              <div className="py-8 text-center text-gray-400 text-xs">
                No recent bookings recorded.
              </div>
            ) : (
              <div className="space-y-2.5">
                {d.recentBookings.map((b) => (
                  <div
                    key={b._id}
                    className="p-3.5 bg-gray-50/80 border border-gray-200/80 rounded-2xl text-xs space-y-1 hover:bg-white transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#F84464]">{b.bookingId}</span>
                      <span className="font-black text-[#4ABD5D]">₹{b.totalAmount}</span>
                    </div>
                    <div className="text-xs font-semibold text-[#222432] truncate">{b.movieTitle}</div>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-0.5">
                      <span>Seats: <strong className="text-gray-700">{b.seats?.join(', ')}</strong></span>
                      <span>{b.showtime}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

