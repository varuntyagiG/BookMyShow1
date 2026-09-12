import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useVendorAuth } from '../../context/VendorAuthContext';
import {
  LayoutGrid,
  Film,
  Tv,
  Calendar,
  CheckCircle2,
  Ticket,
  TrendingUp,
  LogOut,
  ExternalLink,
  Menu,
  X,
  MapPin,
  Shield
} from 'lucide-react';

export default function VendorLayout() {
  const { partner, logout } = useVendorAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { to: '/vendor/dashboard', icon: LayoutGrid, label: 'Overview' },
    { to: '/vendor/cinemas', icon: MapPin, label: 'Cinemas & Venues' },
    { to: '/vendor/screens', icon: Tv, label: 'Screens & Layouts' },
    { to: '/vendor/movies', icon: Film, label: 'Movie Catalog' },
    { to: '/vendor/shows', icon: Calendar, label: 'Show Schedules' },
    { to: '/vendor/scanner', icon: CheckCircle2, label: 'Ticket Scanner', badge: 'Gate Live' },
    { to: '/vendor/bookings', icon: Ticket, label: 'Box Office Manifest' },
    { to: '/vendor/revenue', icon: TrendingUp, label: 'Revenue & Payouts' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/vendor/login');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col font-sans">
      {/* Top Partner Navigation Bar */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Toggle Navigation"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <Link to="/vendor/dashboard" className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white">
                book<span className="text-[#F84464]">my</span>trip
              </span>
              <span className="bg-gradient-to-r from-[#F84464] to-[#ff5e7e] text-white text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full ml-1 shadow-xs">
                Cinema Partner
              </span>
            </Link>
          </div>

          {/* Business Name, Customer App Link & Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live Sync Indicator */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Engine Connected</span>
            </div>

            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 px-3 py-1.5 rounded-xl border border-slate-700/80 transition"
              title="Open Customer Portal in new tab"
            >
              <span>Customer App</span>
              <ExternalLink size={12} />
            </Link>

            <Link
              to="/vendor/scanner"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#F84464] hover:bg-[#E23454] px-3.5 py-1.5 rounded-xl shadow-xs transition active:scale-95"
            >
              <CheckCircle2 size={13} />
              <span>Gate Scanner</span>
            </Link>

            <div className="hidden md:flex items-center gap-2.5 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {partner?.businessName ? partner.businessName.charAt(0).toUpperCase() : 'P'}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight max-w-[140px] truncate">
                  {partner?.businessName || partner?.name || 'Cinema Circuit'}
                </span>
                <span className="text-[10px] text-slate-400">
                  Verified Partner
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl transition"
              title="Logout Partner Session"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body with Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sticky top-24">
            <div className="px-3 py-2 mb-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Box Office Operations
              </p>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-[#F84464] to-[#ff5777] text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                              isActive ? 'bg-white text-[#F84464]' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* Quick Partner Support Box */}
            <div className="mt-8 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Shield className="text-[#F84464]" size={14} />
                <span>Partner Concierge</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                24x7 Box Office & Gate admission support desk active.
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Modal/Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl p-4 flex flex-col z-10">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <span className="font-bold text-gray-900 text-sm">Cinema Operations</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="mt-4 space-y-1 flex-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                          isActive
                            ? 'bg-[#F84464] text-white shadow-sm'
                            : 'text-[#333545] hover:bg-gray-100'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Page Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
