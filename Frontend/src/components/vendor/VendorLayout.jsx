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
    <div className="min-h-screen bg-[#F5F5FA] flex flex-col">
      {/* Top Partner Navigation Bar */}
      <header className="bg-[#333545] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-[#222432] transition"
              aria-label="Toggle Navigation"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <Link to="/vendor/dashboard" className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white">
                book<span className="text-[#F84464]">my</span>trip
              </span>
              <span className="bg-[#F84464] text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ml-1">
                Partner Portal
              </span>
            </Link>
          </div>

          {/* Business Name, Customer App Link & Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-white bg-[#222432] hover:bg-black/40 px-3 py-1.5 rounded-lg border border-gray-700 transition"
              title="Open Customer Portal in new tab"
            >
              <span>Customer App</span>
              <ExternalLink size={12} />
            </Link>

            <Link
              to="/vendor/scanner"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#F84464] hover:bg-[#d83552] px-3 py-1.5 rounded-lg shadow-sm transition"
            >
              <CheckCircle2 size={13} />
              <span>Gate Scanner</span>
            </Link>

            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-semibold text-white leading-tight">
                {partner?.businessName || partner?.name || 'Cinema Partner'}
              </span>
              <span className="text-[11px] text-emerald-400 flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Partner
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#222432] rounded-lg transition"
              title="Logout Partner Session"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body with Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sticky top-24">
            <div className="px-3 py-2 mb-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Operations Menu
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
                      `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                        isActive
                          ? 'bg-[#F84464] text-white shadow-sm'
                          : 'text-[#333545] hover:bg-gray-100 hover:text-black'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <Icon size={18} className={isActive ? 'text-white' : 'text-gray-500'} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isActive ? 'bg-white text-[#F84464]' : 'bg-emerald-100 text-emerald-700'
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
            <div className="mt-8 p-3 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
                <Shield className="text-[#F84464]" size={14} />
                <span>Partner Support</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                24x7 Box Office & Gate operations desk active.
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
