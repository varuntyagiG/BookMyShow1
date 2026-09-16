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
  X,
  Navigation,
  Sun,
  ExternalLink
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
  const [isScannerBright, setIsScannerBright] = useState(false);

  const handleCalendar = (booking) => {
    const title = `${booking.movieTitle || 'Movie'} - BookMyShow Ticket`;
    const details = `Booking ID: ${booking.bookingId || 'BMS'}\nTheatre: ${booking.theatreName || 'Multiplex'}\nShowtime: ${booking.showtime || '10:00 AM'}\nDate: ${booking.showDate || 'Today'}\nSeats: ${(Array.isArray(booking.seats) ? booking.seats : []).join(', ')}`;
    const locationStr = booking.theatreName || 'Cinema';
    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(locationStr)}`;
    window.open(calUrl, '_blank');
  };

  const handleDirections = (theatreName) => {
    const query = theatreName || 'Cinema';
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(mapsUrl, '_blank');
  };

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-[420px] bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 my-4">
            {/* Top Accent Gradient Strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#F84464] via-rose-500 to-amber-400" />

            {/* Modal Header Strip */}
            <div className="bg-gradient-to-br from-[#222432] via-[#2b2e40] to-[#1a1c27] text-white p-5 relative overflow-hidden">
              <div className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 bg-[#F84464]/25 rounded-full blur-2xl" />
              <div className="flex items-start justify-between relative z-10 gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  {(activeTicketModal.movie?.posterUrl || activeTicketModal.posterUrl) && (
                    <img
                      src={activeTicketModal.movie?.posterUrl || activeTicketModal.posterUrl}
                      alt={activeTicketModal.movieTitle || 'Movie'}
                      className="w-11 h-15 object-cover rounded-xl shadow-md border border-white/20 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F84464]/20 border border-[#F84464]/40 text-[#F84464] text-[9px] font-black uppercase tracking-widest">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Official M-Pass</span>
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          activeTicketModal.status === 'cancelled'
                            ? 'bg-gray-700 text-gray-300'
                            : activeTicketModal.ticketValidated
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {activeTicketModal.status === 'cancelled' ? (
                          <span>Void / Cancelled</span>
                        ) : activeTicketModal.ticketValidated ? (
                          <span>Checked In</span>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Confirmed</span>
                          </>
                        )}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white leading-tight truncate">
                      {activeTicketModal.movieTitle || activeTicketModal.movie?.title || 'Movie Experience'}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-300 mt-1 font-medium">
                      <MapPin className="w-3 h-3 text-[#F84464] shrink-0" />
                      <span className="truncate">
                        {activeTicketModal.theatreName || activeTicketModal.cinema?.name || 'Cinema Multiplex'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTicketModal(null)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer shrink-0"
                  title="Close Pass"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Ticket Perforation Notch (Top) */}
            <div className="relative flex items-center justify-between w-full h-4 bg-white overflow-hidden -my-2 z-10">
              <div className="w-4 h-4 rounded-full bg-black/80 -ml-2 border-r border-slate-200 shadow-inner shrink-0" />
              <div className="w-full border-t-2 border-dashed border-slate-200 mx-2" />
              <div className="w-4 h-4 rounded-full bg-black/80 -mr-2 border-l border-slate-200 shadow-inner shrink-0" />
            </div>

            {/* Ticket Body */}
            <div className="p-4 sm:p-5 bg-white">
              {/* QR Code Validation Box */}
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center mb-3.5 relative">
                <div
                  className={`w-28 h-28 bg-white rounded-xl shadow-inner border border-slate-200 p-2 mx-auto flex items-center justify-center mb-2 transition-transform duration-200 ${
                    isScannerBright ? 'scale-105 ring-4 ring-amber-300 shadow-xl' : ''
                  }`}
                >
                  <QrCode className="w-24 h-24 text-slate-900" />
                </div>
                <div className="font-mono text-xs font-black text-slate-800 tracking-widest">
                  {activeTicketModal.bookingId || `BMT-${(activeTicketModal._id || '').slice(-6).toUpperCase()}`}
                </div>
                <p className="text-[10px] font-mono tracking-widest text-slate-400 mt-0.5">
                  |||| | || ||| |||| |
                </p>
                <div className="mt-1.5">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
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
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>READY FOR SCANNER TURNSTILE</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Show Details Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3.5">
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Cinema &amp; Audi</span>
                  <span className="font-bold text-slate-900 text-xs block truncate">
                    {activeTicketModal.theatreName || activeTicketModal.cinema?.name || 'Cinema Multiplex'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {activeTicketModal.screen?.name || (activeTicketModal.screen?.screenNumber ? `Audi ${activeTicketModal.screen.screenNumber}` : 'Audi 2 • Gate 3')}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Date &amp; Showtime</span>
                  <span className="font-bold text-slate-900 text-xs block">
                    {activeTicketModal.showDate || (activeTicketModal.createdAt ? new Date(activeTicketModal.createdAt).toLocaleDateString('en-GB') : 'Today')}
                  </span>
                  <span className="text-[10px] text-[#F84464] font-bold">
                    {activeTicketModal.showtime || '10:00 AM'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">
                    Reserved Seats ({Array.isArray(activeTicketModal.seats) ? activeTicketModal.seats.length : 1})
                  </span>
                  <span className="font-mono font-black text-[#F84464] text-xs sm:text-sm">
                    {Array.isArray(activeTicketModal.seats) ? activeTicketModal.seats.join(', ') : (activeTicketModal.seats || 'Assigned')}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Total Paid</span>
                  <span className="font-black text-slate-900 text-xs sm:text-sm">
                    ₹{Number(activeTicketModal.totalPrice || activeTicketModal.amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Snack Voucher Pill if included */}
              {activeTicketModal.includeSnacks && (
                <div className="mb-3.5 p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-xs shadow-xs">
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-amber-200/60">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🍿</span>
                      <div>
                        <span className="text-xs font-black text-amber-950 block">
                          Cinema Concessions Voucher
                        </span>
                        <span className="text-[10px] text-amber-800 font-semibold">
                          {activeTicketModal.deliveryPreference === 'counter_pickup'
                            ? '⚡ Express Counter: Refreshment Counter #3'
                            : `🛋️ In-Seat Delivery: ${activeTicketModal.theatreName || 'Screen 1'} • Seats ${(Array.isArray(activeTicketModal.seats) ? activeTicketModal.seats : []).join(', ')}`}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-black text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded-md">
                      PAID ₹{activeTicketModal.snacksFee || 0}
                    </span>
                  </div>

                  {/* Itemized Snacks List */}
                  {Array.isArray(activeTicketModal.snacksList) && activeTicketModal.snacksList.length > 0 ? (
                    <div className="space-y-1 mb-2">
                      {activeTicketModal.snacksList.map((snack, sIdx) => (
                        <div key={sIdx} className="flex items-center justify-between text-[11px] text-amber-900">
                          <span>{snack.emoji || '🍿'} {snack.name} <span className="font-bold text-amber-950">× {snack.quantity || 1}</span></span>
                          <span className="font-semibold">₹{(snack.price || 0) * (snack.quantity || 1)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-amber-700 font-medium mb-1.5">
                      Standard Multiplex Snack Combo
                    </p>
                  )}

                  <div className="pt-1.5 border-t border-amber-200/60 flex items-center justify-between text-[9px] text-amber-800 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        activeTicketModal.fnbStatus === 'delivered' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                      }`} />
                      Kitchen Status: {activeTicketModal.fnbStatus === 'delivered' ? 'Delivered to Seat ✓' : 'Preparing at Kitchen ⏳'}
                    </span>
                    <span>Intermission Delivery</span>
                  </div>
                </div>
              )}

              {/* Post-Booking Ticket Utilities Ribbon */}
              <div className="grid grid-cols-3 gap-1.5 mb-3.5">
                <button
                  type="button"
                  onClick={() => handleCalendar(activeTicketModal)}
                  className="py-2 px-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Add to Google Calendar"
                >
                  <Calendar className="w-3 h-3 text-[#F84464]" />
                  <span>Calendar</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirections(activeTicketModal.theatreName || activeTicketModal.cinema?.name)}
                  className="py-2 px-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Open Maps Directions"
                >
                  <Navigation className="w-3 h-3 text-cyan-600" />
                  <span>Directions</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const msg = `🎟️ My BookMyShow Ticket: ${activeTicketModal.movieTitle || activeTicketModal.movie?.title || 'Movie'} at ${activeTicketModal.theatreName || activeTicketModal.cinema?.name || 'Multiplex'}, ${activeTicketModal.showDate || 'Today'} ${activeTicketModal.showtime || '10:00 AM'}. Seats: ${(Array.isArray(activeTicketModal.seats) ? activeTicketModal.seats : []).join(', ')}. Booking ID: ${activeTicketModal.bookingId || activeTicketModal._id}`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  className="py-2 px-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Share on WhatsApp"
                >
                  <span>WhatsApp</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsScannerBright(!isScannerBright)}
                  className={`py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border shrink-0 ${
                    isScannerBright
                      ? 'bg-amber-400 text-black border-amber-300 font-black shadow-md'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                  title="Maximize screen brightness for optical scanner turnstile"
                >
                  <Sun className={`w-3.5 h-3.5 ${isScannerBright ? 'text-black fill-black' : 'text-amber-500'}`} />
                  <span className="hidden sm:inline">{isScannerBright ? 'Bright' : 'Glow'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTicketModal(null)}
                  className="flex-1 py-3 bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-black rounded-xl transition-all shadow-sm shadow-red-500/25 cursor-pointer"
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
