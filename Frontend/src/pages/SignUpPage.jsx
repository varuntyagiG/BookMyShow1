import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle } from 'lucide-react';

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

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F5F5FA]">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block mb-3">
            <span className="text-2xl font-black tracking-tight text-gray-900">
              book<span className="text-[#F84464]">my</span>show
            </span>
          </Link>
          <h2 className="text-xl font-bold text-gray-900">Create a New Account</h2>
          <p className="text-xs text-gray-500 mt-1">Join BookMyShow to unlock rewards and movie tickets</p>
        </div>

        {/* Quick autofill button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => {
              const rand = Math.floor(100 + Math.random() * 900);
              setFormData({
                name: `User ${rand}`,
                email: `user${rand}@example.com`,
                phone: `9876543${rand}`,
                password: 'password123',
              });
            }}
            className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-[#F84464] font-semibold text-xs rounded-lg border border-red-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>✨ Auto-fill Sample User Details for Quick Sign Up</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-xs text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-800 focus:bg-white focus:outline-none focus:border-[#F84464]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-gray-400" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-800 focus:bg-white focus:outline-none focus:border-[#F84464]"
              />
            </div>
          </div>

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

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full pl-9 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-800 focus:bg-white focus:outline-none focus:border-[#F84464]"
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
            disabled={loading}
            className="w-full py-2.5 bg-[#F84464] hover:bg-[#e03a58] text-white text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer mt-2 disabled:opacity-70"
          >
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-600">
          Already have an account?{' '}
          <Link to="/signin" className="text-[#F84464] font-semibold hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}

