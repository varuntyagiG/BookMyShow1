import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useVendorAuth } from '../../context/VendorAuthContext';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui';
import { Building2, ShieldCheck, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function VendorSignUpPage() {
  const { register } = useVendorAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    businessName: '',
    businessAddress: '',
    gstin: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.businessName) {
      setError('Name, email, password, and Theatre Chain Name are required.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await register(formData);
    setLoading(false);

    if (res.success) {
      navigate('/vendor/dashboard', { replace: true });
    } else {
      setError(res.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5FA] flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-2">
          <span className="text-3xl font-black tracking-tight text-[#222432]">
            book<span className="text-[#F84464]">my</span>trip
          </span>
          <span className="bg-[#F84464] text-white text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full">
            Cinema Partner
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Partner Registration
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Onboard your theatre or multiplex chain to BookMyTrip live customer network.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <Card className="shadow-lg border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="text-[#F84464]" size={20} />
              <span>Cinema Operator Profile</span>
            </CardTitle>
            <CardDescription>
              Instant onboarding: scheduled shows publish immediately to customers.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-sm">
                <AlertCircle size={17} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contact Person Name"
                  name="name"
                  required
                  placeholder="e.g. Ramesh Verma"
                  value={formData.name}
                  onChange={handleChange}
                />
                <Input
                  label="Business / Theatre Chain"
                  name="businessName"
                  required
                  placeholder="e.g. Star Multiplexes"
                  value={formData.businessName}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Partner Email Address"
                  name="email"
                  type="email"
                  required
                  placeholder="partner@theatre.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                <Input
                  label="Contact Phone"
                  name="phone"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <Input
                label="Account Password"
                name="password"
                type="password"
                required
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
              />

              <Input
                label="Registered Business Address"
                name="businessAddress"
                placeholder="e.g. Cyber City Mall, Sector 29, Gurugram"
                value={formData.businessAddress}
                onChange={handleChange}
              />

              <Input
                label="GSTIN / Business Registration (Optional)"
                name="gstin"
                placeholder="e.g. 07AAAAA0000A1Z5"
                value={formData.gstin}
                onChange={handleChange}
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={loading}
                className="mt-3 py-2.5 font-semibold text-sm"
              >
                Complete Onboarding & Access Portal
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Already registered as a partner?</span>
              <Link
                to="/vendor/login"
                className="font-semibold text-[#F84464] hover:underline flex items-center gap-1"
              >
                <span>Partner Sign In</span>
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
              Zero Platform Commission Setup
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
