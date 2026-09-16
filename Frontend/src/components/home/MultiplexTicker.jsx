import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TICKER_ITEMS = [
  { icon: '🔥', text: '184 tickets booked across Mumbai & Delhi in the last 15 mins', highlight: 'Fast Filling' },
  { icon: '⚡', text: 'Stree 2: Sarkate Ka Aatank — 92% seats reserved for night shows', highlight: 'Blockbuster' },
  { icon: '👑', text: '42 Recliner VIP passes reserved in Bengaluru & Hyderabad', highlight: 'VIP Royale' },
  { icon: '🍿', text: '320 Popcorn & Pepsi combos pre-booked with 20% discount', highlight: 'Bestseller' },
  { icon: '🎟️', text: 'Instant M-Pass with QR turnstile entry active at 450+ multiplexes', highlight: 'Zero Queue' },
];

export default function MultiplexTicker() {
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % TICKER_ITEMS.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [dismissed]);

  if (dismissed) return null;

  const current = TICKER_ITEMS[index];

  return (
    <div className="w-full bg-[#181A26] border-b border-white/[0.08] relative overflow-hidden select-none">
      {/* Subtle top neon ambient glow */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#F84464]/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3 text-xs">
        
        {/* Left Live Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-extrabold text-[10px] tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE MULTIPLEX</span>
          </div>
        </div>

        {/* Center Animated Message */}
        <div className="flex-1 overflow-hidden flex items-center justify-center sm:justify-start h-5 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="flex items-center gap-2 truncate text-gray-300 font-medium text-[11px] sm:text-xs"
            >
              <span className="text-sm shrink-0">{current.icon}</span>
              <span className="truncate">{current.text}</span>
              <span className="hidden md:inline-flex items-center text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-[#F84464]/20 text-[#F84464] border border-[#F84464]/30 shrink-0">
                {current.highlight}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Dismiss Button */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-gray-500 hover:text-gray-300 p-1 rounded-md hover:bg-white/5 transition-colors shrink-0 cursor-pointer"
          title="Dismiss live ticker"
          aria-label="Dismiss live ticker"
        >
          <X className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
}
