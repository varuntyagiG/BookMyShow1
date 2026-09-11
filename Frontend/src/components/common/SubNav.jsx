import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function SubNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  const categories = [
    { label: 'Movies', path: '/movies' },
    { label: 'Cinemas', path: '/cinemas' },
    { label: 'Stream', path: '/stream', badge: 'NEW' },
    { label: 'Events', path: '/events' },
    { label: 'Plays', path: '/plays' },
    { label: 'Sports', path: '/sports' },
    { label: 'Activities', path: '/activities' },
  ];

  const utilityLinks = [
    { label: 'Gift Cards', path: '/giftcards' }
  ];

  return (
    <nav className="bg-[#222432] text-gray-300 text-xs border-t border-[#2d3042] sticky top-16 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-10">

          {/* Main Category Tabs with Horizontal Scroll on Mobile */}
          <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar py-1">
            <Link
              to="/"
              className={`hover:text-white transition-all cursor-pointer relative py-2 font-medium shrink-0 flex items-center ${currentPath === '/' ? 'text-white font-bold' : 'text-gray-300 hover:text-gray-100'
                }`}
            >
              <span>All</span>
              {currentPath === '/' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F84464] rounded-full shadow-[0_0_8px_#F84464]" />
              )}
            </Link>

            {categories.map((cat) => {
              const isActive = currentPath === cat.path;
              return (
                <Link
                  key={cat.label}
                  to={cat.path}
                  className={`hover:text-white transition-all cursor-pointer relative py-2 font-medium shrink-0 flex items-center gap-1.5 ${isActive ? 'text-white font-bold' : 'text-gray-300 hover:text-gray-100'
                    }`}
                >
                  <span>{cat.label}</span>
                  {cat.badge && (
                    <span className="px-1.5 py-0.2 bg-[#F84464] text-[9px] text-white rounded font-extrabold uppercase tracking-wider animate-pulse">
                      {cat.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F84464] rounded-full shadow-[0_0_8px_#F84464]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Utility Links (Desktop) */}
          <div className="hidden lg:flex items-center space-x-6 shrink-0">
            {utilityLinks.map((item) =>
              item.path ? (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`hover:text-white transition-colors flex items-center gap-1 font-medium cursor-pointer text-xs ${currentPath === item.path ? 'text-white font-bold' : 'text-gray-300 hover:text-white'
                    }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 bg-[#F84464] text-[9px] text-white rounded font-bold uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={() => alert(`${item.label}: Exclusive offers and services partner portal.`)}
                  className="hover:text-white transition-colors flex items-center gap-1 font-medium cursor-pointer text-gray-300 hover:text-white text-xs"
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 bg-[#F84464] text-[9px] text-white rounded font-bold uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
