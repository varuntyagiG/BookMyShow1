import React, { useState, useEffect } from 'react';
import { contentApi } from '../services/api';
import { useCity } from '../context/CityContext';
import { Calendar, MapPin, Sparkles, CheckCircle, X, Loader2, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const generateEventBookingId = () => 'EVT-' + Date.now().toString().slice(-6);

export default function EventsPage() {
  const { selectedCity } = useCity();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ticketCount, setTicketCount] = useState(2);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState('');

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
    setBookingId(generateEventBookingId());
  };

  return (
    <div className="bg-[#F5F5FA] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight my-0">
              Live Events in {selectedCity}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Top music concerts, comedy specials, theatre, and sports live experiences
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#F84464] text-white shadow-md shadow-red-500/20'
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
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-xs">
            <Loader2 className="w-9 h-9 text-[#F84464] animate-spin mb-2.5" />
            <p className="text-xs text-gray-500 font-semibold">Discovering live events in {selectedCity}...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col group cursor-pointer"
                onClick={() => handleBookClick(event)}
              >
                {/* Image */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-black/75 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full backdrop-blur-xs shadow-sm">
                    {event.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#F84464] transition-colors line-clamp-1 tracking-tight">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-2.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#F84464] shrink-0" />
                      <span className="truncate">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                    {event.description && (
                      <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase font-medium">Starting from</span>
                      <span className="text-xs font-black text-gray-900">{event.price}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookClick(event);
                      }}
                      className="bg-[#F84464] hover:bg-[#e03a58] text-white text-xs font-bold py-1.5 px-4 rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      Book Pass
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-xs">
            <Sparkles className="w-9 h-9 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-bold text-gray-800">No events found in {selectedCity} for this category</p>
            <p className="text-xs text-gray-500 mt-1">Check back soon or explore other entertainment categories.</p>
          </div>
        )}

      </div>

      {/* Booking Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {!bookingConfirmed ? (
              <div>
                <span className="text-[10px] font-bold text-[#F84464] uppercase tracking-wider block mb-1">
                  Event Pass Booking
                </span>
                <h3 className="text-lg font-black text-gray-900 mb-1 leading-tight">{selectedEvent.title}</h3>
                <p className="text-xs text-gray-500 mb-5">{selectedEvent.venue} • {selectedEvent.date}</p>

                <div className="mb-5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                    Select Number of Passes
                  </label>
                  <div className="flex items-center gap-2.5">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setTicketCount(num)}
                        className={`w-10 h-10 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                          ticketCount === num
                            ? 'bg-[#F84464] text-white shadow-md shadow-red-500/20 scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl text-xs space-y-2 mb-6 border border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pass Type:</span>
                    <span className="font-bold text-gray-800">General Admission (Phase 1)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Unit Price:</span>
                    <span className="font-bold text-gray-800">{selectedEvent.price} / pass</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-sm">
                    <span>Total Passes:</span>
                    <span className="text-[#F84464] font-black">{ticketCount} Pass(es)</span>
                  </div>
                </div>

                <button
                  onClick={() => setBookingConfirmed(true)}
                  className="w-full py-3 bg-[#F84464] hover:bg-[#e03a58] text-white text-xs sm:text-sm font-extrabold rounded-xl transition-all shadow-lg shadow-red-500/25 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Confirm &amp; Book Passes</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-2">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <CheckCircle className="w-8 h-8 text-green-600 animate-bounce" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-1">Passes Confirmed!</h3>
                <p className="text-xs text-gray-500 mb-5">
                  {ticketCount} Pass(es) booked for <strong>{selectedEvent.title}</strong>
                </p>
                <div className="bg-gray-50 p-4 rounded-xl text-xs text-left text-gray-700 space-y-1.5 mb-6 border border-gray-100">
                  <p><strong>Venue:</strong> {selectedEvent.venue}</p>
                  <p><strong>Date &amp; Time:</strong> {selectedEvent.date}</p>
                  <p><strong>Booking ID:</strong> <span className="font-mono text-[#F84464] font-bold">{bookingId}</span></p>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="w-full py-2.5 bg-[#F84464] hover:bg-[#e03a58] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
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

