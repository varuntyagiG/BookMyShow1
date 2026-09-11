import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useVendorAuth } from '../../context/VendorAuthContext';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui';
import { Film, ShieldCheck, Zap, ArrowRight, AlertCircle } from 'lucide-react';

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
        <Link to="/" className="inline-flex items-center gap-2 mb-2">
          <span className="text-3xl font-black tracking-tight text-[#222432]">
            book<span className="text-[#F84464]">my</span>trip
          </span>
          <span className="bg-[#F84464] text-white text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full">
            Cinema Partner
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Theatre Operator Sign In
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage your auditoriums, showtimes, live box office, and gate scanning.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="shadow-lg border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Partner Authentication</CardTitle>
                <CardDescription>Enter registered cinema credentials</CardDescription>
              </div>
              <button
                type="button"
                onClick={handleDemoFill}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F84464] bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg transition"
                title="Fill verified demo partner credentials"
              >
                <Zap size={13} />
                <span>1-Click Demo</span>
              </button>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-sm">
                <AlertCircle size={17} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Partner Email Address"
                type="email"
                required
                placeholder="operator@theatre.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={loading}
                className="mt-2 py-2.5 font-semibold text-sm"
              >
                Access Partner Workspace
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>New Theatre Operator?</span>
              <Link
                to="/vendor/signup"
                className="font-semibold text-[#F84464] hover:underline flex items-center gap-1"
              >
                <span>Register Cinema Chain</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </CardContent>

          <CardFooter className="bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <Link to="/" className="hover:text-gray-900 transition">
              ← Return to Customer App
            </Link>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <ShieldCheck size={14} />
              Verified Operator Network
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
