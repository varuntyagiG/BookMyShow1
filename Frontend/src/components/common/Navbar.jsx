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
  Crown,
  Sparkles,
  ArrowRight,
  Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCity } from '../../context/CityContext';
import { useNotification } from '../../context/NotificationContext';
import { Link, useNavigate } from 'react-router-dom';
import { playPop } from '../../utils/soundEffects';

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
      className={`sticky top-0 z-40 text-white select-none transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0E1019]/96 backdrop-blur-2xl shadow-[0_15px_35px_-10px_rgba(0,0,0,0.85)] border-b border-white/[0.08]'
          : 'bg-[#12141F]/94 backdrop-blur-2xl shadow-[0_12px_30px_-10px_rgba(0,0,0,0.5)] border-b border-white/[0.08]'
      }`}
    >
      
      {/* Theatrical Ambient Projector Laser Underglow Beam */}
      <div className="relative h-[1.5px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F84464]/85 to-transparent opacity-90 shadow-[0_0_15px_rgba(248,68,100,0.9)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ff5f7e] to-transparent animate-pulse opacity-75" />
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
                <span className="text-xl sm:text-[22px] font-extrabold tracking-tight text-white flex items-center transition-transform group-hover:scale-[1.01] leading-none">
                  book<span className="bg-gradient-to-r from-[#F84464] via-[#ff5f7e] to-[#F84464] bg-clip-text text-transparent">my</span>show
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 group-hover:text-slate-200 transition-colors mt-1">
                  CINEMA &bull; EXPERIENCES
                </span>
              </div>
            </Link>

            {/* Grand Omnisearch Capsule */}
            <div ref={searchBoxRef} className="relative flex-1 hidden sm:block max-w-xl">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div 
                  className={`relative flex items-center rounded-xl transition-all duration-300 backdrop-blur-md ${
                    searchFocused 
                      ? 'bg-white/[0.20] ring-2 ring-[#F84464]/70 border-transparent shadow-[0_0_25px_rgba(248,68,100,0.35)]' 
                      : 'bg-white/[0.10] hover:bg-white/[0.16] border border-white/20'
                  }`}
                >
                  <Search 
                    className={`absolute left-3.5 w-4 h-4 transition-colors pointer-events-none ${
                      searchFocused ? 'text-[#F84464]' : 'text-gray-300'
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
                    className="w-full pl-10 pr-14 py-2.5 bg-transparent text-white text-[13px] font-normal placeholder-slate-400 focus:outline-none transition-all"
                  />
                  
                  {/* Right side helper (clear and Ctrl+K shortcut) */}
                  <div className="absolute right-2.5 flex items-center gap-1.5">
                    {searchInput ? (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="p-1 text-gray-400 hover:text-white rounded-full cursor-pointer transition-colors"
                        title="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-white/10 border border-white/15 rounded-md select-none">
                        <span>Ctrl</span> K
                      </kbd>
                    )}
                  </div>
                </div>
              </form>

              {/* Suggestions Popup Dropdown */}
              {searchFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1B1D28]/98 backdrop-blur-2xl text-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border border-white/10 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-1.5 text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="flex items-center gap-1.5 text-[#F84464]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{searchInput ? 'Matching Results' : 'Trending Blockbusters & Events'}</span>
                    </span>
                    <span className="text-[9px] text-gray-500 font-normal">Esc to dismiss</span>
                  </div>

                  <div className="mt-1 divide-y divide-white/5 max-h-80 overflow-y-auto no-scrollbar">
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
                        className="w-full px-4 py-2.5 text-left hover:bg-white/[0.08] flex items-center justify-between text-xs cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#F84464]/15 border border-[#F84464]/30 flex items-center justify-center text-[#F84464] shrink-0 group-hover:scale-105 group-hover:bg-[#F84464]/25 transition-all">
                            <Film className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-gray-200 group-hover:text-white transition-colors block leading-snug">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {item.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-gray-300 font-semibold group-hover:bg-[#F84464]/20 group-hover:text-[#F84464] group-hover:border-[#F84464]/30 transition-all">
                            {item.type}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
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

            {/* City Selector Capsule with Animated Radar Beacon */}
            <button
              onClick={() => {
                playPop();
                setIsCityModalOpen(true);
              }}
              className="flex items-center gap-2 text-xs text-gray-100 hover:text-white transition-all cursor-pointer py-1.5 px-3 sm:px-3.5 rounded-full bg-white/[0.09] hover:bg-white/[0.18] border border-white/20 backdrop-blur-md active:scale-95 shadow-sm hover:border-[#F84464]/50 hover:shadow-[0_0_15px_rgba(248,68,100,0.2)]"
              title="Change City"
            >
              <div className="relative flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5 text-[#F84464]" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#F84464] rounded-full animate-ping" />
              </div>
              <span className="font-semibold text-slate-200 text-[13px]">{selectedCity}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
            </button>

            {/* Live Notification Bell */}
            <button
              onClick={() => {
                playPop();
                setIsOpenDrawer(true);
              }}
              className="relative p-2 text-gray-200 hover:text-white rounded-full bg-white/[0.09] hover:bg-white/[0.18] border border-white/20 backdrop-blur-md transition-all cursor-pointer active:scale-95 hover:border-[#F84464]/50"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-[#F84464] to-[#ff4767] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-[#F84464]/50 animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Smart M-Ticket Gate Pass Shortcut */}
            <Link
              to="/my-bookings"
              onClick={() => playPop()}
              className="hidden lg:flex items-center gap-1.5 text-[13px] sm:text-sm text-amber-300 hover:text-amber-100 transition-all cursor-pointer py-1.5 px-3.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 backdrop-blur-md active:scale-95 shadow-[0_0_12px_rgba(245,158,11,0.2)] group"
              title="View Digital M-Ticket & Gate Pass"
            >
              <Ticket className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span className="font-semibold text-[13px] sm:text-sm tracking-normal">M-Pass</span>
            </Link>

            {/* Auth Button or VIP Profile Avatar */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => {
                    playPop();
                    setUserDropdownOpen(!userDropdownOpen);
                  }}
                  className="flex items-center gap-2 py-1 px-1.5 sm:px-2.5 rounded-full bg-white/[0.09] hover:bg-white/[0.18] backdrop-blur-md transition-all cursor-pointer border border-white/20 active:scale-95 hover:border-[#F84464]/50 group"
                >
                  {/* Square-Curved Avatar Tile */}
                  <div className="relative">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-[#F84464] via-[#ff3b5c] to-[#e0183e] flex items-center justify-center text-white text-xs font-bold shadow-md ring-2 ring-[#F84464]/50 group-hover:ring-[#F84464] transition-all">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-black flex items-center justify-center shadow-xs">
                      <Crown className="w-1.5 h-1.5 text-black" />
                    </span>
                  </div>

                  <span className="text-[13px] sm:text-sm font-semibold max-w-[110px] truncate hidden md:inline text-slate-200 group-hover:text-white transition-colors">
                    {user?.name?.split(' ')[0] || 'Member'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-68 bg-[#1B1D28]/98 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] py-2 text-white border border-white/10 z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-white/10">
                    
                    {/* Header Banner */}
                    <div className="px-4 py-3.5 bg-gradient-to-b from-white/[0.06] to-transparent">
                      <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-1.5">
                        <Crown className="w-3.5 h-3.5" />
                        <span>BookMyShow Superstar Member</span>
                      </div>
                      <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
                    </div>

                    {/* Quick Access Links */}
                    <div className="py-2">
                      <Link
                        to="/my-bookings"
                        onClick={() => {
                          playPop();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-200 hover:bg-white/10 hover:text-[#F84464] cursor-pointer transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#F84464]/15 flex items-center justify-center text-[#F84464] group-hover:scale-110 transition-transform">
                          <Ticket className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1">
                          <span className="block font-bold">Your Orders &amp; Tickets</span>
                          <span className="text-[10px] text-gray-400 font-normal">Digital M-Pass &amp; QR Turnstile</span>
                        </div>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => {
                          playPop();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-200 hover:bg-white/10 hover:text-[#F84464] cursor-pointer transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-gray-300 group-hover:scale-110 transition-transform">
                          <Settings className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1">
                          <span className="block font-bold">Account &amp; Security</span>
                          <span className="text-[10px] text-gray-400 font-normal">Manage payment &amp; profile</span>
                        </div>
                      </Link>
                    </div>

                    {/* Sign Out Action */}
                    <div className="p-2">
                      <button
                        onClick={() => {
                          playPop();
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/15 rounded-xl cursor-pointer transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    playPop();
                    if (window.innerWidth > 640) {
                      e.preventDefault();
                      openAuthModal('signin');
                    } else {
                      navigate('/signin');
                    }
                  }}
                  className="bg-gradient-to-r from-[#F84464] via-[#ff4769] to-[#e03a58] hover:from-[#ff5274] hover:to-[#eb4363] text-white text-[13px] sm:text-sm font-bold px-5 py-2 rounded-xl transition-all shadow-[0_4px_16px_rgba(248,68,100,0.4)] hover:shadow-[0_6px_24px_rgba(248,68,100,0.6)] active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Sign In</span>
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 sm:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search movies, events, sports..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (onSearch) onSearch(e.target.value);
                }}
                className="w-full pl-10 pr-9 py-2.5 bg-white/[0.08] text-white text-[13px] font-normal rounded-xl placeholder-slate-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#F84464]/50"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 p-1 text-gray-400 hover:text-white"
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
