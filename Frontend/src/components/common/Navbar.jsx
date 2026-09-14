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
  ArrowRight
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
  const dropdownRef = useRef(null);
  const searchBoxRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  // Quick suggestions for BookMyShow search
  const quickSearches = [
    { title: 'Dune: Part Two', type: 'Movies', languages: 'English, Hindi', rating: '9.4', path: '/movies/m1' },
    { title: 'Kalki 2898 AD', type: 'Movies', languages: 'Telugu, Hindi', rating: '9.1', path: '/movies/m2' },
    { title: 'Stree 2: Sarkate Ka Aatank', type: 'Movies', languages: 'Hindi', rating: '9.3', path: '/movies/m3' },
    { title: 'Deadpool & Wolverine', type: 'Movies', languages: 'English, Hindi', rating: '9.0', path: '/movies/m4' },
    { title: 'Sunburn Arena ft. Alan Walker', type: 'Events', languages: 'Live Concert', rating: '9.8', path: '/events' },
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
    <header className="sticky top-0 z-40 bg-[#333545] text-white shadow-sm border-b border-gray-700/40 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4 sm:gap-6">

          {/* Left: Brand Logo & Search Bar */}
          <div className="flex items-center gap-6 sm:gap-8 flex-1 max-w-3xl">
            
            {/* BookMyShow Official Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0 group py-1">
              <div className="w-8 h-8 rounded-lg bg-[#F84464] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
                <Film className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center">
                book<span className="text-[#F84464]">my</span>show
              </span>
            </Link>

            {/* BookMyShow White Search Capsule */}
            <div ref={searchBoxRef} className="relative flex-1 hidden sm:block max-w-xl">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="relative flex items-center bg-white rounded-md border border-gray-200 shadow-xs focus-within:border-[#F84464] focus-within:ring-1 focus-within:ring-[#F84464] transition-all">
                  <Search className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search for Movies, Events, Plays, Sports and Activities"
                    value={searchInput}
                    onFocus={() => setSearchFocused(true)}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      if (onSearch) onSearch(e.target.value);
                    }}
                    className="w-full pl-10 pr-16 py-2 bg-transparent text-gray-800 text-xs placeholder-gray-400 focus:outline-none"
                  />
                  
                  {/* Right side helper (clear or Ctrl+K shortcut) */}
                  <div className="absolute right-2.5 flex items-center gap-1.5">
                    {searchInput ? (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="p-1 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer transition-colors"
                        title="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[9px] font-semibold text-gray-400 bg-gray-100 border border-gray-200 rounded select-none">
                        Ctrl K
                      </kbd>
                    )}
                  </div>
                </div>
              </form>

              {/* Suggestions Popup Dropdown */}
              {searchFocused && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-200 py-2.5 z-50 animate-in fade-in duration-100">
                  <div className="px-4 py-1 text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="flex items-center gap-1.5 text-[#F84464]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{searchInput ? 'Matching Results' : 'Trending Blockbusters'}</span>
                    </span>
                    <span className="text-[9px] text-gray-400 font-normal">Esc to close</span>
                  </div>

                  <div className="mt-1 divide-y divide-gray-100 max-h-72 overflow-y-auto no-scrollbar">
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
                        className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between text-xs cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded bg-red-50 border border-red-100 flex items-center justify-center text-[#F84464] shrink-0">
                            <Film className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800 group-hover:text-[#F84464] transition-colors block">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {item.languages}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold">
                          {item.type}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: City Selector, Notifications, Sign In / Profile */}
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">

            {/* City Selector Pill */}
            <button
              onClick={() => {
                playPop();
                setIsCityModalOpen(true);
              }}
              className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors cursor-pointer py-1 px-2.5 rounded hover:bg-white/10"
              title="Change City"
            >
              <MapPin className="w-3.5 h-3.5 text-[#F84464]" />
              <span className="font-medium">{selectedCity}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => {
                playPop();
                setIsOpenDrawer(true);
              }}
              className="relative p-1.5 text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 bg-[#F84464] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Auth Button or User Profile */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => {
                    playPop();
                    setUserDropdownOpen(!userDropdownOpen);
                  }}
                  className="flex items-center gap-2 py-1 px-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-gray-600"
                >
                  <div className="w-7 h-7 rounded-full bg-[#F84464] flex items-center justify-center text-white text-xs font-bold shadow-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-medium max-w-[100px] truncate hidden md:inline text-gray-200">
                    Hi, {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 text-gray-800 border border-gray-200 z-50 animate-in fade-in duration-100 divide-y divide-gray-100">
                    <div className="px-4 py-3 bg-gray-50 rounded-t-lg">
                      <div className="flex items-center gap-1.5 text-[10px] text-[#F84464] font-bold uppercase tracking-wider mb-1">
                        <Crown className="w-3.5 h-3.5" />
                        <span>BookMyShow Superstar</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/my-bookings"
                        onClick={() => {
                          playPop();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-[#F84464] cursor-pointer transition-colors"
                      >
                        <Ticket className="w-4 h-4 text-[#F84464]" />
                        <span>Your Orders &amp; Bookings</span>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => {
                          playPop();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-[#F84464] cursor-pointer transition-colors"
                      >
                        <Settings className="w-4 h-4 text-gray-400" />
                        <span>Accounts &amp; Settings</span>
                      </Link>
                    </div>

                    <div className="p-1">
                      <button
                        onClick={() => {
                          playPop();
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
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
                className="bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-semibold px-4 py-1.5 rounded-md transition-colors shadow-xs active:scale-95 cursor-pointer"
              >
                Sign In
              </button>
            )}

          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 sm:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative flex items-center bg-white rounded-md">
              <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search movies, events, sports..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (onSearch) onSearch(e.target.value);
                }}
                className="w-full pl-9 pr-8 py-2 text-gray-800 text-xs placeholder-gray-400 rounded-md focus:outline-none"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 p-1 text-gray-400 hover:text-gray-700"
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
