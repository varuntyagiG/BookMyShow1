import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useVendorAuth } from '../../context/VendorAuthContext';
import { vendorApi } from '../../services/vendorApi';
import { useRealtimeRefresh } from '../../services/realtimeSync';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  EmptyState,
  BoxOfficeTrendChart
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
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

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
      {/* Top Header (Matching Admin Header Card) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
              Live Box Office Manifest
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Box Office Operations
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Real-time ticket sales, gate admission validation, and auditorium occupancy for{' '}
            <span className="font-semibold text-gray-900">{partner?.businessName || 'Your Theatres'}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 px-3.5 py-2 rounded-lg shadow-xs transition cursor-pointer"
            title="Refresh Box Office Sync"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin text-[#F84464]' : ''} />
            <span className="hidden sm:inline">Sync Live</span>
          </button>

          <Link
            to="/vendor/scanner"
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#F84464] hover:bg-[#E03A58] px-4 py-2 rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
          >
            <ScanLine size={15} />
            <span>Launch Gate Scanner</span>
          </Link>
        </div>
      </div>

      {/* Senior Executive KPI Summary Row - Compact Equal-Height Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4 items-stretch">
        {/* Metric 1: Box Office Revenue */}
        <div className="relative bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200/90 shadow-xs hover:shadow-md hover:border-gray-300 transition-all duration-200 h-full min-h-[142px] flex flex-col justify-between overflow-hidden group">
          {/* Top 2px Theatrical Laser Beam */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />

          {/* Tier 1: Category & Title with Squircle Icon */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 truncate">
                Financial Gross
              </p>
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5 truncate">
                Box Office Revenue
              </h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/70 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <IndianRupee size={15} />
            </div>
          </div>

          {/* Tier 2: Hero Number & Status (Guaranteed Full Display, Zero Truncation) */}
          <div className="my-1.5 flex items-baseline justify-between gap-2 overflow-visible">
            <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight font-sans whitespace-nowrap shrink-0">
              ₹{summary.totalRevenue.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 shrink-0 whitespace-nowrap">
              Gross
            </span>
          </div>

          {/* Tier 3: Telemetry Footer */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
            <span className="inline-flex items-center gap-1.5 font-medium text-gray-500 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              Live Box Office
            </span>
            <span className="text-gray-700 font-bold shrink-0">
              {summary.totalBookings} {summary.totalBookings === 1 ? 'Booking' : 'Bookings'}
            </span>
          </div>
        </div>

        {/* Metric 2: Tickets Sold */}
        <div className="relative bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200/90 shadow-xs hover:shadow-md hover:border-gray-300 transition-all duration-200 h-full min-h-[142px] flex flex-col justify-between overflow-hidden group">
          {/* Top 2px Theatrical Laser Beam */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#F84464] via-rose-400 to-[#F84464]" />

          {/* Tier 1: Category & Title with Squircle Icon */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 truncate">
                Admissions
              </p>
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5 truncate">
                Tickets Sold
              </h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#F84464] border border-rose-200/70 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Ticket size={15} />
            </div>
          </div>

          {/* Tier 2: Hero Number & Status (Guaranteed Full Display, Zero Truncation) */}
          <div className="my-1.5 flex items-baseline justify-between gap-2 overflow-visible">
            <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight font-sans whitespace-nowrap shrink-0">
              {summary.totalTicketsSold.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] font-bold text-[#F84464] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/80 shrink-0 whitespace-nowrap">
              Admissions
            </span>
          </div>

          {/* Tier 3: Telemetry Footer */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
            <span className="inline-flex items-center gap-1.5 font-medium text-gray-500 truncate">
              <Ticket size={11} className="text-gray-400 shrink-0" />
              {summary.occupancyRate}% Occupancy
            </span>
            <span className="text-gray-700 font-bold shrink-0">
              Across Shows
            </span>
          </div>
        </div>

        {/* Metric 3: Gate Check-Ins */}
        <div className="relative bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200/90 shadow-xs hover:shadow-md hover:border-gray-300 transition-all duration-200 h-full min-h-[142px] flex flex-col justify-between overflow-hidden group">
          {/* Top 2px Theatrical Laser Beam */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500" />

          {/* Tier 1: Category & Title with Squircle Icon */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 truncate">
                Access Control
              </p>
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5 truncate">
                Gate Check-Ins
              </h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/70 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <CheckCircle2 size={15} />
            </div>
          </div>

          {/* Tier 2: Hero Number & Status (Guaranteed Full Display, Zero Truncation) */}
          <div className="my-1.5 flex items-baseline justify-between gap-2 overflow-visible">
            <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight font-sans whitespace-nowrap shrink-0">
              {summary.validatedTicketsCount.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/80 shrink-0 whitespace-nowrap">
              Verified
            </span>
          </div>

          {/* Tier 3: Telemetry Footer */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
            <span className="inline-flex items-center gap-1.5 font-medium text-gray-500 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
              Scanner Online
            </span>
            <span className="text-gray-700 font-bold shrink-0">
              {summary.totalBookings > 0 ? Math.round((summary.validatedTicketsCount / summary.totalBookings) * 100) : 0}% Check-in
            </span>
          </div>
        </div>

        {/* Metric 4: Active Schedules */}
        <div className="relative bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200/90 shadow-xs hover:shadow-md hover:border-gray-300 transition-all duration-200 h-full min-h-[142px] flex flex-col justify-between overflow-hidden group">
          {/* Top 2px Theatrical Laser Beam */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-400 via-violet-400 to-purple-500" />

          {/* Tier 1: Category & Title with Squircle Icon */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 truncate">
                Programming
              </p>
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5 truncate">
                Active Schedules
              </h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 border border-purple-200/70 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Calendar size={15} />
            </div>
          </div>

          {/* Tier 2: Hero Number & Status (Guaranteed Full Display, Zero Truncation) */}
          <div className="my-1.5 flex items-baseline justify-between gap-2 overflow-visible">
            <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight font-sans whitespace-nowrap shrink-0">
              {summary.activeShowsCount.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/80 shrink-0 whitespace-nowrap">
              Live Shows
            </span>
          </div>

          {/* Tier 3: Telemetry Footer */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
            <span className="inline-flex items-center gap-1.5 font-medium text-gray-500 truncate">
              <Tv size={11} className="text-gray-400 shrink-0" />
              {summary.screensCount} Audis
            </span>
            <span className="text-gray-700 font-bold shrink-0">
              Timetables Active
            </span>
          </div>
        </div>
      </div>

      {/* Quick Operations Command Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/vendor/cinemas"
          className="group bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gray-50 text-gray-700 border border-gray-200 flex items-center justify-center font-bold shadow-xs group-hover:bg-[#F84464] group-hover:text-white group-hover:border-[#F84464] transition-all">
              <MapPin size={20} />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm group-hover:text-[#F84464] transition">
                Cinemas &amp; Venues
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-gray-500 font-medium">
                  {summary.cinemasCount} Venues
                </span>
              </div>
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-[#F84464] transition-all">
            <ArrowUpRight size={15} />
          </div>
        </Link>

        <Link
          to="/vendor/screens"
          className="group bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gray-50 text-gray-700 border border-gray-200 flex items-center justify-center font-bold shadow-xs group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
              <Tv size={20} />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition">
                Audi Screens
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-gray-500 font-medium">
                  {summary.screensCount} Audis
                </span>
              </div>
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
            <ArrowUpRight size={15} />
          </div>
        </Link>

        <Link
          to="/vendor/movies"
          className="group bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gray-50 text-gray-700 border border-gray-200 flex items-center justify-center font-bold shadow-xs group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all">
              <Film size={20} />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm group-hover:text-emerald-600 transition">
                Movie Catalog
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-gray-500 font-medium">
                  Film Registry
                </span>
              </div>
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
            <ArrowUpRight size={15} />
          </div>
        </Link>

        <Link
          to="/vendor/shows"
          className="group bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gray-50 text-gray-700 border border-gray-200 flex items-center justify-center font-bold shadow-xs group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600 transition-all">
              <Calendar size={20} />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm group-hover:text-amber-600 transition">
                Show Timetables
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-gray-500 font-medium">
                  {summary.activeShowsCount} Live Shows
                </span>
              </div>
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-all">
            <ArrowUpRight size={15} />
          </div>
        </Link>
      </div>

      {/* Visual Analytics Box Office Trend Chart UI Template */}
      <BoxOfficeTrendChart
        analytics={analytics}
        onRefresh={handleManualRefresh}
      />

      {/* Live Recent Bookings Table Card (Matching Admin Table Card) */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-row items-center justify-between p-6 pb-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span>Live Gate &amp; Box Office Feed</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Real-time manifest of verified and incoming customer reservations across your multiplexes.
            </p>
          </div>
          <Link
            to="/vendor/bookings"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#F84464] hover:text-[#d4324f] hover:underline transition"
          >
            <span>Full Manifest</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>

        <div className="p-0">
          {loading ? (
            <div className="py-12 text-center text-sm text-gray-400">
              Syncing live box office data...
            </div>
          ) : !analytics?.recentBookings || analytics.recentBookings.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No customer bookings yet"
                description="When customers book tickets for your shows on BookMyShow, their reservations will appear here in real-time."
                actionText="Schedule Show"
                onAction={() => window.location.href = '/vendor/shows'}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                    <TableHead className="py-3 px-4">Booking Ref</TableHead>
                    <TableHead className="py-3 px-4">Movie</TableHead>
                    <TableHead className="py-3 px-4">Theatre &amp; Show</TableHead>
                    <TableHead className="py-3 px-4">Patron (Customer)</TableHead>
                    <TableHead className="py-3 px-4">Allocated Seats</TableHead>
                    <TableHead className="py-3 px-4">Amount</TableHead>
                    <TableHead className="py-3 px-4">Gate Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.recentBookings.map((b) => {
                    const isValidated = Boolean(b.ticketValidated);
                    const customerName = b.customerName || 'Customer';
                    const initials = customerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'P';

                    return (
                      <TableRow key={b.id || b.bookingId} className="hover:bg-gray-50/80 transition-colors text-xs border-b border-gray-100 divide-y divide-gray-100">
                        <TableCell className="py-3 px-4 font-mono font-bold text-gray-900">
                          <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-800 border border-gray-200 font-mono font-bold">
                            {b.bookingId}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 px-4 font-bold text-gray-900">
                          {b.movieTitle}
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="text-xs text-gray-800 font-semibold">{b.theatreName}</div>
                          <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <Calendar size={11} className="text-gray-400" />
                            <span>{b.showDate} • {b.showtime}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#F84464] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                              {initials}
                            </div>
                            <span className="font-semibold text-gray-800 text-xs">{customerName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[140px]">
                            {(b.seats || []).slice(0, 3).map((s) => (
                              <span
                                key={s}
                                className="bg-gray-100 text-gray-800 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border border-gray-200"
                              >
                                {s}
                              </span>
                            ))}
                            {(b.seats || []).length > 3 && (
                              <span className="text-[10px] text-gray-500 font-semibold self-center">
                                +{b.seats.length - 3} more
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4 font-black text-gray-900 font-mono">
                          ₹{Number(b.totalAmount || 0).toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          {isValidated ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 size={11} />
                              <span>Checked In</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              <span>Pending Gate</span>
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
