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
  Plus,
  Film,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  MetricCard,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  EmptyState,
  Skeleton,
  CopyBadge,
  CopyButton
} from '../../components/ui';

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
      <div className="space-y-6">
        <Skeleton className="h-44 rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      </div>
    );
  }

  const d = stats || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Multiplex Operations Hero Card */}
      <div className="bg-[#222432] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-white/5">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#F84464]/15 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand" pill>
                Partner Hub
              </Badge>
              <span className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4ABD5D]" />
                BookMyTrip Verified Multiplex Circuit
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
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={handleRefresh}
              loading={refreshing}
              className="bg-white/10 hover:bg-white/15 text-white border-white/15 shadow-none"
            >
              Refresh Telemetry
            </Button>

            <Link to="/cinema-partner/scanner">
              <Button
                variant="primary"
                size="sm"
                icon={QrCode}
                className="shadow-lg shadow-[#F84464]/30"
              >
                Launch Gate Scanner
              </Button>
            </Link>
          </div>
        </div>

        {/* Telemetry Sub-metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-white/10 text-xs">
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Network Status</span>
            <span className="font-bold text-[#4ABD5D] flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-[#4ABD5D] animate-ping" />
              Active &amp; Online
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Managed Venues</span>
            <span className="font-bold text-white mt-1 block">{d.totalCinemas || 0} Cinemas</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Active Auditoriums</span>
            <span className="font-bold text-white mt-1 block">{d.totalScreens || 0} Screens</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Circuit Capacity</span>
            <span className="font-bold text-white mt-1 block">{d.totalSeats || 0} Total Seats</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          title="Today's Box Office"
          value={`₹${(d.todayRevenue || 0).toLocaleString('en-IN')}`}
          subtitle={`Week: ₹${(d.weeklyRevenue || 0).toLocaleString('en-IN')}`}
          icon={IndianRupee}
          variant="success"
        />

        <MetricCard
          title="Today's Admissions"
          value={d.ticketsSoldToday || 0}
          subtitle={`Bookings: ${d.todayBookingsCount || 0} orders`}
          icon={Ticket}
          variant="brand"
        />

        <MetricCard
          title="Multiplex Occupancy"
          value={`${d.occupancyRate || 0}%`}
          subtitle="Real-time seat reservation density"
          icon={Percent}
          variant="info"
        />

        <MetricCard
          title="Screens & Halls"
          value={d.totalScreens || 0}
          subtitle={`Across ${d.totalCinemas || 0} cinema venues`}
          icon={Tv}
          variant="warning"
        />
      </div>

      {/* Main Grid: Screening Timetable & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2-Cols: Upcoming Screenings */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#F84464]" />
                  <span>Upcoming Screening Schedule</span>
                </CardTitle>
                <CardDescription>Auditorium programming and seat demand</CardDescription>
              </div>
              <Link
                to="/cinema-partner/shows"
                className="text-xs font-bold text-[#F84464] hover:text-[#E03A58] flex items-center gap-1"
              >
                <span>View All Shows</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>

            <CardContent>
              {(!d.upcomingShows || d.upcomingShows.length === 0) ? (
                <EmptyState
                  icon={Calendar}
                  title="No Upcoming Shows Scheduled"
                  description="Add movie shows to your cinema screens to start receiving ticket bookings."
                  actionLabel="Schedule First Show"
                  onAction={() => window.location.href = '/cinema-partner/shows'}
                />
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
                          <div className="w-12 h-16 rounded-xl bg-gray-200 shrink-0 overflow-hidden shadow-xs border border-gray-100">
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
                              <Badge variant="brand" className="text-[9px] uppercase px-1.5 py-0.5">
                                {show.format || '2D'}
                              </Badge>
                              <span className="font-semibold text-gray-700">{show.screen?.name || 'Screen 1'}</span>
                              <span>•</span>
                              <span className="text-[#F84464] font-bold">{show.showDate}</span>
                              <span>•</span>
                              <span className="font-black text-[#222432]">{show.startTime}</span>
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                              {isAlmostFull ? (
                                <Badge variant="cancelled" dot>
                                  Almost Full ({pct}%)
                                </Badge>
                              ) : isFillingFast ? (
                                <Badge variant="warning" dot>
                                  Filling Fast ({pct}%)
                                </Badge>
                              ) : (
                                <Badge variant="approved" dot>
                                  Available ({pct}%)
                                </Badge>
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
            </CardContent>
          </Card>

          {/* Top Performing Releases */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-[#4ABD5D]" />
                  <span>Top Performing Box Office Titles</span>
                </CardTitle>
                <CardDescription>Admissions and gross collections by movie</CardDescription>
              </div>
              <Link to="/cinema-partner/reports" className="text-xs font-bold text-[#4ABD5D] hover:underline">
                Full Analytics
              </Link>
            </CardHeader>

            <CardContent>
              {(!d.bestPerformingMovies || d.bestPerformingMovies.length === 0) ? (
                <div className="py-6 text-center text-gray-400 text-xs">
                  No customer ticket bookings recorded yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {d.bestPerformingMovies.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/70 border border-gray-200/80 hover:bg-white transition">
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
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Shortcuts & Live Bookings */}
        <div className="space-y-6">
          {/* Quick Launch Cards */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Operator Quick Launch</CardTitle>
              <CardDescription>Frequent circuit management tasks</CardDescription>
            </CardHeader>

            <CardContent>
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
            </CardContent>
          </Card>

          {/* Recent Bookings Feed */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#F84464]" />
                <span>Live Bookings Pulse</span>
              </CardTitle>
              <Link to="/cinema-partner/bookings" className="text-xs text-[#F84464] font-bold hover:underline">
                View All
              </Link>
            </CardHeader>

            <CardContent>
              {(!d.recentBookings || d.recentBookings.length === 0) ? (
                <div className="py-6 text-center text-gray-400 text-xs">
                  No recent bookings recorded.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {d.recentBookings.map((b) => (
                    <div
                      key={b._id}
                      className="p-3.5 bg-gray-50/80 border border-gray-200/80 rounded-2xl text-xs space-y-1.5 hover:bg-white hover:border-[#F84464]/30 hover:shadow-sm transition"
                    >
                      <div className="flex items-center justify-between">
                        <CopyBadge text={b.bookingId} size="xs" />
                        <span className="font-black text-[#4ABD5D]">₹{b.totalAmount}</span>
                      </div>
                      <div className="text-xs font-semibold text-[#222432] truncate">{b.movieTitle}</div>
                      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          Seats: <strong className="text-gray-700 font-mono">{b.seats?.join(', ')}</strong>
                          {b.seats?.length > 0 && (
                            <CopyButton text={b.seats.join(', ')} size="xs" variant="ghost" title="Copy seats" />
                          )}
                        </span>
                        <span>{b.showtime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
