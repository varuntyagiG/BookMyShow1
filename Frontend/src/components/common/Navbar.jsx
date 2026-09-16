import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  ChevronDown, 
  LogOut, 
  Ticket, 
  Settings, 
  MapPin, 
  X, 
  Film, 
  Bell, 
  User,
  Tag,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCity } from '../../context/CityContext';
import { useNotification } from '../../context/NotificationContext';
import { Link, useNavigate } from 'react-router-dom';
import { playPop } from '../../utils/soundEffects';

const getUserInitials = (name) => {
  if (!name || typeof name !== 'string') return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
};

export default function Navbar({ onSearch }) {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { selectedCity, setIsCityModalOpen } = useCity();
  const { unreadCount, setIsOpenDrawer } = useNotification();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const searchBoxRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  // Listen to scroll position for dynamic obsidian glass morphing
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Curated suggestions for the Grand Omnisearch
  const quickSearches = [
    { title: 'Dune: Part Two', type: 'IMAX 3D', category: 'Sci-Fi / Adventure', rating: '9.4', path: '/movies/m1' },
    { title: 'Kalki 2898 AD', type: 'Dolby Atmos', category: 'Mythological Sci-Fi', rating: '9.1', path: '/movies/m2' },
    { title: 'Stree 2: Sarkate Ka Aatank', type: 'Multiplex Blockbuster', category: 'Comedy / Horror', rating: '9.3', path: '/movies/m3' },
    { title: 'Deadpool & Wolverine', type: '4DX Laser', category: 'Action / Comedy', rating: '9.0', path: '/movies/m4' },
    { title: 'Sunburn Arena ft. Alan Walker', type: 'VIP Festival', category: 'Live Concert', rating: '9.8', path: '/events' },
  ];

  const filteredQuickSearches = searchInput.trim()
    ? quickSearches.filter((s) => s.title.toLowerCase().includes(searchInput.toLowerCase()))
    : quickSearches.slice(0, 4);

  // Global keyboard shortcut (Ctrl+K / Cmd+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchFocused(true);
      }
      if (e.key === 'Escape') {
        setSearchFocused(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchFocused(false);
    if (onSearch) {
      onSearch(searchInput);
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    if (onSearch) onSearch('');
  };

  return (
    <header 
      className={`sticky top-0 z-40 text-[#F5F5F7] select-none transition-all duration-300 ${
        isScrolled
          ? 'bg-[#20212B]/98 backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] border-b border-white/10'
          : 'bg-[#20212B] backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.25)] border-b border-white/10'
      }`}
    >
      
      {/* Subtle Refined Hairline Accent */}
      <div className="relative h-[1px] w-full overflow-hidden bg-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F84464]/30 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px] gap-4 sm:gap-6">

          {/* Left: Brand Identity & Grand Omnisearch */}
          <div className="flex items-center gap-6 sm:gap-8 flex-1 max-w-3xl">
            
            {/* BookMyShow High-Impact Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0 group py-1">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F84464] via-[#ff385c] to-[#e0183e] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(248,68,100,0.5)] group-hover:scale-105 transition-all duration-300 group-hover:shadow-[0_0_24px_rgba(248,68,100,0.7)]">
                  <Film className="w-4.5 h-4.5 text-white" />
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-xl sm:text-[22px] font-extrabold tracking-tight text-[#F5F5F7] flex items-center transition-transform group-hover:scale-[1.01] leading-none">
                  book<span className="bg-gradient-to-r from-[#F84464] via-[#ff5f7e] to-[#F84464] bg-clip-text text-transparent">my</span>show
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#A6A8B3] group-hover:text-[#F5F5F7] transition-colors mt-1">
                  CINEMA &bull; EXPERIENCES
                </span>
              </div>
            </Link>

            {/* Grand Omnisearch Capsule */}
            <div ref={searchBoxRef} className="relative flex-1 hidden sm:block max-w-xl">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div 
                  className={`relative flex items-center rounded-xl transition-all duration-200 ${
                    searchFocused 
                      ? 'bg-[#292B35] ring-2 ring-[#F84464]/70 border-transparent shadow-[0_0_15px_rgba(248,68,100,0.25)]' 
                      : 'bg-[#292B35] hover:bg-[#30333f] border border-white/10 hover:border-white/20'
                  }`}
                >
                  <Search 
                    className={`absolute left-3.5 w-4 h-4 transition-colors pointer-events-none ${
                      searchFocused ? 'text-[#F84464]' : 'text-[#A6A8B3]'
                    }`} 
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search for Movies, Events, Plays, Sports and Activities..."
                    value={searchInput}
                    onFocus={() => setSearchFocused(true)}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      if (onSearch) onSearch(e.target.value);
                    }}
                    className="w-full pl-10 pr-14 py-2.5 bg-transparent text-[#F5F5F7] text-[13px] font-normal placeholder-[#A6A8B3] focus:outline-none transition-all"
                  />
                  
                  {/* Right side helper (clear and Ctrl+K shortcut) */}
                  <div className="absolute right-2.5 flex items-center gap-1.5">
                    {searchInput ? (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="p-1 text-[#A6A8B3] hover:text-[#F5F5F7] rounded-full cursor-pointer transition-colors"
                        title="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-[#A6A8B3] bg-white/[0.06] border border-white/10 rounded-md select-none">
                        <span>Ctrl</span> K
                      </kbd>
                    )}
                  </div>
                </div>
              </form>

              {/* Suggestions Popup Dropdown */}
              {searchFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#20212B] backdrop-blur-2xl text-[#F5F5F7] rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border border-white/10 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-1.5 text-[10px] uppercase font-bold text-[#A6A8B3] tracking-wider flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="flex items-center gap-1.5 text-[#F84464]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{searchInput ? 'Matching Results' : 'Trending Blockbusters & Events'}</span>
                    </span>
                    <span className="text-[9px] text-[#A6A8B3] font-normal">Esc to dismiss</span>
                  </div>

                  <div className="mt-1 divide-y divide-white/10 max-h-80 overflow-y-auto no-scrollbar">
                    {filteredQuickSearches.map((item) => (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => {
                          setSearchInput(item.title);
                          setSearchFocused(false);
                          if (onSearch) onSearch(item.title);
                          playPop();
                          navigate(item.path);
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-[#292B35] flex items-center justify-between text-xs cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#F84464]/15 border border-[#F84464]/30 flex items-center justify-center text-[#F84464] shrink-0 group-hover:scale-105 group-hover:bg-[#F84464]/25 transition-all">
                            <Film className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-[#F5F5F7] group-hover:text-white transition-colors block leading-snug">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-[#A6A8B3]">
                              {item.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[#A6A8B3] font-semibold group-hover:bg-[#F84464]/20 group-hover:text-[#F84464] group-hover:border-[#F84464]/30 transition-all">
                            {item.type}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#A6A8B3] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Interactive Action Dock (Translucent Glass Beads) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            {/* Clean Location Selector Control */}
            <button
              type="button"
              onClick={() => {
                playPop();
                setIsCityModalOpen(true);
              }}
              className="flex items-center gap-2 text-xs text-[#F5F5F7] transition-all cursor-pointer py-1.5 px-3 sm:px-3.5 rounded-full bg-[#1F212A] hover:bg-[#252833] border border-white/10 hover:border-white/[0.18] shadow-none active:scale-95"
              title="Change City"
            >
              <MapPin className="w-3.5 h-3.5 text-[#F84464] shrink-0" />
              <span className="font-semibold text-[#F5F5F7] text-[13px]">{selectedCity}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#A6A8B3] shrink-0" />
            </button>

            {/* Live Notification Bell */}
            <button
              type="button"
              onClick={() => {
                playPop();
                setIsOpenDrawer(true);
              }}
              className="relative p-2 text-[#F5F5F7] hover:text-white rounded-full bg-[#292B35] hover:bg-[#323542] border border-white/10 hover:border-white/20 transition-all cursor-pointer active:scale-95 shadow-none"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#F84464] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Clean M-Pass Shortcut */}
            <Link
              to="/my-bookings"
              onClick={() => playPop()}
              className="hidden lg:flex items-center gap-1.5 text-[13px] sm:text-sm text-[#F5B800] transition-all cursor-pointer py-1.5 px-3.5 rounded-full bg-[#F5B800]/[0.07] hover:bg-[#F5B800]/[0.12] border border-[#F5B800]/40 hover:border-[#F5B800]/[0.55] shadow-none active:scale-95 group"
              title="View Digital M-Ticket & Gate Pass"
            >
              <Ticket className="w-3.5 h-3.5 text-[#F5B800] group-hover:rotate-12 transition-transform shrink-0" />
              <span className="font-semibold text-[13px] sm:text-sm tracking-normal">M-Pass</span>
            </Link>

            {/* Profile / Account Area (40-44px Circular Icon) */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    setUserDropdownOpen(!userDropdownOpen);
                  }}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#292B35] hover:bg-[#323542] border border-white/[0.12] hover:border-white/20 flex items-center justify-center text-[#F5F5F7] transition-all cursor-pointer shadow-none active:scale-95 shrink-0 overflow-hidden"
                  title="User Profile Menu"
                  aria-label="User Account Menu"
                  aria-expanded={userDropdownOpen}
                >
                  {user?.avatar || user?.profilePicture || user?.image ? (
                    <img
                      src={user.avatar || user.profilePicture || user.image}
                      alt={user?.name || 'User'}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-xs sm:text-sm font-bold tracking-tight text-[#F5F5F7] select-none">
                      {getUserInitials(user?.name)}
                    </span>
                  )}
                </button>

                {/* Redesigned Compact Profile Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-64 bg-[#20212B] rounded-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.25)] py-2 text-[#F5F5F7] z-50 animate-in fade-in zoom-in-95 duration-150">
                    
                    {/* User Header */}
                    <div className="px-4 py-3 border-b border-white/10">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#A6A8B3] mb-1">
                        Profile
                      </div>
                      <p className="text-sm font-bold text-[#F5F5F7] truncate">{user?.name || 'Customer'}</p>
                      <p className="text-xs text-[#A6A8B3] truncate mt-0.5">{user?.email || ''}</p>
                    </div>

                    {/* Navigation Links */}
                    <div className="py-1.5">
                      <Link
                        to="/my-bookings"
                        onClick={() => {
                          playPop();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-[#F5F5F7] hover:bg-[#292B35] transition-colors cursor-pointer"
                      >
                        <Ticket className="w-4 h-4 text-[#A6A8B3]" />
                        <span>My Bookings</span>
                      </Link>

                      <Link
                        to="/offers"
                        onClick={() => {
                          playPop();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-[#F5F5F7] hover:bg-[#292B35] transition-colors cursor-pointer"
                      >
                        <Tag className="w-4 h-4 text-[#A6A8B3]" />
                        <span>Offers &amp; Rewards</span>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => {
                          playPop();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-[#F5F5F7] hover:bg-[#292B35] transition-colors cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-[#A6A8B3]" />
                        <span>Account Settings</span>
                      </Link>
                    </div>

                    {/* Sign Out Action */}
                    <div className="border-t border-white/10 pt-1.5 px-2">
                      <button
                        type="button"
                        onClick={() => {
                          playPop();
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-[#292B35] hover:text-red-300 rounded-lg transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span>Sign Out</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            ) : (
              /* Logged-out State: Circular Profile Icon triggering existing Sign In flow */
              <button
                type="button"
                onClick={(e) => {
                  playPop();
                  if (window.innerWidth > 640) {
                    e.preventDefault();
                    openAuthModal('signin');
                  } else {
                    navigate('/signin');
                  }
                }}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#292B35] hover:bg-[#323542] border border-white/[0.12] hover:border-white/20 flex items-center justify-center text-[#F5F5F7] transition-all cursor-pointer shadow-none active:scale-95 shrink-0"
                title="Sign In"
                aria-label="Sign In to Account"
              >
                <User className="w-5 h-5 text-[#F5F5F7]" />
              </button>
            )}

          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 sm:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-[#A6A8B3] pointer-events-none" />
              <input
                type="text"
                placeholder="Search movies, events, sports..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (onSearch) onSearch(e.target.value);
                }}
                className="w-full pl-10 pr-9 py-2.5 bg-[#292B35] text-[#F5F5F7] text-[13px] font-normal rounded-xl placeholder-[#A6A8B3] border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#F84464]/50"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 p-1 text-[#A6A8B3] hover:text-[#F5F5F7]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>
        </div>

      </div>
    </header>
  );
}
