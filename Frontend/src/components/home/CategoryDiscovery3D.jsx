import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight } from 'lucide-react';
import { playPop } from '../../utils/soundEffects';

function DiscoveryCard3D({ item }) {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setMousePos({ x, y });
  };

  const rotX = isHovered ? (0.5 - mousePos.y) * 14 : 0;
  const rotY = isHovered ? (mousePos.x - 0.5) * 14 : 0;

  const handleClick = () => {
    playPop();
    navigate(item.link);
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0.5, y: 0.5 });
      }}
      className="cursor-pointer select-none group"
      style={{ perspective: '800px' }}
    >
      <div
        ref={cardRef}
        style={{
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(${isHovered ? 1.04 : 1}, ${isHovered ? 1.04 : 1}, 1)`,
          transformStyle: 'preserve-3d',
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="relative p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-[#181A26] to-[#12141F] border border-white/10 hover:border-[#F84464]/60 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_40px_-10px_rgba(248,68,100,0.3)] transition-shadow duration-300 flex flex-col justify-between h-full overflow-hidden"
      >
        {/* Dynamic Specular Reflection */}
        {isHovered && (
          <div
            className="pointer-events-none absolute inset-0 z-30 mix-blend-overlay transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,255,255,0.4) 0%, transparent 60%)`,
            }}
          />
        )}

        {/* 3D Visual Asset Image Box */}
        <div 
          className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-black/40 border border-white/10 shadow-inner group-hover:scale-105 transition-transform duration-500"
          style={{ transform: isHovered ? 'translateZ(25px)' : 'translateZ(0px)', transition: 'transform 0.3s ease-out' }}
        >
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white text-[9px] font-black uppercase tracking-wider">
            {item.tag}
          </div>
        </div>

        {/* Card Typography & Actions */}
        <div style={{ transform: isHovered ? 'translateZ(20px)' : 'translateZ(0px)', transition: 'transform 0.3s ease-out' }}>
          <h4 className="text-sm font-black text-white group-hover:text-[#F84464] transition-colors leading-snug">
            {item.title}
          </h4>
          <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
            {item.subtitle}
          </p>

          <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-[#F84464]">
            <span>Explore</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>
    </div>
  );
}

export default function CategoryDiscovery3D() {
  const categories3D = [
    {
      title: 'Movies & IMAX',
      subtitle: 'Blockbusters & 4DX',
      tag: 'IN THEATRES',
      image: '/assets/graphics/clapperboard_3d.jpg',
      link: '/movies',
    },
    {
      title: 'Cinema Concessions',
      subtitle: 'Fresh Butter Popcorn',
      tag: 'GRAB A BITE',
      image: '/assets/graphics/popcorn_tub_3d.jpg',
      link: '/movies',
    },
    {
      title: 'Live Concerts',
      subtitle: 'Arena Shows & EDM',
      tag: 'STADIUM TOURS',
      image: '/assets/graphics/concert_guitar_3d.jpg',
      link: '/events',
    },
    {
      title: 'Stream 4K UHD',
      subtitle: 'Rent & Buy Premieres',
      tag: 'HOME CINEMA',
      image: '/assets/graphics/stream_screen_3d.jpg',
      link: '/stream',
    },
    {
      title: 'Superstar VIP',
      subtitle: 'Digital M-Tickets & Pass',
      tag: 'MEMBER LOUNGE',
      image: '/assets/graphics/superstar_card.jpg',
      link: '/my-bookings',
    },
  ];

  return (
    <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 bg-[#F84464] rounded-full shadow-[0_0_8px_rgba(248,68,100,0.8)]" />
          <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
            <span>Explore The Experience</span>
            <Sparkles className="w-4 h-4 text-[#F84464]" />
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
          Tap any 3D category for instant access
        </span>
      </div>

      {/* 5-Column Interactive 3D Discovery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4">
        {categories3D.map((item) => (
          <DiscoveryCard3D key={item.title} item={item} />
        ))}
      </div>
    </section>
  );
}
