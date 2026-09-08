import React, { useState } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, Phone, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    login,
    register,
    quickDemoLogin,
  } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const isSignUp = authModalMode === 'signup';

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isSignUp) {
        if (!formData.name || !formData.email || !formData.password) {
          setError('Please fill in all required fields.');
          setSubmitting(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters.');
          setSubmitting(false);
          return;
        }

        const res = await register(formData);
        if (!res.success) {
          setError(res.message || 'Registration failed');
        }
      } else {
        if (!formData.email || !formData.password) {
          setError('Please provide both email and password.');
          setSubmitting(false);
          return;
        }

        const res = await login(formData.email, formData.password);
        if (!res.success) {
          setError(res.message || 'Login failed');
        }
      }
    } catch (err) {
      setError(err.message || 'Network error, please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoClick = async () => {
    setError('');
    setSubmitting(true);
    try {
      await quickDemoLogin();
    } catch (err) {
      setError('Demo login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isSignUp ? 'Create an Account' : 'Get Started'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isSignUp
                ? 'Sign up to book tickets and get personalized movie updates'
                : 'Sign in to access your bookings and profile'}
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={() => {
              setError('');
              setAuthModalMode('signin');
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer text-center ${
              !isSignUp
                ? 'border-[#F84464] text-[#F84464] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setError('');
              setAuthModalMode('signup');
            }}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer text-center ${
              isSignUp
                ? 'border-[#F84464] text-[#F84464] bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Create Account (Sign Up)
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {/* Quick Demo Login Option */}
          <div className="mb-4">
            <button
              type="button"
              onClick={handleDemoClick}
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white font-medium text-xs rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>1-Click Instant Demo Login (demo@bookmyshow.com)</span>
            </button>
          </div>

          {/* Social Google button */}
          <div className="mb-5">
            <button
              type="button"
              onClick={() => {
                alert('Social Google Login: Logging in with test Google profile.');
                quickDemoLogin();
              }}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-gray-200 w-full" />
            <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-gray-400 font-medium absolute">
              or with email
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-xs text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-800 focus:bg-white focus:outline-none focus:border-[#F84464]"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-800 focus:bg-white focus:outline-none focus:border-[#F84464]"
                  required
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Mobile Number (Optional)
                </label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-800 focus:bg-white focus:outline-none focus:border-[#F84464]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={isSignUp ? 'At least 6 characters' : 'Enter your password'}
                  className="w-full pl-9 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-800 focus:bg-white focus:outline-none focus:border-[#F84464]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-[#F84464] hover:bg-[#e03a58] text-white text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer mt-2 disabled:opacity-70"
            >
              {submitting
                ? 'Please wait...'
                : isSignUp
                ? 'Create Account'
                : 'Sign In'}
            </button>
          </form>

          {/* Toggle Sign In / Sign Up */}
          <div className="mt-5 text-center">
            <p className="text-xs text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setAuthModalMode(isSignUp ? 'signin' : 'signup');
                }}
                className="text-[#F84464] font-semibold hover:underline cursor-pointer ml-1"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          <p className="text-[10px] text-gray-400 text-center mt-5 leading-relaxed">
            I agree to the <span className="underline">Terms &amp; Conditions</span> &amp;{' '}
            <span className="underline">Privacy Policy</span>
          </p>
        </div>

      </div>
    </div>
  );
}

