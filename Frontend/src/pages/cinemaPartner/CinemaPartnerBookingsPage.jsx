import React, { useState, useEffect } from 'react';
import { cinemaPartnerApi } from '../../services/cinemaPartnerApi';
import { useCinemaToast } from '../../components/cinemaPartner/CinemaPartnerToastContext';
import {
  Ticket,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  X,
  User,
  Phone,
  Mail,
  Building2,
  Tv,
  Film,
  Loader2,
  QrCode
} from 'lucide-react';

export default function CinemaPartnerBookingsPage() {
  const toast = useCinemaToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await cinemaPartnerApi.getBookings({
        search,
        status: statusFilter,
        date: dateFilter,
        limit: 100
      });
      if (res.success && res.bookings) {
        setBookings(res.bookings);
      }
    } catch (err) {
      toast.error('Load Error', err.message || 'Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, dateFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mb-3" />
        <p className="text-xs text-gray-500 font-medium">Loading Cinema Bookings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-[#222432] tracking-tight flex items-center gap-2.5">
            <Ticket className="w-6 h-6 text-[#F84464]" />
            <span>Cinema Admissions &amp; Bookings</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time customer admissions and ticket reservations across your cinemas
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, movie..."
              className="pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-[#222432] placeholder-gray-400 focus:outline-none focus:border-[#F84464] w-44 sm:w-56 shadow-xs"
            />
          </form>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-[#222432] focus:outline-none focus:border-[#F84464] shadow-xs"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      {bookings.length === 0 ? (
        <div className="bg-white border border-[#EEEEF2] rounded-2xl p-12 text-center text-gray-500 text-xs shadow-sm">
          No customer bookings found matching the selected filter.
        </div>
      ) : (
        <div className="bg-white border border-[#EEEEF2] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#222432]">
              <thead className="bg-gray-50/80 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3.5">Booking ID</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Movie &amp; Show</th>
                  <th className="px-5 py-3.5">Seats</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                  <th className="px-5 py-3.5 text-center">Gate Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((b) => {
                  const customerName = b.user?.name || 'Customer';
                  const isValidated = b.ticketValidated;

                  return (
                    <tr key={b._id} className="hover:bg-gray-50/50 transition">
                      <td className="px-5 py-3.5 font-bold text-[#F84464] whitespace-nowrap">
                        {b.bookingId}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-semibold text-[#222432]">{customerName}</div>
                        <div className="text-[10px] text-gray-500">{b.user?.email || b.user?.phone || 'Guest'}</div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-bold text-[#222432] line-clamp-1">{b.movieTitle}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          {b.theatreName} • {b.showtime} ({b.showDate})
                        </div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-bold text-[#222432] bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                          {b.seats?.join(', ')}
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">({b.seatsCount || b.seats?.length} seats)</span>
                      </td>

                      <td className="px-5 py-3.5 text-right font-bold text-[#4ABD5D] whitespace-nowrap">
                        ₹{b.totalAmount}
                      </td>

                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        {isValidated ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#4ABD5D]/10 text-[#4ABD5D] border border-[#4ABD5D]/20">
                            ✓ Checked In
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Pending
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition cursor-pointer"
                          title="View Digital Ticket"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Digital M-Ticket Inspection Modal matching Customer Panel */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md my-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#333545] px-6 py-4 flex items-center justify-between text-white">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-[#F84464]" />
                  <span>Digital Ticket Audit</span>
                </h3>
                <p className="text-[10px] text-gray-300 font-mono mt-0.5">{selectedBooking.bookingId}</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Movie Info Card */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <div className="text-sm font-bold text-[#222432]">{selectedBooking.movieTitle}</div>
                <div className="text-xs text-gray-600">
                  {selectedBooking.theatreName} • {selectedBooking.screenName || 'Screen 1'}
                </div>
                <div className="text-xs text-[#F84464] font-bold pt-1">
                  {selectedBooking.showDate} at {selectedBooking.showtime}
                </div>
              </div>

              {/* Customer Contact */}
              <div className="text-xs space-y-2 pt-1 border-b border-gray-100 pb-3">
                <div className="flex items-center justify-between text-gray-500">
                  <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-gray-400" /> Customer</span>
                  <span className="font-bold text-[#222432]">{selectedBooking.user?.name || 'Customer'}</span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" /> Email</span>
                  <span className="text-[#222432]">{selectedBooking.user?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> Phone</span>
                  <span className="text-[#222432]">{selectedBooking.user?.phone || 'N/A'}</span>
                </div>
              </div>

              {/* Seats & Financial Breakdown */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Assigned Seats</span>
                  <span className="font-bold text-[#F84464] bg-[#F84464]/10 px-2 py-0.5 rounded">
                    {selectedBooking.seats?.join(', ')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Base Tickets</span>
                  <span className="font-semibold text-[#222432]">₹{selectedBooking.ticketPrice}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Convenience Fee</span>
                  <span className="text-[#222432]">₹{selectedBooking.convenienceFee || 0}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200 font-bold">
                  <span className="text-[#222432]">Total Paid</span>
                  <span className="text-[#4ABD5D] text-base">₹{selectedBooking.totalAmount}</span>
                </div>
              </div>

              {/* Validation Audit */}
              <div className="text-xs pt-1">
                <div className="text-[10px] uppercase font-bold text-gray-400 mb-1.5">Gate Verification Status</div>
                {selectedBooking.ticketValidated ? (
                  <div className="p-3 rounded-xl bg-[#4ABD5D]/10 border border-[#4ABD5D]/30 text-[#4ABD5D] text-xs flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Checked In at Gate
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {selectedBooking.validatedAt ? new Date(selectedBooking.validatedAt).toLocaleTimeString() : ''}
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Pending Gate Check-In
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
