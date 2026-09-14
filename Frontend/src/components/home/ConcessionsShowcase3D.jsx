import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, UtensilsCrossed, ChevronRight, Check } from 'lucide-react';
import { playPop } from '../../utils/soundEffects';

export default function ConcessionsShowcase3D() {
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

  const rotX = isHovered ? (0.5 - mousePos.y) * 8 : 0;
  const rotY = isHovered ? (mousePos.x - 0.5) * 8 : 0;

  const handleAction = () => {
    playPop();
    navigate('/movies');
  };

  return (
    <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full" style={{ perspective: '1200px' }}>
      <div
        ref={cardRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setIsHovered(false);
          setMousePos({ x: 0.5, y: 0.5 });
        }}
        style={{
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(${isHovered ? 1.015 : 1}, ${isHovered ? 1.015 : 1}, 1)`,
          transformStyle: 'preserve-3d',
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="relative rounded-3xl bg-gradient-to-r from-[#171A29] via-[#22273C] to-[#171A29] p-6 sm:p-8 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 group select-none cursor-pointer"
        onClick={handleAction}
      >
        {/* Dynamic Specular Sheen */}
        {isHovered && (
          <div
            className="pointer-events-none absolute inset-0 z-30 mix-blend-overlay transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,255,255,0.3) 0%, transparent 60%)`,
            }}
          />
        )}

        {/* Ambient Warm Butter Glow */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#F84464]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Left Side: 3D Images Duo */}
        <div className="flex items-center gap-4 shrink-0 z-10" style={{ transform: isHovered ? 'translateZ(30px)' : 'translateZ(0px)', transition: 'transform 0.3s ease-out' }}>
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden p-1 bg-gradient-to-tr from-amber-400/40 via-white/20 to-[#F84464]/40 border border-white/20 shadow-[0_12px_28px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-500">
            <img
              src="/assets/graphics/concessions_combo.jpg"
              alt="Gourmet Cinema Concessions Combo"
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden p-1 bg-gradient-to-tr from-[#F84464]/40 via-white/20 to-amber-400/40 border border-white/20 shadow-[0_10px_24px_rgba(0,0,0,0.5)] -ml-6 sm:-ml-8 hidden sm:block group-hover:scale-105 transition-transform duration-500 delay-75">
            <img
              src="/assets/graphics/popcorn_tub_3d.jpg"
              alt="Fresh Golden Butter Popcorn Tub"
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
        </div>

        {/* Middle Content */}
        <div className="flex-1 text-center lg:text-left z-10" style={{ transform: isHovered ? 'translateZ(25px)' : 'translateZ(0px)', transition: 'transform 0.3s ease-out' }}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-2 shadow-xs">
            <UtensilsCrossed className="w-3 h-3" />
            <span>Multiplex Gourmet Dining</span>
          </div>

          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
            Grab a Bite • <span className="bg-gradient-to-r from-amber-300 via-rose-200 to-[#F84464] bg-clip-text text-transparent">Pre-Order Concessions</span>
          </h3>

          <p className="text-xs sm:text-sm text-gray-300 mt-1.5 max-w-xl leading-relaxed">
            Skip the lobby queues! Add hot caramel popcorn, crispy nachos with jalapeño cheese, and chilled beverages to your ticket for direct in-seat delivery.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-3 text-xs text-gray-300 font-semibold">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Check className="w-3.5 h-3.5" />
              <span>Up to 20% Online Savings</span>
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <Check className="w-3.5 h-3.5" />
              <span>Seat Delivery Ready</span>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Check className="w-3.5 h-3.5" />
              <span>100% Hygienic Multiplex Kitchens</span>
            </span>
          </div>
        </div>

        {/* Right CTA */}
        <div className="shrink-0 z-10" style={{ transform: isHovered ? 'translateZ(35px)' : 'translateZ(0px)', transition: 'transform 0.3s ease-out' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleAction();
            }}
            className="bg-gradient-to-r from-[#F84464] via-[#ff4769] to-[#E03A58] hover:from-[#ff5576] hover:to-[#eb4464] text-white text-xs sm:text-sm font-black py-3.5 px-6 rounded-2xl transition-all shadow-[0_8px_25px_rgba(248,68,100,0.5)] active:scale-95 flex items-center gap-2 cursor-pointer border border-white/20"
          >
            <span>Order with Tickets</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
}
