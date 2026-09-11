import React from 'react';
import { Menu, QrCode, Building2, ExternalLink, ShieldCheck, Radio } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function CinemaPartnerTopbar({ onMenuToggle }) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-[#333545] border-b border-[#2b2d3c] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-md text-white">
      {/* Left: Mobile Menu + Cinema Network Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#F84464]/20 flex items-center justify-center text-[#F84464] border border-[#F84464]/30">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs font-bold text-gray-400 uppercase tracking-wider">
              Multiplex Ops
            </span>
            <span className="hidden sm:inline text-gray-500">/</span>
            <span className="text-xs sm:text-sm font-black text-white tracking-tight">
              {user?.businessName || 'BookMyShow Cinema Network'}
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-[#4ABD5D] bg-[#4ABD5D]/10 border border-[#4ABD5D]/20 px-2 py-0.5 rounded-full ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ABD5D] animate-ping" />
              Live Network
            </span>
          </div>
        </div>
      </div>

      {/* Right: Customer View Link + Gate Scanner + Partner Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Customer Site Preview Shortcut */}
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold border border-white/10 transition"
          title="Open Customer Front-facing App in New Tab"
        >
          <span>Customer View</span>
          <ExternalLink className="w-3 h-3 text-gray-400" />
        </Link>

        {/* Gate Scanner CTA */}
        <Link
          to="/cinema-partner/scanner"
          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold transition shadow-md shadow-[#F84464]/30 active:scale-95"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Gate Scanner</span>
        </Link>

        {/* User Profile Badge matching BookMyShow partner style */}
        <Link
          to="/cinema-partner/profile"
          className="flex items-center gap-2.5 pl-2.5 sm:pl-3 border-l border-white/10 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#F84464] to-[#c72c47] text-white flex items-center justify-center font-black text-xs shadow-sm border border-white/20">
            {user?.name ? user.name[0].toUpperCase() : 'P'}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-white leading-tight truncate max-w-[130px]">
              {user?.name || 'Cinema Partner'}
            </div>
            <div className="text-[10px] text-[#4ABD5D] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Verified Partner
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}

