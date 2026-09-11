import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import {
  IndianRupee,
  Users,
  Building2,
  Film,
  Ticket,
  Percent,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Loader2,
  Calendar,
  Sparkles,
  Store,
  CheckCircle2,
  Tag,
  RefreshCw
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setError('');
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getAnalytics()
      ]);

      if (statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
      if (analyticsRes.success) {
        setAnalytics(analyticsRes);
      }
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
      setError(err.message || 'Failed to load platform dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="w-10 h-10 text-[#F84464] animate-spin mb-3" />
        <p className="text-xs font-semibold uppercase tracking-wider">Aggregating Platform Telemetry &amp; Financials...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-3xl text-red-600 text-center my-8">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
        <h3 className="text-sm font-bold">Platform Data Synchronization Error</h3>
        <p className="text-xs text-red-500/80 mt-1">{error || 'Unable to communicate with platform management API.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* 1. Platform Master Hero Banner (Matching BookMyShow Dark Hero) */}
      <div className="bg-[#222432] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-white/5">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-linear-to-l from-[#F84464]/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#F84464] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                Platform Admin HQ
              </span>
              <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4ABD5D]" />
                BookMyShow Master Control Engine • Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Platform Master Control &amp; Telemetry
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
              Global oversight across customer bookings, partner multiplex networks, master catalog titles, and commercial settlements.
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
              to="/admin/partners"
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition border border-white/10 shadow-xs"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Partners ({stats.totalPartners})</span>
              {stats.pendingPartners > 0 && (
                <span className="bg-amber-400 text-black px-1.5 py-0.2 rounded-full text-[10px] font-black">
                  {stats.pendingPartners}
                </span>
              )}
            </Link>

            <Link
              to="/admin/movies"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold transition shadow-lg shadow-[#F84464]/30"
            >
              <Film className="w-4 h-4" />
              <span>Add Movie Master</span>
            </Link>
          </div>
        </div>

        {/* Real-time Sub-metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10 text-xs">
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Gross Booking Value</span>
            <span className="font-extrabold text-white text-base mt-0.5">
              ₹{(stats.grossRevenue || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Platform Fee Earnings</span>
            <span className="font-extrabold text-[#F84464] text-base mt-0.5">
              ₹{(stats.platformConvenienceFee || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Partner Box Office Share</span>
            <span className="font-extrabold text-[#4ABD5D] text-base mt-0.5">
              ₹{(stats.partnerBoxOfficeShare || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Average Hall Occupancy</span>
            <span className="font-extrabold text-amber-400 text-base mt-0.5">
              {stats.avgOccupancyRate || 0}%
            </span>
          </div>
        </div>
      </div>

      {/* 2. Platform KPI Cards (BookMyShow High-Contrast Clean White Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Today's Transactions */}
        <div className="bg-white border border-[#EEEEF2] p-5 rounded-3xl shadow-sm hover:shadow-md transition relative overflow-hidden group">
          <div className="w-full h-1 bg-[#4ABD5D] absolute top-0 left-0" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Today's Collections</span>
            <div className="w-9 h-9 rounded-xl bg-[#4ABD5D]/10 text-[#4ABD5D] flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#222432] tracking-tight">
            ₹{(stats.todayGrossRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-gray-500">
            <Ticket className="w-3.5 h-3.5 text-gray-400" />
            <span>{stats.todayTicketsSold || 0} tickets sold today</span>
          </div>
        </div>

        {/* Registered Customers */}
        <div className="bg-white border border-[#EEEEF2] p-5 rounded-3xl shadow-sm hover:shadow-md transition relative overflow-hidden group">
          <div className="w-full h-1 bg-[#F84464] absolute top-0 left-0" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Total Customers</span>
            <div className="w-9 h-9 rounded-xl bg-[#F84464]/10 text-[#F84464] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#222432] tracking-tight">
            {stats.totalCustomers || 0}
          </div>
          <div className="mt-2.5 flex items-center gap-1 text-xs text-[#F84464] font-bold">
            <Link to="/admin/customers" className="hover:underline flex items-center gap-1">
              <span>View customer ledger</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Multiplex Circuits & Screens */}
        <div className="bg-white border border-[#EEEEF2] p-5 rounded-3xl shadow-sm hover:shadow-md transition relative overflow-hidden group">
          <div className="w-full h-1 bg-amber-500 absolute top-0 left-0" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Cinema Network</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#222432] tracking-tight">
            {stats.totalCinemas || 0} <span className="text-sm font-bold text-gray-400">Venues</span>
          </div>
          <div className="mt-2.5 text-xs text-gray-500">
            <span>Housing </span>
            <strong className="text-[#222432] font-bold">{stats.totalScreens || 0} Auditoriums</strong>
          </div>
        </div>

        {/* Movie Master Catalog */}
        <div className="bg-white border border-[#EEEEF2] p-5 rounded-3xl shadow-sm hover:shadow-md transition relative overflow-hidden group">
          <div className="w-full h-1 bg-sky-500 absolute top-0 left-0" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Movie Master</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#222432] tracking-tight">
            {stats.totalMovies || 0} <span className="text-sm font-bold text-gray-400">Titles</span>
          </div>
          <div className="mt-2.5 text-xs text-gray-500">
            <span>Running in </span>
            <strong className="text-[#222432] font-bold">{stats.totalShows || 0} Active Screenings</strong>
          </div>
        </div>
      </div>

      {/* 3. Analytics Chart & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 14-Day Daily Revenue & Booking Pacing */}
        <div className="lg:col-span-2 bg-white border border-[#EEEEF2] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-black text-[#222432] uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#F84464]" />
                <span>14-Day Daily Booking Volume</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Real-time daily transaction pacing across all multiplexes</p>
            </div>
            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              Rolling Window
            </span>
          </div>

          {analytics?.dailyTrends && analytics.dailyTrends.length > 0 ? (
            <div className="h-44 flex items-end gap-2 pt-4">
              {analytics.dailyTrends.map((d, i) => {
                const maxBookings = Math.max(...analytics.dailyTrends.map(t => t.bookings || 1), 5);
                const heightPercent = Math.max(12, Math.round(((d.bookings || 0) / maxBookings) * 100));

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-[#222432] text-white text-[10px] px-2 py-1 rounded-md pointer-events-none whitespace-nowrap z-20 shadow-lg">
                      {d.date}: {d.bookings} Bookings (₹{d.revenue.toLocaleString('en-IN')})
                    </div>

                    <div className="w-full bg-gray-100 rounded-t-lg h-32 flex items-end overflow-hidden">
                      <div
                        className="w-full bg-linear-to-t from-[#F84464] to-[#ff6b84] rounded-t-md transition-all duration-500 group-hover:from-[#E03A58] group-hover:to-[#ff5270]"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-gray-400">{d.date}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-xs text-gray-400">
              No historical trend data available yet.
            </div>
          )}
        </div>

        {/* Entertainment Category Breakdown */}
        <div className="bg-white border border-[#EEEEF2] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-black text-[#222432] uppercase tracking-wider flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Category Share</span>
            </h2>
            <p className="text-xs text-gray-500 mb-6">Booking distribution by experience category</p>

            <div className="space-y-4">
              {[
                { name: 'Theatrical Movies', key: 'movie', color: 'bg-[#F84464]' },
                { name: 'Live Concerts & Events', key: 'event', color: 'bg-indigo-500' },
                { name: 'Sports & Derbies', key: 'sport', color: 'bg-[#4ABD5D]' },
                { name: 'Plays & Theatre', key: 'play', color: 'bg-amber-500' }
              ].map((c) => {
                const count = analytics?.categoryDistribution?.[c.key] || 0;
                const total = Object.values(analytics?.categoryDistribution || {}).reduce((a, b) => a + b, 0) || 1;
                const percent = Math.round((count / total) * 100);

                return (
                  <div key={c.key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-gray-700">{c.name}</span>
                      <span className="font-mono text-gray-500">{count} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className={`${c.color} h-full rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
            <span>Unified Platform Database</span>
            <span className="text-[#4ABD5D] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized
            </span>
          </div>
        </div>
      </div>

      {/* 4. Top Box Office Releases & Multiplex Venues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Grossing Movies */}
        <div className="bg-white border border-[#EEEEF2] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-[#222432] uppercase tracking-wider flex items-center gap-2">
              <Film className="w-4 h-4 text-[#F84464]" />
              <span>Top Box Office Releases</span>
            </h2>
            <Link to="/admin/movies" className="text-xs text-[#F84464] font-bold hover:underline">
              Full Catalog →
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {stats.topMovies && stats.topMovies.length > 0 ? (
              stats.topMovies.map((m, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-mono text-xs font-black text-gray-400">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-[#222432] leading-tight">{m.title}</h4>
                      <p className="text-[10px] text-gray-500">{m.bookingsCount} bookings recorded</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-[#222432] font-mono">
                      ₹{m.totalRevenue.toLocaleString('en-IN')}
                    </span>
                    <span className="block text-[9px] text-[#4ABD5D] font-bold">Gross</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-6 text-center">No movie bookings recorded yet.</p>
            )}
          </div>
        </div>

        {/* Top Performing Cinema Multiplexes */}
        <div className="bg-white border border-[#EEEEF2] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-[#222432] uppercase tracking-wider flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-500" />
              <span>Top Performing Multiplexes</span>
            </h2>
            <Link to="/admin/cinemas" className="text-xs text-[#F84464] font-bold hover:underline">
              All Cinemas →
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {stats.topCinemas && stats.topCinemas.length > 0 ? (
              stats.topCinemas.map((c, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-mono text-xs font-black text-gray-400">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-[#222432] leading-tight">{c.name}</h4>
                      <p className="text-[10px] text-gray-500">{c.bookingsCount} admissions processed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-[#222432] font-mono">
                      ₹{c.totalRevenue.toLocaleString('en-IN')}
                    </span>
                    <span className="block text-[9px] text-[#F84464] font-bold">Collections</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-6 text-center">No cinema activity recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* 5. Recent Platform Bookings Ledger Table */}
      <div className="bg-white border border-[#EEEEF2] rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-black text-[#222432] uppercase tracking-wider flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#4ABD5D]" />
              <span>Live Platform Transactions</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Latest ticket reservations created across customer portal</p>
          </div>
          <Link to="/admin/bookings" className="text-xs font-bold text-[#F84464] hover:underline">
            View All Bookings ({stats.totalBookings}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#222432]">
            <thead className="bg-[#F9F9FB] border-b border-[#EEEEF2] text-gray-400 uppercase text-[10px] font-black tracking-wider">
              <tr>
                <th className="px-4 py-3">Booking ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Movie &amp; Venue</th>
                <th className="px-4 py-3">Seats</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEEEF2] font-medium">
              {stats.recentBookings && stats.recentBookings.length > 0 ? (
                stats.recentBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50/80 transition">
                    <td className="px-4 py-3 font-mono font-bold text-[#F84464]">
                      {b.bookingId}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-[#222432]">{b.user?.name || 'Customer'}</div>
                      <div className="text-[10px] text-gray-500">{b.user?.email || b.user?.phone || 'Guest'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-[#222432] truncate max-w-xs">{b.movieTitle}</div>
                      <div className="text-[10px] text-gray-500 truncate max-w-xs">{b.theatreName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px] font-mono text-gray-700">
                        {Array.isArray(b.seats) ? b.seats.join(', ') : `${b.seatsCount} Seats`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-black text-[#222432]">
                      ₹{(b.totalAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b.bookingStatus === 'confirmed'
                            ? 'bg-[#4ABD5D]/10 text-[#4ABD5D] border border-[#4ABD5D]/20'
                            : 'bg-[#F84464]/10 text-[#F84464] border border-[#F84464]/20'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-400">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

