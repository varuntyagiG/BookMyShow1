import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, Sparkles, KeyRound } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const fillQuickCredentials = () => {
    setEmail('admin@bookmytrip.com');
    setPassword('Admin@123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Both email and password are required for admin authentication');
      return;
    }

    setSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.message || 'Invalid administrator credentials');
      }
    } catch (err) {
      setError(err.message || 'Platform authorization server unreachable');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-gray-100 flex flex-col justify-between selection:bg-[#F84464] selection:text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#F84464]/15 via-red-900/5 to-transparent blur-3xl pointer-events-none" />

      {/* Header bar */}
      <header className="px-6 py-5 max-w-7xl mx-auto w-full flex items-center justify-between relative z-10">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight text-white">
            book<span className="text-[#F84464]">my</span>trip
          </span>
          <span className="bg-[#1C2132] border border-[#2F364E] text-gray-300 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ml-1">
            Enterprise Root
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/vendor/login"
            className="text-xs font-semibold text-gray-400 hover:text-white transition"
          >
            Partner Portal &rarr;
          </Link>
          <Link
            to="/"
            className="text-xs font-semibold text-gray-400 hover:text-white transition"
          >
            Customer Front &rarr;
          </Link>
        </div>
      </header>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-[#121622] border border-[#23293C] rounded-3xl p-8 sm:p-10 shadow-2xl relative">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#F84464] to-orange-500 p-0.5 shadow-lg shadow-[#F84464]/20 mb-4 flex items-center justify-center">
                <div className="w-full h-full bg-[#121622] rounded-[14px] flex items-center justify-center">
                  <ShieldCheck size={28} className="text-[#F84464]" />
                </div>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Platform Operations
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Restricted access for BookMyTrip Super Administrators
              </p>
            </div>

            {/* Auto-fill Quick Test helper */}
            <div className="mb-6 p-3.5 rounded-2xl bg-[#181D2D] border border-[#283149] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <KeyRound size={16} className="text-[#F84464]" />
                <div className="text-left">
                  <p className="text-[11px] font-bold text-gray-200">Default Super Admin</p>
                  <p className="text-[10px] text-gray-400">admin@bookmytrip.com / Admin@123</p>
                </div>
              </div>
              <button
                type="button"
                onClick={fillQuickCredentials}
                className="text-[11px] font-bold text-[#F84464] hover:text-white bg-[#F84464]/10 hover:bg-[#F84464] px-2.5 py-1.5 rounded-lg border border-[#F84464]/20 transition"
              >
                Auto-fill
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-rose-400 text-xs leading-relaxed">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@bookmytrip.com"
                    className="w-full bg-[#181D2D] border border-[#2B344D] focus:border-[#F84464] focus:ring-1 focus:ring-[#F84464] text-white pl-10 pr-4 py-2.5 rounded-xl text-sm transition placeholder:text-gray-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Master Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#181D2D] border border-[#2B344D] focus:border-[#F84464] focus:ring-1 focus:ring-[#F84464] text-white pl-10 pr-4 py-2.5 rounded-xl text-sm transition placeholder:text-gray-600 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#F84464] to-[#ff5d7a] hover:from-[#d83552] hover:to-[#e64765] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#F84464]/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate Root Session</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-[#23293C] text-center">
              <p className="text-[11px] text-gray-500 flex items-center justify-center gap-1">
                <Sparkles size={12} className="text-amber-400" />
                Encrypted with 256-bit AES platform authorization
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-gray-600 relative z-10 border-t border-[#191F2F]">
        &copy; {new Date().getFullYear()} BookMyTrip Entertainment Platform Ltd. Super Administrator Hub.
      </footer>
    </div>
  );
}
