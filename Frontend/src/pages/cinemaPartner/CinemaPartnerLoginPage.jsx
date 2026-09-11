import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  Building2,
  ShieldCheck,
  Film,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Button, Input, Card, Badge } from '../../components/ui';

export default function CinemaPartnerLoginPage() {
  const { login } = useAuth();
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
        if (res.user?.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/cinema-partner');
        }
      } else {
        setError(res.message || 'Invalid partner credentials');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail) => {
    setError('');
    setLoading(true);
    try {
      const res = await login(demoEmail, 'password123');
      if (res.success) {
        if (res.user?.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/cinema-partner');
        }
      } else {
        setError(res.message || 'Demo login failed');
      }
    } catch (err) {
      setError(err.message || 'Demo login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-[#222432]">
      <div className="max-w-md w-full mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#F84464] flex items-center justify-center shadow-lg shadow-[#F84464]/30">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1 text-left">
              <span className="text-2xl font-black tracking-tight text-[#222432]">book</span>
              <span className="bg-[#F84464] text-white px-1.5 py-0.5 rounded text-[11px] font-black uppercase">my</span>
              <span className="text-2xl font-black tracking-tight text-[#222432]">show</span>
            </div>
          </Link>
          <div className="flex justify-center mb-2">
            <Badge variant="warning" pill>
              B2B Cinema Partner Portal
            </Badge>
          </div>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Manage your cinema multiplexes, screens, show schedules &amp; box office tickets
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-7 sm:p-9 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.1)]">
          {/* Instant Demo Login Button */}
          <div className="mb-6">
            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center shadow-md shadow-[#F84464]/25"
              icon={Sparkles}
              onClick={() => handleQuickDemo('partner@bookmyshow.com')}
              disabled={loading}
            >
              One-Click Partner Demo Login
            </Button>
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-gray-400">
                <span className="bg-white px-3 tracking-widest">Or sign in with operator credentials</span>
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
              <Input
                label="Operator Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="partner@bookmyshow.com"
                icon={Mail}
              />
            </div>

            <div>
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  icon={Lock}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-[34px] text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="dark"
              size="lg"
              className="w-full justify-center mt-2"
              loading={loading}
              icon={Building2}
            >
              Sign In to Partner Portal
            </Button>
          </form>

          {/* Navigation Links */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <Link to="/" className="text-[#F84464] font-semibold hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Customer Portal</span>
            </Link>
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4ABD5D]" />
              <span>TLS Secured</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
