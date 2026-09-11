import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Sparkles, Loader2, ArrowLeft, ShieldCheck, Shield, ArrowRight, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@bookmyshow.com');
  const [password, setPassword] = useState('password123');
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
        if (res.user?.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          setError('Access Denied: This account does not possess Platform Administrator rights.');
        }
      } else {
        setError(res.message || 'Invalid administrator credentials');
      }
    } catch (err) {
      setError(err.message || 'Login connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setEmail('admin@bookmyshow.com');
    setPassword('password123');
    setError('');
    setLoading(true);

    try {
      const res = await login('admin@bookmyshow.com', 'password123');
      if (res.success && res.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        setError(res.message || 'Demo admin login failed');
      }
    } catch (err) {
      setError(err.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-[#222432]">
      <div className="max-w-md w-full mx-auto">
        {/* Top Branding matching BookMyShow / B2B */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#F84464] flex items-center justify-center shadow-lg shadow-[#F84464]/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1 text-left">
              <span className="text-2xl font-black tracking-tight text-[#222432]">book</span>
              <span className="bg-[#F84464] text-white px-1.5 py-0.5 rounded text-[11px] font-black uppercase">my</span>
              <span className="text-2xl font-black tracking-tight text-[#222432]">show</span>
            </div>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F84464]/10 text-[#F84464] text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Platform Admin Control Hub
          </div>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Super Administrator governance, cinema partner lifecycle, global revenue &amp; operations
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-[#EEEEF2] p-7 sm:p-9 rounded-2xl shadow-[0_8px_30px_-8px_rgba(0,0,0,0.1)]">
          {/* Instant Demo Login Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleQuickDemo}
              disabled={loading}
              className="w-full py-3 px-4 bg-[#F84464] hover:bg-[#E03A58] text-white font-bold text-xs rounded-xl shadow-md shadow-[#F84464]/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>One-Click Admin Demo Login</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-gray-400">
                <span className="bg-white px-3 tracking-widest">Or sign in with admin credentials</span>
              </div>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-600 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Admin Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bookmyshow.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Master Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#333545] hover:bg-[#222432] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating Administrator...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#4ABD5D]" />
                  <span>Authenticate to Admin Console</span>
                </>
              )}
            </button>
          </form>

          {/* Additional info footer */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <Link to="/" className="text-[#F84464] font-semibold hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Customer Website</span>
            </Link>
            <Link to="/cinema-partner/login" className="text-gray-500 hover:text-[#222432] font-semibold">
              B2B Partner Hub →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

