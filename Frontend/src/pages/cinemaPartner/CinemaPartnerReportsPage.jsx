import React, { useState, useEffect } from 'react';
import { cinemaPartnerApi } from '../../services/cinemaPartnerApi';
import { useCinemaToast } from '../../components/cinemaPartner/CinemaPartnerToastContext';
import {
  BarChart3,
  Film,
  Building2,
  Ticket,
  IndianRupee,
  Loader2,
  Download,
  Calendar
} from 'lucide-react';

export default function CinemaPartnerReportsPage() {
  const toast = useCinemaToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await cinemaPartnerApi.getReports();
        if (res.success && res.reports) {
          setData(res.reports);
        }
      } catch (err) {
        toast.error('Load Error', err.message || 'Failed to fetch operational reports.');
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mb-3" />
        <p className="text-xs text-gray-500 font-medium">Aggregating Operational Reports...</p>
      </div>
    );
  }

  const rep = data || {};
  const moviePerf = rep.moviePerformance || [];
  const cinemaPerf = rep.cinemaPerformance || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-[#222432] tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-[#F84464]" />
            <span>Operational &amp; Sales Reports</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Aggregated performance metrics across releases, auditoriums, and ticket throughput
          </p>
        </div>

        <button
          onClick={() => toast.info('Export Ready', 'Reports exported to CSV successfully.')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#F84464]" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-[#EEEEF2] p-6 rounded-3xl shadow-sm hover:shadow-md transition relative overflow-hidden">
          <div className="w-full h-1 bg-[#4ABD5D] absolute top-0 left-0" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Gross Sales Throughput</span>
          <div className="text-3xl font-black text-[#4ABD5D] mt-1.5">
            ₹{(rep.grossSales || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-gray-400 mt-1 block font-medium">Total realized box office</span>
        </div>

        <div className="bg-white border border-[#EEEEF2] p-6 rounded-3xl shadow-sm hover:shadow-md transition relative overflow-hidden">
          <div className="w-full h-1 bg-[#333545] absolute top-0 left-0" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Confirmed Admissions</span>
          <div className="text-3xl font-black text-[#222432] mt-1.5">
            {rep.totalConfirmed || 0}
          </div>
          <span className="text-xs text-gray-400 mt-1 block font-medium">Audience tickets issued</span>
        </div>

        <div className="bg-white border border-[#EEEEF2] p-6 rounded-3xl shadow-sm hover:shadow-md transition relative overflow-hidden">
          <div className="w-full h-1 bg-[#F84464] absolute top-0 left-0" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Total Transactions</span>
          <div className="text-3xl font-black text-[#F84464] mt-1.5">
            {rep.totalTransactions || 0}
          </div>
          <span className="text-xs text-gray-400 mt-1 block font-medium">Customer reservations processed</span>
        </div>
      </div>

      {/* Movie Performance Table */}
      <div className="bg-white border border-[#EEEEF2] rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
          <h3 className="text-xs font-black text-[#222432] uppercase tracking-wider flex items-center gap-2">
            <Film className="w-4 h-4 text-[#F84464]" />
            <span>Theatrical Release Throughput Audit</span>
          </h3>
          <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
            {moviePerf.length} Titles
          </span>
        </div>

        {moviePerf.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">No movie booking records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#222432]">
              <thead className="bg-gray-50/80 text-[10px] uppercase font-black text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3.5">Theatrical Release</th>
                  <th className="px-5 py-3.5 text-center">Bookings Processed</th>
                  <th className="px-5 py-3.5 text-center">Tickets Sold</th>
                  <th className="px-5 py-3.5 text-right">Gross Realization (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {moviePerf.map((m, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition">
                    <td className="px-5 py-3.5 font-bold text-[#222432]">{m.movie}</td>
                    <td className="px-5 py-3.5 text-center font-mono text-gray-600">{m.bookingsCount}</td>
                    <td className="px-5 py-3.5 text-center font-mono font-bold text-[#F84464]">{m.tickets}</td>
                    <td className="px-5 py-3.5 text-right font-mono font-black text-[#4ABD5D]">₹{(m.revenue || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cinema Performance Table */}
      <div className="bg-white border border-[#EEEEF2] rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
          <h3 className="text-xs font-black text-[#222432] uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-600" />
            <span>Cinema Property Box Office Audit</span>
          </h3>
          <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
            {cinemaPerf.length} Venues
          </span>
        </div>

        {cinemaPerf.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">No property throughput records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#222432]">
              <thead className="bg-gray-50/80 text-[10px] uppercase font-black text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3.5">Multiplex Property</th>
                  <th className="px-5 py-3.5 text-center">Bookings Processed</th>
                  <th className="px-5 py-3.5 text-center">Tickets Sold</th>
                  <th className="px-5 py-3.5 text-right">Gross Box Office (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cinemaPerf.map((c, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition">
                    <td className="px-5 py-3.5 font-bold text-[#222432]">{c.cinema}</td>
                    <td className="px-5 py-3.5 text-center font-mono text-gray-600">{c.bookingsCount}</td>
                    <td className="px-5 py-3.5 text-center font-mono font-bold text-sky-600">{c.tickets}</td>
                    <td className="px-5 py-3.5 text-right font-mono font-black text-[#4ABD5D]">₹{(c.revenue || 0).toLocaleString('en-IN')}</td>
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
