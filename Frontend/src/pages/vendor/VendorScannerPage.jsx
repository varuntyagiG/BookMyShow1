import React, { useState, useEffect, useRef } from 'react';
import { vendorApi } from '../../services/vendorApi';
import {
  PageHeader,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Input,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell
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
  Film,
  Search,
  Zap,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';

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
          <Card className="shadow-sm border-gray-200 overflow-hidden">
            <CardHeader className="bg-[#333545] text-white py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Camera size={18} className="text-[#F84464]" />
                  <span>Optical Gate Scanner Viewfinder</span>
                </CardTitle>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                  CAMERA SENSOR READY
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Interactive Viewfinder Box */}
              <div className="relative w-full aspect-[16/9] bg-[#1a1b26] rounded-xl overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-gray-700">
                {/* Targeting Corners */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#F84464]" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#F84464]" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#F84464]" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#F84464]" />

                {/* Animated Laser Scanning Line */}
                <div className="absolute inset-x-8 top-1/2 h-0.5 bg-[#F84464] shadow-[0_0_12px_#F84464] animate-pulse" />

                <div className="text-center z-10 p-4">
                  <ScanLine size={44} className="text-[#F84464] mx-auto mb-2 opacity-80" />
                  <p className="text-white text-xs font-semibold">
                    Position Customer Ticket QR Within Target Frame
                  </p>
                  <p className="text-gray-400 text-[11px] mt-1">
                    Or enter/select Booking ID below for instant gate verification
                  </p>
                </div>
              </div>

              {/* Manual Ticket ID Form */}
              <form onSubmit={handleFormSubmit} className="mt-5 space-y-3">
                <label className="block text-xs font-semibold text-gray-700">
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
                      className="w-full text-sm font-mono tracking-wider font-bold py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F84464] focus:border-[#F84464] uppercase placeholder:normal-case"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={loading}
                    className="px-6 font-bold text-xs shrink-0"
                  >
                    Validate Ticket
                  </Button>
                </div>
              </form>

              {/* Quick 1-Click Test Selector from Live Database Bookings */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-500" />
                    <span>Quick 1-Click Gate Verification (Live DB Bookings)</span>
                  </p>
                  <span className="text-[11px] text-gray-400">Click any ticket below</span>
                </div>

                {testTicketsLoading ? (
                  <p className="text-xs text-gray-400">Loading active reservations...</p>
                ) : testTickets.length === 0 ? (
                  <p className="text-xs text-gray-400">No active bookings found to test.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {testTickets.map((t) => (
                      <button
                        key={t.bookingId}
                        type="button"
                        onClick={() => handleSelectTestTicket(t)}
                        className={`p-2 rounded-lg border text-left text-xs transition flex flex-col justify-between ${
                          t.ticketValidated
                            ? 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-50 border-gray-200 hover:border-[#F84464] hover:bg-rose-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-mono font-bold text-[11px] text-gray-900">
                            {t.bookingId}
                          </span>
                          {t.ticketValidated ? (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Already Checked In" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-amber-400" title="Pending Check-in" />
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">
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
            <div
              className={`rounded-xl border p-5 shadow-lg transition-all duration-300 ${
                validationResult.status === 'SUCCESS'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : validationResult.status === 'DUPLICATE'
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}
            >
              {/* Status Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-black/10">
                {validationResult.status === 'SUCCESS' ? (
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow">
                    <CheckCircle2 size={28} />
                  </div>
                ) : validationResult.status === 'DUPLICATE' ? (
                  <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow">
                    <AlertTriangle size={28} />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow">
                    <XCircle size={28} />
                  </div>
                )}

                <div>
                  <h3 className="font-black text-lg uppercase tracking-wide leading-tight">
                    {validationResult.status === 'SUCCESS'
                      ? 'ACCESS GRANTED'
                      : validationResult.status === 'DUPLICATE'
                      ? 'DUPLICATE SCAN'
                      : 'ENTRY DENIED'}
                  </h3>
                  <p className="text-xs font-medium opacity-90 mt-0.5">
                    {validationResult.message}
                  </p>
                </div>
              </div>

              {/* Ticket Details */}
              {validationResult.booking ? (
                <div className="mt-4 space-y-3 text-xs">
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-black/5 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-gray-900">
                        {validationResult.booking.bookingId}
                      </span>
                      <span className="bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {validationResult.booking.seatsCount || validationResult.booking.seats?.length} Guest(s)
                      </span>
                    </div>

                    <p className="font-bold text-sm text-gray-900">
                      {validationResult.booking.movieTitle}
                    </p>

                    <div className="flex items-center gap-1.5 text-gray-600 text-[11px]">
                      <MapPin size={12} className="text-[#F84464]" />
                      <span>{validationResult.booking.theatreName}</span>
                      <span>•</span>
                      <span className="font-semibold text-indigo-700">
                        {validationResult.booking.screenName || 'Screen 1'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-gray-600">
                      <Clock size={12} />
                      <span>{validationResult.booking.showDate}</span>
                      <span>•</span>
                      <span className="font-semibold">{validationResult.booking.showtime}</span>
                    </div>

                    {/* Seats Matrix */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Assigned Seats:</span>
                      <div className="flex flex-wrap gap-1">
                        {(validationResult.booking.seats || []).map((s) => (
                          <span
                            key={s}
                            className="bg-[#333545] text-white font-mono font-bold text-xs px-2 py-0.5 rounded shadow-sm"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                      <span className="text-gray-500">Customer:</span>
                      <span className="font-semibold text-gray-900">
                        {validationResult.booking.customerName}
                        {validationResult.booking.customerPhone ? ` (${validationResult.booking.customerPhone})` : ''}
                      </span>
                    </div>
                  </div>

                  {validationResult.status === 'DUPLICATE' && validationResult.booking.validatedAt && (
                    <div className="p-2.5 rounded-lg bg-amber-100/70 border border-amber-300 text-[11px] text-amber-900">
                      ⚠️ First admission was processed at:{' '}
                      <strong>{new Date(validationResult.booking.validatedAt).toLocaleTimeString()}</strong>. Do not admit a second guest on this pass.
                    </div>
                  )}
                </div>
              ) : null}

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
          ) : (
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Gate Validation Standby</CardTitle>
                <CardDescription>
                  Awaiting ticket scan. Results and seat allotments will appear here instantly.
                </CardDescription>
              </CardHeader>
              <CardContent className="py-12 text-center text-gray-400 text-xs">
                <Ticket size={36} className="mx-auto mb-2 opacity-30" />
                <span>No scan activity yet. Ready for cinema admissions.</span>
              </CardContent>
            </Card>
          )}

          {/* Session Scan Log */}
          {recentScans.length > 0 && (
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="py-3 border-b border-gray-100">
                <CardTitle className="text-xs uppercase tracking-wider text-gray-500">
                  Recent Session Admissions ({recentScans.length})
                </CardTitle>
              </CardHeader>
              <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto">
                {recentScans.map((scan, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-gray-900">
                        {scan.booking?.bookingId || 'Ticket'}
                      </span>
                      <p className="text-[11px] text-gray-500">
                        {scan.booking?.movieTitle || 'Movie'} • {(scan.booking?.seats || []).join(', ')}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          scan.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : scan.status === 'DUPLICATE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {scan.status}
                      </span>
                      <p className="text-[10px] text-gray-400 mt-0.5">
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
