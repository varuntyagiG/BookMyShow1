import React, { useState, useEffect } from 'react';
import { cinemaPartnerApi } from '../../services/cinemaPartnerApi';
import { useCinemaToast } from '../../components/cinemaPartner/CinemaPartnerToastContext';
import {
  Clapperboard,
  CheckCircle2,
  Clock,
  XCircle,
  QrCode,
  Ticket,
  Search,
  Loader2,
  Calendar
} from 'lucide-react';

export default function CinemaPartnerTicketsPage() {
  const toast = useCinemaToast();
  const [data, setData] = useState({ summary: {}, tickets: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all'); // 'all' | 'used' | 'unused'

  useEffect(() => {
    async function fetchTickets() {
      try {
        const res = await cinemaPartnerApi.getTickets();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        toast.error('Load Error', err.message || 'Failed to fetch tickets inventory.');
      } finally {
        setLoading(false);
      }
    }
    fetchTickets();
  }, []);

  const s = data.summary || {};
  const tickets = data.tickets || [];

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.bookingId?.toLowerCase().includes(search.toLowerCase()) ||
      t.movieTitle?.toLowerCase().includes(search.toLowerCase()) ||
      t.theatreName?.toLowerCase().includes(search.toLowerCase());

    if (tab === 'used') return matchesSearch && t.ticketValidated;
    if (tab === 'unused') return matchesSearch && !t.ticketValidated && t.bookingStatus === 'confirmed';
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mb-3" />
        <p className="text-xs text-gray-500 font-medium">Loading Tickets Inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-[#222432] tracking-tight flex items-center gap-2.5">
            <Clapperboard className="w-6 h-6 text-[#F84464]" />
            <span>Ticket Inventory &amp; Admissions</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track issued admissions, checked-in guests, and gate validation history
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search booking code..."
            className="pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-[#222432] placeholder-gray-400 focus:outline-none focus:border-[#F84464] w-48 sm:w-60 shadow-xs"
          />
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#EEEEF2] p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Sold</span>
          <div className="text-2xl font-bold text-[#222432] mt-1">{s.totalSold || 0}</div>
          <span className="text-[11px] text-gray-500">Confirmed bookings</span>
        </div>

        <div className="bg-white border border-emerald-200 p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-[#4ABD5D] uppercase tracking-wider block">Checked In (Used)</span>
          <div className="text-2xl font-bold text-[#4ABD5D] mt-1">{s.totalUsed || 0}</div>
          <span className="text-[11px] text-gray-500">Validated at gate</span>
        </div>

        <div className="bg-white border border-amber-200 p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">Unused (Pending)</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{s.totalUnused || 0}</div>
          <span className="text-[11px] text-gray-500">Awaiting admission</span>
        </div>

        <div className="bg-white border border-[#EEEEF2] p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Cancelled</span>
          <div className="text-2xl font-bold text-rose-500 mt-1">{s.totalCancelled || 0}</div>
          <span className="text-[11px] text-gray-500">Refunded tickets</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${tab === 'all'
              ? 'bg-[#F84464] text-white shadow-md shadow-[#F84464]/25'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
        >
          All Tickets ({tickets.length})
        </button>
        <button
          onClick={() => setTab('used')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${tab === 'used'
              ? 'bg-[#4ABD5D] text-white shadow-md shadow-[#4ABD5D]/25'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
        >
          Checked In ({s.totalUsed || 0})
        </button>
        <button
          onClick={() => setTab('unused')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${tab === 'unused'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
        >
          Pending Check-in ({s.totalUnused || 0})
        </button>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white border border-[#EEEEF2] rounded-2xl p-12 text-center text-gray-500 text-xs shadow-sm">
          No tickets found matching this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTickets.map((t) => (
            <div
              key={t._id}
              className="bg-white border border-[#EEEEF2] rounded-2xl p-5 flex flex-col justify-between hover:border-[#F84464]/40 hover:shadow-md transition group"
            >
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                  <span className="text-xs font-mono font-bold text-[#F84464]">{t.bookingId}</span>
                  {t.ticketValidated ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#4ABD5D]/10 text-[#4ABD5D] border border-[#4ABD5D]/20">
                      ✓ Checked In
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Unused
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-[#222432] group-hover:text-[#F84464] transition-colors line-clamp-1">{t.movieTitle}</h4>
                <div className="text-[11px] text-gray-500 mt-1">
                  {t.theatreName} • {t.screenName || 'Screen 1'}
                </div>
                <div className="text-[11px] text-[#F84464] font-semibold mt-0.5">
                  {t.showDate} at {t.showtime}
                </div>

                <div className="mt-3 p-2.5 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center justify-between text-xs">
                  <span className="text-gray-500">Seats: <strong className="text-[#222432]">{t.seats?.join(', ')}</strong></span>
                  <span className="font-bold text-[#4ABD5D]">₹{t.totalAmount}</span>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-gray-100 text-[10px] text-gray-400 flex items-center justify-between">
                <span>Guest: {t.user?.name || 'Customer'}</span>
                <span>{t.ticketValidated && t.validatedAt ? new Date(t.validatedAt).toLocaleTimeString() : ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
