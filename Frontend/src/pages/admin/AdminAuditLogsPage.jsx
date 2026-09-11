import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import {
  ShieldAlert,
  ShieldCheck,
  Filter,
  Activity,
  Terminal
} from 'lucide-react';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Select,
  EmptyState,
  Skeleton
} from '../../components/ui';

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

  const entityOptions = [
    { value: 'all', label: 'All Platform Entities' },
    { value: 'User', label: 'User & Partner Accounts' },
    { value: 'Movie', label: 'Movie Catalog' },
    { value: 'Cinema', label: 'Multiplex Property' },
    { value: 'Show', label: 'Screening Show' },
    { value: 'Booking', label: 'Booking & Ticket Refunds' },
    { value: 'Offer', label: 'Promotions & Coupons' },
    { value: 'City', label: 'Operational Territory' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Platform Governance & Security Audit Trail"
        subtitle="Immutable stream of administrative interventions, partner lifecycle decisions, and catalog mutations."
        icon={ShieldAlert}
        badge="Security & Governance"
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="brand" pill>
              Captured Events: {logs.length}
            </Badge>
          </div>
        }
      />

      {/* Filter Control */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-bold text-[#222432]">Filter By Entity:</span>
            <div className="w-64">
              <Select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                options={entityOptions}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
            <Terminal className="w-3.5 h-3.5 text-[#F84464]" />
            <span>Target audit window: Recent 50 actions</span>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader className="py-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle>Audit Event Journal</CardTitle>
            <CardDescription>
              Chronological ledger of authorized administrator activities
            </CardDescription>
          </div>
          <Badge variant="neutral" pill>
            Tamper Resistant
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-xl" />
              ))}
            </div>
          ) : logs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Administrator</TableHead>
                  <TableHead>Action Code</TableHead>
                  <TableHead>Entity Scope</TableHead>
                  <TableHead>Subject Identifier</TableHead>
                  <TableHead className="text-right">Origin IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log._id} hover>
                    <TableCell className="font-mono text-xs text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-[#222432]">
                        {log.adminEmail || log.admin?.name || 'Platform Administrator'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="brand" className="font-mono text-[10px]">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-gray-700">
                      {log.entityType}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-600">
                      {log.entityName || log.entityId}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-gray-400">
                      {log.ipAddress || '127.0.0.1'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12">
              <EmptyState
                icon={ShieldCheck}
                title="No Audit Logs Recorded"
                description="Administrative actions and catalog updates will automatically append entries here."
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
