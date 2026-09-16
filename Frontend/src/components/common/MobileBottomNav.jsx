import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Film, Tv, Calendar, User, Ticket } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MobileBottomNav() {
  const location = useLocation();
  const { isAuthenticated, openAuthModal } = useAuth();

  // Do not display bottom nav inside admin or vendor pages
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/vendor')) {
    return null;
  }

  const navItems = [
    {
      label: 'Home',
      to: '/',
      icon: Home,
      exact: true,
    },
    {
      label: 'Movies',
      to: '/movies',
      icon: Film,
    },
    {
      label: 'Stream',
      to: '/stream',
      icon: Tv,
    },
    {
      label: 'Events',
      to: '/events',
      icon: Calendar,
    },
    {
      label: isAuthenticated ? 'Bookings' : 'Account',
      to: isAuthenticated ? '/my-bookings' : '#',
      icon: isAuthenticated ? Ticket : User,
      onClick: (e) => {
        if (!isAuthenticated) {
          e.preventDefault();
          openAuthModal('signin');
        }
      },
    },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 md:hidden pointer-events-auto">
      {/* Ambient Top Glow Line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#F84464]/40 to-transparent" />

      {/* Frosted Obsidian Glass Dock */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="bg-[#0E1018]/95 backdrop-blur-2xl border-t border-white/[0.08] px-2 py-2 flex items-center justify-around shadow-[0_-8px_25px_rgba(0,0,0,0.6)]"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}
      >
        {navItems.map((item) => {
          const isActive =
            item.exact
              ? location.pathname === item.to
              : item.to !== '#' && location.pathname.startsWith(item.to);

          const IconComponent = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={item.onClick}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 cursor-pointer select-none group ${
                isActive ? 'text-[#F84464]' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {/* Active Indicator Glow Pip */}
              {isActive && (
                <span className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-[#F84464] shadow-[0_0_8px_#F84464] animate-pulse" />
              )}

              <div
                className={`p-1 rounded-lg transition-transform duration-200 ${
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                }`}
              >
                <IconComponent
                  className={`w-5 h-5 transition-colors ${
                    isActive
                      ? 'stroke-[#F84464] drop-shadow-[0_0_8px_rgba(248,68,100,0.6)]'
                      : 'stroke-current'
                  }`}
                  strokeWidth={isActive ? 2.4 : 1.9}
                />
              </div>

              <span
                className={`text-[10px] tracking-tight transition-all duration-200 ${
                  isActive
                    ? 'font-bold text-[#F84464]'
                    : 'font-medium text-gray-400 group-hover:text-gray-200'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
