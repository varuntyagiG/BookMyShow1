import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookingApi } from '../services/api';
import { useRealtimeRefresh } from '../services/realtimeSync';
import { useAuth } from '../context/AuthContext';
import { TicketPassCard } from '../components/ui';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
  Loader2,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  X
} from 'lucide-react';

export default function CustomerBookingsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, openAuthModal } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTicketModal, setActiveTicketModal] = useState(null);
  const [cancelModal, setCancelModal] = useState({ isOpen: false, booking: null, loading: false, error: '' });
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetchBookings();
  }, [isAuthenticated]);

  // Real-time reactive sync across tabs & portals
  useRealtimeRefresh(['BOOKING_MUTATION'], () => {
    if (isAuthenticated) {
      fetchBookings();
    }
  });

  async function fetchBookings() {
    try {
      setLoading(true);
      setError('');
      const res = await bookingApi.getMyBookings();
      if (res.success && Array.isArray(res.bookings)) {
        setBookings(res.bookings);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error('Failed to load user bookings:', err);
      setError('Unable to load your bookings. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  }

  const handleCancelBooking = async () => {
    if (!cancelModal.booking) return;
    setCancelModal((prev) => ({ ...prev, loading: true, error: '' }));

    try {
      const res = await bookingApi.cancelBooking(cancelModal.booking._id);
      if (res.success) {
        // Update local state
        setBookings((prev) =>
          prev.map((b) =>
            b._id === cancelModal.booking._id ? { ...b, status: 'cancelled' } : b
          )
        );
        setCancelModal({ isOpen: false, booking: null, loading: false, error: '' });
        if (activeTicketModal?._id === cancelModal.booking._id) {
          setActiveTicketModal((prev) => ({ ...prev, status: 'cancelled' }));
        }
      } else {
        setCancelModal((prev) => ({ ...prev, loading: false, error: res.message || 'Failed to cancel booking.' }));
      }
    } catch (err) {
      setCancelModal((prev) => ({
        ...prev,
        loading: false,
        error: err.message || 'Unable to cancel booking. Please try again later.'
      }));
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'all') return true;
    return b.status === filterStatus;
  });

  if (!isAuthenticated) {
    return (
      <div className="bg-[#F5F5FA] min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-red-50 text-[#F84464] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">View Your Bookings</h2>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            Please sign in to access your digital tickets, manage your reservations, and view pass receipts.
          </p>
          <button
            onClick={() => openAuthModal('signin')}
            className="w-full py-3 bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-500/20 cursor-pointer"
          >
            Sign In to My Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F5FA] min-h-screen pb-16 text-[#222432]">
      {/* Header Banner */}
      <div className="bg-[#222432] text-white py-8 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F84464]/20 border border-[#F84464]/30 text-[#F84464] text-[10px] font-bold uppercase tracking-wider mb-2">
                <Ticket className="w-3 h-3" />
                <span>Ticket Ledger &amp; M-Pass</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight my-0">
                My Bookings &amp; Tickets
              </h1>
              <p className="text-xs text-gray-300 mt-1">
                Manage your confirmed cinema tickets, view QR entrance passes, and track refunds.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchBookings}
                disabled={loading}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <Link
                to="/movies"
                className="px-4 py-2 bg-[#F84464] hover:bg-[#E03A58] text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-red-500/25 flex items-center gap-1.5"
              >
                <span>Book Another Show</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: `All (${bookings.length})` },
              { id: 'confirmed', label: `Active (${bookings.filter((b) => b.status === 'confirmed').length})` },
              { id: 'cancelled', label: `Cancelled (${bookings.filter((b) => b.status === 'cancelled').length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-[#F84464] text-white shadow-sm'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-9 h-9 text-[#F84464] animate-spin mb-3" />
            <p className="text-xs text-gray-500 font-medium">Fetching your live bookings from database...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-lg mx-auto my-8">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-red-800">{error}</p>
            <button
              onClick={fetchBookings}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredBookings.map((b) => (
              <TicketPassCard
                key={b._id}
                booking={b}
                onViewTicket={(booking) => setActiveTicketModal(booking)}
                onCancel={(booking) => setCancelModal({ isOpen: true, booking, loading: false, error: '' })}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-xs max-w-md mx-auto my-12">
            <div className="w-14 h-14 bg-red-50 text-[#F84464] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Ticket className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-gray-900 mb-1">No Bookings Found</h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              You haven't reserved any showtimes or passes yet. Discover the latest blockbuster movies and events near you!
            </p>
            <Link
              to="/movies"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/25 transition-all"
            >
              <span>Explore Movies</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Digital M-Ticket Full Modal */}
      {activeTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
            {/* Modal Header Strip */}
            <div className="bg-gradient-to-br from-[#222432] via-[#2d3043] to-[#1e202c] text-white p-6 relative overflow-hidden">
              <div className="pointer-events-none absolute -top-12 -right-12 w-36 h-36 bg-[#F84464]/30 rounded-full blur-2xl" />
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F84464]/20 border border-[#F84464]/40 text-[#F84464] text-[9px] font-black uppercase tracking-widest mb-1.5">
                    <Sparkles className="w-3 h-3" />
                    <span>Official M-Pass</span>
                  </div>
                  <h3 className="text-xl font-black text-white leading-tight">
                    {activeTicketModal.movieTitle || 'Movie Ticket'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-300 mt-1">
                    <MapPin className="w-3 h-3 text-[#F84464] shrink-0" />
                    <span className="truncate">{activeTicketModal.theatreName || 'Cinema Hall'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTicketModal(null)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer shrink-0"
                  title="Close Pass"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Ticket Perforation Notch (Top) */}
            <div className="relative flex items-center justify-between w-full h-4 bg-white overflow-hidden -my-2 z-10">
              <div className="w-4 h-4 rounded-full bg-black/80 -ml-2 border-r border-slate-200 shadow-inner" />
              <div className="w-full border-t-2 border-dashed border-slate-200 mx-2" />
              <div className="w-4 h-4 rounded-full bg-black/80 -mr-2 border-l border-slate-200 shadow-inner" />
            </div>

            {/* Ticket Body */}
            <div className="p-6 bg-white">
              {/* QR Code Validation Box */}
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center mb-5 relative group">
                <div className="w-36 h-36 bg-white rounded-2xl shadow-inner border border-slate-200 p-2.5 mx-auto flex items-center justify-center mb-3">
                  <QrCode className="w-32 h-32 text-slate-900" />
                </div>
                <div className="font-mono text-xs font-black text-slate-800 tracking-widest">
                  {activeTicketModal.bookingId || `BMT-${(activeTicketModal._id || '').slice(-6).toUpperCase()}`}
                </div>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full ${
                      activeTicketModal.status === 'cancelled'
                        ? 'bg-gray-200 text-gray-700'
                        : activeTicketModal.ticketValidated
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {activeTicketModal.status === 'cancelled' ? (
                      <>
                        <AlertCircle className="w-3 h-3 text-gray-500" />
                        <span>VOID / CANCELLED</span>
                      </>
                    ) : activeTicketModal.ticketValidated ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>✓ ADMITTED AT TURNSTILE GATE</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>READY FOR SCANNER TURNSTILE</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Show Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-5">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Show Date</span>
                  <span className="font-bold text-slate-900">
                    {activeTicketModal.showDate || (activeTicketModal.createdAt ? new Date(activeTicketModal.createdAt).toLocaleDateString('en-GB') : 'Today')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Showtime</span>
                  <span className="font-bold text-slate-900">
                    {activeTicketModal.showtime || '10:00 AM'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Reserved Seats</span>
                  <span className="font-black text-[#F84464] font-mono">
                    {Array.isArray(activeTicketModal.seats) ? activeTicketModal.seats.join(', ') : 'Assigned'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Paid</span>
                  <span className="font-black text-slate-900">
                    ₹{Number(activeTicketModal.totalPrice || activeTicketModal.amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Ticket</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTicketModal(null)}
                  className="flex-1 py-3 bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-red-500/25 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Cancellation Modal */}
      {cancelModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-gray-900 text-center mb-1">
              Cancel This Booking?
            </h3>
            <p className="text-xs text-gray-500 text-center mb-4 leading-relaxed">
              Are you sure you want to cancel booking for{' '}
              <strong>{cancelModal.booking?.movieTitle}</strong>? The reserved seats will be released immediately and a full refund of{' '}
              <strong className="text-emerald-600">₹{cancelModal.booking?.totalPrice || cancelModal.booking?.amount}</strong> will be initiated.
            </p>

            {cancelModal.error && (
              <div className="mb-3 p-2 bg-red-50 text-red-600 rounded-lg text-xs font-semibold text-center">
                {cancelModal.error}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCancelModal({ isOpen: false, booking: null, loading: false, error: '' })}
                disabled={cancelModal.loading}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelModal.loading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {cancelModal.loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Yes, Cancel</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
