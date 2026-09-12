import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useVendorAuth } from '../../context/VendorAuthContext';
import { vendorApi } from '../../services/vendorApi';
import { useRealtimeRefresh } from '../../services/realtimeSync';
import {
  PageHeader,
  MetricCard,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  EmptyState
} from '../../components/ui';
import {
  IndianRupee,
  Ticket,
  Tv,
  Calendar,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Film,
  ScanLine,
  RefreshCw,
  Clock,
  ArrowUpRight
} from 'lucide-react';

export default function VendorDashboardPage() {
  const { partner } = useVendorAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchDashboardData = async () => {
    try {
      const res = await vendorApi.getAnalytics();
      if (res.success && res.data) {
        setAnalytics(res.data);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('Failed to load partner analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Auto refresh every 30 seconds for live box office sync only when tab is active
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchDashboardData();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Real-time reactive sync across tabs & portals
  useRealtimeRefresh(['BOOKING_MUTATION', 'SHOW_MUTATION', 'SCREEN_MUTATION', 'MOVIE_MUTATION'], () => {
    fetchDashboardData();
  });

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const summary = analytics?.summary || {
    totalRevenue: 0,
    totalTicketsSold: 0,
    totalBookings: 0,
    validatedTicketsCount: 0,
    activeShowsCount: 0,
    cinemasCount: 0,
    screensCount: 0,
    occupancyRate: 0
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Box Office Operations
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time ticket sales, gate admission validation, and auditorium occupancy for{' '}
            <span className="font-semibold text-gray-700">{partner?.businessName || 'Your Theatres'}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg shadow-sm transition"
            title="Refresh Box Office Sync"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin text-[#F84464]' : ''} />
            <span className="hidden sm:inline">Sync Live</span>
          </button>

          <Link
            to="/vendor/scanner"
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#F84464] hover:bg-[#d83552] px-4 py-2 rounded-lg shadow-sm transition"
          >
            <ScanLine size={15} />
            <span>Launch Gate Scanner</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Box Office Revenue"
          value={`₹${summary.totalRevenue.toLocaleString('en-IN')}`}
          change={`${summary.totalBookings} customer bookings`}
          isPositive={true}
          icon={IndianRupee}
          loading={loading}
          variant="brand"
        />

        <MetricCard
          title="Tickets Sold"
          value={summary.totalTicketsSold.toString()}
          change={`${summary.occupancyRate}% theatre occupancy`}
          isPositive={true}
          icon={Ticket}
          loading={loading}
        />

        <MetricCard
          title="Gate Check-Ins"
          value={summary.validatedTicketsCount.toString()}
          change={`${summary.totalBookings > 0 ? Math.round((summary.validatedTicketsCount / summary.totalBookings) * 100) : 0}% admissions verified`}
          isPositive={true}
          icon={CheckCircle2}
          loading={loading}
        />

        <MetricCard
          title="Active Schedules"
          value={summary.activeShowsCount.toString()}
          change={`Across ${summary.screensCount} auditoriums`}
          isPositive={true}
          icon={Calendar}
          loading={loading}
        />
      </div>

      {/* Quick Operations Command Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/vendor/cinemas"
          className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] hover:border-[#F84464]/60 hover:shadow-[0_12px_28px_-6px_rgba(248,68,100,0.12)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex items-center justify-between"
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-rose-300 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-[#F84464] border border-rose-100 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 group-hover:bg-[#F84464] group-hover:text-white transition-all duration-300">
              <MapPin size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm group-hover:text-[#F84464] transition">
                Cinemas & Venues
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700">
                  {summary.cinemasCount} Venues
                </span>
                <span className="text-[11px] text-slate-400">Manage</span>
              </div>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-[#F84464] transition-all">
            <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </Link>

        <Link
          to="/vendor/screens"
          className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] hover:border-indigo-500/60 hover:shadow-[0_12px_28px_-6px_rgba(99,102,241,0.12)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex items-center justify-between"
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <Tv size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition">
                Audi Screens
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                  {summary.screensCount} Audis
                </span>
                <span className="text-[11px] text-slate-400">Layouts</span>
              </div>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
            <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </Link>

        <Link
          to="/vendor/movies"
          className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] hover:border-emerald-500/60 hover:shadow-[0_12px_28px_-6px_rgba(16,185,129,0.12)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex items-center justify-between"
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <Film size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition">
                Movie Catalog
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                  Schedule
                </span>
                <span className="text-[11px] text-slate-400">Library</span>
              </div>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
            <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </Link>

        <Link
          to="/vendor/shows"
          className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] hover:border-amber-500/60 hover:shadow-[0_12px_28px_-6px_rgba(245,158,11,0.12)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex items-center justify-between"
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-300 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
              <Calendar size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition">
                Show Timetables
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700">
                  {summary.activeShowsCount} Live
                </span>
                <span className="text-[11px] text-slate-400">Timetable</span>
              </div>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-all">
            <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Live Recent Bookings Table Card */}
      <Card className="shadow-none border-slate-200/90 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 bg-slate-50/40">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <span>Live Gate & Box Office Feed</span>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </CardTitle>
            <CardDescription>
              Real-time manifest of verified and incoming customer reservations across your multiplexes.
            </CardDescription>
          </div>
          <Link
            to="/vendor/bookings"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#F84464] hover:text-[#d83552] bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition"
          >
            <span>Full Manifest</span>
            <ArrowUpRight size={13} />
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-sm text-gray-500">
              Syncing live box office data...
            </div>
          ) : !analytics?.recentBookings || analytics.recentBookings.length === 0 ? (
            <EmptyState
              title="No customer bookings yet"
              description="When customers book tickets for your shows on BookMyTrip, their reservations will appear here in real-time."
              actionText="Schedule Show"
              onAction={() => window.location.href = '/vendor/shows'}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Movie</TableHead>
                  <TableHead>Theatre & Show</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Gate Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.recentBookings.map((b) => (
                  <TableRow key={b.id || b.bookingId}>
                    <TableCell className="font-mono text-xs font-bold text-gray-900">
                      {b.bookingId}
                    </TableCell>
                    <TableCell className="font-semibold text-gray-800 text-sm">
                      {b.movieTitle}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-gray-900 font-medium">{b.theatreName}</div>
                      <div className="text-[11px] text-gray-500">
                        {b.showDate} • {b.showtime}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-700">
                      {b.customerName}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[140px]">
                        {(b.seats || []).slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="bg-gray-100 text-gray-800 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                          >
                            {s}
                          </span>
                        ))}
                        {(b.seats || []).length > 3 && (
                          <span className="text-[10px] text-gray-400 self-center">
                            +{b.seats.length - 3} more
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-xs text-gray-900">
                      ₹{b.totalAmount}
                    </TableCell>
                    <TableCell>
                      {b.ticketValidated ? (
                        <Badge variant="success" className="text-[11px] font-semibold">
                          Checked In
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="text-[11px]">
                          Pending Gate
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
