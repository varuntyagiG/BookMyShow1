import React from 'react';
import { Calendar, MapPin, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LiveEventsSection({ events = [] }) {
  const navigate = useNavigate();
  if (!events.length) return null;

  return (
    <section className="py-12 bg-[#F5F5FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                The Best Of Live Events
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-[#F84464]">
                <Sparkles className="w-3 h-3" /> Popular
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Top concerts, comedy gigs, live sports and theatrical performances</p>
          </div>
          <button
            onClick={() => navigate('/events')}
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#F84464] hover:text-[#e03a58] transition-colors cursor-pointer group"
          >
            <span>See All</span>
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => navigate('/events')}
              className="bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-xl border border-gray-100/80 transition-all duration-300 transform hover:-translate-y-1.5 group cursor-pointer flex flex-col"
            >
              {/* Event Image */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 bg-black/75 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs shadow-sm">
                  {event.category}
                </div>
              </div>

              {/* Event Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#F84464] transition-colors line-clamp-1 tracking-tight">
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
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-medium">Starts From</span>
                    <span className="text-xs font-extrabold text-gray-900">{event.price}</span>
                  </div>
                  <span className="text-xs font-bold text-[#F84464] bg-red-50 hover:bg-[#F84464] hover:text-white px-3 py-1 rounded-md transition-colors shadow-xs">
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

