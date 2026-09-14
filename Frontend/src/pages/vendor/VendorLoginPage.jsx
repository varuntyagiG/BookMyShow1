import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useVendorAuth } from '../../context/VendorAuthContext';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui';
import { Film, ShieldCheck, Zap, ArrowRight, AlertCircle, Sparkles, Building2 } from 'lucide-react';

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
    <div className="min-h-screen bg-[#0B0D14] text-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient Cinema Studio Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#F84464]/15 via-transparent to-transparent" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 w-96 h-96 bg-[#F84464]/10 rounded-full blur-3xl" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
          <span className="text-3xl font-black tracking-tight text-white">
            book<span className="text-[#F84464]">my</span>show
          </span>
          <span className="bg-gradient-to-r from-[#F84464] to-[#ff6b85] text-white text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
            Studio Partner
          </span>
        </Link>
        <h2 className="text-2xl font-black tracking-tight text-white mt-1">
          Cinema Operator Console
        </h2>
        <p className="mt-1.5 text-xs text-gray-400">
          Executive control deck for auditoriums, live box office, and gate admissions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="bg-[#141724]/95 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Top 3D Neon Projection Accent Line */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#F84464] to-transparent shadow-[0_0_15px_rgba(248,68,100,0.85)]" />

          {/* Header */}
          <div className="p-6 pb-4 border-b border-white/[0.08] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Partner Authentication</h3>
              <p className="text-xs text-gray-400 mt-0.5">Enter registered cinema credentials</p>
            </div>
            <button
              type="button"
              onClick={handleDemoFill}
              className="inline-flex items-center gap-1.5 text-xs font-black text-white bg-gradient-to-r from-amber-500 via-[#F84464] to-[#e03a58] px-3 py-1.5 rounded-xl shadow-md shadow-red-500/20 hover:opacity-95 transition-all cursor-pointer active:scale-95"
              title="Fill verified demo partner credentials"
            >
              <Sparkles size={13} className="text-amber-200" />
              <span>1-Click Demo</span>
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-5 p-3 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-start gap-2.5 text-red-400 text-xs font-medium animate-in fade-in">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-[#F84464]" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Operator Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="partner@cinemaworld.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Operator Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3 font-bold text-xs rounded-xl bg-gradient-to-r from-[#F84464] to-[#E03A58] hover:from-[#ff5576] hover:to-[#eb4464] text-white shadow-[0_8px_20px_rgba(248,68,100,0.45)] transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Authenticating Operator...</span>
                ) : (
                  <>
                    <span>Access Executive Control Deck</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/[0.08] flex items-center justify-between text-xs text-gray-400">
              <span>New Theatre Operator?</span>
              <Link
                to="/vendor/signup"
                className="font-bold text-[#F84464] hover:text-[#ff6b85] flex items-center gap-1 transition-colors"
              >
                <span>Register Cinema Chain</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          <div className="px-6 py-4 bg-black/30 border-t border-white/[0.06] flex items-center justify-between text-xs text-gray-400">
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1.5">
              <span>← Customer App</span>
            </Link>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 text-[11px]">
              <ShieldCheck size={13} />
              <span>Verified Studio Network</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
