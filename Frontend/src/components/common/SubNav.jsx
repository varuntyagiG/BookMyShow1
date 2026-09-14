import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { playPop } from '../../utils/soundEffects';

export default function SubNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  const categories = [
    { label: 'Movies', path: '/movies' },
    { label: 'Stream', path: '/stream', badge: 'NEW' },
    { label: 'Events', path: '/events' },
    { label: 'Plays', path: '/plays' },
    { label: 'Sports', path: '/sports' },
    { label: 'Activities', path: '/activities' },
  ];

  const utilityLinks = [
    { label: 'ListYourShow', path: '/vendor/signup' },
    { label: 'Offers', path: '/offers' },
    { label: 'Gift Cards', path: '/giftcards' }
  ];

  return (
    <nav className="bg-[#1F2533] text-gray-300 text-xs border-b border-gray-700/30 sticky top-16 z-30 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-10">

          {/* Main Category Tabs */}
          <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => {
              const isActive = currentPath === cat.path;
              return (
                <Link
                  key={cat.label}
                  to={cat.path}
                  onClick={() => playPop()}
                  className={`hover:text-white transition-colors cursor-pointer relative py-1.5 font-medium shrink-0 flex items-center gap-1.5 ${
                    isActive ? 'text-white font-semibold' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <span>{cat.label}</span>
                  {cat.badge && (
                    <span className="px-1.5 py-0.2 text-[8px] bg-[#F84464] text-white rounded font-bold uppercase tracking-wider">
                      {cat.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Utility Links (Desktop) */}
          <div className="hidden lg:flex items-center space-x-5 shrink-0 text-[11px]">
            {utilityLinks.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => playPop()}
                className="text-gray-300 hover:text-white transition-colors font-medium cursor-pointer"
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </nav>
  );
}
