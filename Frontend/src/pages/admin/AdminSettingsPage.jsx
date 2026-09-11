import React from 'react';
import {
  Settings,
  ShieldCheck,
  Database,
  Server,
  Key,
  Lock,
  CheckCircle,
  Sparkles,
  Cpu,
  Layers,
  Globe,
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button
} from '../../components/ui';

export default function AdminSettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <PageHeader
        title="Platform Architecture & System Configuration"
        subtitle="Global platform telemetry parameters, database cluster status, fee settlements, and RBAC governance policies."
        icon={Settings}
        badge="Platform Telemetry"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Architecture Settings */}
        <Card>
          <CardHeader className="pb-3 border-b border-[#EEEEF2]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center">
                <Database className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <CardTitle>Distributed Database Architecture</CardTitle>
                <CardDescription>Primary storage engine & live schema</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-[#EEEEF2] text-xs">
              <div className="p-4 flex items-center justify-between">
                <span className="text-gray-500 font-medium">Database Cluster:</span>
                <span className="font-mono text-[#222432] font-bold">MongoDB Atlas (M0 Shared Cloud)</span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <span className="text-gray-500 font-medium">Unified Single Source of Truth:</span>
                <Badge variant="approved" dot>
                  Customer + B2B + Admin
                </Badge>
              </div>
              <div className="p-4 flex items-center justify-between">
                <span className="text-gray-500 font-medium">Base Platform Currency:</span>
                <span className="font-mono text-[#222432] font-bold">INR (₹) Indian Rupee</span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <span className="text-gray-500 font-medium">Convenience Fee Structure:</span>
                <span className="font-mono text-[#F84464] font-bold">₹35.40 / Ticket (incl. 18% GST)</span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <span className="text-gray-500 font-medium">Audi Time Slot Overlap Lock:</span>
                <Badge variant="brand" dot>
                  Hardware Conflict Guard Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & RBAC Configuration */}
        <Card>
          <CardHeader className="pb-3 border-b border-[#EEEEF2]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200/60 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-[#F84464]" />
              </div>
              <div>
                <CardTitle>Server-Side RBAC Enforcement</CardTitle>
                <CardDescription>Role authorization and session security</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-[#EEEEF2] text-xs">
              <div className="p-4 flex items-center justify-between">
                <span className="text-gray-500 font-medium">Authentication Protocol:</span>
                <span className="font-mono text-[#222432] font-bold">JWT Bearer Token (Stateless)</span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <span className="text-gray-500 font-medium">Session Token Lifespan:</span>
                <span className="font-mono text-[#222432] font-bold">7 Days Rolling Expiry</span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <span className="text-gray-500 font-medium">Partner Instant Suspension:</span>
                <Badge variant="approved" dot>
                  Real-time Route Interceptor
                </Badge>
              </div>
              <div className="p-4 flex items-center justify-between">
                <span className="text-gray-500 font-medium">Active Admin Account:</span>
                <span className="font-mono text-[#F84464] font-bold truncate max-w-[180px]">{user?.email}</span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <span className="text-gray-500 font-medium">Assigned Global Role:</span>
                <Badge variant="brand" pill>
                  {user?.role || 'admin'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Multi-Role Quick Reference Credentials */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-500" />
            <CardTitle>Platform Multi-Role Access Reference</CardTitle>
          </div>
          <CardDescription>
            System seeded role credentials for instant cross-panel validation
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#F9F9FB] border border-[#EEEEF2] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="brand" pill>Platform Admin</Badge>
                  <span className="text-[10px] text-gray-400 font-bold">L3 Global</span>
                </div>
                <div className="font-mono font-bold text-[#222432] text-xs">admin@bookmyshow.com</div>
                <div className="font-mono text-gray-500 text-xs">password123</div>
              </div>
              <p className="text-[11px] text-gray-400 mt-3 pt-2 border-t border-[#EEEEF2]">
                Full platform control center, governance & settlements
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F9F9FB] border border-[#EEEEF2] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="warning" pill>Cinema Partner</Badge>
                  <span className="text-[10px] text-gray-400 font-bold">L2 B2B</span>
                </div>
                <div className="font-mono font-bold text-[#222432] text-xs">partner@bookmyshow.com</div>
                <div className="font-mono text-gray-500 text-xs">password123</div>
              </div>
              <p className="text-[11px] text-gray-400 mt-3 pt-2 border-t border-[#EEEEF2]">
                Multiplex venue setup, screen audis & show programming
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F9F9FB] border border-[#EEEEF2] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="neutral" pill>Customer (B2C)</Badge>
                  <span className="text-[10px] text-gray-400 font-bold">L1 Consumer</span>
                </div>
                <div className="font-mono font-bold text-[#222432] text-xs">demo@bookmyshow.com</div>
                <div className="font-mono text-gray-500 text-xs">password123</div>
              </div>
              <p className="text-[11px] text-gray-400 mt-3 pt-2 border-t border-[#EEEEF2]">
                Public portal for ticket bookings, seats & vouchers
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
