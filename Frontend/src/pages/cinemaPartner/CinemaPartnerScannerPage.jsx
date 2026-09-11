import React, { useState } from 'react';
import { cinemaPartnerApi } from '../../services/cinemaPartnerApi';
import { useCinemaToast } from '../../components/cinemaPartner/CinemaPartnerToastContext';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
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
  EmptyState
} from '../../components/ui';

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
      <PageHeader
        title="Gate Turnstile & Optical Ticket Scanner"
        subtitle="Validate digital M-Tickets, check in moviegoers, and prevent duplicate admissions at cinema hall gates."
        icon={QrCode}
        badge="Access Control"
        actions={
          <Badge variant="brand" pill className="animate-pulse">
            Scanner Live
          </Badge>
        }
      />

      {/* Main Scanner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (7 cols): Input & Scanner Results */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Scan QR Code or Enter Booking ID</CardTitle>
                <CardDescription>Works with handheld barcode scanners and keyboard entry</CardDescription>
              </div>
              <Badge variant="brand" dot>
                Turnstile Terminal
              </Badge>
            </CardHeader>

            <CardContent>
              {/* Simulated Scanner Viewfinder */}
              <div className="relative my-2 p-4 bg-[#222432] rounded-2xl overflow-hidden border border-gray-800 shadow-inner">
                <div className="w-full h-0.5 bg-[#F84464] shadow-[0_0_12px_#F84464] animate-pulse mb-3" />
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <QrCode className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={bookingIdInput}
                      onChange={(e) => setBookingIdInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="e.g. BMS-849201"
                      autoFocus
                      className="w-full pl-10 pr-3 py-3 bg-gray-800/90 border border-gray-700 rounded-xl text-sm font-mono text-white placeholder-gray-500 focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/30"
                    />
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    icon={ShieldCheck}
                    onClick={() => handleValidate()}
                    loading={validating}
                  >
                    Verify
                  </Button>
                </div>
              </div>

              <p className="text-[11px] text-gray-400 mt-3 font-medium">
                Compatible with optical barcode/QR scanners, mobile cameras, and manual alphanumeric codes.
              </p>
            </CardContent>
          </Card>

          {/* Validation Result Banner */}
          {validationResult && (
            <Card
              className={`p-6 border transition-all duration-300 animate-in fade-in zoom-in-95 ${
                isSuccess
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : statusType === 'ALREADY_USED'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                  : 'bg-red-50/70 border-red-200 text-red-950'
              }`}
            >
              {/* Status Header */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-black/10 mb-4">
                {isSuccess ? (
                  <div className="w-11 h-11 rounded-2xl bg-[#4ABD5D]/20 text-[#4ABD5D] flex items-center justify-center border border-[#4ABD5D]/30">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center border border-red-200">
                    <XCircle className="w-7 h-7" />
                  </div>
                )}

                <div>
                  <h3 className="text-base font-black tracking-tight">
                    {isSuccess ? '✓ ADMISSION AUTHORIZED' : '✕ ADMISSION REJECTED'}
                  </h3>
                  <p className="text-xs opacity-90 font-medium">{validationResult.message}</p>
                </div>
              </div>

              {/* Booking Ticket Summary on Success */}
              {b && (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-white/80 rounded-xl border border-black/5 flex items-center justify-between">
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
                    <div className="p-3 bg-white/80 rounded-xl border border-black/5">
                      <span className="text-[10px] opacity-70 block font-bold">Assigned Seats</span>
                      <strong className="text-[#F84464] font-mono text-sm font-black">{b.seats?.join(', ')}</strong>
                    </div>

                    <div className="p-3 bg-white/80 rounded-xl border border-black/5">
                      <span className="text-[10px] opacity-70 block font-bold">Showtime</span>
                      <strong className="text-[#222432] text-xs">{b.showtime} ({b.showDate})</strong>
                    </div>

                    <div className="p-3 bg-white/80 rounded-xl border border-black/5">
                      <span className="text-[10px] opacity-70 block font-bold">Customer Name</span>
                      <strong className="text-[#222432] text-xs">{b.customerName}</strong>
                    </div>

                    <div className="p-3 bg-white/80 rounded-xl border border-black/5">
                      <span className="text-[10px] opacity-70 block font-bold">Booking Reference</span>
                      <strong className="text-[#222432] font-mono text-xs">{b.bookingId}</strong>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right Col (5 cols): Live Check-in Audit Stream */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#F84464]" />
                <span>Session Check-In Audit</span>
              </CardTitle>
              <Badge variant="neutral" pill>
                {scanHistory.length} Scans
              </Badge>
            </CardHeader>

            <CardContent>
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
                        <Badge variant={h.status === 'VALID' ? 'approved' : 'cancelled'}>
                          {h.status}
                        </Badge>
                      </div>

                      {h.movie && (
                        <div className="text-[11px] text-gray-700 font-semibold truncate">{h.movie}</div>
                      )}
                      {h.seats && (
                        <div className="text-[10px] text-[#F84464] font-mono">Seats: {h.seats} • {h.customer}</div>
                      )}
                      {h.message && (
                        <div className="text-[10px] text-red-500 truncate">{h.message}</div>
                      )}

                      <div className="text-[9px] text-gray-400 text-right pt-0.5 font-mono">{h.timestamp}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
