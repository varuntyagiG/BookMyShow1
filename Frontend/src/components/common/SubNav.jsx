import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { playPop } from '../../utils/soundEffects';
import { 
  Building2, 
  Tag, 
  Gift, 
  Film, 
  Sparkles, 
  Flame, 
  Star, 
  Crown, 
  ChevronRight, 
  Compass, 
  Calendar, 
  Tv, 
  Ticket, 
  Music, 
  Smile, 
  MapPin,
  Clapperboard,
  Coffee
} from 'lucide-react';

export default function SubNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const closeTimeoutRef = useRef(null);
  const subnavRef = useRef(null);

  // Scroll listener for dynamic transparent morphing
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = [
    { label: 'Movies', path: '/movies', menuKey: 'movies' },
    { label: 'Cinemas', path: '/cinemas', badge: 'VIP', menuKey: 'cinemas' },
    { label: 'Stream', path: '/stream', badge: 'NEW', menuKey: 'stream' },
    { label: 'Events', path: '/events', badge: 'HOT', menuKey: 'events' },
    { label: 'Plays', path: '/plays' },
    { label: 'Sports', path: '/sports' },
    { label: 'Activities', path: '/activities' },
  ];

  const utilityLinks = [
    { label: 'ListYourShow', path: '/vendor/signup', icon: Building2, highlight: true },
    { label: 'Offers', path: '/offers', icon: Tag },
    { label: 'Gift Cards', path: '/giftcards', icon: Gift }
  ];

  // Mouse hover buffer to prevent flicker during diagonal movement
  const handleMouseEnter = (menuKey) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (menuKey) {
      if (activeMegaMenu !== menuKey) {
        playPop();
      }
      setActiveMegaMenu(menuKey);
    }
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 220);
  };

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveMegaMenu(null);
    };
    const handleClickOutside = (e) => {
      if (subnavRef.current && !subnavRef.current.contains(e.target)) {
        setActiveMegaMenu(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav 
      ref={subnavRef}
      onMouseLeave={handleMouseLeave}
      className={`sticky top-[68px] z-30 select-none text-xs transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0A0C14]/96 backdrop-blur-2xl border-b border-white/[0.08] text-gray-200 shadow-[0_6px_25px_-5px_rgba(0,0,0,0.5)]'
          : 'bg-[#0E1018]/94 backdrop-blur-2xl border-b border-white/[0.08] text-gray-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.35)]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11">

          {/* Main Category Tabs with Horizontal Scroll on Mobile */}
          <div className="flex items-center space-x-7 overflow-x-auto no-scrollbar py-1">
            <Link
              to="/"
              onClick={() => {
                setActiveMegaMenu(null);
                playPop();
              }}
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
              const isHovered = activeMegaMenu === cat.menuKey;

              return (
                <div
                  key={cat.label}
                  onMouseEnter={() => handleMouseEnter(cat.menuKey)}
                  className="relative flex items-center"
                >
                  <Link
                    to={cat.path}
                    onClick={() => {
                      setActiveMegaMenu(null);
                      playPop();
                    }}
                    className={`hover:text-white transition-all cursor-pointer relative py-2 font-semibold shrink-0 flex items-center gap-1.5 ${
                      isActive || isHovered ? 'text-white font-black' : 'text-gray-300 hover:text-white'
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
                    {(isActive || isHovered) && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#F84464] to-[#ff6b85] rounded-full shadow-[0_0_12px_rgba(248,68,100,0.95)]" />
                    )}
                  </Link>
                </div>
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
                  onClick={() => {
                    setActiveMegaMenu(null);
                    playPop();
                  }}
                  className={`transition-all flex items-center gap-1.5 font-semibold cursor-pointer text-xs ${
                    item.highlight 
                      ? 'bg-white/[0.10] hover:bg-white/[0.18] border border-white/20 px-3 py-1 rounded-full text-gray-100 hover:text-white shadow-sm hover:border-[#F84464]/50 backdrop-blur-md' 
                      : (currentPath === item.path ? 'text-white font-black' : 'text-gray-300 hover:text-white')
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

      {/* ======================================================== */}
      {/* RICH CINEMA MEGA-MENUS (Option C: Theatrical Dock)       */}
      {/* ======================================================== */}

      {/* 1. MOVIES MEGA-MENU (4 Columns) */}
      {activeMegaMenu === 'movies' && (
        <div 
          onMouseEnter={() => handleMouseEnter('movies')}
          className="absolute top-full left-0 right-0 w-full bg-[#12141F]/98 backdrop-blur-2xl border-b border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.85)] py-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Glowing Top Accent Beam */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F84464]/70 to-transparent" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-12 gap-6 text-white">

              {/* Col 1: Now Showing Blockbusters (4 Cols) */}
              <div className="col-span-12 lg:col-span-5 pr-0 lg:pr-4 border-b lg:border-b-0 lg:border-r border-white/10 pb-4 lg:pb-0">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-300">
                    <Film className="w-3.5 h-3.5 text-[#F84464]" />
                    <span>Now Showing in Cinemas</span>
                  </div>
                  <Link
                    to="/movies"
                    onClick={() => { setActiveMegaMenu(null); playPop(); }}
                    className="text-[11px] font-bold text-[#F84464] hover:text-[#ff6b85] flex items-center gap-0.5 group"
                  >
                    <span>View All (24+)</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'm1', title: 'Dune: Part Two', rating: '9.4', format: 'IMAX 3D Laser', lang: 'English, Hindi', color: 'from-amber-500/20 to-orange-500/10' },
                    { id: 'm2', title: 'Kalki 2898 AD', rating: '9.1', format: 'Dolby Atmos', lang: 'Telugu, Hindi', color: 'from-blue-500/20 to-cyan-500/10' },
                    { id: 'm3', title: 'Stree 2: Sarkate Ka Aatank', rating: '9.3', format: 'Blockbuster', lang: 'Hindi', color: 'from-purple-500/20 to-rose-500/10' },
                    { id: 'm4', title: 'Deadpool & Wolverine', rating: '9.0', format: '4DX Motion', lang: 'English, Hindi', color: 'from-red-500/20 to-rose-500/10' },
                  ].map((m) => (
                    <Link
                      key={m.id}
                      to={`/movies/${m.id}`}
                      onClick={() => { setActiveMegaMenu(null); playPop(); }}
                      className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 hover:border-[#F84464]/50 transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-gray-300 group-hover:bg-[#F84464]/25 group-hover:text-[#F84464] transition-colors">
                            {m.format}
                          </span>
                          <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            <span>{m.rating}</span>
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-gray-100 group-hover:text-white line-clamp-1 leading-snug">
                          {m.title}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">{m.lang}</p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-[#F84464]">
                        <span>Book Seats</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Col 2: Advance Bookings & Anticipated (3 Cols) */}
              <div className="col-span-12 sm:col-span-6 lg:col-span-3 pr-0 lg:pr-4 border-b lg:border-b-0 lg:border-r border-white/10 pb-4 lg:pb-0">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-gray-300 mb-3.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Advance Bookings</span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { title: 'Pushpa 2: The Rule', date: 'Dec 05', status: 'Advance Booking Open', badge: 'Selling Fast' },
                    { title: 'Gladiator II', date: 'Nov 15', status: 'IMAX 70mm Exclusive', badge: 'Exclusive' },
                    { title: 'Joker: Folie à Deux', date: 'Oct 02', status: 'Musical Thriller', badge: 'Trending' },
                    { title: 'Singham Again', date: 'Diwali', status: 'Cop Universe Spectacle', badge: 'Mega Action' },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] transition-colors flex items-center justify-between group cursor-pointer"
                      onClick={() => {
                        setActiveMegaMenu(null);
                        playPop();
                        navigate('/movies');
                      }}
                    >
                      <div>
                        <span className="font-bold text-xs text-gray-200 group-hover:text-white block leading-tight">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-gray-400">{item.status}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {item.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Col 3: Languages & Filters (2 Cols) */}
              <div className="col-span-6 lg:col-span-2 pr-0 lg:pr-3 border-r border-white/10">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-gray-300 mb-3.5">
                  <Compass className="w-3.5 h-3.5 text-[#F84464]" />
                  <span>Languages</span>
                </div>

                <ul className="space-y-1.5">
                  {[
                    { name: 'Hindi Movies', count: '14' },
                    { name: 'English Movies', count: '10' },
                    { name: 'Telugu Movies', count: '8' },
                    { name: 'Tamil Movies', count: '6' },
                    { name: 'Malayalam Movies', count: '4' },
                    { name: 'Kannada Movies', count: '3' },
                  ].map((lang) => (
                    <li key={lang.name}>
                      <Link
                        to="/movies"
                        onClick={() => { setActiveMegaMenu(null); playPop(); }}
                        className="flex items-center justify-between text-xs text-gray-300 hover:text-white py-1 px-2 rounded-lg hover:bg-white/10 transition-colors group"
                      >
                        <span className="group-hover:translate-x-0.5 transition-transform">{lang.name}</span>
                        <span className="text-[10px] text-gray-500 group-hover:text-gray-300">{lang.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 4: Premium Formats & VIP Experiences (2 Cols) */}
              <div className="col-span-6 lg:col-span-2">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-gray-300 mb-3.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Experiences</span>
                </div>

                <div className="space-y-2">
                  {[
                    { name: 'IMAX 3D Laser', desc: 'Volumetric Audio & Ratio', color: 'text-amber-400' },
                    { name: '4DX Motion', desc: 'Rain, Fog & Dynamic Seats', color: 'text-rose-400' },
                    { name: 'Dolby Atmos', desc: '360° Object Acoustics', color: 'text-blue-400' },
                    { name: 'ScreenX 270°', desc: 'Tri-Screen Panoramic', color: 'text-emerald-400' },
                    { name: 'VIP Recliner', desc: 'Plush Leather & Butler Dining', color: 'text-purple-400' },
                  ].map((exp) => (
                    <Link
                      key={exp.name}
                      to="/movies"
                      onClick={() => { setActiveMegaMenu(null); playPop(); }}
                      className="block p-1.5 rounded-lg hover:bg-white/10 transition-colors group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${exp.color} bg-current`} />
                        <span className="font-bold text-xs text-gray-200 group-hover:text-white">
                          {exp.name}
                        </span>
                      </div>
                      <span className="text-[9px] text-gray-400 block pl-3">
                        {exp.desc}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 2. CINEMAS MEGA-MENU (3 Columns) */}
      {activeMegaMenu === 'cinemas' && (
        <div 
          onMouseEnter={() => handleMouseEnter('cinemas')}
          className="absolute top-full left-0 right-0 w-full bg-[#12141F]/98 backdrop-blur-2xl border-b border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.85)] py-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F84464]/70 to-transparent" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-white">

              {/* Col 1: Flagship Chains */}
              <div className="border-r border-white/10 pr-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-300 mb-3.5">
                  <Clapperboard className="w-3.5 h-3.5 text-[#F84464]" />
                  <span>Flagship Multiplex Chains</span>
                </div>
                <div className="space-y-2">
                  {[
                    { name: 'PVR INOX Cinemas', desc: "India's Premier Multiplex Giant", tag: '3,200+ Screens' },
                    { name: 'Cinepolis VIP', desc: 'Luxury Lounges & Gourmet Coffee Tree', tag: 'Luxury Tier' },
                    { name: 'MovieMax Multiplex', desc: 'Everyday Blockbuster Value & Dolby 4K', tag: 'Top Value' },
                    { name: 'Miraj Cinemas', desc: 'Comfortable Stadium Recliners', tag: 'Multiplex' },
                  ].map((c) => (
                    <Link
                      key={c.name}
                      to="/cinemas"
                      onClick={() => { setActiveMegaMenu(null); playPop(); }}
                      className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 block group transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white group-hover:text-[#F84464] transition-colors">{c.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-semibold">{c.tag}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">{c.desc}</p>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Col 2: Auditoriums */}
              <div className="border-r border-white/10 pr-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-300 mb-3.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Signature Formats & Screens</span>
                </div>
                <div className="space-y-2">
                  {[
                    { title: 'IMAX Laser Auditoriums', spec: 'Curved Silver Screen • 12-Channel Audio' },
                    { title: 'Insignia & Gold Class', spec: 'Butler-at-Seat Service & Plush Leather Loungers' },
                    { title: '4DX Motion Auditoriums', spec: 'Sensory Environmental Rain, Wind & Scent FX' },
                    { title: 'BigPix Giant Screen', spec: 'Ultra-bright High Lumen Laser Projection' },
                  ].map((s) => (
                    <Link
                      key={s.title}
                      to="/cinemas"
                      onClick={() => { setActiveMegaMenu(null); playPop(); }}
                      className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 block group transition-all"
                    >
                      <h4 className="font-bold text-xs text-gray-200 group-hover:text-amber-400 transition-colors">{s.title}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">{s.spec}</p>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Col 3: Services & Privileges */}
              <div>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-300 mb-3.5">
                  <Coffee className="w-3.5 h-3.5 text-[#F84464]" />
                  <span>Multiplex Services & Comfort</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { title: '🍿 Seat Delivery Concessions', desc: 'Pre-order hot buttered popcorn, nachos & Pepsi delivered directly to your recliner seat.' },
                    { title: '🎟️ Paperless M-Pass Turnstiles', desc: 'Skip the box office queue with instant contactless optical QR turnstile gate check-in.' },
                    { title: '♿ Accessibility & Assisted Hearing', desc: 'All flagship multiplexes feature wheelchair spaces and Dolby assisted audio headsets.' },
                  ].map((item) => (
                    <div key={item.title} className="p-2 rounded-lg bg-white/[0.03]">
                      <span className="font-bold text-xs text-white block">{item.title}</span>
                      <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 3. EVENTS MEGA-MENU (3 Columns) */}
      {activeMegaMenu === 'events' && (
        <div 
          onMouseEnter={() => handleMouseEnter('events')}
          className="absolute top-full left-0 right-0 w-full bg-[#12141F]/98 backdrop-blur-2xl border-b border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.85)] py-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F84464]/70 to-transparent" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-white">

              {/* Col 1: Live Concerts */}
              <div className="border-r border-white/10 pr-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-300 mb-3.5">
                  <Music className="w-3.5 h-3.5 text-[#F84464]" />
                  <span>Live Concerts & Festivals</span>
                </div>
                <div className="space-y-2">
                  {[
                    { title: 'Sunburn Arena ft. Alan Walker', city: 'Mumbai & Delhi', date: 'VIP Pass Available' },
                    { title: 'Arijit Singh: Grand Arena Tour', city: 'Bengaluru', date: 'Selling Fast' },
                    { title: 'NH7 Weekender Festival', city: 'Pune', date: 'Early Bird Pass' },
                  ].map((e) => (
                    <Link
                      key={e.title}
                      to="/events"
                      onClick={() => { setActiveMegaMenu(null); playPop(); }}
                      className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 block group transition-all"
                    >
                      <h4 className="font-bold text-xs text-white group-hover:text-[#F84464] transition-colors">{e.title}</h4>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                        <span>{e.city}</span>
                        <span className="font-semibold text-amber-400">{e.date}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Col 2: Comedy & Theater */}
              <div className="border-r border-white/10 pr-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-300 mb-3.5">
                  <Smile className="w-3.5 h-3.5 text-amber-400" />
                  <span>Standup Comedy & Theater</span>
                </div>
                <div className="space-y-2">
                  {[
                    { title: 'Zakir Khan: Live Special', venue: 'NCPA Auditorium', badge: 'Housefull' },
                    { title: 'Anubhav Singh Bassi Tour', venue: 'Siri Fort Auditorium', badge: 'Trending' },
                    { title: 'Mughal-e-Azam Musical Broadway', venue: 'JIO World Theatre', badge: 'Grand Show' },
                  ].map((c) => (
                    <Link
                      key={c.title}
                      to="/events"
                      onClick={() => { setActiveMegaMenu(null); playPop(); }}
                      className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 block group transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-white group-hover:text-amber-400 transition-colors">{c.title}</h4>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">{c.badge}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">{c.venue}</p>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Col 3: VIP Pass Privileges */}
              <div>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-300 mb-3.5">
                  <Ticket className="w-3.5 h-3.5 text-[#F84464]" />
                  <span>VIP Experience Passes</span>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Crown className="w-4 h-4" />
                    <span>Backstage & Lounge Privileges</span>
                  </div>
                  <p className="text-[10px] text-gray-300 leading-relaxed">
                    Exclusive hospitality credentials, dedicated VIP entry lanes, complimentary bar vouchers, and artist meet & greet credentials.
                  </p>
                  <Link
                    to="/events"
                    onClick={() => { setActiveMegaMenu(null); playPop(); }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F84464] hover:text-[#ff5274] pt-1"
                  >
                    <span>Browse VIP Passes</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 4. STREAM MEGA-MENU (Single Broad Showcase) */}
      {activeMegaMenu === 'stream' && (
        <div 
          onMouseEnter={() => handleMouseEnter('stream')}
          className="absolute top-full left-0 right-0 w-full bg-[#12141F]/98 backdrop-blur-2xl border-b border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.85)] py-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F84464]/70 to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F84464]/20 border border-[#F84464]/40 flex items-center justify-center text-[#F84464]">
                  <Tv className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>BookMyShow Stream Premieres</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-gradient-to-r from-[#F84464] to-[#ff5978] text-white font-black animate-pulse">NEW</span>
                  </h4>
                  <p className="text-xs text-gray-400">Rent or buy the latest cinema blockbusters directly on your Smart TV or mobile devices.</p>
                </div>
              </div>

              <Link
                to="/stream"
                onClick={() => { setActiveMegaMenu(null); playPop(); }}
                className="bg-gradient-to-r from-[#F84464] to-[#e03a58] hover:from-[#ff5274] hover:to-[#eb4363] text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-[0_4px_16px_rgba(248,68,100,0.4)] cursor-pointer shrink-0"
              >
                <span>Explore Stream Premieres</span>
              </Link>
            </div>
          </div>
        </div>
      )}

    </nav>
  );
}
