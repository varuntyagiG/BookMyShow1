import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { contentApi, bookingApi } from '../services/api';
import { useCity } from '../context/CityContext';
import { Calendar, MapPin, Loader2, CheckCircle, X, Ticket, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const generateBookingId = () => 'BMS-' + Date.now().toString().slice(-6);

export default function CategoryPage() {
  const location = useLocation();
  const path = location.pathname.replace('/', '') || 'events'; // 'sports' | 'plays' | 'activities'
  const { selectedCity } = useCity();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [passCount, setPassCount] = useState(2);
  const [passTier, setPassTier] = useState('Standard');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [activeSubFilter, setActiveSubFilter] = useState('All');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const categoryMeta = {
    sports: {
      title: 'Sports Matches & Tournaments',
      desc: 'Cricket, Football, Kabaddi, and high-energy live stadium experiences',
      icon: '🏆',
      subFilters: ['All', 'Cricket', 'Football', 'Marathons', 'Esports'],
    },
    plays: {
      title: 'Plays & Theatre Shows',
      desc: 'Broadway musicals, classic theatre, drama, comedy plays, and stage performances',
      icon: '🎭',
      subFilters: ['All', 'Theatre', 'Comedy Drama', 'Musical', 'Classical'],
    },
    activities: {
      title: 'Fun Activities & Experiences',
      desc: 'Theme parks, gaming lounges, escape rooms, workshops, and weekend getaways',
      icon: '🎡',
      subFilters: ['All', 'Amusement Parks', 'Gaming', 'Workshops', 'Adventure'],
    },
  };

  const currentMeta = categoryMeta[path] || {
    title: `${path.charAt(0).toUpperCase() + path.slice(1)} in ${selectedCity}`,
    desc: 'Explore popular live experiences and activities near you',
    icon: '✨',
    subFilters: ['All'],
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setActiveSubFilter('All');
      try {
        const res = await contentApi.getCategoryItems(path, { city: selectedCity });
        if (res.success && res.items) {
          setItems(res.items);
        }
      } catch (err) {
        console.error('Error fetching category items:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [path, selectedCity]);

  const filteredItems = activeSubFilter === 'All'
    ? items
    : items.filter(item => {
        const matchText = `${item.title} ${item.category || ''}`.toLowerCase();
        return matchText.includes(activeSubFilter.toLowerCase());
      });

  const handleBook = (item) => {
    if (!isAuthenticated) {
      openAuthModal('signin');
      return;
    }
    setSelectedItem(item);
    setPassCount(2);
    setPassTier('Standard');
    setBookingConfirmed(false);
    setBookingError('');
    setBookingId(generateBookingId());
  };

  const handleConfirmBooking = async () => {
    if (!isAuthenticated) {
      openAuthModal('signin');
      return;
    }
    setBookingLoading(true);
    setBookingError('');
    try {
      const passes = Array.from({ length: passCount }, (_, i) => `${passTier.toUpperCase()}-${i + 1}`);
      const res = await bookingApi.createBooking({
        movieId: selectedItem.id || selectedItem._id || `cat-${Date.now()}`,
        movieTitle: selectedItem.title,
        theatreName: selectedItem.venue || `${path.toUpperCase()} Arena`,
        showtime: '06:30 PM',
        showDate: selectedItem.date || 'Upcoming',
        seats: passes,
        includeSnacks: false,
      });

      if (res.success && res.booking) {
        setBookingId(res.booking.bookingId);
        setBookingConfirmed(true);
      } else {
        setBookingError(res.message || 'Failed to book passes.');
      }
    } catch (err) {
      setBookingError(err.message || 'Unable to book passes. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Base numeric price parser
  const getBasePrice = (priceStr) => {
    if (!priceStr) return 499;
    const num = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) || num === 0 ? 499 : num;
  };

  const basePrice = selectedItem ? getBasePrice(selectedItem.price) : 499;
  const multiplier = passTier === 'VIP' ? 1.8 : 1;
  const unitPrice = Math.round(basePrice * multiplier);
  const totalAmount = unitPrice * passCount;

  return (
    <div className="bg-[#F5F5FA] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-[#F84464] border border-red-200/60 rounded-full text-xs font-bold mb-2 uppercase tracking-wider">
              <span>{currentMeta.icon}</span>
              <span>Explore {path}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight my-0">
              {currentMeta.title} in <span className="text-[#F84464]">{selectedCity}</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">{currentMeta.desc}</p>
          </div>

          {/* Subfilter chips */}
          {currentMeta.subFilters && currentMeta.subFilters.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {currentMeta.subFilters.map((sf) => (
                <button
                  key={sf}
                  onClick={() => setActiveSubFilter(sf)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeSubFilter === sf
                      ? 'bg-[#F84464] text-white shadow-md shadow-red-500/20'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {sf}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 shadow-xs">
            <Loader2 className="w-9 h-9 text-[#F84464] animate-spin mb-3" />
            <p className="text-xs font-bold text-gray-600">Discovering best {path} in {selectedCity}...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col group cursor-pointer"
                onClick={() => handleBook(item)}
              >
                {/* Image */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-black/75 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full backdrop-blur-xs shadow-sm">
                    {item.category || path.toUpperCase()}
                  </div>
                  <div className="absolute top-3 right-3 bg-[#F84464] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Popular</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#F84464] transition-colors line-clamp-1 tracking-tight">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-2.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#F84464] shrink-0" />
                      <span className="truncate">{item.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{item.venue}</span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase font-medium">Starting from</span>
                      <span className="text-xs sm:text-sm font-black text-gray-900">{item.price}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBook(item);
                      }}
                      className="bg-[#F84464] hover:bg-[#e03a58] text-white text-xs font-bold py-1.5 px-4 rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      Book Passes
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-xs">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">{currentMeta.icon}</span>
            </div>
            <p className="text-base font-bold text-gray-800">
              No {path} listed right now in {selectedCity}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Try switching your city to Mumbai, Delhi-NCR, or Bengaluru for more exciting listings.
            </p>
          </div>
        )}

      </div>

      {/* Booking Pass Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {!bookingConfirmed ? (
              <div>
                <span className="text-[10px] font-bold text-[#F84464] uppercase tracking-wider block mb-1">
                  BookPass Checkout
                </span>
                <h3 className="text-lg font-black text-gray-900 mb-1 leading-tight">{selectedItem.title}</h3>
                <p className="text-xs text-gray-500 mb-4">{selectedItem.venue} • {selectedItem.date}</p>

                {/* Tier Selection */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Pass Category
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPassTier('Standard')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        passTier === 'Standard'
                          ? 'border-[#F84464] bg-red-50/50 ring-2 ring-[#F84464]/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-xs text-gray-900">Standard Pass</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">₹{basePrice} / person</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPassTier('VIP')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        passTier === 'VIP'
                          ? 'border-[#F84464] bg-red-50/50 ring-2 ring-[#F84464]/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-xs text-[#F84464] flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>VIP Express</span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">₹{Math.round(basePrice * 1.8)} / person</div>
                    </button>
                  </div>
                </div>

                {/* Pass Quantity Selector */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Number of Passes
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setPassCount(num)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          passCount === num
                            ? 'bg-[#F84464] text-white shadow-md shadow-red-500/20 scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-gray-50 p-4 rounded-xl text-xs space-y-2 mb-5 border border-gray-100">
                  <div className="flex justify-between text-gray-600">
                    <span>{passTier} Pass × {passCount}:</span>
                    <span className="font-semibold text-gray-900">₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Booking Fee &amp; Taxes:</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery:</span>
                    <span className="font-semibold text-gray-900">Instant M-Pass (SMS/Email)</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 font-black text-sm">
                    <span className="text-gray-900">Total Payable:</span>
                    <span className="text-[#F84464] font-black">₹{totalAmount}</span>
                  </div>
                </div>

                {bookingError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold text-center">
                    {bookingError}
                  </div>
                )}

                <button
                  onClick={handleConfirmBooking}
                  disabled={bookingLoading}
                  className="w-full py-3 bg-[#F84464] hover:bg-[#e03a58] disabled:opacity-60 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-lg shadow-red-500/25 cursor-pointer flex items-center justify-center gap-2"
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing your reservation...</span>
                    </>
                  ) : (
                    <>
                      <Ticket className="w-4 h-4" />
                      <span>Pay ₹{totalAmount} &amp; Confirm Booking</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-2">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <CheckCircle className="w-8 h-8 text-green-600 animate-bounce" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-1">Pass Confirmed!</h3>
                <p className="text-xs text-gray-500 mb-4">
                  {passCount} {passTier} Pass(es) successfully booked for <strong>{selectedItem.title}</strong>
                </p>

                {/* Simulated Digital Pass Card */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 rounded-xl text-left text-xs space-y-2 mb-5 shadow-md">
                  <div className="flex justify-between items-center border-b border-gray-700/80 pb-2">
                    <span className="font-mono text-[#F84464] font-black tracking-wider text-sm">{bookingId}</span>
                    <span className="bg-[#F84464]/30 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {passTier.toUpperCase()} PASS
                    </span>
                  </div>
                  <p className="text-gray-300"><strong>Venue:</strong> {selectedItem.venue}</p>
                  <p className="text-gray-300"><strong>Date:</strong> {selectedItem.date}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-700/80 text-[11px]">
                    <span className="text-gray-400">Total Paid: ₹{totalAmount}</span>
                    <span className="text-green-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Entry Pass
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to="/my-bookings"
                    onClick={() => setSelectedItem(null)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
                  >
                    View in My Bookings
                  </Link>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="flex-1 py-2.5 bg-[#F84464] hover:bg-[#e03a58] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

