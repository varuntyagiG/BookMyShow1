import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, LogOut, Database, UserCheck, Plus, Film, ExternalLink } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminTopbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="h-16 bg-[#333545] border-b border-[#2B2D3C] sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
      {/* Left: Mobile hamburger & Database Status */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* BookMyShow Database Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#222432] border border-white/10 text-xs font-medium text-gray-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>MongoDB Atlas: <span className="text-emerald-400 font-semibold">Live & Synced</span></span>
        </div>
      </div>

      {/* Right: Quick Action + Profile & Logout */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/movies"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Movie</span>
        </Link>

        {/* User Card */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#222432] border border-white/10 text-xs text-white">
          <div className="w-7 h-7 rounded-full bg-[#F84464] flex items-center justify-center text-white font-black text-xs shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden md:block text-left">
            <p className="font-bold leading-tight text-white">{user?.name || 'Super Admin'}</p>
            <p className="text-[10px] text-gray-300 font-mono">{user?.email}</p>
          </div>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-black bg-[#F84464]/30 text-[#F84464] uppercase tracking-wider border border-[#F84464]/30">
            Admin
          </span>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          title="Sign out of Admin Panel"
          className="p-2 rounded-xl bg-[#222432] hover:bg-red-500/20 hover:text-red-300 border border-white/10 text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">Logout</span>
        </button>
      </div>
    </header>
  );
}
