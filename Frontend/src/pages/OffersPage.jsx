import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Sparkles,
  Search,
  Check,
  Copy,
  Calendar,
  Tag,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  X,
  Gift,
  Zap,
  Info,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';

const offerCategories = [
  { id: 'all', label: 'All Offers' },
  { id: 'credit', label: 'Credit Cards' },
  { id: 'debit', label: 'Debit Cards' },
  { id: 'upi', label: 'UPI & Wallets' },
  { id: 'rewards', label: 'BMS Rewards' },
  { id: 'cinemas', label: 'Cinema Chains' },
];

const bankFilters = ['All', 'ICICI Bank', 'HDFC Bank', 'Axis Bank', 'SBI Card', 'Kotak', 'CRED', 'Paytm'];

const offersData = [
  {
    id: 'off-1',
    title: 'ICICI Bank Coral, Rubyx & Sapphiro Credit Cards',
    subtitle: 'Buy 1 Ticket and Get 1 Free Ticket + 20% discount on cinema food & beverages.',
    category: 'credit',
    bank: 'ICICI Bank',
    tag: 'BUY 1 GET 1 FREE',
    tagColor: 'bg-[#F84464]',
    code: 'ICICIBOGO',
    validTill: '31 Dec 2026',
    brandBg: 'from-orange-600 to-amber-700',
    maxDiscount: 'Up to ₹250 on 2nd ticket',
    minBooking: '2 tickets',
    eligibleDays: 'All days of the week',
    description: 'Get a complimentary second ticket when you purchase a ticket using your ICICI Bank Coral, Rubyx, or Sapphiro Credit Card. Valid twice a month per cardholder.',
    terms: [
      'Offer is valid on minimum booking of 2 cinema tickets.',
      'Discount capped at ₹250 or the price of the second ticket, whichever is lower.',
      'Valid for both 2D, 3D, and IMAX screenings across all partner theatres.',
      'Applicable on first-come, first-served basis as per quota.'
    ]
  },
  {
    id: 'off-2',
    title: 'HDFC Bank Times Credit Card Exclusive',
    subtitle: 'Flat 25% instant discount on movie tickets and free Popcorn combo voucher.',
    category: 'credit',
    bank: 'HDFC Bank',
    tag: '25% INSTANT OFF',
    tagColor: 'bg-blue-600',
    code: 'HDFCTIMES',
    validTill: '30 Nov 2026',
    brandBg: 'from-blue-700 to-indigo-900',
    maxDiscount: 'Up to ₹150 per transaction',
    minBooking: '1 ticket',
    eligibleDays: 'Monday to Sunday',
    description: 'Enjoy 25% instant off on movie ticket purchases using your HDFC Bank Times Credit Card. Available on any screen format.',
    terms: [
      'Maximum discount of ₹150 per transaction.',
      'Offer can be availed up to 4 times per calendar month.',
      'Valid on BookMyShow website and mobile app bookings.'
    ]
  },
  {
    id: 'off-3',
    title: 'Axis Bank Neo & MyZone Credit Cards',
    subtitle: '10% instant discount on all cinema bookings and live shows.',
    category: 'credit',
    bank: 'Axis Bank',
    tag: '10% OFF',
    tagColor: 'bg-[#97144D]',
    code: 'AXISNEO10',
    validTill: '31 Dec 2026',
    brandBg: 'from-[#97144D] to-[#5C0A2E]',
    maxDiscount: 'Up to ₹100 per booking',
    minBooking: '₹300 minimum spend',
    eligibleDays: 'All days',
    description: 'Flat 10% instant savings across movies, theatrical plays, and concerts when paying with Axis Bank Neo or MyZone Credit Cards.',
    terms: [
      'Minimum booking amount of ₹300 required.',
      'Maximum discount capped at ₹100 per transaction.',
      'Valid twice per calendar month.'
    ]
  },
  {
    id: 'off-4',
    title: 'SBI Card Elite & Aurum Premium Privilege',
    subtitle: 'Enjoy 2 Free movie tickets worth up to ₹500 every calendar month.',
    category: 'credit',
    bank: 'SBI Card',
    tag: '2 FREE TICKETS',
    tagColor: 'bg-[#293B8E]',
    code: 'SBISUPER',
    validTill: '31 Jan 2027',
    brandBg: 'from-[#293B8E] to-[#121B47]',
    maxDiscount: 'Up to ₹250 per free ticket',
    minBooking: '2 tickets',
    eligibleDays: 'All days of the week',
    description: 'SBI Card ELITE and AURUM holders get 2 complimentary movie tickets each month across leading multiplex chains in India.',
    terms: [
      'Capped at ₹250 per ticket; price difference if any to be borne by the user.',
      'Convenience fees and taxes are applicable as per standard rates.',
      'Valid on multiplexes and standalone theatres.'
    ]
  },
  {
    id: 'off-5',
    title: 'Kotak Everyday RuPay & League Platinum',
    subtitle: 'Buy 1 Get 1 Free on all weekend shows (Friday to Sunday).',
    category: 'debit',
    bank: 'Kotak',
    tag: 'BOGO WEEKEND',
    tagColor: 'bg-red-700',
    code: 'KOTAKCINEMA',
    validTill: '15 Oct 2026',
    brandBg: 'from-red-700 to-rose-900',
    maxDiscount: 'Up to ₹200 on 2nd ticket',
    minBooking: '2 tickets',
    eligibleDays: 'Friday, Saturday & Sunday',
    description: 'Make your weekend movie outings twice as fun with Kotak Mahindra Bank Debit and Credit Cards.',
    terms: [
      'Valid only for showtimes on Friday, Saturday, and Sunday.',
      'Maximum discount of ₹200 on the second ticket.',
      'Limited weekend quotas available.'
    ]
  },
  {
    id: 'off-6',
    title: 'CRED Pay Cashback Blitz',
    subtitle: 'Get up to ₹150 guaranteed cashback directly into your CRED balance.',
    category: 'upi',
    bank: 'CRED',
    tag: '₹150 CASHBACK',
    tagColor: 'bg-black',
    code: 'CREDPAY150',
    validTill: '31 Dec 2026',
    brandBg: 'from-zinc-900 to-black',
    maxDiscount: 'Flat ₹150 Cashback',
    minBooking: '₹400 minimum transaction',
    eligibleDays: 'All days',
    description: 'Pay using CRED UPI or CRED Pay at checkout and unlock scratch cards with guaranteed cashback up to ₹150 on your booking.',
    terms: [
      'Applicable on transactions above ₹400.',
      'Cashback credited to CRED balance within 24 hours of successful booking.',
      'Valid once per CRED user during the promotion period.'
    ]
  },
  {
    id: 'off-7',
    title: 'Paytm UPI Instant Discount',
    subtitle: 'Flat ₹50 cashback on your first cinema booking with Paytm UPI.',
    category: 'upi',
    bank: 'Paytm',
    tag: 'FLAT ₹50 CASHBACK',
    tagColor: 'bg-[#002E6E]',
    code: 'PAYTM50',
    validTill: '30 Nov 2026',
    brandBg: 'from-[#002E6E] to-[#00B9F1]',
    maxDiscount: '₹50 flat cashback',
    minBooking: '₹200 minimum booking',
    eligibleDays: 'All days',
    description: 'Link your bank account via Paytm UPI and get ₹50 instant cashback directly credited to your UPI-linked bank account.',
    terms: [
      'Valid on first movie ticket booking via Paytm UPI.',
      'Minimum transaction value of ₹200.',
      'One-time redemption per customer.'
    ]
  },
  {
    id: 'off-8',
    title: 'BookMyShow SuperStar Privilege Member Offer',
    subtitle: '100% Waiver on convenience fee for your first movie booking every month.',
    category: 'rewards',
    bank: 'All',
    tag: 'ZERO FEE PASS',
    tagColor: 'bg-[#F84464]',
    code: 'BMSSUPERSTAR',
    validTill: '31 Dec 2026',
    brandBg: 'from-[#F84464] to-[#B4233D]',
    maxDiscount: '100% convenience fee waiver',
    minBooking: 'No minimum',
    eligibleDays: 'All days',
    description: 'Exclusive benefit for BookMyShow SuperStar loyalty members. Enjoy zero convenience fee on your first transaction of every calendar month.',
    terms: [
      'Applicable for registered SuperStar status accounts.',
      'Automatically credited upon entering promo code.',
      'Valid on cinema tickets only.'
    ]
  },
  {
    id: 'off-9',
    title: 'PVR INOX Passport Weekday Cinema Pass',
    subtitle: 'Watch any 10 movies on weekdays for just ₹699 across PVR and INOX screens.',
    category: 'cinemas',
    bank: 'All',
    tag: 'PASSPORT PASS',
    tagColor: 'bg-amber-600',
    code: 'PVRINOXPASS',
    validTill: '31 Dec 2026',
    brandBg: 'from-amber-600 to-yellow-800',
    maxDiscount: 'Up to ₹200 off per ticket',
    minBooking: '1 ticket',
    eligibleDays: 'Monday to Thursday',
    description: 'Binge the biggest theatrical releases every Monday to Thursday with the PVR INOX Passport subscription pass.',
    terms: [
      'Valid only from Monday to Thursday (excluding national holidays).',
      'Valid for 1 ticket per day.',
      'Recliner seats and IMAX formats may require additional surcharge.'
    ]
  }
];

