import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  Calendar,
  Ticket,
  Sparkles,
  Users,
  ExternalLink,
  ChevronRight,
  Clapperboard,
  Tv
} from 'lucide-react';

const SECTIONS = [
  {
    title: 'CINEMA MANAGEMENT',
    items: [
      { name: 'Console Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
      { name: 'Movie Catalog', path: '/admin/movies', icon: Film },
      { name: 'Theatres & Shows', path: '/admin/shows', icon: Calendar },
      { name: 'Customer Bookings', path: '/admin/bookings', icon: Ticket },
    ]
  },
  {
    title: 'LIVE EXPERIENCES',
    items: [
      { name: 'Events & Banners', path: '/admin/events', icon: Sparkles },
    ]
  },
  {
    title: 'ENTERPRISE ACCESS',
    items: [
      { name: 'Users & Roles', path: '/admin/users', icon: Users },
    ]
  }
];

export default function AdminSidebar({ isOpen, setIsOpen }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#1F222E] border-r border-[#2B2D3C] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* BookMyShow Header Branding */}
        <div className="h-16 flex items-center justify-between px-5 bg-[#191B24] border-b border-[#2B2D3C]">
          <Link to="/admin" className="flex items-center gap-1.5 select-none group">
            <span className="text-lg font-black tracking-tighter text-white">book</span>
            <span className="bg-[#F84464] text-white px-1.5 py-0.5 rounded-md text-[11px] font-black tracking-wider uppercase shadow-md shadow-[#F84464]/30">my</span>
            <span className="text-lg font-black tracking-tighter text-white">show</span>
            <span className="ml-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-[#F84464]/20 text-[#F84464] border border-[#F84464]/30">
              Admin
            </span>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6">
          {SECTIONS.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 pb-1.5 text-[9px] font-extrabold uppercase tracking-wider text-gray-400">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                        isActive
                          ? 'bg-[#F84464] text-white shadow-md shadow-[#F84464]/25 font-bold'
                          : 'text-gray-300 hover:text-white hover:bg-white/[0.07]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Quick Launch Customer App */}
        <div className="p-3.5 bg-[#191B24] border-t border-[#2B2D3C]">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-[#F84464]/15 hover:border-[#F84464]/40 text-gray-300 hover:text-white text-xs font-medium border border-white/10 transition group"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#F84464]" />
              <span className="text-xs">Live Customer App</span>
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
              Live
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
}
