import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useVendorAuth } from '../../context/VendorAuthContext';
import { Film, ShieldCheck, Mail, Lock, ArrowRight, AlertCircle, Sparkles, Building2 } from 'lucide-react';

export default function VendorLoginPage() {
  const { login } = useVendorAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/vendor/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.message || 'Login failed. Please check credentials.');
    }
  };

  const handleDemoFill = () => {
    setEmail('partner@cinemaworld.com');
    setPassword('Partner@123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#F5F5FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
          <span className="text-3xl font-black tracking-tight text-[#222432]">
            book<span className="text-[#F84464]">my</span>trip
          </span>
          <span className="bg-[#F84464] text-white text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
            Cinema Partner
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Cinema Operator Console
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Executive control deck for auditoriums, live box office, and gate admissions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 sm:p-8">
          {/* Top Title & Icon */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900">Partner Authentication</h3>
              <p className="text-xs text-gray-500">Enter registered cinema operator credentials</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#F84464] flex items-center justify-center">
              <Building2 size={22} />
            </div>
          </div>

          {/* Quick Credential Helper Pill */}
          <div className="mb-5 p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles size={16} className="text-[#F84464]" />
              <div className="text-left">
                <p className="text-xs font-bold text-gray-800">Demo Partner Account</p>
                <p className="text-[11px] text-gray-500">partner@cinemaworld.com / Partner@123</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDemoFill}
              className="text-xs font-bold text-[#F84464] hover:text-white bg-red-50 hover:bg-[#F84464] px-2.5 py-1 rounded-lg border border-red-200 transition cursor-pointer"
            >
              Auto-fill
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-600 text-xs">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-[#F84464]" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Operator Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  required
                  placeholder="partner@cinemaworld.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full bg-white border border-gray-300 focus:border-[#F84464] focus:ring-1 focus:ring-[#F84464] text-gray-900 pl-10 pr-4 py-2.5 rounded-xl text-sm transition placeholder:text-gray-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Operator Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full bg-white border border-gray-300 focus:border-[#F84464] focus:ring-1 focus:ring-[#F84464] text-gray-900 pl-10 pr-4 py-2.5 rounded-xl text-sm transition placeholder:text-gray-400 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-[#F84464] hover:bg-[#d83552] text-white font-bold text-sm rounded-xl shadow-md shadow-[#F84464]/20 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating Operator...</span>
                </>
              ) : (
                <>
                  <span>Access Partner Control Deck</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>New Cinema Operator?</span>
            <Link
              to="/vendor/signup"
              className="font-bold text-[#F84464] hover:text-[#d83552] flex items-center gap-1 transition-colors"
            >
              <span>Register Multiplex Chain</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <Link to="/" className="hover:text-gray-900 transition-colors flex items-center gap-1">
              <span>← Customer App</span>
            </Link>
            <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
              <ShieldCheck size={13} />
              <span>Verified Studio Network</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
