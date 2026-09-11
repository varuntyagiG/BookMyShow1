import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Store,
  Film,
  Calendar,
  Ticket,
  TrendingUp,
  Tag,
  MapPin,
  BarChart3,
  ShieldAlert,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
  Sparkles
} from 'lucide-react';

const SECTIONS = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, end: true },
    ]
  },
  {
    title: 'Platform Management',
    items: [
      { name: 'Customers', path: '/admin/customers', icon: Users },
      { name: 'Cinema Partners', path: '/admin/partners', icon: Building2 },
      { name: 'Multiplex Cinemas', path: '/admin/cinemas', icon: Store },
      { name: 'Movie Master', path: '/admin/movies', icon: Film },
      { name: 'Operating Cities', path: '/admin/cities', icon: MapPin },
    ]
  },
  {
    title: 'Operations',
    items: [
      { name: 'Shows Schedule', path: '/admin/shows', icon: Calendar },
      { name: 'All Bookings', path: '/admin/bookings', icon: Ticket },
    ]
  },
  {
    title: 'Commercial',
    items: [
      { name: 'Revenue & Settlements', path: '/admin/revenue', icon: TrendingUp },
      { name: 'Promotions & Offers', path: '/admin/offers', icon: Tag },
    ]
  },
  {
    title: 'Intelligence & Security',
    items: [
      { name: 'Compliance Reports', path: '/admin/reports', icon: BarChart3 },
      { name: 'Audit Trail', path: '/admin/audit-logs', icon: ShieldAlert },
      { name: 'Platform Settings', path: '/admin/settings', icon: Settings },
    ]
  }
];

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#333545] border-r border-[#2b2d3c] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl lg:shadow-none select-none`}
      >
        {/* Brand Header matching Customer Panel */}
        <div className="h-16 flex items-center justify-between px-5 bg-[#222432] border-b border-[#2b2d3c]">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-[#F84464] to-[#E03A58] flex items-center justify-center shadow-md shadow-[#F84464]/30 group-hover:scale-105 transition-transform">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center">
              <span className="text-lg font-black tracking-tight text-white flex items-center">
                book<span className="text-[#F84464]">my</span>show
              </span>
              <span className="ml-2 bg-[#F84464] text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
                Admin
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 no-scrollbar">
          {SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 text-[10px] font-black tracking-wider text-gray-400 uppercase select-none mb-1.5">
                {section.title}
              </div>

              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                        isActive
                          ? 'bg-[#F84464] text-white shadow-sm shadow-[#F84464]/30 font-black'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                              isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                            }`}
                          />
                          <span className="truncate">{item.name}</span>
                        </div>

                        {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-80" />}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Admin User Card */}
        <div className="p-3 bg-[#222432] border-t border-[#2b2d3c]">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#F84464]/20 text-[#F84464] border border-[#F84464]/30 flex items-center justify-center text-xs font-black shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {user?.name || 'Administrator'}
                </div>
                <div className="text-[10px] text-[#4ABD5D] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ABD5D]" />
                  Master Access
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
