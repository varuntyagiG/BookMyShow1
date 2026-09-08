import React from 'react';
import { CreditCard, ArrowRight } from 'lucide-react';

export default function PromoBanner() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-gradient-to-r from-[#2B3148] via-[#3B4261] to-[#2B3148] rounded-xl p-5 sm:p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm border border-gray-700/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#F84464]/20 border border-[#F84464]/40 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6 text-[#F84464]" />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white">
              Unlock Exclusive Movie Ticket Offers &amp; Discounts
            </h4>
            <p className="text-xs text-gray-300 mt-0.5">
              Get up to 50% discount on credit/debit card transactions with our banking partners.
            </p>
          </div>
        </div>

        <button
          onClick={() => alert('Viewing partner card offers & discount coupons')}
          className="shrink-0 bg-[#F84464] hover:bg-[#e03a58] text-white text-xs font-bold py-2.5 px-5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>View Offers</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

