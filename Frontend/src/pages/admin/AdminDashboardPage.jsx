import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import {
  IndianRupee,
  Users,
  Building2,
  Film,
  Ticket,
  Calendar,
  Store,
  RefreshCw,
  TrendingUp,
  Tag,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  MetricCard,
  PageHeader,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  SkeletonMetric,
  ErrorState,
  CopyBadge,
  CopyButton
} from '../../components/ui';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setError('');
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getAnalytics()
      ]);

      if (statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
      if (analyticsRes.success) {
        setAnalytics(analyticsRes);
      }
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
      setError(err.message || 'Failed to load platform telemetry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="h-8 w-64 bg-gray-200/80 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <ErrorState
          title="Platform Telemetry Synchronization Error"
          description={error || 'Unable to communicate with the platform management API.'}
          onRetry={loadDashboard}
        />
      </div>
    );
  }

  const s = stats || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Page Header */}
      <PageHeader
        title="Platform Control & Telemetry"
        subtitle="Real-time global oversight across customer bookings, cinema multiplexes, central movie catalog, and settlement revenues."
        icon={Sparkles}
        badge="HQ Master"
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              loading={refreshing}
              icon={RefreshCw}
            >
              Refresh Telemetry
            </Button>

            <Link to="/admin/partners">
              <Button variant="primary" size="sm" icon={Building2}>
                Review Partners
              </Button>
            </Link>
          </>
        }
      />

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          title="Total Platform Revenue"
          value={`₹${(s.totalRevenue || 0).toLocaleString('en-IN')}`}
          subtitle="Gross Box Office collections across all cities"
          icon={IndianRupee}
          trend="+18.4%"
          variant="dark"
        />

        <MetricCard
          title="Total Bookings"
          value={(s.totalBookings || 0).toLocaleString()}
          subtitle="Confirmed admission passes issued"
          icon={Ticket}
          trend="+12.1%"
          badge="Live"
        />

        <MetricCard
          title="Registered Customers"
          value={(s.totalCustomers || 0).toLocaleString()}
          subtitle="Active BookMyTrip customer accounts"
          icon={Users}
        />

        <MetricCard
          title="Cinema Partners"
          value={(s.totalPartners || 0).toLocaleString()}
          subtitle={`${s.pendingPartners || 0} applications awaiting review`}
          icon={Building2}
          variant="brand"
        />
      </div>

      {/* Secondary Operational Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#F84464] flex items-center justify-center shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black">{s.totalCinemas || 0}</div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Multiplexes</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black">{s.totalMovies || 0}</div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Catalog Titles</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black">{s.activeShows || 0}</div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Today's Shows</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black">{s.totalOffers || 0}</div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Deals</div>
          </div>
        </Card>
      </div>

      {/* Two-Column Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Bookings Activity */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>
                  <Activity className="w-4 h-4 text-[#F84464]" />
                  <span>Real-Time Customer Bookings</span>
                </CardTitle>
                <CardDescription>
                  Latest transaction receipts generated across partner cinemas
                </CardDescription>
              </div>

              <Link to="/admin/bookings">
                <Button variant="ghost" size="xs">
                  <span>View All Bookings</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </CardHeader>

            <div className="p-0">
              {s.recentBookings && s.recentBookings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow hover={false}>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Movie / Experience</TableHead>
                      <TableHead>Cinema Multiplex</TableHead>
                      <TableHead>Seats</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {s.recentBookings.slice(0, 6).map((b) => (
                      <TableRow key={b._id || b.bookingId} className="transition-colors hover:bg-[#F84464]/5">
                        <TableCell className="whitespace-nowrap">
                          <CopyBadge text={b.bookingId || b._id?.substring(0, 8)} size="xs" />
                        </TableCell>
                        <TableCell className="font-bold text-[#222432]">
                          {b.movieTitle || b.movie?.title || 'Cinema Screening'}
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {b.theatreName || b.cinema?.name || 'Multiplex Venue'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-[11px] font-bold text-gray-700">
                              {Array.isArray(b.seats) ? b.seats.join(', ') : '1 Seat'}
                            </span>
                            {Array.isArray(b.seats) && b.seats.length > 0 && (
                              <CopyButton text={b.seats.join(', ')} size="xs" variant="ghost" title="Copy seats" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-black text-[#222432]">
                          ₹{(b.totalAmount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={b.bookingStatus === 'confirmed' ? 'active' : b.bookingStatus === 'cancelled' ? 'cancelled' : 'pending'}
                            dot
                          >
                            {b.bookingStatus || 'Confirmed'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-gray-500 text-xs">
                  No booking transactions recorded yet.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Platform Ecosystem Quick Actions & Pending Partners */}
        <div className="space-y-6">
          {/* Partner Approvals Card */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>
                  <Building2 className="w-4 h-4 text-amber-500" />
                  <span>Partner Onboarding</span>
                </CardTitle>
                <CardDescription>
                  Cinema operators awaiting verification
                </CardDescription>
              </div>

              {s.pendingPartners > 0 && (
                <Badge variant="pending" dot>
                  {s.pendingPartners} Pending
                </Badge>
              )}
            </CardHeader>

            <CardContent className="space-y-3">
              {s.pendingPartnersList && s.pendingPartnersList.length > 0 ? (
                s.pendingPartnersList.slice(0, 4).map((p) => (
                  <div
                    key={p._id}
                    className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#222432] truncate">
                        {p.businessName || p.name}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate">{p.email}</div>
                    </div>

                    <Link to="/admin/partners">
                      <Button variant="outline" size="xs">
                        Review
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-[#222432]">All Partners Verified</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">No pending onboarding applications</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Management Shortcuts */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Layers className="w-4 h-4 text-[#F84464]" />
                <span>Quick Modules</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
              <Link
                to="/admin/movies"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition text-xs font-bold text-[#222432]"
              >
                <div className="flex items-center gap-2.5">
                  <Film className="w-4 h-4 text-[#F84464]" />
                  <span>Master Movie Catalog</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </Link>

              <Link
                to="/admin/shows"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition text-xs font-bold text-[#222432]"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Global Screening Schedules</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </Link>

              <Link
                to="/admin/revenue"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition text-xs font-bold text-[#222432]"
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span>Settlements &amp; Convenience Fees</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </Link>

              <Link
                to="/admin/audit-logs"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition text-xs font-bold text-[#222432]"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-gray-600" />
                  <span>Security &amp; Audit Logs</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
