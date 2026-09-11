import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useVendorAuth } from '../../context/VendorAuthContext';
import { vendorApi } from '../../services/vendorApi';
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
          change={`${summary.totalBookings > 0 ? Math.round((summary.validatedTicketsCount / summary.totalBookings) * 100) : 0}% of admissions`}
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

      {/* Quick Operations Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/vendor/cinemas"
          className="group bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-[#F84464] hover:shadow-md transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-[#F84464] flex items-center justify-center font-bold">
              <MapPin size={20} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm group-hover:text-[#F84464] transition">
                Cinemas & Venues
              </p>
              <p className="text-xs text-gray-500">{summary.cinemasCount} registered</p>
            </div>
          </div>
          <ArrowUpRight size={16} className="text-gray-400 group-hover:text-[#F84464] transition" />
        </Link>

        <Link
          to="/vendor/screens"
          className="group bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-[#F84464] hover:shadow-md transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Tv size={20} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm group-hover:text-indigo-600 transition">
                Audi Screens
              </p>
              <p className="text-xs text-gray-500">{summary.screensCount} configured</p>
            </div>
          </div>
          <ArrowUpRight size={16} className="text-gray-400 group-hover:text-indigo-600 transition" />
        </Link>

        <Link
          to="/vendor/movies"
          className="group bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-[#F84464] hover:shadow-md transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Film size={20} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm group-hover:text-emerald-600 transition">
                Movie Catalog
              </p>
              <p className="text-xs text-gray-500">Publish or schedule</p>
            </div>
          </div>
          <ArrowUpRight size={16} className="text-gray-400 group-hover:text-emerald-600 transition" />
        </Link>

        <Link
          to="/vendor/shows"
          className="group bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-[#F84464] hover:shadow-md transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Calendar size={20} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm group-hover:text-amber-600 transition">
                Show Timetables
              </p>
              <p className="text-xs text-gray-500">Schedule & pricing</p>
            </div>
          </div>
          <ArrowUpRight size={16} className="text-gray-400 group-hover:text-amber-600 transition" />
        </Link>
      </div>

      {/* Live Recent Bookings Table */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <span>Live Gate & Box Office Feed</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </CardTitle>
            <CardDescription>
              Real-time feed of customer reservations across your theatres.
            </CardDescription>
          </div>
          <Link
            to="/vendor/bookings"
            className="text-xs font-semibold text-[#F84464] hover:underline"
          >
            View Full Manifest →
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
