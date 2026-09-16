import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVendorAuth } from '../context/VendorAuthContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { playPop } from '../utils/soundEffects';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Ticket,
  Bell,
  Building2,
  User,
  ArrowRight
} from 'lucide-react';

export default function SignInPage() {
  const { login, quickDemoLogin } = useAuth();
  const { login: vendorLogin } = useVendorAuth();
  const { login: adminLogin } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('customer'); // 'customer' | 'vendor' | 'admin'
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const emailLower = email.trim().toLowerCase();

      // 1. Admin login routing
      if (selectedRole === 'admin' || emailLower === 'admin@bookmyshow.com' || emailLower === 'admin@bookmytrip.com') {
        const res = await adminLogin(email, password);
        if (res.success) {
          navigate('/admin/dashboard');
          return;
        } else {
          setError(res.message || 'Admin authentication failed');
          setLoading(false);
          return;
        }
      }

      // 2. Cinema Partner login routing
      if (selectedRole === 'vendor' || emailLower === 'partner@bookmyshow.com' || emailLower === 'partner@cinemaworld.com') {
        const res = await vendorLogin(email, password);
        if (res.success) {
          navigate('/vendor/dashboard');
          return;
        } else {
          setError(res.message || 'Cinema partner login failed');
          setLoading(false);
          return;
        }
      }

      // 3. Customer login with smart fallbacks
      const res = await login(email, password);
      if (res.success) {
        navigate('/');
      } else {
        // Fallback for partner/admin credentials
        try {
          const vRes = await vendorLogin(email, password);
          if (vRes.success) {
            navigate('/vendor/dashboard');
            return;
          }
        } catch (_) {}

        try {
          const aRes = await adminLogin(email, password);
          if (aRes.success) {
            navigate('/admin/dashboard');
            return;
          }
        } catch (_) {}

        setError(res.message || 'Invalid credentials. Please check your email and password.');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChipSelect = (role) => {
    try { playPop(); } catch (_) {}
    setSelectedRole(role);
    setError('');

    if (role === 'customer') {
      setEmail('demo@bookmyshow.com');
      setPassword('password123');
    } else if (role === 'vendor') {
      setEmail('partner@bookmyshow.com');
      setPassword('password123');
    } else if (role === 'admin') {
      setEmail('admin@bookmyshow.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F5F5FA]">
      <div className="max-w-md w-full">
        
        {/* Main Card */}
        <div className="bg-white p-8 sm:p-9 rounded-2xl shadow-xl border border-gray-100">
          {/* Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-block mb-3">
              <span className="text-3xl font-extrabold tracking-tight text-gray-900">
                book<span className="text-[#F84464]">my</span>show
              </span>
            </Link>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Sign In to Your Account</h2>
            <p className="text-xs text-gray-500 mt-1">Access your tickets, saved movies, and faster checkout</p>
          </div>

          {/* Quick Role Demo Chips (Customer, Cinema Partner, Super Admin) */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Choose Account Role</span>
              </span>
              <span className="text-[9px] text-gray-400 font-semibold">Pre-fills Credentials</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleRoleChipSelect('customer')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedRole === 'customer'
                    ? 'bg-blue-50 border-blue-400 text-blue-800 shadow-xs'
                    : 'bg-gray-50/80 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold truncate">
                  <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">Customer</span>
                </div>
                <div className="text-[9px] text-gray-400 truncate mt-0.5">Tickets & Seats</div>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleRoleChipSelect('vendor')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedRole === 'vendor'
                    ? 'bg-[#F84464]/10 border-[#F84464]/50 text-[#F84464] shadow-xs'
                    : 'bg-gray-50/80 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold truncate">
                  <Building2 className="w-3.5 h-3.5 text-[#F84464] shrink-0" />
                  <span className="truncate">Partner</span>
                </div>
                <div className="text-[9px] text-gray-400 truncate mt-0.5">Multiplex Desk</div>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleRoleChipSelect('admin')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-xs'
                    : 'bg-gray-50/80 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold truncate">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">Admin</span>
                </div>
                <div className="text-[9px] text-gray-400 truncate mt-0.5">GMV & KYC</div>
              </button>
            </div>
          </div>

          {/* Error notice */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-600 font-medium animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#F84464]" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('For this demo version, you can sign in with any registered password or use the 1-Click Instant Demo Login button above.')}
                  className="text-[11px] text-[#F84464] hover:underline cursor-pointer font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#F84464] hover:bg-[#e03a58] text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-red-500/25 transition-all cursor-pointer mt-2 disabled:opacity-70 active:scale-[0.99]"
            >
              {loading
                ? 'Signing In...'
                : selectedRole === 'vendor'
                  ? 'Sign In as Cinema Partner'
                  : selectedRole === 'admin'
                    ? 'Sign In as Platform Admin'
                    : 'Sign In'}
            </button>
          </form>

          {/* Switch to Sign Up */}
          <div className="mt-6 text-center text-xs text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#F84464] font-bold hover:underline">
              Create an Account
            </Link>
          </div>

          {/* Cinema Partner Registration banner */}
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#F84464]/10 text-[#F84464]">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-gray-900 font-bold text-xs">Cinema Operator / Partner?</div>
                <div className="text-gray-500 text-[10px]">Register your multiplexes & screens</div>
              </div>
            </div>
            <Link
              to="/vendor/signup"
              className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-[#F84464] font-bold text-xs hover:bg-red-50 hover:border-[#F84464]/30 transition-all flex items-center gap-1 cursor-pointer shadow-xs shrink-0"
            >
              <span>Partner Sign Up</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Benefits Strip */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-2xs">
            <Ticket className="w-4 h-4 text-[#F84464] mx-auto mb-1" />
            <span className="text-[10px] font-bold text-gray-700 block">Instant M-Tickets</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#F84464] mx-auto mb-1" />
            <span className="text-[10px] font-bold text-gray-700 block">100% Safe Payments</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-2xs">
            <Bell className="w-4 h-4 text-[#F84464] mx-auto mb-1" />
            <span className="text-[10px] font-bold text-gray-700 block">Movie Alerts</span>
          </div>
        </div>

      </div>
    </div>
  );
}

