import React from 'react';
import { Menu, ExternalLink, ShieldCheck, Sparkles, Building2, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function AdminTopbar({ onMenuToggle }) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-[#333545] border-b border-[#2b2d3c] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-md text-white">
      {/* Left: Mobile Menu + Platform Context */}
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
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs font-bold text-gray-400 uppercase tracking-wider">
              Platform Master
            </span>
            <span className="hidden sm:inline text-gray-500">/</span>
            <span className="text-xs sm:text-sm font-black text-white tracking-tight">
              BookMyShow Governance HQ
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-[#4ABD5D] bg-[#4ABD5D]/10 border border-[#4ABD5D]/20 px-2.5 py-0.5 rounded-full ml-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ABD5D] animate-ping" />
              Live Ecosystem
            </span>
          </div>
        </div>
      </div>

      {/* Right: Cross-Panel Switches & Admin Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Customer Portal Shortcut */}
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold border border-white/10 transition"
          title="Preview Customer Facing Store"
        >
          <Store className="w-3.5 h-3.5 text-[#F84464]" />
          <span>Customer View</span>
          <ExternalLink className="w-3 h-3 text-gray-400 ml-0.5" />
        </Link>

        {/* B2B Partner Portal Shortcut */}
        <Link
          to="/cinema-partner"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold border border-white/10 transition"
          title="Inspect B2B Cinema Partner Hub"
        >
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          <span>B2B Hub</span>
          <ExternalLink className="w-3 h-3 text-gray-400 ml-0.5" />
        </Link>

        {/* Admin Profile Chip */}
        <div className="flex items-center gap-2.5 pl-2.5 sm:pl-3 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#F84464] to-[#c72c47] text-white flex items-center justify-center font-black text-xs shadow-sm border border-white/20">
            A
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-white leading-tight truncate max-w-[140px]">
              {user?.name || 'Administrator'}
            </div>
            <div className="text-[10px] text-[#F84464] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#4ABD5D]" />
              Super Admin
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

