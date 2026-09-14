import React, { useState } from 'react';
import { Calendar, MapPin, ChevronRight, Sparkles, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function EventPassCard({ event, onClick }) {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  };

  const rotateX = isHovered ? (0.5 - mousePos.y) * 12 : 0;
  const rotateY = isHovered ? (mousePos.x - 0.5) * 12 : 0;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0.5, y: 0.5 });
      }}
      className="cursor-pointer select-none"
      style={{ perspective: '900px' }}
    >
      <motion.div
        animate={{
          rotateX,
          rotateY,
          scale: isHovered ? 1.03 : 1,
          y: isHovered ? -6 : 0,
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative bg-[#1A1D2B] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-black/40 border border-white/10 hover:border-[#F84464]/50 transition-all duration-300 flex flex-col"
      >
        {/* Holographic Rainbow Foil Sheen */}
        {isHovered && (
          <div
            className="pointer-events-none absolute inset-0 mix-blend-color-dodge opacity-60 z-20 transition-opacity duration-300"
            style={{
              background: `linear-gradient(${mousePos.x * 360}deg, rgba(255,0,128,0.2) 0%, rgba(0,255,255,0.2) 50%, rgba(255,215,0,0.2) 100%)`,
            }}
          />
        )}

        {/* Event Banner */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/40">
          <img
            src={event.imageUrl}
            alt={event.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div 
            className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md uppercase tracking-wider z-10 border border-white/10"
            style={{ transform: 'translateZ(25px)' }}
          >
            {event.category}
          </div>
        </div>

        {/* Event Info */}
        <div className="p-4.5 flex-1 flex flex-col justify-between" style={{ transform: 'translateZ(15px)' }}>
          <div>
            <h3 className="text-sm font-black text-white hover:text-[#F84464] transition-colors line-clamp-1 tracking-tight">
              {event.title}
            </h3>

            <div className="flex items-center gap-2 text-xs text-gray-300 mt-2.5 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-[#F84464] shrink-0" />
              <span className="truncate">{event.date}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-dashed border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-bold">Starts From</span>
              <span className="text-xs font-black text-white">{event.price}</span>
            </div>
            <span className="text-xs font-black text-white bg-gradient-to-r from-[#F84464] to-[#E03A58] px-3.5 py-1.5 rounded-xl transition-all shadow-[0_4px_12px_rgba(248,68,100,0.35)] flex items-center gap-1">
              <Ticket className="w-3 h-3" />
              <span>Book</span>
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LiveEventsSection({ events = [] }) {
  const navigate = useNavigate();
  if (!events.length) return null;

  return (
    <section className="py-12 bg-[#141414] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                The Best Of Live Events
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F84464]/20 border border-[#F84464]/30 text-[#F84464]">
                <Sparkles className="w-3 h-3" /> Popular
              </span>
            </div>
            <div className="w-10 h-1 bg-[#F84464] rounded-full mt-1.5" />
            <p className="text-xs text-gray-400 mt-1.5 font-medium">Top concerts, comedy gigs, live sports and theatrical performances</p>
          </div>
          <button
            onClick={() => navigate('/events')}
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#F84464] hover:text-[#e03a58] transition-colors cursor-pointer group"
          >
            <span>See All</span>
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* VIP Concert Experience Spotlight Banner */}
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-[#171328] via-[#21173b] to-[#120f24] p-5 sm:p-6 border border-purple-500/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-60 h-60 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-5 z-10">
            <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl overflow-hidden border border-purple-400/40 shadow-[0_0_20px_rgba(168,85,247,0.35)] relative group cursor-pointer">
              <img
                src="/assets/graphics/concert_vip_pass.jpg"
                alt="Holographic VIP Concert Pass"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-wider text-purple-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-purple-400/30 whitespace-nowrap">
                VIP Pass
              </span>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Festival Hologram Passes</span>
              </div>
              <h3 className="text-base sm:text-xl font-black text-white tracking-tight">
                Live Stadium Concerts &amp; Electronic Arenas
              </h3>
              <p className="text-xs text-purple-200/80 mt-1 max-w-xl">
                Get front-row stadium access, backstage lounge passes, and optical turnstile fast-track entry with verified digital festival passes.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/events')}
            className="shrink-0 bg-gradient-to-r from-purple-600 via-[#F84464] to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-black py-3 px-5 rounded-2xl transition-all shadow-[0_4px_18px_rgba(168,85,247,0.4)] active:scale-95 flex items-center gap-2 cursor-pointer z-10"
          >
            <span>Explore Live Concerts</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventPassCard
              key={event.id}
              event={event}
              onClick={() => navigate('/events')}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

