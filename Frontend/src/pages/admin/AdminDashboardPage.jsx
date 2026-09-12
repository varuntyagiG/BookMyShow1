import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import { useRealtimeRefresh } from '../../services/realtimeSync';
import {
  TrendingUp,
  DollarSign,
  Ticket,
  Building2,
  Film,
  Users,
  Percent,
  RefreshCw,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (selectedRange = range) => {
    try {
      setRefreshing(true);
      const res = await adminApi.getOverview(selectedRange);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard overview:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(range);
  }, [range]);

  // Real-time reactive sync across tabs & portals
  useRealtimeRefresh(['BOOKING_MUTATION', 'MOVIE_MUTATION', 'SHOW_MUTATION', 'VENDOR_STATUS_MUTATION', 'OFFER_MUTATION'], () => {
    fetchDashboardData(range);
  });

  const stats = data?.stats || {};
  const recentBookings = data?.recentBookings || [];

  return (
    <div className="space-y-6">
      {/* Page Header (Matching Vendor Page Header Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
              Live Nationwide Pulse
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Executive Command Center
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Nationwide Box Office GMV, 10% Convenience Fee Take-Rate & Operational Telemetry
          </p>
        </div>

        {/* Date Filter & Refresh */}
        <div className="flex items-center gap-2.5">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-white border border-gray-300 text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl outline-none focus:border-[#F84464]"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Past 7 Days</option>
            <option value="month">Past 30 Days</option>
          </select>

          <button
            onClick={() => fetchDashboardData()}
            disabled={refreshing}
            className="p-2 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 rounded-xl border border-gray-300 shadow-sm transition disabled:opacity-50"
            title="Refresh Live Data"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin text-[#F84464]' : ''} />
          </button>
        </div>
      </div>

      {/* 4 Prime KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total GMV - BookMyShow Crimson Hero Card */}
        <motion.div
          whileHover={{ y: -4, scale: 1.015 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="bg-gradient-to-br from-[#F84464] via-[#E23454] to-[#C92A46] text-white rounded-2xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(248,68,100,0.28)] relative overflow-hidden group border border-rose-400/30"
        >
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-white/80">
              Nationwide GMV
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white border border-white/20 shadow-xs group-hover:scale-105 transition-transform">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight font-sans relative z-10">
            ₹{loading ? '---' : Number(stats.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-white/90 relative z-10">
            <span className="bg-white/20 text-white font-bold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 border border-white/20">
              <ArrowUpRight size={12} /> Live Feed
            </span>
            <span className="text-white/80 font-medium">Gross ticket sales volume</span>
          </div>
        </motion.div>

        {/* Platform 10% Fee Revenue */}
        <motion.div
          whileHover={{ y: -4, scale: 1.015 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="bg-gradient-to-br from-white via-white to-emerald-50/40 border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.06),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_32px_-4px_rgba(16,185,129,0.14)] hover:border-emerald-300 transition-all duration-300 relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400" />
          <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-emerald-400/10 blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800/80">
              Platform Fee Take (10%)
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <Percent size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight font-sans relative z-10">
            ₹{loading ? '---' : Number(stats.platformFeeRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 relative z-10">
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] border border-emerald-200/70">
              10% Platform Cut
            </span>
            <span className="font-medium">Convenience earnings</span>
          </div>
        </motion.div>

        {/* Confirmed Bookings */}
        <motion.div
          whileHover={{ y: -4, scale: 1.015 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="bg-gradient-to-br from-white via-white to-blue-50/40 border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(59,130,246,0.06),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_32px_-4px_rgba(59,130,246,0.14)] hover:border-blue-300 transition-all duration-300 relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-500" />
          <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-blue-400/10 blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-800/80">
              Confirmed Admissions
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <Ticket size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans relative z-10">
            {loading ? '---' : Number(stats.totalBookings || 0).toLocaleString('en-IN')}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 relative z-10">
            <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full text-[10px] border border-blue-200/70">
              {stats.activeBookingsCount || stats.totalBookings || 0} Issued
            </span>
            <span className="font-medium">Total tickets reserved</span>
          </div>
        </motion.div>

        {/* Cinema Partners Network */}
        <motion.div
          whileHover={{ y: -4, scale: 1.015 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="bg-gradient-to-br from-white via-white to-amber-50/40 border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(245,158,11,0.06),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_32px_-4px_rgba(245,158,11,0.14)] hover:border-amber-300 transition-all duration-300 relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500" />
          <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-amber-400/10 blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800/80">
              Partner Venues
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
              <Building2 size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-sans relative z-10">
            {loading ? '---' : Number(stats.totalVendors || 0).toLocaleString('en-IN')}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 relative z-10">
            <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full text-[10px] border border-amber-200/70">
              {stats.pendingVendors || 0} Pending KYC
            </span>
            <span className="font-medium">Theatres in network</span>
          </div>
        </motion.div>
      </div>

      {/* Secondary Operational Telemetry Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 transition-all flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shadow-2xs">
            <Film size={20} />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900">{stats.totalMovies || 0}</div>
            <div className="text-[11px] text-slate-500 font-medium">CineData Titles</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 transition-all flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-2xs">
            <Building2 size={20} />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900">{stats.totalCinemas || 0}</div>
            <div className="text-[11px] text-slate-500 font-medium">Theatres Online</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 transition-all flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 border border-sky-100 shadow-2xs">
            <Calendar size={20} />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900">{stats.totalShows || 0}</div>
            <div className="text-[11px] text-slate-500 font-medium">Scheduled Shows</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 transition-all flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center text-[#F84464] border border-rose-100 shadow-2xs">
            <Users size={20} />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900">{stats.totalUsers || 0}</div>
            <div className="text-[11px] text-slate-500 font-medium">Registered Patrons</div>
          </div>
        </div>
      </div>

      {/* Quick Action Dispatch Center */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-[#F84464]" />
          <span>Platform Dispatch & Actions</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            to="/admin/vendors"
            className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition group flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-bold text-gray-900 group-hover:text-[#F84464] transition flex items-center justify-between">
                <span>KYC Partner Audit</span>
                <ArrowUpRight size={14} />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Review & approve pending cinema partner licenses
              </p>
            </div>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded w-fit mt-3">
              {stats.pendingVendors || 0} Action Required
            </span>
          </Link>

          <Link
            to="/admin/movies"
            className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition group flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-bold text-gray-900 group-hover:text-[#F84464] transition flex items-center justify-between">
                <span>Manage Film Registry</span>
                <ArrowUpRight size={14} />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Pin movies to Homepage Spotlight & manage posters
              </p>
            </div>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded w-fit mt-3">
              {stats.totalMovies || 0} Titles Cataloged
            </span>
          </Link>

          <Link
            to="/admin/offers"
            className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition group flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-bold text-gray-900 group-hover:text-[#F84464] transition flex items-center justify-between">
                <span>Bank Alliances & B1G1</span>
                <ArrowUpRight size={14} />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Configure ICICI, SBI & Amex promo discounts
              </p>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded w-fit mt-3">
              Active Campaigns
            </span>
          </Link>

          <Link
            to="/admin/settlements"
            className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition group flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-bold text-gray-900 group-hover:text-[#F84464] transition flex items-center justify-between">
                <span>Nodal Escrow Disburse</span>
                <ArrowUpRight size={14} />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Authorize weekly partner payouts with UTR tracking
              </p>
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded w-fit mt-3">
              Direct Bank Wire
            </span>
          </Link>
        </div>
      </div>

      {/* Nationwide Bookings Audit Manifest */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Recent Nationwide Transactions</h2>
            <p className="text-xs text-gray-500">Live ticket bookings ingested from all partner cinemas</p>
          </div>
          <Link
            to="/admin/bookings"
            className="text-xs font-bold text-[#F84464] hover:underline flex items-center gap-1"
          >
            <span>View All Bookings</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs">
            No nationwide bookings recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] font-bold tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Booking ID</th>
                  <th className="px-4 py-3">Movie & Theatre</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Seats</th>
                  <th className="px-4 py-3">Gross Ticket Value</th>
                  <th className="px-4 py-3">Platform Fee (10%)</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentBookings.map((b) => (
                  <tr key={b._id || b.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-gray-900">
                      #{b.bookingId || (b._id || b.id || '').toString().slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">
                        {b.movieTitle || b.showId?.movieId?.title || 'Unknown Title'}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {b.theatreName || b.showId?.cinemaId?.name || 'Partner Venue'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900">{b.customerName || b.user?.name || b.userId?.name || 'Customer'}</div>
                      <div className="text-[10px] text-gray-400">{b.customerEmail || b.user?.email || b.userId?.email || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {(b.seats || []).map(s => s.seatNumber || s).join(', ') || 'N/A'}
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900">
                      ₹{Number(b.totalAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-600">
                      ₹{Math.round((b.totalAmount || 0) * 0.1).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          b.bookingStatus === 'cancelled'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {b.bookingStatus || 'Confirmed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
