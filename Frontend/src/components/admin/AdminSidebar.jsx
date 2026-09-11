import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Store,
  Film,
  Calendar,
  Ticket,
  TrendingUp,
  Tag,
  MapPin,
  BarChart3,
  ShieldAlert,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Shield,
  Radio
} from 'lucide-react';

const SECTIONS = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, end: true },
    ]
  },
  {
    title: 'PLATFORM CONTROL',
    items: [
      { name: 'Customers', path: '/admin/customers', icon: Users },
      { name: 'Cinema Partners', path: '/admin/partners', icon: Building2 },
      { name: 'Multiplex Cinemas', path: '/admin/cinemas', icon: Store },
      { name: 'Movie Master', path: '/admin/movies', icon: Film },
      { name: 'Cities', path: '/admin/cities', icon: MapPin },
    ]
  },
  {
    title: 'OPERATIONS',
    items: [
      { name: 'Shows Schedule', path: '/admin/shows', icon: Calendar },
      { name: 'All Bookings', path: '/admin/bookings', icon: Ticket },
    ]
  },
  {
    title: 'COMMERCIAL',
    items: [
      { name: 'Revenue & Payouts', path: '/admin/revenue', icon: TrendingUp },
      { name: 'Offers & Coupons', path: '/admin/offers', icon: Tag },
    ]
  },
  {
    title: 'INTELLIGENCE & AUDIT',
    items: [
      { name: 'Performance Reports', path: '/admin/reports', icon: BarChart3 },
      { name: 'Audit Trail', path: '/admin/audit-logs', icon: ShieldAlert },
      { name: 'Settings', path: '/admin/settings', icon: Settings },
    ]
  }
];

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#333545] border-r border-[#2b2d3c] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl lg:shadow-none select-none`}
      >
        {/* Brand Header matching BookMyShow partner sidebar */}
        <div className="h-16 flex items-center justify-between px-5 bg-[#222432] border-b border-[#2b2d3c]">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-[#F84464] to-[#e03a58] flex items-center justify-center shadow-md shadow-[#F84464]/30 group-hover:scale-105 transition-transform">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-black tracking-tight text-white">book</span>
                <span className="bg-[#F84464] text-white px-1 py-0.2 rounded text-[9px] font-black uppercase tracking-wider">
                  my
                </span>
                <span className="text-sm font-black tracking-tight text-white">show</span>
              </div>
              <div className="flex items-center gap-1 -mt-0.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#F84464]">
                  Platform Admin
                </span>
                <span className="text-[7.5px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-1 py-0.2 rounded">
                  HQ
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Global Control Status Chip */}
        <div className="px-4 py-2.5 bg-[#2b2d3c]/70 border-b border-[#2b2d3c] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-gray-300">
            <Radio className="w-3 h-3 text-[#4ABD5D] animate-pulse" />
            <span className="font-medium">Master Governance</span>
          </div>
          <span className="text-[9px] font-bold uppercase text-[#4ABD5D] bg-[#4ABD5D]/10 px-1.5 py-0.5 rounded border border-[#4ABD5D]/20">
            Root Mode
          </span>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 no-scrollbar">
          {SECTIONS.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 pb-1 text-[9px] font-black uppercase tracking-widest text-gray-400/90">
                {sec.title}
              </div>
              {sec.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-linear-to-r from-[#F84464] to-[#e03a58] text-white shadow-[0_4px_16px_rgba(248,68,100,0.4)] font-bold'
                          : 'text-gray-300 hover:text-white hover:bg-white/8'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 transition-transform group-hover:scale-110 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* System Telemetry & Admin Sign Out */}
        <div className="p-3 bg-[#222432] border-t border-[#2b2d3c] space-y-2">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-gray-300 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4ABD5D]" />
              <span className="font-medium text-gray-200">Cluster Security</span>
            </div>
            <span className="text-[9px] text-[#4ABD5D] font-bold">ACTIVE</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Administrator</span>
          </button>
        </div>
      </aside>
    </>
  );
}

