import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  Smartphone,
  CreditCard,
  Building2,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  Copy,
  Check,
  Zap,
  Info
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// Popular UPI Apps
const UPI_APPS = [
  { id: 'phonepe', name: 'PhonePe', color: '#5f259f', icon: '🟣' },
  { id: 'gpay', name: 'Google Pay', color: '#4285F4', icon: '🔵' },
  { id: 'paytm', name: 'Paytm UPI', color: '#00BAF2', icon: '🔷' },
  { id: 'cred', name: 'CRED UPI', color: '#1A1A1A', icon: '🖤' },
];

// Popular NetBanking Banks
const POPULAR_BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC', badge: 'Popular' },
  { id: 'icici', name: 'ICICI Bank', code: 'ICIC', badge: 'Instant' },
  { id: 'sbi', name: 'State Bank of India', code: 'SBIN', badge: 'Zero Fee' },
  { id: 'axis', name: 'Axis Bank', code: 'UTIB', badge: 'Fast' },
  { id: 'kotak', name: 'Kotak Mahindra', code: 'KKBK', badge: '' },
  { id: 'pnb', name: 'Punjab National', code: 'PUNB', badge: '' },
];

export default function PaymentGatewayModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  amount = 0,
  itemDetails = {},
  isProcessing = false
}) {
  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [upiMethod, setUpiMethod] = useState('qr'); // 'qr' | 'id'
  const [selectedUpiApp, setSelectedUpiApp] = useState('phonepe');
  const [upiId, setUpiId] = useState('');
  const [upiError, setUpiError] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardError, setCardError] = useState('');

  // NetBanking fields
  const [selectedBank, setSelectedBank] = useState('hdfc');

  // Simulation flow states
  const [paymentPhase, setPaymentPhase] = useState('idle'); // 'idle' | 'authorizing' | 'otp' | 'success'
  const [otpInput, setOtpInput] = useState('');
  const [otpTimer, setOtpTimer] = useState(30);
  const [sessionTimer, setSessionTimer] = useState(540); // 9 minutes session countdown

  // Transaction reference
  const txnRef = React.useMemo(() => {
    return 'TXN-' + Math.floor(100000 + Math.random() * 900000) + '-' + Math.random().toString(36).substring(2, 5).toUpperCase();
  }, [isOpen]);

  // Session timer countdown
  useEffect(() => {
    if (!isOpen) {
      setSessionTimer(540);
      setPaymentPhase('idle');
      return;
    }
    const timer = setInterval(() => {
      setSessionTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, onClose]);

  // OTP Countdown timer
  useEffect(() => {
    let timer;
    if (paymentPhase === 'otp' && otpTimer > 0) {
      timer = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [paymentPhase, otpTimer]);

  if (!isOpen) return null;

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate official UPI Intent URL for real phone scanners
  // Standard NPCI format: upi://pay?pa=VPA&pn=NAME&am=AMOUNT&cu=INR&tn=NOTE
  const upiIntentString = `upi://pay?pa=bookmyshow.merchant@icici&pn=BookMyShow%20Entertainment&am=${amount}&cu=INR&tn=Booking%20Ref%20${txnRef}`;

  // Card formatting helpers
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length > 2) {
      raw = raw.slice(0, 2) + '/' + raw.slice(2);
    }
    setCardExpiry(raw);
  };

  // Process UPI Payment Simulation
  const handleProcessUPI = () => {
    if (upiMethod === 'id') {
      if (!upiId || !upiId.includes('@')) {
        setUpiError('Please enter a valid UPI ID (e.g., yourname@okhdfcbank or number@ybl)');
        return;
      }
    }
    setUpiError('');
    setPaymentPhase('authorizing');

    setTimeout(() => {
      setPaymentPhase('success');
      setTimeout(() => {
        onPaymentSuccess?.({
          paymentMethod: `upi_${selectedUpiApp}`,
          transactionId: txnRef,
          amount
        });
      }, 1200);
    }, 2200);
  };

  // Process Card Payment Simulation
  const handleProcessCard = (e) => {
    e.preventDefault();
    const cleanNum = cardNumber.replace(/\s/g, '');
    if (cleanNum.length < 15) {
      setCardError('Please enter a valid 16-digit card number.');
      return;
    }
    if (!cardExpiry || cardExpiry.length < 5) {
      setCardError('Please enter card expiry date (MM/YY).');
      return;
    }
    if (!cardCvv || cardCvv.length < 3) {
      setCardError('Please enter a valid 3-digit CVV.');
      return;
    }

    setCardError('');
    setPaymentPhase('otp');
    setOtpTimer(30);
  };

  // Verify Card 3D Secure OTP
  const handleVerifyOtp = () => {
    setPaymentPhase('authorizing');
    setTimeout(() => {
      setPaymentPhase('success');
      setTimeout(() => {
        onPaymentSuccess?.({
          paymentMethod: 'card_visa',
          transactionId: txnRef,
          amount
        });
      }, 1200);
    }, 1800);
  };

  // Process NetBanking Simulation
  const handleProcessNetBanking = () => {
    setPaymentPhase('authorizing');
    setTimeout(() => {
      setPaymentPhase('success');
      setTimeout(() => {
        onPaymentSuccess?.({
          paymentMethod: `netbanking_${selectedBank}`,
          transactionId: txnRef,
          amount
        });
      }, 1200);
    }, 2000);
  };

  const handleCopyUpiString = () => {
    navigator.clipboard?.writeText(upiIntentString);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-[#181a24] via-[#1c1f2e] to-[#12141c] text-white rounded-3xl shadow-2xl border border-slate-700/60 overflow-hidden my-auto">
        
        {/* Top Header Strip */}
        <div className="bg-gradient-to-r from-[#222538] to-[#1a1c2b] px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F84464] to-rose-500 flex items-center justify-center shadow-lg shadow-[#F84464]/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>BookMyShow</span>
                  <span className="text-[#F84464] font-medium text-xs">Payment Gateway</span>
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  256-bit SSL
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Official NPCI UPI &amp; Banking Sandbox
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Session Timer */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 text-xs font-mono text-amber-400" title="Seats lock expiry timer">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{formatTimer(sessionTimer)}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={paymentPhase === 'authorizing'}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Order Summary Ribbon */}
        <div className="px-5 py-3 bg-[#131520] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Paying for:</span>
            <span className="font-bold text-slate-200">{itemDetails.title || 'Movie Tickets'}</span>
            {itemDetails.seats?.length > 0 && (
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                {itemDetails.seats.length} {itemDetails.seats.length === 1 ? 'Seat' : 'Seats'} ({itemDetails.seats.join(', ')})
              </span>
            )}
            {itemDetails.includeSnacks && (
              <span className="text-[11px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
                🍿 F&amp;B Included
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs">Total Payable:</span>
            <span className="text-base font-bold text-white font-mono bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              ₹{Number(amount).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Modal Body & Flow Switcher */}
        <div className="p-4 sm:p-6 min-h-[380px] flex flex-col justify-between">
          
          {/* PHASE 1: Normal Payment Methods Selection */}
          {paymentPhase === 'idle' && (
            <div>
              {/* Payment Method Selector Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 mb-5">
                <button
                  type="button"
                  onClick={() => { setActiveTab('upi'); setUpiError(''); }}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'upi'
                      ? 'bg-gradient-to-r from-[#F84464] to-rose-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Smartphone className="w-4 h-4 shrink-0" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab('card'); setCardError(''); }}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'card'
                      ? 'bg-gradient-to-r from-[#F84464] to-rose-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span>Debit / Credit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('netbanking')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'netbanking'
                      ? 'bg-gradient-to-r from-[#F84464] to-rose-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span>Net Banking</span>
                </button>
              </div>

              {/* TAB 1: UPI / PhonePe / GPay */}
              {activeTab === 'upi' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* UPI Sub-Toggle: QR Code vs UPI ID */}
                  <div className="flex items-center justify-center gap-2 border-b border-slate-800 pb-3">
                    <button
                      type="button"
                      onClick={() => setUpiMethod('qr')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        upiMethod === 'qr'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
                      }`}
                    >
                      ⚡ Scan UPI QR Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiMethod('id')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        upiMethod === 'id'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
                      }`}
                    >
                      Enter UPI ID / VPA
                    </button>
                  </div>

                  {upiMethod === 'qr' ? (
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                      {/* Live Scannable 2D Dynamic QR Code */}
                      <div className="bg-white p-3.5 rounded-2xl shadow-xl flex flex-col items-center shrink-0 ring-4 ring-rose-500/10">
                        <QRCodeSVG
                          value={upiIntentString}
                          size={150}
                          level="H"
                          includeMargin={false}
                        />
                        <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold tracking-widest text-slate-900 uppercase">
                          <span>PhonePe</span>
                          <span>•</span>
                          <span>GPay</span>
                          <span>•</span>
                          <span>Paytm</span>
                        </div>
                      </div>

                      {/* Instructions & Instant Payment Action */}
                      <div className="space-y-3 flex-1 text-center sm:text-left">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-bold mb-1.5">
                            <Zap className="w-3 h-3" />
                            <span>Zero Convenience Surcharge</span>
                          </div>
                          <h4 className="text-sm font-bold text-white">
                            Scan with PhonePe, Google Pay, or Paytm
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            Open any UPI app on your mobile and point camera at the QR code to pay ₹{amount}.
                          </p>
                        </div>

                        {/* Supported Apps Badges */}
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                          {UPI_APPS.map((app) => (
                            <button
                              key={app.id}
                              type="button"
                              onClick={() => setSelectedUpiApp(app.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors cursor-pointer ${
                                selectedUpiApp === app.id
                                  ? 'bg-slate-800 border-[#F84464] text-white'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <span>{app.icon}</span>
                              <span>{app.name}</span>
                            </button>
                          ))}
                        </div>

                        <div className="pt-2 flex flex-col sm:flex-row gap-2">
                          <button
                            type="button"
                            onClick={handleProcessUPI}
                            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-[#F84464] hover:from-rose-500 to-rose-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-900/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Simulate Instant Scan &amp; Pay (₹{amount})</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleCopyUpiString}
                            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            title="Copy UPI Intent URI"
                          >
                            {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedUpi ? 'Copied' : 'Copy URI'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* UPI ID Mode */
                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Enter your UPI ID / Virtual Payment Address
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="mobile@upi or username@okhdfcbank"
                            value={upiId}
                            onChange={(e) => { setUpiId(e.target.value); setUpiError(''); }}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-[#F84464] focus:ring-1 focus:ring-[#F84464] font-mono"
                          />
                        </div>
                        {upiError && (
                          <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {upiError}
                          </p>
                        )}
                      </div>

                      {/* Quick Handle Suggestions */}
                      <div>
                        <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                          Quick Suffixes:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {['@okhdfcbank', '@okaxis', '@ybl', '@paytm', '@ibl'].map((suffix) => (
                            <button
                              key={suffix}
                              type="button"
                              onClick={() => {
                                const base = upiId.includes('@') ? upiId.split('@')[0] : upiId;
                                setUpiId((base || 'yourname') + suffix);
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 rounded-lg font-mono transition-colors cursor-pointer"
                            >
                              {suffix}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleProcessUPI}
                        className="w-full py-3 bg-[#F84464] hover:bg-rose-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-rose-900/30 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Send Payment Request to UPI App</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Debit / Credit Card */}
              {activeTab === 'card' && (
                <form onSubmit={handleProcessCard} className="space-y-4 animate-in fade-in duration-200">
                  {/* Virtual Luxury Card Preview */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border border-slate-700/80 shadow-inner relative overflow-hidden">
                    <div className="pointer-events-none absolute -right-6 -bottom-6 w-32 h-32 bg-[#F84464]/20 rounded-full blur-2xl" />
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono font-bold tracking-wider">
                        <span className="w-6 h-4 bg-amber-400/30 border border-amber-300/40 rounded-sm inline-block" />
                        <span>CHIP</span>
                      </div>
                      <span className="text-xs font-bold tracking-widest text-slate-300 uppercase">
                        {cardNumber.startsWith('4') ? 'VISA' : cardNumber.startsWith('5') ? 'MASTERCARD' : 'RUPAY'}
                      </span>
                    </div>

                    <div className="font-mono text-base sm:text-lg tracking-widest text-slate-100 font-bold mb-3">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300 uppercase">
                      <div>
                        <span className="text-[9px] text-slate-400 block">Cardholder</span>
                        <span className="font-bold tracking-wider">{cardHolder || 'VALUED CUSTOMER'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 block">Expires</span>
                        <span className="font-mono font-bold">{cardExpiry || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Input Fields */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="4532 0000 0000 0000"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength={19}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-hidden focus:border-[#F84464] font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          placeholder="Name on card"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-hidden focus:border-[#F84464]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">
                            Valid Thru
                          </label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            maxLength={5}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-hidden focus:border-[#F84464] font-mono text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">
                            CVV
                          </label>
                          <input
                            type="password"
                            placeholder="•••"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                            maxLength={3}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-hidden focus:border-[#F84464] font-mono text-center"
                          />
                        </div>
                      </div>
                    </div>

                    {cardError && (
                      <p className="text-xs text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {cardError}
                      </p>
                    )}
                  </div>

                  {/* Test Autofill Button */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCardNumber('4532 8912 3456 7890');
                        setCardHolder('VARUN SHARMA');
                        setCardExpiry('12/28');
                        setCardCvv('789');
                        setCardError('');
                      }}
                      className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2 cursor-pointer"
                    >
                      ⚡ Auto-fill Test Sandbox Card
                    </button>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      3D Secure 2.0
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#F84464] hover:bg-rose-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-rose-900/30 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to 3D Secure OTP (₹{amount})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* TAB 3: Net Banking */}
              {activeTab === 'netbanking' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <p className="text-xs text-slate-300 font-medium">
                    Choose from top popular Indian banking portals:
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {POPULAR_BANKS.map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setSelectedBank(bank.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          selectedBank === bank.id
                            ? 'bg-rose-950/40 border-[#F84464] ring-1 ring-[#F84464]'
                            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded">
                            {bank.code}
                          </span>
                          {bank.badge && (
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              {bank.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-200">
                          {bank.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                    <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>
                      You will be authenticated through {POPULAR_BANKS.find(b => b.id === selectedBank)?.name} corporate retail gateway to authorize the transaction of ₹{amount}.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleProcessNetBanking}
                    className="w-full py-3 bg-[#F84464] hover:bg-rose-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-rose-900/30 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to {POPULAR_BANKS.find(b => b.id === selectedBank)?.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PHASE 2: 3D Secure Bank OTP Dialog */}
          {paymentPhase === 'otp' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 animate-in zoom-in-95 duration-200 my-auto">
              <div className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/30 text-[#F84464] mx-auto flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  3D Secure Bank Verification
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  A high-security one-time password (OTP) was sent to your registered mobile number ending in <span className="text-white font-mono font-bold">•••• 8910</span>.
                </p>
              </div>

              <div className="max-w-xs mx-auto">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full bg-slate-950 border-2 border-slate-700 focus:border-[#F84464] rounded-xl px-4 py-3 text-center text-lg font-mono tracking-widest text-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setOtpInput('482910')}
                  className="text-amber-400 hover:text-amber-300 underline underline-offset-2 cursor-pointer"
                >
                  ⚡ Auto-fill Test OTP (482910)
                </button>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">
                  Resend in {otpTimer}s
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentPhase('idle')}
                  className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="w-2/3 py-2.5 bg-[#F84464] hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  Authorize &amp; Confirm ₹{amount}
                </button>
              </div>
            </div>
          )}

          {/* PHASE 3: Bank Processing / Authorization State */}
          {paymentPhase === 'authorizing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 my-auto animate-in fade-in">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-slate-800 border-t-[#F84464] animate-spin" />
                <Lock className="w-6 h-6 text-[#F84464]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Securing Transaction...
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Connecting to NPCI Clearing House and reserving cinema turnstile pass. Please do not close or refresh this tab.
                </p>
              </div>
              <span className="font-mono text-xs text-slate-500">
                Ref ID: {txnRef}
              </span>
            </div>
          )}

          {/* PHASE 4: Payment Approved Celebration */}
          {paymentPhase === 'success' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 my-auto animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center shadow-xl shadow-emerald-500/20 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Payment Authorized Successfully!
              </h3>
              <p className="text-xs text-emerald-400 font-semibold">
                Paid ₹{amount} • Generating your Live M-Ticket Pass...
              </p>
              <div className="font-mono text-[11px] text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                TXN: {txnRef}
              </div>
            </div>
          )}

          {/* Bottom Security Footer */}
          <div className="mt-6 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                RBI Compliant
              </span>
              <span>•</span>
              <span>PCI-DSS Level 1</span>
              <span>•</span>
              <span>100% Refundable if Cancelled</span>
            </div>
            <div className="font-mono text-slate-600">
              TXN-ID: {txnRef}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
