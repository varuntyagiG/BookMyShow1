import React from 'react';
import { Link, useLocation } from 'react-router-dom';

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
    { label: 'ListYourShow', badge: 'NEW' },
    { label: 'Corporates' },
    { label: 'Offers' },
    { label: 'Gift Cards' }
  ];

  return (
    <nav className="bg-[#222432] text-gray-300 text-xs border-t border-gray-800 hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-10">
          
          {/* Main Category Tabs */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className={`hover:text-white transition-colors cursor-pointer relative py-2 font-medium ${
                currentPath === '/' ? 'text-white' : 'text-gray-300'
              }`}
            >
              All
              {currentPath === '/' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F84464]" />
              )}
            </Link>

            {categories.map((cat) => {
              const isActive = currentPath === cat.path;
              return (
                <Link
                  key={cat.label}
                  to={cat.path}
                  className={`hover:text-white transition-colors cursor-pointer relative py-2 font-medium flex items-center gap-1.5 ${
                    isActive ? 'text-white font-semibold' : 'text-gray-300'
                  }`}
                >
                  <span>{cat.label}</span>
                  {cat.badge && (
                    <span className="px-1 py-0.2 bg-[#F84464] text-[9px] text-white rounded font-bold uppercase">
                      {cat.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F84464]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Utility Links */}
          <div className="flex items-center space-x-6">
            {utilityLinks.map((item) => (
              <button
                key={item.label}
                onClick={() => alert(`${item.label}: Exclusive offers and services partner portal.`)}
                className="hover:text-white transition-colors flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1 py-0.2 bg-[#F84464] text-[9px] text-white rounded font-bold uppercase">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

        </div>
      </div>
    </nav>
  );
}
