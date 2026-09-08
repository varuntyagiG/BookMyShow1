import React, { useState, useEffect } from 'react';
import { contentApi } from '../services/api';
import { useCity } from '../context/CityContext';
import { Calendar, MapPin, Filter, Sparkles, CheckCircle, X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function EventsPage() {
  const { selectedCity } = useCity();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ticketCount, setTicketCount] = useState(2);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const categories = ['All', 'Music Shows', 'Comedy Shows', 'Music Festival', 'Sports'];

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      try {
        const res = await contentApi.getCategoryItems('events', { city: selectedCity });
        if (res.success && res.items) {
          setEvents(res.items);
        }
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, [selectedCity]);

  const filteredEvents = activeCategory === 'All'
    ? events
    : events.filter(e => e.category?.toLowerCase() === activeCategory.toLowerCase());

  const handleBookClick = (event) => {
    if (!isAuthenticated) {
      openAuthModal('signin');
      return;
    }
    setSelectedEvent(event);
    setTicketCount(2);
    setBookingConfirmed(false);
  };

  return (
    <div className="bg-[#F5F5FA] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight my-0">
              Live Events in {selectedCity}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Top music concerts, comedy specials, theatre, and sports live experiences
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#F84464] text-white shadow-xs'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg">
            <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mb-2" />
            <p className="text-xs text-gray-500 font-medium">Discovering live events in {selectedCity}...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group"
              >
                {/* Image */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-xs backdrop-blur-xs">
                    {event.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#F84464] transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                    {event.description && (
                      <p className="text-[11px] text-gray-400 mt-2 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Starting from</span>
                      <span className="text-xs font-bold text-gray-900">{event.price}</span>
                    </div>
                    <button
                      onClick={() => handleBookClick(event)}
                      className="bg-[#F84464] hover:bg-[#e03a58] text-white text-xs font-bold py-1.5 px-3.5 rounded transition-colors cursor-pointer"
                    >
                      Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
            <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-800">No events found in {selectedCity} for this category</p>
            <p className="text-xs text-gray-500 mt-1">Check back soon or explore other entertainment categories.</p>
          </div>
        )}

      </div>

      {/* Booking Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute right-4 top-4 p-1 text-gray-400 hover:text-gray-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            {!bookingConfirmed ? (
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{selectedEvent.title}</h3>
                <p className="text-xs text-gray-500 mb-4">{selectedEvent.venue} • {selectedEvent.date}</p>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-700 mb-2">Select Number of Passes</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setTicketCount(num)}
                        className={`w-9 h-9 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                          ticketCount === num
                            ? 'bg-[#F84464] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1 mb-5">
                  <div className="flex justify-between">
                    <span>Entry Category:</span>
                    <span className="font-bold">General Admission (Phase 1)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pricing:</span>
                    <span className="font-bold text-[#F84464]">{selectedEvent.price} / pass</span>
                  </div>
                </div>

                <button
                  onClick={() => setBookingConfirmed(true)}
                  className="w-full py-2.5 bg-[#F84464] hover:bg-[#e03a58] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Confirm &amp; Book Passes
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3 animate-bounce" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">Event Pass Booked!</h3>
                <p className="text-xs text-gray-600 mb-4">
                  {ticketCount} Pass(es) confirmed for <strong>{selectedEvent.title}</strong>
                </p>
                <div className="bg-gray-50 p-3 rounded-lg text-xs text-left text-gray-700 mb-5">
                  <p><strong>Venue:</strong> {selectedEvent.venue}</p>
                  <p><strong>Date &amp; Time:</strong> {selectedEvent.date}</p>
                  <p><strong>Booking ID:</strong> EVT-{Math.floor(100000 + Math.random() * 900000)}</p>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
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

