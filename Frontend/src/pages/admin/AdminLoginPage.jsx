import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, KeyRound, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-[#F5F5FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-2">
          <span className="text-3xl font-black tracking-tight text-[#222432]">
            book<span className="text-[#F84464]">my</span>trip
          </span>
          <span className="bg-[#F84464] text-white text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full">
            Super Admin
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Platform Operations Hub
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Executive command center, partner KYC, and nationwide ticket settlement.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 sm:p-8">
          {/* Top Icon & Subtitle */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900">Root Authentication</h3>
              <p className="text-xs text-gray-500">Restricted to Platform Administrators</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#F84464] flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
          </div>

          {/* Quick Credential Helper Pill */}
          <div className="mb-5 p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <KeyRound size={16} className="text-[#F84464]" />
              <div className="text-left">
                <p className="text-xs font-bold text-gray-800">Default Super Admin</p>
                <p className="text-[11px] text-gray-500">admin@bookmytrip.com / Admin@123</p>
              </div>
            </div>
            <button
              type="button"
              onClick={fillQuickCredentials}
              className="text-xs font-bold text-[#F84464] hover:text-white bg-red-50 hover:bg-[#F84464] px-2.5 py-1 rounded-lg border border-red-200 transition"
            >
              Auto-fill
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-600 text-xs">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bookmytrip.com"
                  className="w-full bg-white border border-gray-300 focus:border-[#F84464] focus:ring-1 focus:ring-[#F84464] text-gray-900 pl-10 pr-4 py-2.5 rounded-xl text-sm transition placeholder:text-gray-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Master Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-gray-300 focus:border-[#F84464] focus:ring-1 focus:ring-[#F84464] text-gray-900 pl-10 pr-4 py-2.5 rounded-xl text-sm transition placeholder:text-gray-400 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 bg-[#F84464] hover:bg-[#d83552] text-white font-bold text-sm rounded-xl shadow-md shadow-[#F84464]/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
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

          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <Link to="/vendor/login" className="hover:text-gray-900 font-medium">
              Cinema Partner Login &rarr;
            </Link>
            <Link to="/" className="hover:text-gray-900 font-medium">
              Storefront &rarr;
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <p className="mt-4 text-center text-xs text-gray-500 flex items-center justify-center gap-1">
          <Sparkles size={12} className="text-amber-500" />
          <span>Encrypted with 256-bit AES platform authorization</span>
        </p>
      </div>
    </div>
  );
}
