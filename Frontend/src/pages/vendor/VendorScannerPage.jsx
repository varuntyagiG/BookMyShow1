import React, { useState, useEffect } from 'react';
import { vendorApi } from '../../services/vendorApi';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '../../components/ui';
import {
  ScanLine,
  Camera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Ticket,
  MapPin,
  Zap,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion } from 'framer-motion';

// Web Audio API Sound generator for gate chimes
function playGateSound(type = 'success') {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
      osc.frequency.setValueAtTime(146.83, audioCtx.currentTime + 0.15); // D3
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    }
  } catch (_e) {
    // Audio context may be restricted before user gesture
  }
}

export default function VendorScannerPage() {
  const [bookingIdInput, setBookingIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Live test tickets selector
  const [testTickets, setTestTickets] = useState([]);
  const [testTicketsLoading, setTestTicketsLoading] = useState(true);

  // Load recent confirmed tickets to provide 1-click test validation
  const fetchTestTickets = async () => {
    try {
      const res = await vendorApi.getBookings({ limit: 8 });
      if (res.success && res.data) {
        setTestTickets(res.data);
      }
    } catch (_err) {
      console.warn('Could not prefetch test tickets');
    } finally {
      setTestTicketsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestTickets();
  }, []);

  const handleValidate = async (idToValidate) => {
    const targetId = (idToValidate || bookingIdInput || '').trim();
    if (!targetId) return;

    setLoading(true);
    setValidationResult(null);

    try {
      const res = await vendorApi.scanTicket({ bookingId: targetId });
      if (res.success) {
        if (soundEnabled) playGateSound('success');
        const outcome = {
          status: 'SUCCESS',
          code: res.code || 'VERIFIED_SUCCESS',
          message: res.message || 'Ticket verified successfully!',
          booking: res.booking,
          scannedAt: new Date()
        };
        setValidationResult(outcome);
        setRecentScans(prev => [outcome, ...prev.slice(0, 9)]);
        setBookingIdInput('');
        fetchTestTickets(); // Refresh tickets list to update badge
      }
    } catch (err) {
      if (soundEnabled) playGateSound('error');
      const errData = err.data || {};
      const outcome = {
        status: errData.code === 'ALREADY_VALIDATED' ? 'DUPLICATE' : 'DENIED',
        code: errData.code || 'VALIDATION_FAILED',
        message: errData.message || err.message || 'Validation failed',
        booking: errData.booking || null,
        scannedAt: new Date()
      };
      setValidationResult(outcome);
      setRecentScans(prev => [outcome, ...prev.slice(0, 9)]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleValidate(bookingIdInput);
  };

  const handleSelectTestTicket = (ticket) => {
    setBookingIdInput(ticket.bookingId);
    handleValidate(ticket.bookingId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <ScanLine className="text-[#F84464]" size={26} />
            <span>Cinema Gate Ticket Scanner</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time optical QR code & BMS ticket ID verification for cinema gate check-in.
          </p>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
            soundEnabled
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-gray-50 text-gray-500 border-gray-200'
          }`}
          title="Toggle Gate Audio Chime"
        >
          {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          <span>Audio {soundEnabled ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Main Validation Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scanner & Input (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="shadow-none border-slate-200/90 overflow-hidden">
            <CardHeader className="bg-[#222432] text-white py-4 border-b border-slate-800">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-sm text-white flex items-center gap-2.5">
                  <Camera size={18} className="text-[#F84464]" />
                  <span>Optical Gate Scanner Viewfinder</span>
                </CardTitle>
                <span className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-500/15 text-emerald-300 font-mono px-2.5 py-1 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>OPTICAL SENSOR READY</span>
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Interactive Viewfinder Box */}
              <div className="relative w-full aspect-[16/9] bg-[#12131C] rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-slate-800 shadow-inner">
                {/* Targeting Corners */}
                <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-[#F84464] rounded-tl" />
                <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-[#F84464] rounded-tr" />
                <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-[#F84464] rounded-bl" />
                <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-[#F84464] rounded-br" />

                {/* Ambient Grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                {/* Animated Vertical Laser Scanning Beam */}
                <motion.div
                  animate={{ y: [-65, 65, -65] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                  className="absolute inset-x-8 h-0.5 bg-gradient-to-r from-transparent via-[#F84464] to-transparent shadow-[0_0_18px_#F84464] pointer-events-none"
                />

                <div className="text-center z-10 p-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <ScanLine size={32} className="text-[#F84464]" />
                  </div>
                  <p className="text-white text-xs font-bold tracking-wide">
                    Position Customer Ticket QR Within Target Frame
                  </p>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Optical sensor verifies BookMyTrip digital vouchers instantly
                  </p>
                </div>
              </div>

              {/* Manual Ticket ID Form */}
              <form onSubmit={handleFormSubmit} className="mt-5 space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Manual Ticket ID or QR Code String
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      required
                      placeholder="e.g. BMS-778232"
                      value={bookingIdInput}
                      onChange={(e) => setBookingIdInput(e.target.value.toUpperCase())}
                      className="w-full text-sm font-mono tracking-wider font-bold py-2.5 px-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#F84464] focus:border-[#F84464] uppercase placeholder:normal-case shadow-2xs"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={loading}
                    className="px-6 font-bold text-xs shrink-0 rounded-xl"
                  >
                    Validate Ticket
                  </Button>
                </div>
              </form>

              {/* Quick 1-Click Test Selector from Live Database Bookings */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-500" />
                    <span>Quick 1-Click Gate Verification (Live DB Bookings)</span>
                  </p>
                  <span className="text-[11px] text-slate-400 font-medium">Test validation</span>
                </div>

                {testTicketsLoading ? (
                  <p className="text-xs text-slate-400">Loading active reservations...</p>
                ) : testTickets.length === 0 ? (
                  <p className="text-xs text-slate-400">No active bookings found to test.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {testTickets.map((t) => (
                      <button
                        key={t.bookingId}
                        type="button"
                        onClick={() => handleSelectTestTicket(t)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition flex flex-col justify-between group shadow-2xs ${
                          t.ticketValidated
                            ? 'bg-emerald-50/70 border-emerald-200/80 hover:bg-emerald-100'
                            : 'bg-white border-slate-200/80 hover:border-[#F84464] hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-mono font-bold text-[11px] text-slate-900 group-hover:text-[#F84464] transition-colors">
                            {t.bookingId}
                          </span>
                          {t.ticketValidated ? (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Already Checked In" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Pending Check-in" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1.5 line-clamp-1 font-medium">
                          {t.movieTitle}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Gate Validation Outcome Display (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {validationResult ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className={`rounded-2xl border p-5 shadow-lg transition-all duration-300 relative overflow-hidden ${
                validationResult.status === 'SUCCESS'
                  ? 'bg-gradient-to-b from-emerald-50/90 to-white border-emerald-300 text-emerald-950 shadow-emerald-500/10'
                  : validationResult.status === 'DUPLICATE'
                  ? 'bg-gradient-to-b from-amber-50/90 to-white border-amber-300 text-amber-950 shadow-amber-500/10'
                  : 'bg-gradient-to-b from-rose-50/90 to-white border-rose-300 text-rose-950 shadow-rose-500/10'
              }`}
            >
              {/* Top Accent Strip */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 ${
                  validationResult.status === 'SUCCESS'
                    ? 'bg-emerald-500'
                    : validationResult.status === 'DUPLICATE'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              />

              {/* Status Header */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-200/80">
                {validationResult.status === 'SUCCESS' ? (
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <CheckCircle2 size={26} />
                  </div>
                ) : validationResult.status === 'DUPLICATE' ? (
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                    <AlertTriangle size={26} />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <XCircle size={26} />
                  </div>
                )}

                <div>
                  <h3 className="font-black text-lg uppercase tracking-wider leading-tight">
                    {validationResult.status === 'SUCCESS'
                      ? 'ACCESS GRANTED'
                      : validationResult.status === 'DUPLICATE'
                      ? 'DUPLICATE SCAN'
                      : 'ENTRY DENIED'}
                  </h3>
                  <p className="text-xs font-medium text-slate-600 mt-0.5">
                    {validationResult.message}
                  </p>
                </div>
              </div>

              {/* Ticket Boarding Pass Card */}
              {validationResult.booking ? (
                <div className="mt-4 space-y-3 text-xs">
                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="font-mono font-black text-sm text-slate-900 tracking-wider">
                        {validationResult.booking.bookingId}
                      </span>
                      <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {validationResult.booking.seatsCount || validationResult.booking.seats?.length} Guest(s)
                      </span>
                    </div>

                    <p className="font-bold text-sm text-slate-900">
                      {validationResult.booking.movieTitle}
                    </p>

                    <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                      <MapPin size={12} className="text-[#F84464] shrink-0" />
                      <span>{validationResult.booking.theatreName}</span>
                      <span>•</span>
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {validationResult.booking.screenName || 'Screen 1'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-600 font-mono">
                      <Clock size={12} className="text-slate-400" />
                      <span>{validationResult.booking.showDate}</span>
                      <span>•</span>
                      <span className="font-bold text-slate-900">{validationResult.booking.showtime}</span>
                    </div>

                    {/* Assigned Seats Matrix */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-slate-500 font-medium text-[11px]">Assigned Seats:</span>
                      <div className="flex flex-wrap gap-1">
                        {(validationResult.booking.seats || []).map((s) => (
                          <span
                            key={s}
                            className="bg-[#222432] text-white font-mono font-bold text-xs px-2 py-0.5 rounded-md shadow-2xs"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Customer:</span>
                      <span className="font-bold text-slate-900">
                        {validationResult.booking.customerName || 'Admitted Guest'}
                        {validationResult.booking.customerPhone ? ` (${validationResult.booking.customerPhone})` : ''}
                      </span>
                    </div>

                    {validationResult.status === 'DUPLICATE' && validationResult.booking.validatedAt && (
                      <div className="p-2.5 rounded-xl bg-amber-100/70 border border-amber-300 text-[11px] text-amber-900 font-medium">
                        ⚠️ First admission was processed at:{' '}
                        <strong>{new Date(validationResult.booking.validatedAt).toLocaleTimeString()}</strong>. Do not admit a second guest on this pass.
                      </div>
                    )}
                  </div>

                  {/* Ready for next scan prompt */}
                  <div className="mt-4 pt-3 border-t border-black/10 flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setValidationResult(null)}
                      className="text-xs font-semibold bg-white"
                    >
                      Clear & Ready Next Scan
                    </Button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          ) : (
            /* Standby Card */
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center bg-white shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#F84464] flex items-center justify-center mx-auto mb-3">
                <Ticket size={24} />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Gate Validation Standby</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Scan customer QR code or click any test reservation from the left pane to view admittance details.
              </p>
            </div>
          )}

          {/* Session Scan Log */}
          {recentScans.length > 0 && (
            <Card className="shadow-none border-slate-200/90 overflow-hidden">
              <CardHeader className="py-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                  Recent Session Admissions ({recentScans.length})
                </CardTitle>
              </CardHeader>
              <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                {recentScans.map((scan, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/60 transition-colors">
                    <div>
                      <span className="font-mono font-bold text-slate-900">
                        {scan.booking?.bookingId || 'Ticket'}
                      </span>
                      <p className="text-[11px] text-slate-500">
                        {scan.booking?.movieTitle || 'Movie'} • {(scan.booking?.seats || []).join(', ')}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          scan.status === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : scan.status === 'DUPLICATE'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {scan.status}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {scan.scannedAt.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