export default function OffersPage() {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedBank, setSelectedBank] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [activeModalOffer, setActiveModalOffer] = useState(null);

  // Filter offers
  const filteredOffers = offersData.filter((item) => {
    // Category check
    if (activeCategory !== 'all' && item.category !== activeCategory) {
      return false;
    }

    // Bank check
    if (selectedBank !== 'All' && item.bank !== selectedBank && item.bank !== 'All') {
      return false;
    }

    // Search query check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSubtitle = item.subtitle.toLowerCase().includes(q);
      const matchBank = item.bank.toLowerCase().includes(q);
      const matchCode = item.code.toLowerCase().includes(q);
      const matchTag = item.tag.toLowerCase().includes(q);
      if (!matchTitle && !matchSubtitle && !matchBank && !matchCode && !matchTag) {
        return false;
      }
    }

    return true;
  });

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleResetFilters = () => {
    setActiveCategory('all');
    setSelectedBank('All');
    setSearchQuery('');
  };

  return (
    <div className="bg-[#F5F5FA] min-h-screen pb-16 text-[#222432]">

      {/* 1. Header Hero Banner */}
      <div className="relative bg-[#222432] text-white py-10 sm:py-14 border-b border-gray-800 overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-[#F84464]/15 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F84464]/20 border border-[#F84464]/30 text-[#F84464] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Partner Discounts &amp; Coupons</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight my-0 leading-tight">
              Exclusive Offers &amp; Bank Discounts
            </h1>

            <p className="text-xs sm:text-sm text-gray-300 mt-3 leading-relaxed max-w-2xl">
              Unlock Buy 1 Get 1 Free tickets, cashbacks, and instant discounts with credit &amp; debit 
              cards from ICICI, HDFC, Axis, SBI, Kotak, and UPI wallets.
            </p>
          </div>

          {/* Real-time Search Box */}
          <div className="mt-7 max-w-xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search offers by bank name, card type, or coupon code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-white text-gray-900 text-xs sm:text-sm font-medium rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-[#F84464] placeholder-gray-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 2. Navigation Category Tabs */}
      <div className="sticky top-[104px] z-20 bg-white border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto no-scrollbar py-2.5">
            {offerCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#F84464] text-white shadow-sm shadow-red-500/25'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Partner Bank Quick Filter Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="text-xs uppercase font-extrabold text-gray-500 tracking-wider">
            Filter by Partner Bank
          </span>
          {(selectedBank !== 'All' || searchQuery || activeCategory !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-[#F84464] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {bankFilters.map((bank) => (
            <button
              key={bank}
              onClick={() => setSelectedBank(bank)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                selectedBank === bank
                  ? 'bg-[#333545] text-white shadow-sm font-bold'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {bank}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Offers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {filteredOffers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between group"
              >
                {/* Card Header Strip with Gradient and Tag */}
                <div className={`p-5 text-white bg-gradient-to-r ${offer.brandBg} relative overflow-hidden`}>
                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 block">
                        {offer.bank}
                      </span>
                      <h3 className="text-base font-black tracking-tight text-white leading-tight mt-0.5">
                        {offer.title}
                      </h3>
                    </div>
                    <span className="shrink-0 bg-white/20 backdrop-blur-xs text-white border border-white/30 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {offer.tag}
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                      {offer.subtitle}
                    </p>

                    <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-[11px] text-gray-500">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700">Max Discount:</span>
                        <span className="font-bold text-[#F84464]">{offer.maxDiscount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700">Valid Till:</span>
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {offer.validTill}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions: Code & Details */}
                  <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between gap-3">
                    {/* Code pill with one-click copy */}
                    <div className="flex items-center border border-dashed border-[#F84464]/60 bg-red-50/50 rounded-lg px-2.5 py-1.5">
                      <span className="font-mono text-xs font-black text-[#F84464] tracking-wider">
                        {offer.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(offer.code)}
                        className="ml-2 text-gray-500 hover:text-[#F84464] transition-colors cursor-pointer"
                        title="Copy coupon code"
                      >
                        {copiedCode === offer.code ? (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Copied
                          </span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <button
                      onClick={() => setActiveModalOffer(offer)}
                      className="text-xs font-bold text-gray-800 hover:text-[#F84464] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-14 text-center border border-gray-100 shadow-xs max-w-xl mx-auto my-6">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">No Offers Found</h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              No promotions match your current search or partner filter. Try searching for a different bank or resetting your filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="bg-[#F84464] hover:bg-[#e03a58] text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-all cursor-pointer shadow-md shadow-red-500/25"
            >
              View All Offers
            </button>
          </div>
        )}
      </div>

      {/* 5. Offer Details & How-To-Avail Modal */}
      {activeModalOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveModalOffer(null)}
              className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase font-bold text-white bg-[#F84464] px-2 py-0.5 rounded-full">
                {activeModalOffer.tag}
              </span>
              <span className="text-xs text-gray-400 font-semibold">•</span>
              <span className="text-xs text-gray-500 font-bold">{activeModalOffer.bank}</span>
            </div>

            <h3 className="text-lg font-black text-gray-900 leading-tight mb-2">
              {activeModalOffer.title}
            </h3>

            <p className="text-xs text-gray-600 leading-relaxed mb-5">
              {activeModalOffer.description}
            </p>

            {/* Coupon Code Strip */}
            <div className="bg-red-50/70 border border-dashed border-[#F84464]/60 rounded-xl p-4 flex items-center justify-between mb-5">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase block">Coupon Code</span>
                <span className="font-mono text-base font-black text-[#F84464] tracking-wider">
                  {activeModalOffer.code}
                </span>
              </div>
              <button
                onClick={() => handleCopy(activeModalOffer.code)}
                className="bg-[#F84464] hover:bg-[#e03a58] text-white text-xs font-bold py-2 px-4 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                {copiedCode === activeModalOffer.code ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Details Table */}
            <div className="bg-gray-50 p-4 rounded-xl text-xs space-y-2 mb-5 border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Maximum Discount:</span>
                <span className="font-bold text-gray-900">{activeModalOffer.maxDiscount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Minimum Booking:</span>
                <span className="font-bold text-gray-900">{activeModalOffer.minBooking}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Eligible Days:</span>
                <span className="font-bold text-gray-900">{activeModalOffer.eligibleDays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Valid Until:</span>
                <span className="font-bold text-gray-900">{activeModalOffer.validTill}</span>
              </div>
            </div>

            {/* Steps to Avail */}
            <div className="mb-5">
              <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider mb-2.5">
                How to Avail this Offer
              </h4>
              <ol className="space-y-2 text-xs text-gray-600 list-decimal list-inside pl-1">
                <li>Select your movie, cinema, and preferred showtime.</li>
                <li>Pick your seats and proceed to the Checkout screen.</li>
                <li>Under the <strong>"Unlock Offers or Apply Promocodes"</strong> section, paste code <strong className="text-[#F84464]">{activeModalOffer.code}</strong>.</li>
                <li>Complete your transaction using an eligible {activeModalOffer.bank} card or UPI handle.</li>
              </ol>
            </div>

            {/* Terms & Conditions */}
            <div className="mb-6 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider mb-2">
                Terms &amp; Conditions
              </h4>
              <ul className="space-y-1.5 text-[11px] text-gray-500">
                {activeModalOffer.terms.map((term, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#F84464] font-bold">•</span>
                    <span>{term}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <button
              onClick={() => {
                handleCopy(activeModalOffer.code);
                setActiveModalOffer(null);
                navigate('/movies');
              }}
              className="w-full py-3 bg-[#F84464] hover:bg-[#e03a58] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-red-500/25 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Copy Code &amp; Explore Movies</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 6. Information & Trust Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 pt-10 border-t border-gray-200">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-[#F84464]/10 text-[#F84464] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900 tracking-tight">
                Are bank offers safe and guaranteed?
              </h4>
              <p className="text-xs text-gray-500 mt-1 max-w-xl">
                All bank partnerships are officially integrated through 256-bit encrypted payment gateways. Discounts 
                are instantly verified and deducted from your total booking amount.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/movies')}
            className="shrink-0 px-6 py-3 bg-[#333545] hover:bg-[#222432] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Browse Movies Now
          </button>
        </div>
      </div>

    </div>
  );
}
