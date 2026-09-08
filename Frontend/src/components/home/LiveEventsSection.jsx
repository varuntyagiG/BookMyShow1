import React from 'react';
import { Calendar, MapPin, ChevronRight } from 'lucide-react';

export default function LiveEventsSection({ events = [] }) {
  if (!events.length) return null;

  return (
    <section className="py-10 bg-[#F5F5FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              The Best Of Live Events
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Top concerts, comedy gigs, and experiences</p>
          </div>
          <button
            onClick={() => alert('Viewing all live events')}
            className="flex items-center gap-0.5 text-xs sm:text-sm font-semibold text-[#F84464] hover:underline cursor-pointer"
          >
            <span>See All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => alert(`Booking for ${event.title}`)}
              className="bg-white rounded-lg overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 group cursor-pointer flex flex-col"
            >
              {/* Event Image */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-semibold px-2 py-0.5 rounded-xs backdrop-blur-xs">
                  {event.category}
                </div>
              </div>

              {/* Event Info */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
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
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800">{event.price}</span>
                  <span className="text-xs font-semibold text-[#F84464] group-hover:underline">
                    Book Now
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

