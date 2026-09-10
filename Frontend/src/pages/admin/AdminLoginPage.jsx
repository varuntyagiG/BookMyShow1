import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, Mail, Loader2, ArrowLeft, AlertCircle, Film } from 'lucide-react';

export default function AdminLoginPage() {
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in as admin, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        if (res.user?.role === 'admin') {
          navigate('/admin');
        } else {
          setError('Access Denied: This account does not have Super Admin privileges.');
        }
      } else {
        setError(res.message || 'Invalid credentials.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = () => {
    setEmail('varuntyagi2004@gmail.com');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-[#1F222E] text-white flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Top bar back link */}
      <div className="relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-white transition px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Customer Store
        </Link>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md mx-auto my-auto py-8 relative z-10">
        {/* BookMyShow Brand Emblem */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-2 mb-2 select-none">
            <span className="text-3xl font-black tracking-tighter text-white">book</span>
            <span className="bg-[#F84464] text-white px-2.5 py-1 rounded-xl text-base font-black tracking-wider uppercase shadow-lg shadow-[#F84464]/30">
              my
            </span>
            <span className="text-3xl font-black tracking-tighter text-white">show</span>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#F84464]/20 text-[#F84464] border border-[#F84464]/30">
            Super Admin Console
          </span>
        </div>

        {/* White Card Container */}
        <div className="bg-white rounded-3xl p-7 sm:p-8 shadow-2xl text-[#222432] border border-gray-100">
          <h2 className="text-xl font-black tracking-tight text-[#222432]">Admin Authentication</h2>
          <p className="text-xs text-gray-500 mt-1 mb-6">
            Sign in to manage movies, live shows, seat reservations, and revenue.
          </p>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs font-medium leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bookmyshow.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#222432] text-xs font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-1 focus:ring-[#F84464] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Secret Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[#222432] text-xs font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-1 focus:ring-[#F84464] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-[#F84464] hover:bg-[#E03A58] disabled:opacity-50 text-white text-xs font-black tracking-wider uppercase transition-all shadow-lg shadow-[#F84464]/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <span>Authenticate Admin Session</span>
              )}
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col items-center">
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="text-xs text-gray-500 hover:text-[#F84464] transition font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#F84464]" />
              Auto-fill Seeded Super Admin Credentials
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-[11px] text-gray-400 relative z-10">
        BookMyShow Cinema Partner Platform &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
}
