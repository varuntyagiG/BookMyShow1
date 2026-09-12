import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, LogOut, Ticket, Settings, MapPin, X, Film, Sparkles, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCity } from '../../context/CityContext';
import { useNotification } from '../../context/NotificationContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ onSearch }) {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { selectedCity, setIsCityModalOpen } = useCity();
  const { unreadCount, setIsOpenDrawer } = useNotification();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const dropdownRef = useRef(null);
  const searchBoxRef = useRef(null);
  const navigate = useNavigate();

  // Popular quick searches
  const quickSearches = [
    { title: 'Dune: Part Two', type: 'Movie', path: '/movies/m1' },
    { title: 'Kalki 2898 AD', type: 'Movie', path: '/movies/m2' },
    { title: 'Stree 2: Sarkate Ka Aatank', type: 'Movie', path: '/movies/m3' },
    { title: 'Deadpool & Wolverine', type: 'Movie', path: '/movies/m4' },
    { title: 'Sunburn Arena ft. Alan Walker', type: 'Event', path: '/events' },
  ];

  const filteredQuickSearches = searchInput.trim()
    ? quickSearches.filter((s) => s.title.toLowerCase().includes(searchInput.toLowerCase()))
    : quickSearches.slice(0, 3);

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
    <header className="sticky top-0 z-40 bg-[#333545] text-white shadow-md border-b border-[#2b2d3c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">

          {/* Brand Logo & Search */}
          <div className="flex items-center gap-4 sm:gap-8 flex-1 max-w-2xl">
            {/* BookMyShow Logo */}
            <Link to="/" className="flex items-center gap-1 shrink-0 group py-1">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center transition-transform group-hover:scale-[1.02]">
                book<span className="text-[#F84464]">my</span>show
              </span>
            </Link>

            {/* Global Search Bar with Live Suggestions Dropdown */}
            <div ref={searchBoxRef} className="relative flex-1 hidden sm:block">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search for Movies, Events, Plays, Sports and Activities"
                    value={searchInput}
                    onFocus={() => setSearchFocused(true)}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      if (onSearch) onSearch(e.target.value);
                    }}
                    className="w-full pl-10 pr-9 py-2 bg-white text-gray-900 text-xs rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F84464]/60 transition-all shadow-inner"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-2.5 p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </form>

              {/* Suggestions Popup */}
              {searchFocused && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white text-gray-800 rounded-lg shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-1.5 text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#F84464]" />
                    <span>{searchInput ? 'Matching Results' : 'Trending Searches'}</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {filteredQuickSearches.map((item) => (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => {
                          setSearchInput(item.title);
                          setSearchFocused(false);
                          if (onSearch) onSearch(item.title);
                          navigate(item.path);
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-red-50/60 flex items-center justify-between text-xs cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Film className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-semibold text-gray-800">{item.title}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
                          {item.type}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Actions: City Selector & Auth */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">

            {/* City Selector Button with Pin Icon */}
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="flex items-center gap-1.5 text-xs text-gray-200 hover:text-white transition-all cursor-pointer py-1.5 px-2.5 rounded-md hover:bg-white/10 active:scale-95"
              title="Select City"
            >
              <MapPin className="w-3.5 h-3.5 text-[#F84464]" />
              <span className="font-medium">{selectedCity}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {/* Real-time Notification Bell */}
            <button
              onClick={() => setIsOpenDrawer(true)}
              className="relative p-2 text-gray-200 hover:text-white rounded-full hover:bg-white/10 transition-all cursor-pointer active:scale-95"
              title="Real-time Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 bg-[#F84464] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Auth Button or User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-1 px-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer border border-white/10 active:scale-95"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#F84464] to-[#ff6b85] flex items-center justify-center text-white text-xs font-bold shadow-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold max-w-[100px] truncate hidden md:inline text-gray-100">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-gray-300" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-2xl py-2 text-gray-800 border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70 rounded-t-xl">
                      <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-bold text-gray-900 truncate mt-0.5">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

                    <div className="py-1.5">
                      <Link
                        to="/my-bookings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-[#F84464] cursor-pointer transition-colors"
                      >
                        <Ticket className="w-4 h-4 text-gray-400" />
                        <span>Your Orders &amp; Bookings</span>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-[#F84464] cursor-pointer transition-colors"
                      >
                        <Settings className="w-4 h-4 text-gray-400" />
                        <span>Accounts &amp; Settings</span>
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/signin"
                  onClick={(e) => {
                    if (window.innerWidth > 640) {
                      e.preventDefault();
                      openAuthModal('signin');
                    }
                  }}
                  className="text-xs font-semibold text-gray-200 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={(e) => {
                    if (window.innerWidth > 640) {
                      e.preventDefault();
                      openAuthModal('signup');
                    }
                  }}
                  className="bg-[#F84464] hover:bg-[#e03a58] text-white text-xs font-bold px-3.5 py-1.5 rounded-md transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer"
                >
                  Sign Up
                </Link>
              </div>
            )}

          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 sm:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for Movies, Events, Plays..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (onSearch) onSearch(e.target.value);
              }}
              className="w-full pl-9 pr-8 py-2 bg-white text-gray-900 text-xs rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#F84464]"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>

      </div>
    </header>
  );
}

