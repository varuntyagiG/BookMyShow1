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

      {/* Senior Executive KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Box Office Revenue */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="bg-white p-5 rounded-2xl border border-slate-100/90 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_18px_38px_-6px_rgba(0,0,0,0.09)] hover:border-slate-200 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
        >
          <div>
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Financial Gross
                </p>
                <h3 className="text-sm font-bold text-slate-800 mt-0.5">
                  Box Office Revenue
                </h3>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-slate-50 text-emerald-600 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-50 transition-all duration-300 shadow-2xs">
                <IndianRupee size={20} />
              </div>
            </div>

            <div className="mt-3.5 flex items-baseline gap-2 flex-wrap relative z-10">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                ₹{summary.totalRevenue.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                Gross Collection
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs relative z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Box Office
            </span>
            <span className="text-slate-500 font-medium text-[11px]">
              {summary.totalBookings} {summary.totalBookings === 1 ? 'Booking' : 'Bookings'}
            </span>
          </div>
        </motion.div>

        {/* Metric 2: Tickets Sold */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="bg-white p-5 rounded-2xl border border-slate-100/90 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_18px_38px_-6px_rgba(0,0,0,0.09)] hover:border-slate-200 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
        >
          <div>
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Admissions
                </p>
                <h3 className="text-sm font-bold text-slate-800 mt-0.5">
                  Tickets Sold
                </h3>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-slate-50 text-[#F84464] border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-rose-50 transition-all duration-300 shadow-2xs">
                <Ticket size={20} />
              </div>
            </div>

            <div className="mt-3.5 flex items-baseline gap-2 relative z-10">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                {summary.totalTicketsSold.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                Admissions
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs relative z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-100">
              <Ticket size={12} className="text-slate-400" />
              {summary.occupancyRate}% Occupancy
            </span>
            <span className="text-slate-500 font-medium text-[11px]">
              Across Shows
            </span>
          </div>
        </motion.div>

        {/* Metric 3: Gate Check-Ins */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="bg-white p-5 rounded-2xl border border-slate-100/90 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_18px_38px_-6px_rgba(0,0,0,0.09)] hover:border-slate-200 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
        >
          <div>
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Access Control
                </p>
                <h3 className="text-sm font-bold text-slate-800 mt-0.5">
                  Gate Check-Ins
                </h3>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-slate-50 text-blue-600 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-blue-50 transition-all duration-300 shadow-2xs">
                <CheckCircle2 size={20} />
              </div>
            </div>

            <div className="mt-3.5 flex items-baseline gap-2 relative z-10">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                {summary.validatedTicketsCount.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                Verified
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs relative z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-100">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Scanner Active
            </span>
            <span className="text-slate-500 font-medium text-[11px]">
              {summary.totalBookings > 0 ? Math.round((summary.validatedTicketsCount / summary.totalBookings) * 100) : 0}% Verified
            </span>
          </div>
        </motion.div>

        {/* Metric 4: Active Schedules */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="bg-white p-5 rounded-2xl border border-slate-100/90 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_18px_38px_-6px_rgba(0,0,0,0.09)] hover:border-slate-200 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
        >
          <div>
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Programming
                </p>
                <h3 className="text-sm font-bold text-slate-800 mt-0.5">
                  Active Schedules
                </h3>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-slate-50 text-violet-600 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-violet-50 transition-all duration-300 shadow-2xs">
                <Calendar size={20} />
              </div>
            </div>

            <div className="mt-3.5 flex items-baseline gap-2 relative z-10">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans">
                {summary.activeShowsCount.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                Live Shows
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs relative z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-100">
              <Tv size={12} className="text-slate-400" />
              {summary.screensCount} Audis
            </span>
            <span className="text-slate-500 font-medium text-[11px]">
              Timetables Active
            </span>
          </div>
        </motion.div>
      </div>

      {/* Quick Operations Command Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div whileHover={{ y: -4, scale: 1.015 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 350, damping: 25 }}>
          <Link
            to="/vendor/cinemas"
            className="group bg-white p-5 rounded-2xl border border-slate-100/90 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_32px_-6px_rgba(0,0,0,0.08)] hover:border-slate-200 transition-all duration-300 relative overflow-hidden flex items-center justify-between h-full"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-800 border border-slate-100 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 group-hover:bg-[#F84464] group-hover:text-white transition-all duration-300">
                <MapPin size={22} />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm group-hover:text-[#F84464] transition">
                  Cinemas & Venues
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-100">
                    {summary.cinemasCount} Venues
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Manage</span>
                </div>
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-[#F84464] transition-all">
              <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>
        </motion.div>

        <motion.div whileHover={{ y: -4, scale: 1.015 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 350, damping: 25 }}>
          <Link
            to="/vendor/screens"
            className="group bg-white p-5 rounded-2xl border border-slate-100/90 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_32px_-6px_rgba(0,0,0,0.08)] hover:border-slate-200 transition-all duration-300 relative overflow-hidden flex items-center justify-between h-full"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-800 border border-slate-100 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <Tv size={22} />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition">
                  Audi Screens
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-100">
                    {summary.screensCount} Audis
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Layouts</span>
                </div>
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
              <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>
        </motion.div>

        <motion.div whileHover={{ y: -4, scale: 1.015 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 350, damping: 25 }}>
          <Link
            to="/vendor/movies"
            className="group bg-white p-5 rounded-2xl border border-slate-100/90 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_32px_-6px_rgba(0,0,0,0.08)] hover:border-slate-200 transition-all duration-300 relative overflow-hidden flex items-center justify-between h-full"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-800 border border-slate-100 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <Film size={22} />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition">
                  Movie Catalog
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-100">
                    Schedule
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Library</span>
                </div>
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
              <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>
        </motion.div>

        <motion.div whileHover={{ y: -4, scale: 1.015 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 350, damping: 25 }}>
          <Link
            to="/vendor/shows"
            className="group bg-white p-5 rounded-2xl border border-slate-100/90 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_32px_-6px_rgba(0,0,0,0.08)] hover:border-slate-200 transition-all duration-300 relative overflow-hidden flex items-center justify-between h-full"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-800 border border-slate-100 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                <Calendar size={22} />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition">
                  Show Timetables
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-100">
                    {summary.activeShowsCount} Live
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Timetable</span>
                </div>
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-all">
              <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Visual Analytics Box Office Trend Chart UI Template */}
      <BoxOfficeTrendChart
        analytics={analytics}
        onRefresh={handleManualRefresh}
      />

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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <TableHead className="py-3 px-4">Booking Ref</TableHead>
                    <TableHead className="py-3 px-4">Movie</TableHead>
                    <TableHead className="py-3 px-4">Theatre & Show</TableHead>
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
                      <TableRow key={b.id || b.bookingId} className="hover:bg-slate-50/70 transition-colors text-xs border-b border-slate-100">
                        <TableCell className="py-3 px-4 font-mono font-bold text-slate-900">
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200/80 font-mono">
                            {b.bookingId}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 px-4 font-bold text-slate-900">
                          {b.movieTitle}
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="text-xs text-slate-900 font-medium">{b.theatreName}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Calendar size={11} className="text-slate-400" />
                            <span>{b.showDate} • {b.showtime}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                              {initials}
                            </div>
                            <span className="font-semibold text-slate-800 text-xs">{customerName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[140px]">
                            {(b.seats || []).slice(0, 3).map((s) => (
                              <span
                                key={s}
                                className="bg-slate-100 text-slate-800 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200/70"
                              >
                                {s}
                              </span>
                            ))}
                            {(b.seats || []).length > 3 && (
                              <span className="text-[10px] text-slate-400 font-semibold self-center">
                                +{b.seats.length - 3} more
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4 font-black text-slate-900 font-sans">
                          ₹{Number(b.totalAmount || 0).toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          {isValidated ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                              <CheckCircle2 size={11} />
                              <span>Checked In</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                              </span>
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
        </CardContent>
      </Card>
    </div>
  );
}
