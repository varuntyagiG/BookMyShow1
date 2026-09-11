import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Loader2,
  Clock,
  User,
  Activity,
  FileCode,
  Sparkles
} from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAuditLogs({ entityType: entityFilter, limit: 50 });
      if (res.success) {
        setLogs(res.logs || []);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [entityFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#222432] tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-[#F84464]" />
            <span>Platform Governance &amp; Security Audit Trail</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Immutable log of all administrative interventions, partner lifecycle decisions, and catalog updates.
          </p>
        </div>

        <span className="font-bold text-[#222432] bg-white px-3.5 py-1.5 rounded-xl border border-[#EEEEF2] text-xs shadow-sm">
          Captured Logs: {logs.length}
        </span>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#EEEEF2] p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="font-bold text-[#222432]">Filter by Target Entity:</span>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-xs text-[#222432] px-3 py-1.5 rounded-xl focus:bg-white focus:outline-none focus:border-[#F84464]"
          >
            <option value="all">All Entities</option>
            <option value="User">User / Partner</option>
            <option value="Movie">Movie Catalog</option>
            <option value="Cinema">Multiplex Property</option>
            <option value="Show">Screening Show</option>
            <option value="Booking">Booking &amp; Refund</option>
            <option value="Offer">Promotion &amp; Offer</option>
            <option value="City">Operational City</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Stream */}
      <div className="bg-white border border-[#EEEEF2] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#222432]">
            <thead className="bg-[#F9F9FB] text-gray-400 uppercase text-[10px] font-black tracking-wider border-b border-[#EEEEF2]">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Administrator</th>
                <th className="px-5 py-3.5">Action Code</th>
                <th className="px-5 py-3.5">Target Entity</th>
                <th className="px-5 py-3.5">Subject / Identifier</th>
                <th className="px-5 py-3.5 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEEEF2] font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 text-[#F84464] animate-spin mx-auto mb-2" />
                    <span>Loading security audit trail...</span>
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/80 transition">
                    <td className="px-5 py-3.5 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-[#222432]">{log.adminEmail || log.admin?.name || 'Platform Admin'}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded bg-rose-50 text-[#F84464] border border-rose-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-gray-700">
                      {log.entityType}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-gray-600">
                      {log.entityName || log.entityId}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-[11px] text-gray-400">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-gray-400">
                    No audit logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
