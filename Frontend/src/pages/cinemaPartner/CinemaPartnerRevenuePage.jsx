import React, { useState, useEffect } from 'react';
import { cinemaPartnerApi } from '../../services/cinemaPartnerApi';
import { useCinemaToast } from '../../components/cinemaPartner/CinemaPartnerToastContext';
import {
  TrendingUp,
  IndianRupee,
  Calendar,
  Building2,
  Film,
  Loader2,
  ArrowUpRight,
  PieChart,
  BarChart2
} from 'lucide-react';

export default function CinemaPartnerRevenuePage() {
  const toast = useCinemaToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRevenue() {
      try {
        const res = await cinemaPartnerApi.getRevenue();
        if (res.success && res.revenue) {
          setData(res.revenue);
        }
      } catch (err) {
        toast.error('Load Error', err.message || 'Failed to fetch financial metrics.');
      } finally {
        setLoading(false);
      }
    }
    fetchRevenue();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mb-3" />
        <p className="text-xs text-gray-500 font-medium">Computing Financial Telemetry...</p>
      </div>
    );
  }

  const r = data || {};
  const byMovieEntries = Object.entries(r.revenueByMovie || {});
  const byCinemaEntries = Object.entries(r.revenueByCinema || {});

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-[#222432] tracking-tight flex items-center gap-2.5">
          <TrendingUp className="w-6 h-6 text-[#4ABD5D]" />
          <span>Financial Revenue &amp; Box Office Earnings</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Accredited box office sales, daily revenue pacing, and cinema hall contributions
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-[#EEEEF2] p-6 rounded-3xl shadow-sm hover:shadow-md transition relative overflow-hidden">
          <div className="w-full h-1 bg-[#4ABD5D] absolute top-0 left-0" />
          <span className="text-[10px] font-black text-[#4ABD5D] uppercase tracking-wider block">Today's Collections</span>
          <div className="text-3xl font-black text-[#4ABD5D] mt-1.5">
            ₹{(r.todayRevenue || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-gray-400 mt-1.5 block font-medium">Live gate &amp; online sales</span>
        </div>

        <div className="bg-white border border-[#EEEEF2] p-6 rounded-3xl shadow-sm hover:shadow-md transition relative overflow-hidden">
          <div className="w-full h-1 bg-[#333545] absolute top-0 left-0" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Rolling 7-Day Box Office</span>
          <div className="text-3xl font-black text-[#222432] mt-1.5">
            ₹{(r.weeklyRevenue || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-gray-400 mt-1.5 block font-medium">Weekly admission gross</span>
        </div>

        <div className="bg-white border border-[#EEEEF2] p-6 rounded-3xl shadow-sm hover:shadow-md transition relative overflow-hidden">
          <div className="w-full h-1 bg-sky-500 absolute top-0 left-0" />
          <span className="text-[10px] font-black text-sky-600 uppercase tracking-wider block">Rolling 30-Day Box Office</span>
          <div className="text-3xl font-black text-[#222432] mt-1.5">
            ₹{(r.monthlyRevenue || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-gray-400 mt-1.5 block font-medium">Monthly cinema throughput</span>
        </div>

        <div className="bg-white border border-[#EEEEF2] p-6 rounded-3xl shadow-sm hover:shadow-md transition relative overflow-hidden">
          <div className="w-full h-1 bg-amber-500 absolute top-0 left-0" />
          <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider block">Cumulative Gross</span>
          <div className="text-3xl font-black text-amber-600 mt-1.5">
            ₹{(r.grossRevenue || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-gray-400 mt-1.5 block font-medium">{r.totalBookingsCount || 0} customer reservations</span>
        </div>
      </div>

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue by Movie */}
        <div className="bg-white border border-[#EEEEF2] rounded-3xl p-6 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
            <h3 className="text-xs font-black text-[#222432] uppercase tracking-wider flex items-center gap-2">
              <Film className="w-4 h-4 text-[#F84464]" />
              <span>Revenue by Theatrical Release</span>
            </h3>
            <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
              {byMovieEntries.length} Releases
            </span>
          </div>

          {byMovieEntries.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs">No movie earnings recorded.</div>
          ) : (
            <div className="space-y-4">
              {byMovieEntries.map(([movieTitle, amount]) => {
                const pct = r.grossRevenue > 0 ? Math.round((amount / r.grossRevenue) * 100) : 0;

                return (
                  <div key={movieTitle} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#222432] truncate max-w-[220px]">{movieTitle}</span>
                      <span className="font-black text-[#4ABD5D]">₹{amount.toLocaleString('en-IN')} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-[#F84464] to-[#e03a58] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Revenue by Cinema */}
        <div className="bg-white border border-[#EEEEF2] rounded-3xl p-6 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
            <h3 className="text-xs font-black text-[#222432] uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-600" />
              <span>Revenue by Cinema Property</span>
            </h3>
            <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
              {byCinemaEntries.length} Theatres
            </span>
          </div>

          {byCinemaEntries.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs">No cinema earnings recorded.</div>
          ) : (
            <div className="space-y-4">
              {byCinemaEntries.map(([cinemaName, amount]) => {
                const pct = r.grossRevenue > 0 ? Math.round((amount / r.grossRevenue) * 100) : 0;

                return (
                  <div key={cinemaName} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#222432] truncate max-w-[220px]">{cinemaName}</span>
                      <span className="font-black text-sky-600">₹{amount.toLocaleString('en-IN')} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-sky-500 to-sky-600 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
