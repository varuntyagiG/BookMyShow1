import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Sparkles, AlertCircle, ShieldCheck, Ticket, Bell } from 'lucide-react';

export default function SignInPage() {
  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message || 'Invalid credentials');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await quickDemoLogin();
      if (res.success) {
        navigate('/');
      }
    } catch {
      setError('Demo login error');
    } finally {
      setLoading(false);
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
              <span className="text-3xl font-black tracking-tight text-gray-900">
                book<span className="text-[#F84464]">my</span>show
              </span>
            </Link>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Sign In to Your Account</h2>
            <p className="text-xs text-gray-500 mt-1">Access your tickets, saved movies, and faster checkout</p>
          </div>

          {/* Demo Login Button */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleDemo}
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-[#F84464] to-[#e03a58] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>1-Click Instant Demo Login (demo@bookmyshow.com)</span>
            </button>
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
              className="w-full py-3 bg-[#F84464] hover:bg-[#e03a58] text-white text-xs sm:text-sm font-black rounded-xl shadow-lg shadow-red-500/25 transition-all cursor-pointer mt-2 disabled:opacity-70 active:scale-[0.99]"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Switch to Sign Up */}
          <div className="mt-6 text-center text-xs text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#F84464] font-bold hover:underline">
              Create an Account
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

