import React, { useState } from 'react';
import { cinemaPartnerApi } from '../../services/cinemaPartnerApi';
import { useCinemaToast } from '../../components/cinemaPartner/CinemaPartnerToastContext';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Loader2,
  Film,
  Building2,
  Tv,
  Clock,
  User,
  History,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';

export default function CinemaPartnerScannerPage() {
  const toast = useCinemaToast();
  const [bookingIdInput, setBookingIdInput] = useState('');
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);

  const handleValidate = async (idToValidate) => {
    const targetId = idToValidate || bookingIdInput;
    if (!targetId || !targetId.trim()) {
      toast.warning('Input Required', 'Please enter a Booking ID or scan a QR code.');
      return;
    }

    setValidating(true);
    setValidationResult(null);

    try {
      const res = await cinemaPartnerApi.validateTicket(targetId.trim());
      setValidationResult(res);

      if (res.success) {
        toast.success('Admitted', res.message);
        setScanHistory((prev) => [
          {
            id: targetId.trim(),
            timestamp: new Date().toLocaleTimeString(),
            status: 'VALID',
            movie: res.booking?.movieTitle,
            seats: res.booking?.seats?.join(', '),
            customer: res.booking?.customerName
          },
          ...prev
        ]);
        setBookingIdInput('');
      }
    } catch (err) {
      const errRes = {
        success: false,
        status: 'FAILED',
        message: err.message || 'Validation failed.'
      };
      setValidationResult(errRes);
      toast.error('Validation Failed', err.message);

      setScanHistory((prev) => [
        {
          id: targetId.trim(),
          timestamp: new Date().toLocaleTimeString(),
          status: 'REJECTED',
          message: err.message
        },
        ...prev
      ]);
    } finally {
      setValidating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleValidate();
    }
  };

  const b = validationResult?.booking;
  const isSuccess = validationResult?.success;
  const statusType = validationResult?.status;

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-[#222432]">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-[#222432] tracking-tight flex items-center gap-2.5">
          <QrCode className="w-6 h-6 text-[#F84464]" />
          <span>Gate Admission &amp; Ticket Scanner</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Verify digital M-Tickets, check in moviegoers, and prevent duplicate admissions
        </p>
      </div>

      {/* Main Validation Scanner Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (7 cols): Input & Scanner Results */}
        <div className="lg:col-span-7 space-y-6">
          {/* Scanner Input Card */}
          <div className="bg-white border border-[#EEEEF2] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Scan QR Code or Enter Booking Identifier
              </h3>
              <span className="text-[10px] font-bold text-[#F84464] bg-[#F84464]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F84464] animate-ping" />
                Live Gate Scanner
              </span>
            </div>

            {/* Simulated Animated Scanner Viewfinder */}
            <div className="relative my-3 p-4 bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
              <div className="w-full h-0.5 bg-[#F84464] shadow-[0_0_12px_#F84464] animate-pulse mb-3" />
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <QrCode className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={bookingIdInput}
                    onChange={(e) => setBookingIdInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. BMS-849201"
                    autoFocus
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-800/90 border border-gray-700 rounded-xl text-sm font-mono text-white placeholder-gray-500 focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/30"
                  />
                </div>

                <button
                  onClick={() => handleValidate()}
                  disabled={validating}
                  className="px-5 py-2.5 bg-[#F84464] hover:bg-[#E03A58] text-white font-bold text-xs rounded-xl shadow-md shadow-[#F84464]/25 flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
                >
                  {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Verify Ticket</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 mt-2">
              Tip: Compatible with optical barcode/QR scanners, hand scanners, and manual numeric entry.
            </p>
          </div>

          {/* Real-time Result Banner matching BookMyShow ticket verification slip */}
          {validationResult && (
            <div
              className={`p-6 rounded-2xl border shadow-sm transition-all duration-300 animate-in fade-in zoom-in-95 ${isSuccess
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : statusType === 'ALREADY_USED'
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-red-50 border-red-200 text-red-950'
                }`}
            >
              {/* Status Header */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-black/10 mb-4">
                {isSuccess && (
                  <div className="w-11 h-11 rounded-xl bg-[#4ABD5D]/20 text-[#4ABD5D] flex items-center justify-center border border-[#4ABD5D]/30">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                )}
                {!isSuccess && (
                  <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center border border-red-200">
                    <XCircle className="w-7 h-7" />
                  </div>
                )}

                <div>
                  <h3 className="text-base font-bold tracking-tight">
                    {isSuccess ? '✓ ADMISSION GRANTED' : '✕ ADMISSION REJECTED'}
                  </h3>
                  <p className="text-xs opacity-90 font-medium">{validationResult.message}</p>
                </div>
              </div>

              {/* Booking Ticket Summary on Success */}
              {b && (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-white/70 rounded-xl border border-black/5 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] opacity-70 uppercase font-bold">Movie / Screening</div>
                      <div className="font-bold text-sm text-[#222432] mt-0.5">{b.movieTitle}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] opacity-70 uppercase font-bold">Auditorium</div>
                      <div className="font-bold text-sm text-[#F84464] mt-0.5">{b.screenName || 'Screen 1'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 bg-white/70 rounded-xl border border-black/5">
                      <span className="text-[10px] opacity-70 block font-bold">Assigned Seats</span>
                      <strong className="text-[#F84464] font-mono text-sm">{b.seats?.join(', ')}</strong>
                    </div>

                    <div className="p-3 bg-white/70 rounded-xl border border-black/5">
                      <span className="text-[10px] opacity-70 block font-bold">Showtime</span>
                      <strong className="text-[#222432] text-xs">{b.showtime} ({b.showDate})</strong>
                    </div>

                    <div className="p-3 bg-white/70 rounded-xl border border-black/5">
                      <span className="text-[10px] opacity-70 block font-bold">Customer Name</span>
                      <strong className="text-[#222432] text-xs">{b.customerName}</strong>
                    </div>

                    <div className="p-3 bg-white/70 rounded-xl border border-black/5">
                      <span className="text-[10px] opacity-70 block font-bold">Booking Reference</span>
                      <strong className="text-[#222432] font-mono text-xs">{b.bookingId}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Col (5 cols): Live Check-in Audit Stream */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#EEEEF2] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
              <h3 className="text-xs font-bold text-[#222432] uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-[#F84464]" />
                <span>Session Check-In Audit</span>
              </h3>
              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                {scanHistory.length} Scans
              </span>
            </div>

            {scanHistory.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                No tickets scanned during this session yet.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {scanHistory.map((h, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1 hover:bg-white transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#222432]">{h.id}</span>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${h.status === 'VALID'
                            ? 'bg-[#4ABD5D]/10 text-[#4ABD5D] border border-[#4ABD5D]/20'
                            : 'bg-red-50 text-red-600 border border-red-200'
                          }`}
                      >
                        {h.status}
                      </span>
                    </div>

                    {h.movie && (
                      <div className="text-[11px] text-gray-700 font-semibold truncate">{h.movie}</div>
                    )}
                    {h.seats && (
                      <div className="text-[10px] text-[#F84464]">Seats: {h.seats} • {h.customer}</div>
                    )}
                    {h.message && (
                      <div className="text-[10px] text-red-500 truncate">{h.message}</div>
                    )}

                    <div className="text-[9px] text-gray-400 text-right pt-0.5">{h.timestamp}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
