import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  LayoutDashboard,
  Building2,
  Film,
  Ticket,
  Tag,
  Landmark,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  Zap,
  Activity,
  ChevronRight
} from 'lucide-react';

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Executive Command' },
    { to: '/admin/vendors', icon: Building2, label: 'Cinema Partners KYC', badge: 'Verify' },
    { to: '/admin/movies', icon: Film, label: 'Film Registry CMS' },
    { to: '/admin/bookings', icon: Ticket, label: 'Universal Bookings' },
    { to: '/admin/offers', icon: Tag, label: 'Bank Deals & Promos' },
    { to: '/admin/settlements', icon: Landmark, label: 'Nodal Wire Ledger' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#0C0E14] text-gray-100 flex flex-col font-sans selection:bg-[#F84464] selection:text-white">
      {/* Top Operations Header */}
      <header className="bg-[#121620] border-b border-[#222738] sticky top-0 z-40 shadow-xl backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1C2132] transition"
              aria-label="Toggle Navigation"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <Link to="/admin/dashboard" className="flex items-center gap-2.5">
              <span className="text-2xl font-black tracking-tight text-white">
                book<span className="text-[#F84464]">my</span>trip
              </span>
              <span className="bg-gradient-to-r from-red-500/20 to-orange-500/20 text-[#F84464] border border-[#F84464]/30 text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Zap size={10} className="fill-current text-[#F84464]" />
                Super Admin
              </span>
            </Link>
          </div>

          {/* Quick Cross-Portal Switchers & Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white bg-[#1A1F2E] hover:bg-[#252C42] px-3 py-1.5 rounded-lg border border-[#2B344D] transition"
                title="Open Customer Frontstore"
              >
                <span>Storefront</span>
                <ExternalLink size={12} className="text-gray-400" />
              </Link>

              <Link
                to="/vendor/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white bg-[#1A1F2E] hover:bg-[#252C42] px-3 py-1.5 rounded-lg border border-[#2B344D] transition"
                title="Open Cinema Partner Portal"
              >
                <span>Partner Portal</span>
                <ExternalLink size={12} className="text-gray-400" />
              </Link>
            </div>

            {/* Admin identity pill */}
            <div className="hidden md:flex items-center gap-2.5 bg-[#171B28] border border-[#262D40] px-3 py-1.5 rounded-lg">
              <div className="w-7 h-7 rounded-full bg-[#F84464]/20 border border-[#F84464]/40 flex items-center justify-center text-[#F84464]">
                <ShieldCheck size={16} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-gray-200 leading-tight">
                  {admin?.name || 'Platform Admin'}
                </span>
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {admin?.email || 'admin@bookmytrip.com'}
                </span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition border border-transparent hover:border-rose-500/20"
              title="Terminate Admin Session"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Operations Body Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        {/* Desktop Operations Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-[#121620] rounded-2xl border border-[#222738] shadow-xl p-4 sticky top-24">
            <div className="px-3 py-2 mb-2 flex items-center justify-between">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                Operations Menu
              </p>
              <Activity size={12} className="text-emerald-400 animate-pulse" />
            </div>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-[#F84464] text-white shadow-lg shadow-[#F84464]/25 ring-1 ring-white/20'
                          : 'text-gray-300 hover:bg-[#1A1F2E] hover:text-white'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <Icon size={17} className={isActive ? 'text-white' : 'text-gray-400'} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge ? (
                          <span
                            className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                              isActive ? 'bg-white text-[#F84464]' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {item.badge}
                          </span>
                        ) : (
                          <ChevronRight size={14} className={isActive ? 'text-white' : 'text-gray-600'} />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* Platform Security Badge */}
            <div className="mt-8 p-3.5 rounded-xl bg-[#161B28] border border-[#252D40]">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-200">
                <ShieldCheck className="text-emerald-400" size={15} />
                <span>Nodal Security Layer</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                PCI-DSS & RBI compliant nodal escrow disburse protocol active.
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-[#121620] border-r border-[#222738] h-full shadow-2xl p-4 flex flex-col z-10">
              <div className="flex items-center justify-between pb-4 border-b border-[#222738]">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-base tracking-tight">Admin Operations</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1C2132] rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="mt-4 space-y-1.5 flex-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                          isActive
                            ? 'bg-[#F84464] text-white shadow-lg'
                            : 'text-gray-300 hover:bg-[#1A1F2E]'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={17} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
              <div className="pt-4 border-t border-[#222738]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl transition border border-rose-500/20"
                >
                  <LogOut size={16} />
                  <span>Terminate Session</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Page Outlet */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
