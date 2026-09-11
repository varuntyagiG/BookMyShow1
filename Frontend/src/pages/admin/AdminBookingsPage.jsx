import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../services/adminApi';
import {
  Ticket,
  Search,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Film,
  Building2,
  Calendar,
  Clock,
  User,
  ShieldAlert,
  X
} from 'lucide-react';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refundingBooking, setRefundingBooking] = useState(null);
  const [refundReason, setRefundReason] = useState('Customer Dispute / Emergency Cancellation');
  const [submittingRefund, setSubmittingRefund] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getBookings({ search, status: statusFilter, limit: 50 });
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchBookings]);

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    if (!refundingBooking) return;
    setSubmittingRefund(true);
    try {
      const res = await adminApi.refundBooking(refundingBooking._id, { reason: refundReason });
      if (res.success) {
        setToastMessage(`Booking #${refundingBooking.bookingId || refundingBooking._id.slice(-6)} refunded successfully`);
        setRefundingBooking(null);
        setTimeout(() => setToastMessage(null), 3000);
        fetchBookings();
      }
    } catch (err) {
      alert(err.message || 'Failed to process forced refund');
    } finally {
      setSubmittingRefund(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#121622] border border-[#23293C] rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Ticket size={16} className="text-[#F84464]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Universal Box Office Audit
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Universal Admissions & Ticket Ledger
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Cross-cinema transaction search, seat manifest inspection & authorized forced refund reversal
          </p>
        </div>

        <button
          onClick={() => fetchBookings()}
          className="self-start sm:self-auto p-2 bg-[#181D2D] hover:bg-[#22293E] text-gray-300 hover:text-white rounded-xl border border-[#2B344D] transition"
          title="Refresh List"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin text-[#F84464]' : ''} />
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Booking ID (#BK-...), Customer email or phone..."
            className="w-full bg-[#121622] border border-[#23293C] focus:border-[#F84464] text-white pl-10 pr-4 py-2.5 rounded-xl text-sm placeholder:text-gray-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'confirmed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                statusFilter === tab
                  ? 'bg-[#F84464] text-white shadow-md shadow-[#F84464]/20'
                  : 'bg-[#121622] text-gray-400 hover:text-white border border-[#23293C]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-[#121622] border border-[#23293C] rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-[#F84464] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-400">Loading admissions ledger...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Ticket size={36} className="mx-auto text-gray-600 mb-3" />
            <p className="text-sm font-semibold text-gray-300">No bookings match the specified criteria</p>
            <p className="text-xs text-gray-500 mt-1">Try broadening your search or resetting filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#181D2D] text-gray-400 uppercase text-[10px] font-bold tracking-wider border-b border-[#23293C]">
                <tr>
                  <th className="px-4 py-3.5">Ref ID</th>
                  <th className="px-4 py-3.5">Film & Theatre</th>
                  <th className="px-4 py-3.5">Patron</th>
                  <th className="px-4 py-3.5">Seats</th>
                  <th className="px-4 py-3.5">Gross Amount</th>
                  <th className="px-4 py-3.5">10% Platform Cut</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Root Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#20273C]">
                {bookings.map((b) => {
                  const isCancelled = b.bookingStatus === 'cancelled';
                  const bookingRef = b.bookingId || b._id.toString().slice(-6).toUpperCase();
                  const seatList = (b.seats || []).map(s => s.seatNumber || s).join(', ') || 'N/A';

                  return (
                    <tr key={b._id} className="hover:bg-[#181D2D]/60 transition">
                      <td className="px-4 py-3.5 font-mono font-bold text-white">
                        #{bookingRef}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-white">
                          {b.showId?.movieId?.title || 'General Title'}
                        </div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Building2 size={11} className="text-gray-500" />
                          <span>{b.showId?.cinemaId?.name || 'Partner Venue'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-gray-200 font-medium">
                          {b.userId?.name || 'Guest User'}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {b.userId?.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-amber-400">
                        {seatList}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-white">
                        ₹{Number(b.totalAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-emerald-400">
                        ₹{Math.round((b.totalAmount || 0) * 0.1).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isCancelled
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {b.bookingStatus || 'Confirmed'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {!isCancelled ? (
                          <button
                            onClick={() => setRefundingBooking(b)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500 px-2.5 py-1.5 rounded-lg border border-rose-500/20 transition"
                          >
                            <RotateCcw size={12} />
                            <span>Force Refund</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-500 italic">Refunded</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Force Refund Modal */}
      {refundingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121622] border border-[#23293C] rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#23293C]">
              <h2 className="text-base font-black text-rose-400 flex items-center gap-2">
                <ShieldAlert size={18} />
                <span>Authorize Force Refund</span>
              </h2>
              <button
                onClick={() => setRefundingBooking(null)}
                className="p-1 text-gray-400 hover:text-white rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRefundSubmit} className="mt-4 space-y-4">
              <div className="p-3 bg-[#181D2D] rounded-xl border border-[#2B344D] text-xs text-gray-300">
                <div className="flex justify-between font-bold text-white mb-1">
                  <span>Booking ID:</span>
                  <span>#{refundingBooking.bookingId || refundingBooking._id.slice(-6)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Refund Amount:</span>
                  <span className="text-emerald-400 font-bold">₹{refundingBooking.totalAmount}</span>
                </div>
                <div className="flex justify-between text-gray-400 mt-1">
                  <span>Seats:</span>
                  <span>{(refundingBooking.seats || []).map(s => s.seatNumber || s).join(', ')}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Regulatory / Incident Justification
                </label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full bg-[#181D2D] border border-[#2B344D] text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-rose-500"
                >
                  <option value="Show Cancelled / AC Failure / Technical Glitch">
                    Show Cancelled / AC Failure / Technical Glitch
                  </option>
                  <option value="Customer Dispute / Emergency Cancellation">
                    Customer Dispute / Emergency Cancellation
                  </option>
                  <option value="Duplicate Ticket Transaction Ingest">
                    Duplicate Ticket Transaction Ingest
                  </option>
                  <option value="Cinema Partner Request">
                    Cinema Partner Request
                  </option>
                </select>
              </div>

              <p className="text-[11px] text-gray-500 leading-relaxed">
                Notice: Releasing this transaction immediately restores the seat availability to the theatre manifest and registers a debit in the partner weekly nodal wire settlement.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundingBooking(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white bg-[#181D2D] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRefund}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/20 disabled:opacity-50"
                >
                  {submittingRefund ? 'Reversing...' : 'Execute Immediate Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
