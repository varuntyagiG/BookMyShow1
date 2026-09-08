import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, User, LogOut, Ticket, Settings, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCity } from '../../context/CityContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ onSearch }) {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { selectedCity, setIsCityModalOpen } = useCity();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchInput);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#333545] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Search */}
          <div className="flex items-center gap-6 flex-1 max-w-2xl">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5 shrink-0 group">
              <span className="text-xl font-bold tracking-tight text-white flex items-center">
                book<span className="text-[#F84464]">my</span>show
              </span>
            </Link>

            {/* Global Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 hidden sm:block">
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for Movies, Events, Plays, Sports and Activities"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    if (onSearch) onSearch(e.target.value);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-white text-gray-900 text-xs rounded-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#F84464]"
                />
              </div>
            </form>
          </div>

          {/* Right Actions: City Selector & Auth */}
          <div className="flex items-center gap-4 shrink-0">
            
            {/* City Selector Button */}
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="flex items-center gap-1 text-xs text-gray-200 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded hover:bg-white/10"
              title="Select City"
            >
              <span>{selectedCity}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {/* Auth Button or User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-1 px-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-[#F84464] flex items-center justify-center text-white text-xs font-semibold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-medium max-w-[100px] truncate hidden md:inline">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-gray-300" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl py-2 text-gray-800 border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          alert('Bookings history: You have no active bookings yet.');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
                      >
                        <Ticket className="w-4 h-4 text-gray-500" />
                        <span>Your Orders &amp; Bookings</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          alert('Account profile: ' + (user?.email || ''));
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-gray-500" />
                        <span>Accounts &amp; Settings</span>
                      </button>
                    </div>

                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 cursor-pointer"
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
                    // Also support popup modal on click
                    if (window.innerWidth > 640) {
                      e.preventDefault();
                      openAuthModal('signin');
                    }
                  }}
                  className="text-xs font-medium text-gray-200 hover:text-white px-3 py-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={(e) => {
                    // Also support popup modal on click
                    if (window.innerWidth > 640) {
                      e.preventDefault();
                      openAuthModal('signup');
                    }
                  }}
                  className="bg-[#F84464] hover:bg-[#e03a58] text-white text-xs font-bold px-3.5 py-1.5 rounded transition-colors shadow-xs cursor-pointer"
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
              className="w-full pl-9 pr-4 py-2 bg-white text-gray-900 text-xs rounded-sm placeholder-gray-400 focus:outline-none"
            />
          </form>
        </div>

      </div>
    </header>
  );
}

