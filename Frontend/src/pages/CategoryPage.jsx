import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { contentApi } from '../services/api';
import { useCity } from '../context/CityContext';
import { Calendar, MapPin, Loader2, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CategoryPage() {
  const location = useLocation();
  const path = location.pathname.replace('/', '') || 'events'; // 'sports' | 'plays' | 'activities'
  const { selectedCity } = useCity();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const categoryTitles = {
    sports: { title: 'Sports Matches & Tournaments', desc: 'Cricket, Football, Kabaddi and live stadium sports' },
    plays: { title: 'Plays & Theatre Shows', desc: 'Broadway musicals, classic theatre, and dramatic performances' },
    activities: { title: 'Fun Activities & Experiences', desc: 'Theme parks, gaming arcades, escape rooms, and outdoor adventures' },
  };

  const currentMeta = categoryTitles[path] || {
    title: `${path.charAt(0).toUpperCase() + path.slice(1)} in ${selectedCity}`,
    desc: 'Explore popular experiences near you',
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
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

  const handleBook = (item) => {
    if (!isAuthenticated) {
      openAuthModal('signin');
      return;
    }
    setSelectedItem(item);
    setBookingConfirmed(false);
  };

  return (
    <div className="bg-[#F5F5FA] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight my-0">
            {currentMeta.title} in {selectedCity}
          </h1>
          <p className="text-xs text-gray-500 mt-1">{currentMeta.desc}</p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg">
            <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mb-2" />
            <p className="text-xs text-gray-500">Loading {path}...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-xs backdrop-blur-xs">
                    {item.category}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#F84464] transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{item.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{item.venue}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">{item.price}</span>
                    <button
                      onClick={() => handleBook(item)}
                      className="bg-[#F84464] hover:bg-[#e03a58] text-white text-xs font-bold py-1.5 px-3.5 rounded transition-colors cursor-pointer"
                    >
                      Book Tickets
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
            <p className="text-sm font-semibold text-gray-800">
              No {path} listed right now in {selectedCity}
            </p>
            <p className="text-xs text-gray-500 mt-1">Try switching to Mumbai or Delhi-NCR for more listings.</p>
          </div>
        )}

      </div>

      {/* Booking Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute right-4 top-4 p-1 text-gray-400 hover:text-gray-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            {!bookingConfirmed ? (
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{selectedItem.title}</h3>
                <p className="text-xs text-gray-500 mb-4">{selectedItem.venue} • {selectedItem.date}</p>
                <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1 mb-5">
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-bold text-[#F84464]">{selectedItem.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery:</span>
                    <span className="font-bold">Instant M-Ticket (SMS/Email)</span>
                  </div>
                </div>
                <button
                  onClick={() => setBookingConfirmed(true)}
                  className="w-full py-2.5 bg-[#F84464] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Confirm &amp; Proceed to Pay
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-900 mb-1">Booking Confirmed!</h3>
                <p className="text-xs text-gray-600 mb-4">You are all set for {selectedItem.title}!</p>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-full py-2 bg-[#F84464] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

