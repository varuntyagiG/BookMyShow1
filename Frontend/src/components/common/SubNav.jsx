import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { playPop } from '../../utils/soundEffects';
import { Building2, Tag, Gift } from 'lucide-react';

export default function SubNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  const categories = [
    { label: 'Movies', path: '/movies' },
    { label: 'Cinemas', path: '/cinemas', badge: 'VIP' },
    { label: 'Stream', path: '/stream', badge: 'NEW' },
    { label: 'Events', path: '/events', badge: 'HOT' },
    { label: 'Plays', path: '/plays' },
    { label: 'Sports', path: '/sports' },
    { label: 'Activities', path: '/activities' },
  ];

  const utilityLinks = [
    { label: 'ListYourShow', path: '/vendor/signup', icon: Building2, highlight: true },
    { label: 'Offers', path: '/offers', icon: Tag },
    { label: 'Gift Cards', path: '/giftcards', icon: Gift }
  ];

  return (
    <nav className="bg-[#181A24]/95 backdrop-blur-xl text-gray-300 text-xs border-b border-white/[0.06] sticky top-[68px] z-30 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.35)] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11">

          {/* Main Category Tabs with Horizontal Scroll on Mobile */}
          <div className="flex items-center space-x-7 overflow-x-auto no-scrollbar py-1">
            <Link
              to="/"
              onClick={() => playPop()}
              className={`hover:text-white transition-all cursor-pointer relative py-2 font-semibold shrink-0 flex items-center ${
                currentPath === '/' ? 'text-white font-black' : 'text-gray-300 hover:text-white'
              }`}
            >
              <span>All</span>
              {currentPath === '/' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#F84464] to-[#ff6b85] rounded-full shadow-[0_0_12px_rgba(248,68,100,0.95)]" />
              )}
            </Link>

            {categories.map((cat) => {
              const isActive = currentPath === cat.path;
              return (
                <Link
                  key={cat.label}
                  to={cat.path}
                  onClick={() => playPop()}
                  className={`hover:text-white transition-all cursor-pointer relative py-2 font-semibold shrink-0 flex items-center gap-1.5 ${
                    isActive ? 'text-white font-black' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <span>{cat.label}</span>
                  {cat.badge && (
                    <span 
                      className={`px-1.5 py-0.5 text-[8.5px] rounded font-black uppercase tracking-wider shadow-xs ${
                        cat.badge === 'NEW' 
                          ? 'bg-gradient-to-r from-[#F84464] to-[#ff5978] text-white animate-pulse' 
                          : cat.badge === 'VIP' 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                          : 'bg-red-500/20 text-[#ff5978] border border-red-500/30'
                      }`}
                    >
                      {cat.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#F84464] to-[#ff6b85] rounded-full shadow-[0_0_12px_rgba(248,68,100,0.95)]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Utility Links (Desktop) */}
          <div className="hidden lg:flex items-center space-x-4 shrink-0">
            {utilityLinks.map((item) => {
              const Icon = item.icon;
              return item.path ? (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => playPop()}
                  className={`transition-all flex items-center gap-1.5 font-semibold cursor-pointer text-xs ${
                    item.highlight 
                      ? 'bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 px-3 py-1 rounded-full text-gray-200 hover:text-white shadow-xs hover:border-[#F84464]/50' 
                      : (currentPath === item.path ? 'text-white font-black' : 'text-gray-400 hover:text-white')
                  }`}
                >
                  {Icon && <Icon className={`w-3 h-3 ${item.highlight ? 'text-[#F84464]' : 'text-gray-400'}`} />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={() => alert(`${item.label}: Exclusive services portal.`)}
                  className="hover:text-white transition-colors flex items-center gap-1 font-semibold cursor-pointer text-gray-400 hover:text-white text-xs"
                >
                  {Icon && <Icon className="w-3 h-3 text-gray-400" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </nav>
  );
}
