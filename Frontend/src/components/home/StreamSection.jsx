import React, { useState } from 'react';
import { PlayCircle, Crown, ChevronRight, Tv, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function StreamCard({ item, onClick }) {
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
      className="cursor-pointer select-none pb-4"
      style={{ perspective: '1000px' }}
    >
      <motion.div
        animate={{
          rotateX,
          rotateY,
          scale: isHovered ? 1.03 : 1,
          y: isHovered ? -8 : 0,
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative bg-gradient-to-b from-[#1F2536] to-[#141724] rounded-2xl overflow-hidden border border-white/10 hover:border-[#F84464]/60 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.6)] hover:shadow-[0_25px_60px_-15px_rgba(248,68,100,0.35)] transition-shadow duration-300 flex flex-col"
      >
        {/* Steelbook Spine Highlight */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-r from-white/40 via-white/15 to-transparent z-20 pointer-events-none" />

        {/* Dynamic 3D Glare Sheen */}
        {isHovered && (
          <div
            className="pointer-events-none absolute inset-0 mix-blend-overlay z-20 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)`,
            }}
          />
        )}

        <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/60">
          <img
            src={item.imageUrl}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 bg-[#F84464] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-lg uppercase tracking-wider z-10">
            {item.badge}
          </div>

          {/* Floating 3D Play Button */}
          <div 
            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-all duration-300 backdrop-blur-[1px] ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transform: 'translateZ(25px)' }}
          >
            <div className="w-13 h-13 rounded-full bg-[#F84464] text-white flex items-center justify-center shadow-[0_0_20px_rgba(248,68,100,0.8)] transform scale-95 group-hover:scale-105 transition-transform">
              <PlayCircle className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between" style={{ transform: 'translateZ(15px)' }}>
          <div>
            <h3 className="text-base font-bold text-white hover:text-[#F84464] transition-colors truncate tracking-tight">
              {item.title}
            </h3>
            <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-gray-400 font-medium bg-white/5 px-2.5 py-0.5 rounded-md border border-white/5">
              {item.language}
            </span>
            <span className="text-xs font-black text-white bg-gradient-to-r from-[#F84464] to-[#E03A58] px-4 py-1.5 rounded-xl transition-all shadow-[0_4px_14px_rgba(248,68,100,0.4)]">
              Rent / Buy
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function StreamSection({ premieres = [] }) {
  const navigate = useNavigate();
  if (!premieres.length) return null;

  return (
    <section className="py-14 bg-gradient-to-b from-[#222738] via-[#1B1E2C] to-[#12141E] text-white relative overflow-hidden">
      {/* 3D Atmospheric Radial Glow */}
      <div className="pointer-events-none absolute -top-20 right-10 w-96 h-96 bg-[#F84464]/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Stream Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F84464] to-[#ff6b85] flex items-center justify-center text-white shadow-[0_6px_20px_rgba(248,68,100,0.45)] shrink-0">
              <PlayCircle className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white">Premieres</span>
                <span className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  <Crown className="w-3 h-3" /> STREAM EXCLUSIVE
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5 font-medium">
                Brand new cinematic releases delivered straight to your screen every Friday
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/stream')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#F84464] hover:text-white transition-colors cursor-pointer self-start sm:self-auto group px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
          >
            <Tv className="w-3.5 h-3.5 text-[#F84464]" />
            <span>Explore All on Stream</span>
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Premieres 3D Shelf Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
          {premieres.map((item) => (
            <StreamCard
              key={item.id}
              item={item}
              onClick={() => navigate('/stream')}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

