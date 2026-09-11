import React from 'react';
import { Settings, ShieldCheck, Database, Server, Key, Lock, CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminSettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[#222432] tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#F84464]" />
          <span>Platform Settings &amp; Architecture</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          System telemetry parameters, fee settlement structures, and platform security policies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Architecture Settings */}
        <div className="bg-white border border-[#EEEEF2] rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-[#222432] uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-[#4ABD5D]" />
            <span>Shared Database Integration</span>
          </h3>

          <div className="divide-y divide-[#EEEEF2] text-xs">
            <div className="py-3 flex justify-between">
              <span className="text-gray-500">Database Engine:</span>
              <span className="font-mono text-[#222432] font-bold">MongoDB Atlas Cloud</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-gray-500">Unified Source of Truth:</span>
              <span className="text-[#4ABD5D] font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Shared Customer + B2B + Admin
              </span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-gray-500">Default Currency:</span>
              <span className="font-mono text-[#222432] font-bold">INR (₹) Indian Rupee</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-gray-500">Convenience Fee Structure:</span>
              <span className="font-mono text-[#F84464] font-bold">₹35.40 / Ticket (18% GST incl.)</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-gray-500">Screen Conflict Engine:</span>
              <span className="text-[#4ABD5D] font-bold">Active (Strict Overlap Lock)</span>
            </div>
          </div>
        </div>

        {/* Security & RBAC Configuration */}
        <div className="bg-white border border-[#EEEEF2] rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-[#222432] uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#F84464]" />
            <span>Server-Side RBAC Enforcement</span>
          </h3>

          <div className="divide-y divide-[#EEEEF2] text-xs">
            <div className="py-3 flex justify-between">
              <span className="text-gray-500">Authentication Protocol:</span>
              <span className="font-mono text-[#222432] font-bold">JWT (JSON Web Token) Bearer</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-gray-500">Token Expiry:</span>
              <span className="font-mono text-[#222432] font-bold">7 Days Rolling</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-gray-500">Partner Suspension Guard:</span>
              <span className="text-[#4ABD5D] font-bold">Enforced (Instant API Lock)</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-gray-500">Current Operator Session:</span>
              <span className="font-mono text-[#F84464] font-bold">{user?.email}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-gray-500">Operator Role:</span>
              <span className="uppercase text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Accounts Reference Card */}
      <div className="bg-white border border-[#EEEEF2] rounded-3xl p-6 shadow-sm">
        <h3 className="text-sm font-black text-[#222432] uppercase tracking-wider mb-3 flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-500" />
          <span>Platform Multi-Role Test Credentials</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#F9F9FB] p-4 rounded-2xl border border-[#EEEEF2]">
            <div className="font-black text-[#F84464] text-sm mb-1">Platform Admin</div>
            <div className="font-mono text-[#222432] font-semibold">admin@bookmyshow.com</div>
            <div className="font-mono text-gray-500">password123</div>
            <div className="text-[10px] text-gray-400 mt-2">Full Platform Control Center</div>
          </div>

          <div className="bg-[#F9F9FB] p-4 rounded-2xl border border-[#EEEEF2]">
            <div className="font-black text-amber-600 text-sm mb-1">Cinema Partner (B2B)</div>
            <div className="font-mono text-[#222432] font-semibold">partner@bookmyshow.com</div>
            <div className="font-mono text-gray-500">password123</div>
            <div className="text-[10px] text-gray-400 mt-2">INOX Cinecorp Multiplexes Hub</div>
          </div>

          <div className="bg-[#F9F9FB] p-4 rounded-2xl border border-[#EEEEF2]">
            <div className="font-black text-sky-600 text-sm mb-1">Customer (B2C)</div>
            <div className="font-mono text-[#222432] font-semibold">demo@bookmyshow.com</div>
            <div className="font-mono text-gray-500">password123</div>
            <div className="text-[10px] text-gray-400 mt-2">Public Ticket Booking Store</div>
          </div>
        </div>
      </div>
    </div>
  );
}
