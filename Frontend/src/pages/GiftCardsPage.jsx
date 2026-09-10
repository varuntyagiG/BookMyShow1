import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCity } from '../context/CityContext';
import {
  Gift,
  CreditCard,
  Sparkles,
  CheckCircle,
  Check,
  Copy,
  Printer,
  X,
  ShieldCheck,
  Calendar,
  Mail,
  User,
  Clock,
  ChevronRight,
  Info,
  HelpCircle,
  RefreshCw,
  ShoppingBag,
  AlertCircle,
  Heart,
  PartyPopper,
  Film,
  Award
} from 'lucide-react';

const occasions = [
  { id: 'all', label: 'All Occasions' },
  { id: 'birthday', label: 'Birthday' },
  { id: 'anniversary', label: 'Anniversary' },
  { id: 'celebration', label: 'Celebrations' },
  { id: 'congrats', label: 'Congratulations' },
  { id: 'thankyou', label: 'Thank You' },
  { id: 'cinema', label: 'Movie Mania' },
];

const cardDesigns = [
  {
    id: 'des-1',
    occasion: 'birthday',
    title: 'Blockbuster Birthday',
    subtitle: 'Wishing you a cinematic year filled with joy and blockbusters!',
    bgGradient: 'from-rose-600 via-pink-600 to-amber-500',
    accentColor: '#F84464',
    badge: 'Popular',
    tagline: 'Happy Birthday',
    icon: PartyPopper
  },
  {
    id: 'des-2',
    occasion: 'cinema',
    title: 'Movie Buff Special',
    subtitle: 'Unlimited movies, popcorn, and memories in premium cinemas.',
    bgGradient: 'from-red-600 via-[#2A2E3D] to-[#121216]',
    accentColor: '#F84464',
    badge: 'Top Pick',
    tagline: 'Cinema Magic',
    icon: Film
  },
  {
    id: 'des-3',
    occasion: 'anniversary',
    title: 'Love & Romance',
    subtitle: 'Celebrate your special love story with a memorable movie date.',
    bgGradient: 'from-purple-700 via-pink-600 to-rose-500',
    accentColor: '#E03A58',
    badge: 'Romantic',
    tagline: 'Happy Anniversary',
    icon: Heart
  },
  {
    id: 'des-4',
    occasion: 'celebration',
    title: 'Festive Sparkle',
    subtitle: 'Bring festive sparkle and entertainment to your loved ones.',
    bgGradient: 'from-amber-600 via-orange-600 to-red-700',
    accentColor: '#FF9800',
    badge: 'Celebrations',
    tagline: 'Festive Cheer',
    icon: Sparkles
  },
  {
    id: 'des-5',
    occasion: 'congrats',
    title: 'Standing Ovation',
    subtitle: 'Kudos on your grand success, hard work, and milestones!',
    bgGradient: 'from-emerald-600 via-teal-700 to-cyan-900',
    accentColor: '#4ABD5D',
    badge: 'Milestone',
    tagline: 'Congratulations',
    icon: Award
  },
  {
    id: 'des-6',
    occasion: 'thankyou',
    title: 'Heartfelt Thanks',
    subtitle: 'A warm gesture of gratitude with great entertainment.',
    bgGradient: 'from-blue-600 via-indigo-600 to-purple-800',
    accentColor: '#3B82F6',
    badge: 'Gratitude',
    tagline: 'Thank You',
    icon: Gift
  }
];

const presetAmounts = [250, 500, 1000, 2000, 5000];

