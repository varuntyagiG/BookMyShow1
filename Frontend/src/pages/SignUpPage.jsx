import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, Sparkles, ShieldCheck, Gift, Award } from 'lucide-react';

export default function SignUpPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(formData);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofill = () => {
    const rand = Math.floor(100 + Math.random() * 900);
    setFormData({
      name: `User ${rand}`,
      email: `user${rand}@example.com`,
      phone: `9876543${rand}`,
      password: 'password123',
    });
    setError('');
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
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Create a New Account</h2>
            <p className="text-xs text-gray-500 mt-1">Unlock exclusive deals, rewards, and 100% contactless booking</p>
          </div>

          {/* Quick autofill demo button */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleAutofill}
              className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100/80 text-[#F84464] font-bold text-xs rounded-xl border border-red-200/80 flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4" />
              <span>✨ 1-Click Auto-Fill Demo Credentials</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-600 font-medium animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#F84464]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-[#F84464]">*</span>
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-[#F84464]">*</span>
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Mobile Number <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Password <span className="text-[#F84464]">*</span>
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
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
              {loading ? 'Creating Account...' : 'Register Account'}
            </button>
          </form>

          {/* Switch to Sign In */}
          <div className="mt-6 text-center text-xs text-gray-600">
            Already have an account?{' '}
            <Link to="/signin" className="text-[#F84464] font-bold hover:underline">
              Sign In
            </Link>
          </div>

          <p className="text-[10px] text-gray-400 text-center mt-5 leading-relaxed">
            By registering, you agree to BookMyShow's <span className="underline">Terms &amp; Conditions</span> and{' '}
            <span className="underline">Privacy Policy</span>.
          </p>
        </div>

        {/* Benefits Strip */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-2xs">
            <Gift className="w-4 h-4 text-[#F84464] mx-auto mb-1" />
            <span className="text-[10px] font-bold text-gray-700 block">Welcome Perks</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-2xs">
            <Award className="w-4 h-4 text-[#F84464] mx-auto mb-1" />
            <span className="text-[10px] font-bold text-gray-700 block">Superstar Rewards</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#F84464] mx-auto mb-1" />
            <span className="text-[10px] font-bold text-gray-700 block">100% Privacy</span>
          </div>
        </div>

      </div>
    </div>
  );
}

