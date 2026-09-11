import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import {
  TrendingUp,
  Building2,
  CheckCircle,
  Download,
  IndianRupee,
  Receipt,
  Wallet,
  ArrowUpRight
} from 'lucide-react';
import {
  PageHeader,
  MetricCard,
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
  Button,
  EmptyState,
  Skeleton
} from '../../components/ui';

export default function AdminRevenuePage() {
  const [revenueData, setRevenueData] = useState(null);
  const [partnerSettlements, setPartnerSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRevenue() {
      setLoading(true);
      try {
        const res = await adminApi.getRevenueOverview();
        if (res.success) {
          setRevenueData(res.revenue);
          setPartnerSettlements(res.partnerSettlements || []);
        }
      } catch (err) {
        console.error('Error fetching revenue:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRevenue();
  }, []);

  const handleExportCSV = () => {
    if (!partnerSettlements.length) return;
    const headers = ['Partner Organization', 'Email', 'Gross Revenue (INR)', 'Platform Fee (INR)', 'Net Payable (INR)', 'Total Bookings'];
    const rows = partnerSettlements.map((p) => [
      `"${p.partnerName}"`,
      `"${p.partnerEmail}"`,
      p.grossRevenue,
      p.convenienceFee,
      p.netPayable,
      p.bookingsCount
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bms_settlements_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Commercial Revenue & Partner Settlements"
        subtitle="Platform convenience fee earnings, box office revenue splits, and cinema partner payout reconciliations."
        icon={TrendingUp}
        badge="Financial Telemetry"
        actions={
          <Button
            variant="outline"
            icon={Download}
            onClick={handleExportCSV}
            disabled={!partnerSettlements.length}
          >
            Export Settlements CSV
          </Button>
        }
      />

      {/* Financial KPIs */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <MetricCard
            title="Gross Booking Value (GBV)"
            value={`₹${(revenueData?.totalGross || 0).toLocaleString('en-IN')}`}
            subtitle={`Accumulated across ${revenueData?.totalBookings || 0} confirmed ticket bookings`}
            icon={Receipt}
            variant="default"
          />

          <MetricCard
            title="Platform Net Earnings"
            value={`₹${(revenueData?.platformFee || 0).toLocaleString('en-IN')}`}
            subtitle="Convenience margin retained from booking transactions"
            icon={TrendingUp}
            variant="brand"
          />

          <MetricCard
            title="Partner Box Office Share"
            value={`₹${(revenueData?.partnerShare || 0).toLocaleString('en-IN')}`}
            subtitle="Box office admissions remittances due to multiplex partners"
            icon={Wallet}
            variant="success"
          />
        </div>
      )}

      {/* Partner Settlement Ledger */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
          <div>
            <CardTitle>Partner Settlement & Payout Audit Ledger</CardTitle>
            <CardDescription>
              Calculated net remittances owed to cinema operator circuits based on confirmed admissions
            </CardDescription>
          </div>
          <Badge variant="neutral" pill>
            {partnerSettlements.length} Cinema Partners
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : partnerSettlements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cinema Operator Circuit</TableHead>
                  <TableHead>Billing Email</TableHead>
                  <TableHead className="text-center">Transactions</TableHead>
                  <TableHead className="text-right">Gross Collections</TableHead>
                  <TableHead className="text-right">Platform Fee Share</TableHead>
                  <TableHead className="text-right text-[#4ABD5D]">Net Remittance</TableHead>
                  <TableHead className="text-center">Audit Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partnerSettlements.map((p, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 text-amber-600" />
                        </div>
                        <span className="font-bold text-[#222432]">{p.partnerName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-500">
                      {p.partnerEmail || '—'}
                    </TableCell>
                    <TableCell className="text-center font-mono font-medium">
                      {p.bookingsCount}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-[#222432]">
                      ₹{p.grossRevenue.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right font-mono text-[#F84464] font-semibold">
                      ₹{p.convenienceFee.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right font-mono font-black text-[#4ABD5D] text-sm">
                      ₹{p.netPayable.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="approved" dot>
                        Reconciled
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12">
              <EmptyState
                icon={TrendingUp}
                title="No Partner Settlements Yet"
                description="When customer bookings are finalized, partner payout ledgers and platform fee calculations will populate here."
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