export default function GiftCardsPage() {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { selectedCity } = useCity();

  const [selectedOccasion, setSelectedOccasion] = useState('all');
  const [selectedDesign, setSelectedDesign] = useState(cardDesigns[0]);
  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [quantity, setQuantity] = useState(1);

  const [formData, setFormData] = useState({
    recipientName: '',
    recipientEmail: '',
    senderName: '',
    senderEmail: '',
    message: 'Enjoy the show! Have a wonderful entertainment experience.'
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);
  const [copiedVoucher, setCopiedVoucher] = useState(false);

  // Sync logged in user profile to form
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        senderName: prev.senderName || user.name || '',
        senderEmail: prev.senderEmail || user.email || ''
      }));
    }
  }, [user]);

  const filteredDesigns = selectedOccasion === 'all'
    ? cardDesigns
    : cardDesigns.filter((d) => d.occasion === selectedOccasion);

  const handleAmountSelect = (val) => {
    setAmount(val);
    setCustomAmount('');
    if (formErrors.amount) {
      setFormErrors((prev) => ({ ...prev, amount: '' }));
    }
  };

  const handleCustomAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(val);
    if (val) {
      const num = parseInt(val, 10);
      setAmount(num);
    }
    if (formErrors.amount) {
      setFormErrors((prev) => ({ ...prev, amount: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.recipientName.trim()) {
      errors.recipientName = 'Recipient name is required.';
    }
    if (!formData.recipientEmail.trim()) {
      errors.recipientEmail = 'Recipient email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.recipientEmail)) {
      errors.recipientEmail = 'Please enter a valid email address.';
    }

    if (!formData.senderName.trim()) {
      errors.senderName = 'Sender name is required.';
    }
    if (!formData.senderEmail.trim()) {
      errors.senderEmail = 'Sender email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.senderEmail)) {
      errors.senderEmail = 'Please enter a valid email address.';
    }

    if (!amount || amount < 100 || amount > 10000) {
      errors.amount = 'Amount must be between ₹100 and ₹10,000.';
    }

    return errors;
  };

  const handlePurchase = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!isAuthenticated) {
      openAuthModal('signin');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const voucherNum = 'BMS-GC-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000);
      const pinNum = Math.floor(100000 + Math.random() * 900000).toString();

      setOrderConfirmed({
        voucherCode: voucherNum,
        pin: pinNum,
        amount,
        quantity,
        totalPaid: amount * quantity,
        recipientName: formData.recipientName,
        recipientEmail: formData.recipientEmail,
        senderName: formData.senderName,
        design: selectedDesign,
        expiryDate: '1 Year from today'
      });
    }, 800);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedVoucher(true);
    setTimeout(() => setCopiedVoucher(false), 2500);
  };

  const handlePrintVoucher = () => {
    window.print();
  };

  const handleResetAfterDone = () => {
    setOrderConfirmed(null);
    setFormData((prev) => ({
      ...prev,
      recipientName: '',
      recipientEmail: ''
    }));
  };

  return (
    <div className="bg-[#F5F5FA] min-h-screen pb-16 text-[#222432]">
      
      {/* 1. Hero Header Banner */}
      <div className="relative bg-gradient-to-b from-[#1C2130] via-[#161A26] to-[#121216] text-white py-12 sm:py-16 border-b border-gray-800/80 overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 bg-[#F84464]/15 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 w-80 h-80 bg-[#F84464]/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F84464]/15 border border-[#F84464]/30 text-[#F84464] text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
                <Gift className="w-3.5 h-3.5" />
                <span>Instant Digital E-Gift Cards</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight my-0 leading-[1.12]">
                Gift The Magic Of Movies &amp; Live Shows
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 mt-4 leading-relaxed max-w-xl">
                The ultimate entertainment gift for birthdays, celebrations, or special moments.
                Redeemable on cinema tickets, food &amp; beverages, live concerts, and plays across 100+ cities.
              </p>
            </div>

            {/* Value Highlights Strip */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-xs space-y-3.5 w-full max-w-sm shrink-0 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F84464]/20 flex items-center justify-center text-[#F84464] shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">1 Year Validity</span>
                  <span className="text-[11px] text-gray-300">Valid for 365 days across all screenings</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F84464]/20 flex items-center justify-center text-[#F84464] shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">Instant E-Delivery</span>
                  <span className="text-[11px] text-gray-300">Delivered directly via Email &amp; SMS</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F84464]/20 flex items-center justify-center text-[#F84464] shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">Zero Convenience Fees</span>
                  <span className="text-[11px] text-gray-300">100% of your amount goes into the voucher</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Gift Card Customization & Purchase Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Occasion Filter Tabs */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight my-0">
                1. Select an Occasion &amp; Theme
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Choose a design that matches the celebration</p>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {occasions.map((occ) => (
              <button
                key={occ.id}
                type="button"
                onClick={() => setSelectedOccasion(occ.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedOccasion === occ.id
                    ? 'bg-[#F84464] text-white shadow-md shadow-red-500/25'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {occ.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column (7 cols): Card Designs, Denomination, Personalization Form */}
          <div className="lg:col-span-7 space-y-6">

            {/* Card Designs Gallery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredDesigns.map((des) => {
                const isSelected = selectedDesign.id === des.id;
                const IconComponent = des.icon;
                return (
                  <div
                    key={des.id}
                    onClick={() => setSelectedDesign(des)}
                    className={`group relative rounded-2xl p-5 cursor-pointer transition-all duration-200 border text-white overflow-hidden bg-gradient-to-br ${des.bgGradient} ${
                      isSelected
                        ? 'ring-3 ring-[#F84464] scale-[1.02] shadow-xl shadow-red-500/20'
                        : 'hover:scale-[1.01] opacity-90 hover:opacity-100 border-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-xs uppercase tracking-wider text-white flex items-center gap-1">
                        <IconComponent className="w-3 h-3" />
                        <span>{des.tagline}</span>
                      </span>
                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-white text-[#F84464] flex items-center justify-center font-black text-xs shadow-sm">
                          ✓
                        </span>
                      ) : (
                        <span className="text-[10px] text-white/70 font-semibold">{des.badge}</span>
                      )}
                    </div>

                    <h3 className="text-base font-black tracking-tight text-white mb-1">
                      {des.title}
                    </h3>
                    <p className="text-xs text-white/80 line-clamp-1 leading-relaxed">
                      {des.subtitle}
                    </p>

                    <div className="mt-5 pt-3 border-t border-white/20 flex items-center justify-between text-[11px] text-white/90">
                      <span className="font-mono tracking-wider">bookmyshow</span>
                      <span>Digital Card</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Denomination & Quantity Box */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-3">
                2. Select Voucher Amount
              </h2>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 mb-4">
                {presetAmounts.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAmountSelect(val)}
                    className={`py-3 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      amount === val && !customAmount
                        ? 'bg-[#F84464] text-white shadow-md shadow-red-500/25 scale-105'
                        : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    ₹{val.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              {/* Custom amount input */}
              <div className="mb-5">
                <label className="text-xs text-gray-500 font-medium block mb-1.5">
                  Or enter custom denomination (₹100 to ₹10,000):
                </label>
                <div className="relative max-w-xs">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-gray-400">₹</span>
                  <input
                    type="text"
                    placeholder="Enter custom amount"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F84464]/50 focus:bg-white transition-all"
                  />
                </div>
                {formErrors.amount && (
                  <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {formErrors.amount}
                  </p>
                )}
              </div>

              {/* Quantity selector */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Quantity</span>
                  <span className="text-[11px] text-gray-500">Buy multiple vouchers with the same amount</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuantity(q)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        quantity === q
                          ? 'bg-[#F84464] text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recipient & Sender Form */}
            <form onSubmit={handlePurchase} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-2">
                3. Recipient &amp; Sender Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.recipientName}
                    onChange={(e) => {
                      setFormData({ ...formData, recipientName: e.target.value });
                      if (formErrors.recipientName) setFormErrors({ ...formErrors, recipientName: '' });
                    }}
                    className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs font-medium focus:outline-none focus:bg-white transition-all ${
                      formErrors.recipientName ? 'border-red-400 focus:ring-2 focus:ring-red-400' : 'border-gray-200 focus:ring-2 focus:ring-[#F84464]/50'
                    }`}
                  />
                  {formErrors.recipientName && (
                    <p className="text-[11px] text-red-500 font-semibold mt-1">{formErrors.recipientName}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Recipient Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="rahul@example.com"
                    value={formData.recipientEmail}
                    onChange={(e) => {
                      setFormData({ ...formData, recipientEmail: e.target.value });
                      if (formErrors.recipientEmail) setFormErrors({ ...formErrors, recipientEmail: '' });
                    }}
                    className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs font-medium focus:outline-none focus:bg-white transition-all ${
                      formErrors.recipientEmail ? 'border-red-400 focus:ring-2 focus:ring-red-400' : 'border-gray-200 focus:ring-2 focus:ring-[#F84464]/50'
                    }`}
                  />
                  {formErrors.recipientEmail && (
                    <p className="text-[11px] text-red-500 font-semibold mt-1">{formErrors.recipientEmail}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Your Name (Sender) *
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={formData.senderName}
                    onChange={(e) => {
                      setFormData({ ...formData, senderName: e.target.value });
                      if (formErrors.senderName) setFormErrors({ ...formErrors, senderName: '' });
                    }}
                    className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs font-medium focus:outline-none focus:bg-white transition-all ${
                      formErrors.senderName ? 'border-red-400 focus:ring-2 focus:ring-red-400' : 'border-gray-200 focus:ring-2 focus:ring-[#F84464]/50'
                    }`}
                  />
                  {formErrors.senderName && (
                    <p className="text-[11px] text-red-500 font-semibold mt-1">{formErrors.senderName}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Your Email (for receipt) *
                  </label>
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.senderEmail}
                    onChange={(e) => {
                      setFormData({ ...formData, senderEmail: e.target.value });
                      if (formErrors.senderEmail) setFormErrors({ ...formErrors, senderEmail: '' });
                    }}
                    className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs font-medium focus:outline-none focus:bg-white transition-all ${
                      formErrors.senderEmail ? 'border-red-400 focus:ring-2 focus:ring-red-400' : 'border-gray-200 focus:ring-2 focus:ring-[#F84464]/50'
                    }`}
                  />
                  {formErrors.senderEmail && (
                    <p className="text-[11px] text-red-500 font-semibold mt-1">{formErrors.senderEmail}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Personal Message on the Card
                </label>
                <textarea
                  rows={2}
                  maxLength={120}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F84464]/50 focus:bg-white transition-all"
                />
                <div className="flex justify-end text-[10px] text-gray-400 mt-0.5">
                  {formData.message.length}/120 characters
                </div>
              </div>

              {/* Price Calculation Box */}
              <div className="bg-gray-50 p-4 rounded-xl text-xs space-y-2 border border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span>Gift Cards ({quantity} × ₹{amount.toLocaleString('en-IN')}):</span>
                  <span className="font-bold text-gray-900">₹{(amount * quantity).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Digital Delivery &amp; Processing:</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 text-sm font-black">
                  <span>Total Amount Payable:</span>
                  <span className="text-[#F84464]">₹{(amount * quantity).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#F84464] hover:bg-[#e03a58] active:scale-[0.98] text-white text-xs sm:text-sm font-extrabold rounded-xl transition-all shadow-md shadow-red-500/25 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing E-Gift Card...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {isAuthenticated ? `Pay ₹${(amount * quantity).toLocaleString('en-IN')} & Send Gift Card` : 'Sign In to Buy Gift Card'}
                    </span>
                  </>
                )}
              </button>
            </form>

          </div>

          {/* Right Column (5 cols): Live Interactive Visualizer Preview */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold text-gray-500 tracking-wider">
                  Live Card Preview
                </span>
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Instant E-Delivery
                </span>
              </div>

              {/* The Live Interactive Card */}
              <div className={`relative aspect-[1.58/1] w-full rounded-2xl p-6 text-white shadow-2xl overflow-hidden bg-gradient-to-br ${selectedDesign.bgGradient} flex flex-col justify-between border border-white/20 transition-all duration-300`}>
                <div className="pointer-events-none absolute -top-12 -right-12 w-44 h-44 bg-white/20 rounded-full blur-2xl" />

                {/* Top Row */}
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <span className="text-xl font-black tracking-tight text-white flex items-center">
                      book<span className="text-white drop-shadow-sm font-black">my</span>show
                    </span>
                    <span className="text-[10px] text-white/80 block uppercase tracking-wider font-semibold mt-0.5">
                      Official E-Gift Voucher
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-white/70 block">Card Value</span>
                    <span className="text-xl sm:text-2xl font-black text-white">
                      ₹{amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Center Content */}
                <div className="relative z-10 my-1">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-black/40 rounded-full text-white uppercase tracking-wider inline-block">
                    {selectedDesign.tagline}
                  </span>
                  <p className="text-xs text-white/95 mt-2 font-medium italic line-clamp-2 leading-relaxed">
                    "{formData.message || 'Enjoy the show!'}"
                  </p>
                </div>

                {/* Bottom Row */}
                <div className="relative z-10 pt-3 border-t border-white/25 flex items-end justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-white/70 block uppercase font-bold">Recipient:</span>
                    <span className="font-black text-white text-sm truncate max-w-[180px] block">
                      {formData.recipientName || 'Someone Special'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-white/70 block uppercase font-bold">Valid Across:</span>
                    <span className="font-bold text-white text-[11px]">{selectedCity} &amp; Pan-India</span>
                  </div>
                </div>
              </div>

              {/* Verified Guide Box */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs text-xs space-y-3">
                <h3 className="font-bold text-gray-900 flex items-center gap-1.5 text-xs uppercase tracking-wider my-0">
                  <Info className="w-4 h-4 text-[#F84464]" />
                  <span>How Redemption Works</span>
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-red-50 text-[#F84464] font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                    <span>Recipient receives the unique 16-digit voucher code &amp; PIN instantly via email.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-red-50 text-[#F84464] font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                    <span>Select any movie, event, or play ticket on BookMyShow and proceed to checkout.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-red-50 text-[#F84464] font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                    <span>Under the Gift Voucher section, enter the code to deduct the amount instantly.</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* 3. Purchase Confirmation & Voucher Modal */}
      {orderConfirmed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-7 text-center animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={handleResetAfterDone}
              className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>

            <h3 className="text-xl font-black text-gray-900 mb-1">
              Gift Voucher Generated!
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              Your gift card has been created and dispatched to <strong>{orderConfirmed.recipientEmail}</strong>.
            </p>

            {/* Printable Digital Voucher Card */}
            <div className={`p-5 rounded-2xl text-white text-left text-xs mb-5 shadow-lg bg-gradient-to-br ${orderConfirmed.design.bgGradient}`}>
              <div className="flex justify-between items-center border-b border-white/20 pb-3 mb-3">
                <span className="text-xs font-black tracking-wider uppercase">BookMyShow E-Gift Voucher</span>
                <span className="text-base font-black">₹{orderConfirmed.amount.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="space-y-2.5 font-mono">
                <div>
                  <span className="text-[10px] text-white/70 block uppercase font-sans font-bold">Voucher Code</span>
                  <div className="flex items-center justify-between font-bold text-sm bg-black/35 px-3 py-2 rounded-xl mt-0.5">
                    <span>{orderConfirmed.voucherCode}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(orderConfirmed.voucherCode)}
                      className="text-white hover:text-red-200 cursor-pointer transition-colors p-1"
                      title="Copy voucher code"
                    >
                      {copiedVoucher ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-white/70 block uppercase font-sans font-bold">Security PIN</span>
                  <span className="font-bold text-sm bg-black/35 px-3 py-1.5 rounded-xl inline-block mt-0.5">
                    {orderConfirmed.pin}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/20 text-[11px] text-white/85 flex justify-between">
                <span>Recipient: {orderConfirmed.recipientName}</span>
                <span>Validity: 12 Months</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrintVoucher}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save Voucher</span>
              </button>
              <button
                type="button"
                onClick={handleResetAfterDone}
                className="flex-1 py-3 bg-[#F84464] hover:bg-[#e03a58] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Frequently Asked Questions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-10 border-t border-gray-200">
        <h2 className="text-lg font-black text-gray-900 mb-6 tracking-tight">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-600">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
            <h3 className="font-black text-gray-900 text-xs mb-2">Where can I use this Gift Card?</h3>
            <p className="leading-relaxed">
              BookMyShow Gift Cards can be redeemed for booking movie tickets, concert passes, theatrical plays, 
              sports matches, and cinema snacks across 100+ cities in India.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
            <h3 className="font-black text-gray-900 text-xs mb-2">What is the validity period?</h3>
            <p className="leading-relaxed">
              Every Gift Card is valid for 12 months (365 days) from the purchase date. The voucher can be used across 
              multiple transactions until the balance is fully exhausted.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
            <h3 className="font-black text-gray-900 text-xs mb-2">How do I redeem at checkout?</h3>
            <p className="leading-relaxed">
              On the booking checkout screen, choose "Gift Voucher", enter your 16-digit voucher code and 6-digit PIN. 
              The voucher value will be instantly applied to your bill.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
