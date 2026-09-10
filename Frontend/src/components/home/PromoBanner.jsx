import React from 'react';
import { CreditCard, ArrowRight, Sparkles } from 'lucide-react';

export default function PromoBanner() {
  const bankPartners = ['ICICI Bank', 'HDFC Bank', 'Axis Bank', 'SBI Card', 'Kotak'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-gradient-to-r from-[#2B3148] via-[#353C54] to-[#2B3148] rounded-2xl p-6 sm:p-7 text-white flex flex-col lg:flex-row items-center justify-between gap-6 shadow-md border border-gray-700/40 relative overflow-hidden group">
        
        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#F84464]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
          <div className="w-13 h-13 rounded-2xl bg-[#F84464]/20 border border-[#F84464]/40 flex items-center justify-center shrink-0 shadow-inner">
            <CreditCard className="w-7 h-7 text-[#F84464]" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Special Bank Offers
              </span>
              <span className="bg-[#F84464] text-white text-[10px] font-bold px-2 py-0.2 rounded-full">
                UP TO 50% OFF
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Unlock Exclusive Movie Ticket Discounts &amp; Cashback
            </h4>
            <p className="text-xs text-gray-300 mt-1 max-w-xl">
              Enjoy Buy 1 Get 1 Free and up to ₹250 instant cashback with leading partner bank credit &amp; debit cards.
            </p>
            
            {/* Bank partner chips */}
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 flex-wrap">
              {bankPartners.map((bank) => (
                <span
                  key={bank}
                  className="bg-white/10 hover:bg-white/20 text-[10px] font-semibold text-gray-200 px-2 py-0.5 rounded border border-white/10 transition-colors"
                >
                  {bank}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => alert('BookMyShow Card Offers: 1. ICICI Coral/Rubyx (Buy 1 Get 1) | 2. HDFC Times Card (25% off) | 3. Axis Neo (10% off). Apply coupon at checkout!')}
          className="shrink-0 bg-[#F84464] hover:bg-[#e03a58] text-white text-xs font-bold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <span>View All Card Offers</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

