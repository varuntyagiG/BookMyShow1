import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
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

  const stats = data?.stats || {};
  const recentBookings = data?.recentBookings || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#121622] border border-[#23293C] rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Live Nationwide Pulse
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Executive Command Center
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Nationwide Box Office GMV, 10% Convenience Fee Take-Rate & Operational Telemetry
          </p>
        </div>

        {/* Date Filter & Refresh */}
        <div className="flex items-center gap-2.5">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-[#181D2D] border border-[#2B344D] text-white text-xs font-semibold px-3 py-2 rounded-xl outline-none focus:border-[#F84464]"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Past 7 Days</option>
            <option value="month">Past 30 Days</option>
          </select>

          <button
            onClick={() => fetchDashboardData()}
            disabled={refreshing}
            className="p-2 bg-[#181D2D] hover:bg-[#22293E] text-gray-300 hover:text-white rounded-xl border border-[#2B344D] transition disabled:opacity-50"
            title="Refresh Live Data"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin text-[#F84464]' : ''} />
          </button>
        </div>
      </div>

      {/* 4 Prime KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total GMV */}
        <div className="bg-[#121622] border border-[#23293C] rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-[#F84464]/50 transition duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#F84464]/5 rounded-bl-full pointer-events-none group-hover:bg-[#F84464]/10 transition" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Nationwide GMV
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#F84464]/15 flex items-center justify-center text-[#F84464]">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ₹{loading ? '---' : Number(stats.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-400">
            <span className="text-emerald-400 font-semibold flex items-center">
              <ArrowUpRight size={12} /> Live
            </span>
            <span>Total gross ticket sales</span>
          </div>
        </div>

        {/* Platform 10% Fee Revenue */}
        <div className="bg-[#121622] border border-[#23293C] rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/10 transition" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Platform Fee Take (10%)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
              <Percent size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
            ₹{loading ? '---' : Number(stats.platformFeeRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-400">
            <span className="text-emerald-400 font-semibold">10% Take</span>
            <span>Convenience & booking fee</span>
          </div>
        </div>

        {/* Confirmed Bookings */}
        <div className="bg-[#121622] border border-[#23293C] rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:bg-blue-500/10 transition" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Confirmed Admissions
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400">
              <Ticket size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {loading ? '---' : Number(stats.totalBookings || 0).toLocaleString('en-IN')}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-400">
            <span className="text-blue-400 font-semibold">
              {stats.activeBookingsCount || stats.totalBookings || 0}
            </span>
            <span>Tickets scanned & active</span>
          </div>
        </div>

        {/* Cinema Partners Network */}
        <div className="bg-[#121622] border border-[#23293C] rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:bg-amber-500/10 transition" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Partner Venues
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
              <Building2 size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {loading ? '---' : Number(stats.totalVendors || 0).toLocaleString('en-IN')}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-400">
            <span className="text-amber-400 font-semibold">
              {stats.pendingVendors || 0} Pending
            </span>
            <span>KYC verification queue</span>
          </div>
        </div>
      </div>

      {/* Secondary Operational Telemetry Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#121622] border border-[#23293C] rounded-xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400">
            <Film size={18} />
          </div>
          <div>
            <div className="text-lg font-black text-white">{stats.totalMovies || 0}</div>
            <div className="text-[11px] text-gray-400">CineData Titles</div>
          </div>
        </div>

        <div className="bg-[#121622] border border-[#23293C] rounded-xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
            <Building2 size={18} />
          </div>
          <div>
            <div className="text-lg font-black text-white">{stats.totalCinemas || 0}</div>
            <div className="text-[11px] text-gray-400">Theatres Online</div>
          </div>
        </div>

        <div className="bg-[#121622] border border-[#23293C] rounded-xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-400">
            <Calendar size={18} />
          </div>
          <div>
            <div className="text-lg font-black text-white">{stats.totalShows || 0}</div>
            <div className="text-[11px] text-gray-400">Scheduled Shows</div>
          </div>
        </div>

        <div className="bg-[#121622] border border-[#23293C] rounded-xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-rose-500/15 flex items-center justify-center text-rose-400">
            <Users size={18} />
          </div>
          <div>
            <div className="text-lg font-black text-white">{stats.totalUsers || 0}</div>
            <div className="text-[11px] text-gray-400">Registered Patrons</div>
          </div>
        </div>
      </div>

      {/* Quick Action Dispatch Center */}
      <div className="bg-[#121622] border border-[#23293C] rounded-2xl p-6 shadow-xl">
        <h2 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-[#F84464]" />
          <span>Platform Dispatch & Actions</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            to="/admin/vendors"
            className="p-4 rounded-xl bg-[#181D2D] hover:bg-[#20273C] border border-[#2B344D] hover:border-[#F84464]/50 transition group flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-bold text-white group-hover:text-[#F84464] transition flex items-center justify-between">
                <span>KYC Partner Audit</span>
                <ArrowUpRight size={14} />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Review & approve pending cinema partner licenses
              </p>
            </div>
            <span className="text-[10px] font-bold text-amber-400 mt-3 block">
              {stats.pendingVendors || 0} Action Required
            </span>
          </Link>

          <Link
            to="/admin/movies"
            className="p-4 rounded-xl bg-[#181D2D] hover:bg-[#20273C] border border-[#2B344D] hover:border-[#F84464]/50 transition group flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-bold text-white group-hover:text-[#F84464] transition flex items-center justify-between">
                <span>Manage Film Registry</span>
                <ArrowUpRight size={14} />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Pin movies to Homepage Spotlight & manage posters
              </p>
            </div>
            <span className="text-[10px] font-bold text-purple-400 mt-3 block">
              {stats.totalMovies || 0} Titles Cataloged
            </span>
          </Link>

          <Link
            to="/admin/offers"
            className="p-4 rounded-xl bg-[#181D2D] hover:bg-[#20273C] border border-[#2B344D] hover:border-[#F84464]/50 transition group flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-bold text-white group-hover:text-[#F84464] transition flex items-center justify-between">
                <span>Bank Alliances & B1G1</span>
                <ArrowUpRight size={14} />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Configure ICICI, SBI & Amex promo discounts
              </p>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 mt-3 block">
              {stats.activeOffers || 0} Active Campaign Codes
            </span>
          </Link>

          <Link
            to="/admin/settlements"
            className="p-4 rounded-xl bg-[#181D2D] hover:bg-[#20273C] border border-[#2B344D] hover:border-[#F84464]/50 transition group flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-bold text-white group-hover:text-[#F84464] transition flex items-center justify-between">
                <span>Nodal Escrow Disburse</span>
                <ArrowUpRight size={14} />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Authorize weekly partner payouts with UTR tracking
              </p>
            </div>
            <span className="text-[10px] font-bold text-blue-400 mt-3 block">
              Direct Bank Wire
            </span>
          </Link>
        </div>
      </div>

      {/* Nationwide Bookings Audit Manifest */}
      <div className="bg-[#121622] border border-[#23293C] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-extrabold text-white">Recent Nationwide Transactions</h2>
            <p className="text-xs text-gray-400">Live ticket bookings ingested from all partner cinemas</p>
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
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#181D2D] text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Booking ID</th>
                  <th className="px-4 py-3">Movie & Theatre</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Seats</th>
                  <th className="px-4 py-3">Gross Ticket Value</th>
                  <th className="px-4 py-3">Platform Fee (10%)</th>
                  <th className="px-4 py-3 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#20273C]">
                {recentBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-[#181D2D]/60 transition">
                    <td className="px-4 py-3 font-mono font-bold text-white">
                      #{b.bookingId || b._id.toString().slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">
                        {b.showId?.movieId?.title || 'Unknown Title'}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {b.showId?.cinemaId?.name || 'Partner Venue'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-200">{b.userId?.name || 'Customer'}</div>
                      <div className="text-[10px] text-gray-500">{b.userId?.email || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-200">
                      {(b.seats || []).map(s => s.seatNumber || s).join(', ') || 'N/A'}
                    </td>
                    <td className="px-4 py-3 font-bold text-white">
                      ₹{Number(b.totalAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-400">
                      ₹{Math.round((b.totalAmount || 0) * 0.1).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          b.bookingStatus === 'cancelled'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
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
