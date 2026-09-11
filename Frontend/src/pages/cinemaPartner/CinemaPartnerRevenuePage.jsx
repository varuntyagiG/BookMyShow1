import React, { useState, useEffect } from 'react';
import { cinemaPartnerApi } from '../../services/cinemaPartnerApi';
import { useCinemaToast } from '../../components/cinemaPartner/CinemaPartnerToastContext';
import {
  TrendingUp,
  IndianRupee,
  Building2,
  Film,
  Calendar,
  Wallet,
  Receipt,
  Sparkles
} from 'lucide-react';
import {
  PageHeader,
  MetricCard,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  EmptyState,
  Skeleton
} from '../../components/ui';

export default function CinemaPartnerRevenuePage() {
  const toast = useCinemaToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRevenue() {
      try {
        const res = await cinemaPartnerApi.getRevenue();
        if (res.success && res.revenue) {
          setData(res.revenue);
        }
      } catch (err) {
        toast.error('Load Error', err.message || 'Failed to fetch financial metrics.');
      } finally {
        setLoading(false);
      }
    }
    fetchRevenue();
  }, []);

  const r = data || {};
  const byMovieEntries = Object.entries(r.revenueByMovie || {});
  const byCinemaEntries = Object.entries(r.revenueByCinema || {});

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Header */}
      <PageHeader
        title="Commercial Box Office & Financial Ledger"
        subtitle="Accredited box office sales, daily revenue pacing, and cinema property contributions."
        icon={TrendingUp}
        badge="Financial Intelligence"
      />

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard
            title="Today's Collections"
            value={`₹${(r.todayRevenue || 0).toLocaleString('en-IN')}`}
            subtitle="Live turnstile & online sales"
            icon={IndianRupee}
            variant="success"
          />

          <MetricCard
            title="Rolling 7-Day Gross"
            value={`₹${(r.weeklyRevenue || 0).toLocaleString('en-IN')}`}
            subtitle="Weekly admission collections"
            icon={TrendingUp}
            variant="brand"
          />

          <MetricCard
            title="Rolling 30-Day Gross"
            value={`₹${(r.monthlyRevenue || 0).toLocaleString('en-IN')}`}
            subtitle="Monthly auditorium throughput"
            icon={Wallet}
            variant="info"
          />

          <MetricCard
            title="Cumulative Box Office"
            value={`₹${(r.grossRevenue || 0).toLocaleString('en-IN')}`}
            subtitle={`${r.totalBookingsCount || 0} customer reservations`}
            icon={Receipt}
            variant="warning"
          />
        </div>
      )}

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue by Movie */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Film className="w-4 h-4 text-[#F84464]" />
                <span>Revenue by Theatrical Release</span>
              </CardTitle>
              <CardDescription>Box office gross split across active titles</CardDescription>
            </div>
            <Badge variant="brand" pill>
              {byMovieEntries.length} Releases
            </Badge>
          </CardHeader>

          <CardContent>
            {byMovieEntries.length === 0 ? (
              <EmptyState
                icon={Film}
                title="No Movie Earnings Yet"
                description="Movie collections will populate here as ticket sales are recorded."
              />
            ) : (
              <div className="space-y-4">
                {byMovieEntries.map(([movieTitle, amount]) => {
                  const pct = r.grossRevenue > 0 ? Math.round((amount / r.grossRevenue) * 100) : 0;

                  return (
                    <div key={movieTitle} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#222432] truncate max-w-[220px]">{movieTitle}</span>
                        <span className="font-mono font-black text-[#4ABD5D]">₹{amount.toLocaleString('en-IN')} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#F84464] to-[#f76781] rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Cinema */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-600" />
                <span>Revenue by Cinema Property</span>
              </CardTitle>
              <CardDescription>Auditorium gross generated across multiplex locations</CardDescription>
            </div>
            <Badge variant="info" pill>
              {byCinemaEntries.length} Venues
            </Badge>
          </CardHeader>

          <CardContent>
            {byCinemaEntries.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No Venue Earnings Yet"
                description="Cinema property sales will populate here as admissions are processed."
              />
            ) : (
              <div className="space-y-4">
                {byCinemaEntries.map(([cinemaName, amount]) => {
                  const pct = r.grossRevenue > 0 ? Math.round((amount / r.grossRevenue) * 100) : 0;

                  return (
                    <div key={cinemaName} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#222432] truncate max-w-[220px]">{cinemaName}</span>
                        <span className="font-mono font-black text-sky-600">₹{amount.toLocaleString('en-IN')} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-sky-600 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
