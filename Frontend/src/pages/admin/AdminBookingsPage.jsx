import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import {
  Ticket,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
  Clock,
  IndianRupee,
  X,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // 360-Degree Booking Detail Drawer State
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getBookings({
        search,
        status: statusFilter,
        page,
        limit: 15
      });
      if (res.success) {
        setBookings(res.bookings || []);
        setPagination(res.pagination || { total: 0, pages: 1 });
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [search, statusFilter, page]);

  const handleOpenDetail = async (bookingId) => {
    setDrawerLoading(true);
    try {
      const res = await adminApi.getBookingById(bookingId);
      if (res.success) {
        setSelectedBooking(res.booking);
      }
    } catch (err) {
      alert(err.message || 'Failed to retrieve booking.');
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleCancelBooking = async (booking) => {
    const reason = window.prompt(`Cancel booking ${booking.bookingId} and issue refund of ₹${booking.totalAmount}? Enter cancellation reason:`, 'Customer requested refund');
    if (!reason) return;

    setActionLoading(true);
    try {
      const res = await adminApi.cancelBooking(booking._id, reason);
      if (res.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === booking._id ? { ...b, bookingStatus: 'cancelled', paymentStatus: 'refunded' } : b))
        );
        if (selectedBooking && selectedBooking._id === booking._id) {
          setSelectedBooking((prev) => ({ ...prev, bookingStatus: 'cancelled', paymentStatus: 'refunded' }));
        }
        alert(`Booking ${booking.bookingId} cancelled and refund registered.`);
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel booking.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#222432] tracking-tight flex items-center gap-2">
            <Ticket className="w-6 h-6 text-[#F84464]" />
            <span>Global Bookings &amp; Transactions Ledger</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Audit every ticket transaction, seat allocation, payment status, and physical gate turnstile admission.
          </p>
        </div>

        <span className="font-bold text-[#222432] bg-white px-3.5 py-2 rounded-xl border border-[#EEEEF2] shadow-xs text-xs">
          Total Bookings: {pagination.total}
        </span>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#EEEEF2] p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by booking ID, movie, or customer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#222432] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-gray-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-gray-50 border border-gray-200 text-xs text-[#222432] font-semibold px-3 py-2 rounded-xl focus:bg-white focus:outline-none focus:border-[#F84464] transition"
          >
            <option value="all">All Bookings</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled &amp; Refunded</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white border border-[#EEEEF2] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#222432]">
            <thead className="bg-[#F9F9FB] border-b border-[#EEEEF2] text-gray-400 uppercase text-[10px] font-black tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Booking ID</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Movie Title</th>
                <th className="px-5 py-3.5">Cinema Venue</th>
                <th className="px-5 py-3.5">Seats</th>
                <th className="px-5 py-3.5 text-right">Total (₹)</th>
                <th className="px-5 py-3.5 text-center">Gate Turnstile</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEEEF2] font-medium">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 text-[#F84464] animate-spin mx-auto mb-2" />
                    <span>Loading platform transactions...</span>
                  </td>
                </tr>
              ) : bookings.length > 0 ? (
                bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50/80 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-[#F84464]">
                      {booking.bookingId}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-[#222432]">{booking.user?.name || 'Customer'}</div>
                      <div className="text-[10px] text-gray-400">{booking.user?.email || '—'}</div>
                    </td>
                    <td className="px-5 py-3.5 text-[#222432] font-semibold truncate max-w-xs">
                      {booking.movieTitle}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 truncate max-w-xs">
                      {booking.theatreName}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono bg-gray-100 text-[#222432] px-2 py-0.5 rounded text-[11px]">
                        {Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-black text-[#222432]">
                      ₹{(booking.totalAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {booking.ticketValidated ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#4ABD5D]/10 text-[#4ABD5D] border border-[#4ABD5D]/20">
                          <CheckCircle className="w-3 h-3" /> Admitted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          Pending Gate
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          booking.bookingStatus === 'confirmed'
                            ? 'bg-[#4ABD5D]/10 text-[#4ABD5D] border border-[#4ABD5D]/20'
                            : 'bg-[#F84464]/10 text-[#F84464] border border-[#F84464]/20'
                        }`}
                      >
                        {booking.bookingStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenDetail(booking._id)}
                        className="px-3 py-1 bg-[#F84464]/10 hover:bg-[#F84464] text-[#F84464] hover:text-white rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        Audit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="py-10 text-center text-gray-400">
                    No bookings found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-[#EEEEF2] flex items-center justify-between text-xs text-gray-500 bg-white">
            <span>
              Page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg bg-gray-50 border border-gray-200 disabled:opacity-40 hover:bg-gray-100 text-[#222432] cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg bg-gray-50 border border-gray-200 disabled:opacity-40 hover:bg-gray-100 text-[#222432] cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 360-Degree Booking Audit Drawer */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white border-l border-[#EEEEF2] h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl text-[#222432]">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div>
                  <h3 className="text-base font-black text-[#222432]">Transaction 360° Audit</h3>
                  <p className="text-xs font-mono text-[#F84464]">ID: {selectedBooking.bookingId}</p>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-1.5 text-gray-400 hover:text-[#222432] hover:bg-gray-100 rounded-lg cursor-pointer transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer & Venue Strip */}
              <div className="bg-[#F9F9FB] p-4 rounded-2xl border border-[#EEEEF2] mb-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer:</span>
                  <span className="font-bold text-[#222432]">{selectedBooking.user?.name} ({selectedBooking.user?.email})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Movie Title:</span>
                  <span className="font-bold text-[#222432]">{selectedBooking.movieTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Multiplex Property:</span>
                  <span className="text-gray-700">{selectedBooking.theatreName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Auditorium Screen:</span>
                  <span className="text-[#F84464] font-semibold">{selectedBooking.screenName || 'Audi 1'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Show Date &amp; Time:</span>
                  <span className="font-mono text-[#222432]">{selectedBooking.showDate} • {selectedBooking.showtime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Booked Seats:</span>
                  <span className="font-mono font-bold text-amber-600">
                    {Array.isArray(selectedBooking.seats) ? selectedBooking.seats.join(', ') : selectedBooking.seats}
                  </span>
                </div>
              </div>

              {/* Commercial Breakdown */}
              <div className="bg-[#F9F9FB] p-4 rounded-2xl border border-[#EEEEF2] mb-4 space-y-2 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Base Ticket Price:</span>
                  <span className="font-mono text-[#222432]">₹{selectedBooking.ticketPrice}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Platform Convenience Fee:</span>
                  <span className="font-mono text-[#F84464] font-semibold">₹{selectedBooking.convenienceFee || 45}</span>
                </div>
                {selectedBooking.snacksFee > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>F&amp;B Snacks Addon:</span>
                    <span className="font-mono text-[#222432]">₹{selectedBooking.snacksFee}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200/70 text-sm font-bold text-[#222432]">
                  <span>Gross Charged:</span>
                  <span className="font-mono text-[#4ABD5D] font-black">₹{selectedBooking.totalAmount}</span>
                </div>
              </div>

              {/* Gate Scanner Status */}
              <div className="bg-[#F9F9FB] p-4 rounded-2xl border border-[#EEEEF2] mb-4 text-xs">
                <h4 className="font-bold text-[#222432] mb-2 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-[#F84464]" />
                  <span>Turnstile Gate Admission Status</span>
                </h4>
                {selectedBooking.ticketValidated ? (
                  <div className="text-[#4ABD5D] font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    <span>Admitted through gate turnstile</span>
                  </div>
                ) : (
                  <div className="text-gray-500 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Ticket not yet presented at cinema gate turnstile</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cancel Booking Action */}
            <div className="pt-4 border-t border-gray-100">
              {selectedBooking.bookingStatus === 'confirmed' ? (
                <button
                  onClick={() => handleCancelBooking(selectedBooking)}
                  disabled={actionLoading}
                  className="w-full py-2.5 bg-[#F84464]/10 hover:bg-[#F84464] text-[#F84464] hover:text-white rounded-xl text-xs font-bold transition border border-[#F84464]/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Cancel Booking &amp; Process Full Refund</span>
                </button>
              ) : (
                <div className="text-center text-xs text-[#F84464] font-bold py-2">
                  This transaction is cancelled and marked as refunded.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

