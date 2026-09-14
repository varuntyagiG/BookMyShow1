import React, { useState } from 'react';
import { CreditCard, ArrowRight, Sparkles, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PromoBanner() {
  const bankPartners = ['ICICI Bank', 'HDFC Bank', 'Axis Bank', 'SBI Card', 'Kotak'];
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  };

  const rotateX = isHovered ? (0.5 - mousePos.y) * 16 : 0;
  const rotateY = isHovered ? (mousePos.x - 0.5) * 16 : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setIsHovered(false);
          setMousePos({ x: 0.5, y: 0.5 });
        }}
        className="bg-gradient-to-r from-[#202538] via-[#2B3248] to-[#1E2233] rounded-3xl p-6 sm:p-8 text-white flex flex-col lg:flex-row items-center justify-between gap-7 shadow-xl border border-white/10 relative overflow-hidden group select-none"
      >
        {/* Decorative background glow */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-[#F84464]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 flex-1">
          
          {/* 3D Photorealistic Superstar VIP Metal Card */}
          <div style={{ perspective: '800px' }} className="shrink-0">
            <motion.div
              animate={{
                rotateX,
                rotateY,
                scale: isHovered ? 1.08 : 1,
                y: isHovered ? -5 : 0,
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="w-52 h-32 sm:w-60 sm:h-36 rounded-2xl p-1 bg-gradient-to-tr from-amber-500/40 via-white/20 to-amber-300/40 border border-amber-400/30 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.6)] relative overflow-hidden group cursor-pointer"
            >
              {/* Card Image */}
              <img
                src="/assets/graphics/superstar_card.jpg"
                alt="BookMyShow Superstar VIP Card"
                className="w-full h-full object-cover rounded-[14px]"
              />

              {/* Dynamic Metallic Foil Glare Reflection */}
              {isHovered && (
                <div
                  className="pointer-events-none absolute inset-0 mix-blend-overlay z-10 transition-opacity duration-300 rounded-[14px]"
                  style={{
                    background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,255,255,0.7) 0%, transparent 65%)`,
                  }}
                />
              )}

              {/* Interactive Sparkle Tag */}
              <div 
                className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold text-amber-300 border border-amber-400/30 shadow-xs flex items-center gap-1 z-10"
                style={{ transform: 'translateZ(20px)' }}
              >
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                <span>VIP PASS</span>
              </div>
            </motion.div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
              <span className="text-xs uppercase font-black tracking-wider text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Special Bank Offers
              </span>
              <span className="bg-[#F84464] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                UP TO 50% OFF
              </span>
            </div>
            <h4 className="text-base sm:text-xl font-black text-white tracking-tight leading-snug">
              Unlock Exclusive Movie Ticket Discounts &amp; Instant Cashback
            </h4>
            <p className="text-xs text-gray-300 mt-1.5 max-w-xl leading-relaxed">
              Enjoy Buy 1 Get 1 Free and up to ₹250 instant savings with premier partner bank credit &amp; debit cards.
            </p>
            
            {/* Bank partner chips */}
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-4 flex-wrap">
              {bankPartners.map((bank) => (
                <span
                  key={bank}
                  className="bg-white/10 hover:bg-white/20 text-[10px] font-bold text-gray-200 px-2.5 py-1 rounded-lg border border-white/10 transition-colors shadow-2xs"
                >
                  {bank}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => alert('BookMyShow Card Offers: 1. ICICI Coral/Rubyx (Buy 1 Get 1) | 2. HDFC Times Card (25% off) | 3. Axis Neo (10% off). Apply coupon at checkout!')}
          className="shrink-0 bg-gradient-to-r from-[#F84464] to-[#E03A58] hover:from-[#ff5576] hover:to-[#eb4464] text-white text-xs font-black py-3.5 px-6 rounded-2xl transition-all shadow-[0_6px_20px_rgba(248,68,100,0.4)] hover:shadow-[0_10px_28px_rgba(248,68,100,0.55)] active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <span>View All Card Offers</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

