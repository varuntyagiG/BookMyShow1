import React, { useState, useEffect } from 'react';
import { cinemaPartnerApi } from '../../services/cinemaPartnerApi';
import { useCinemaToast } from '../../components/cinemaPartner/CinemaPartnerToastContext';
import {
  Clapperboard,
  CheckCircle2,
  Clock,
  XCircle,
  QrCode,
  Ticket,
  Search,
  Calendar,
  Sparkles
} from 'lucide-react';
import {
  PageHeader,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  MetricCard,
  Input,
  EmptyState,
  Skeleton,
  CopyBadge,
  CopyButton
} from '../../components/ui';

export default function CinemaPartnerTicketsPage() {
  const toast = useCinemaToast();
  const [data, setData] = useState({ summary: {}, tickets: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');

  useEffect(() => {
    async function fetchTickets() {
      try {
        const res = await cinemaPartnerApi.getTickets();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        toast.error('Load Error', err.message || 'Failed to fetch tickets inventory.');
      } finally {
        setLoading(false);
      }
    }
    fetchTickets();
  }, []);

  const s = data.summary || {};
  const tickets = data.tickets || [];

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.bookingId?.toLowerCase().includes(search.toLowerCase()) ||
      t.movieTitle?.toLowerCase().includes(search.toLowerCase()) ||
      t.theatreName?.toLowerCase().includes(search.toLowerCase());

    if (tab === 'used') return matchesSearch && t.ticketValidated;
    if (tab === 'unused') return matchesSearch && !t.ticketValidated && t.bookingStatus === 'confirmed';
    return matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Page Header */}
      <PageHeader
        title="Ticket Inventory & Admissions Manifest"
        subtitle="Track issued admissions, checked-in guests, and turnstile gate validation history."
        icon={Clapperboard}
        badge="Inventory Manifest"
        actions={
          <div className="w-64">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search booking ID, movie..."
              icon={Search}
            />
          </div>
        }
      />

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard
            title="Total Sold"
            value={s.totalSold || 0}
            subtitle="Confirmed bookings"
            icon={Ticket}
            variant="brand"
          />

          <MetricCard
            title="Checked In (Used)"
            value={s.totalUsed || 0}
            subtitle="Validated at turnstile"
            icon={CheckCircle2}
            variant="success"
          />

          <MetricCard
            title="Pending Check-in"
            value={s.totalUnused || 0}
            subtitle="Awaiting gate arrival"
            icon={Clock}
            variant="warning"
          />

          <MetricCard
            title="Cancelled"
            value={s.totalCancelled || 0}
            subtitle="Refunded tickets"
            icon={XCircle}
            variant="default"
          />
        </div>
      )}

      {/* Segment Tabs */}
      <Card>
        <CardContent className="p-3 flex items-center gap-2">
          <button
            onClick={() => setTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              tab === 'all'
                ? 'bg-[#F84464] text-white shadow-sm shadow-[#F84464]/30'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Tickets ({tickets.length})
          </button>
          <button
            onClick={() => setTab('used')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              tab === 'used'
                ? 'bg-[#4ABD5D] text-white shadow-sm shadow-[#4ABD5D]/30'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Checked In ({s.totalUsed || 0})
          </button>
          <button
            onClick={() => setTab('unused')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              tab === 'unused'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Pending Check-in ({s.totalUnused || 0})
          </button>
        </CardContent>
      </Card>

      {/* Tickets List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-3xl" />
          ))}
        </div>
      ) : filteredTickets.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            icon={Ticket}
            title="No Tickets Found"
            description="No tickets match the selected inventory filter or search query."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTickets.map((t) => (
            <Card
              key={t._id}
              className="flex flex-col justify-between hover:border-[#F84464]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group overflow-hidden"
            >
              <div className="p-5 pb-0">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#EEEEF2]">
                  <CopyBadge text={t.bookingId} size="xs" />
                  {t.ticketValidated ? (
                    <Badge variant="approved" dot>
                      Checked In
                    </Badge>
                  ) : (
                    <Badge variant="warning" dot>
                      Pending Gate
                    </Badge>
                  )}
                </div>

                <h4 className="text-sm font-bold text-[#222432] group-hover:text-[#F84464] transition-colors line-clamp-1">
                  {t.movieTitle}
                </h4>
                <div className="text-[11px] text-gray-500 mt-1">
                  {t.theatreName} • {t.screenName || 'Screen 1'}
                </div>
                <div className="text-[11px] text-[#F84464] font-semibold mt-0.5">
                  {t.showDate} at {t.showtime}
                </div>

                <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-[#EEEEF2] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-gray-500 shrink-0">Seats:</span>
                    <strong className="text-[#222432] font-mono truncate">{t.seats?.join(', ')}</strong>
                    {t.seats?.length > 0 && (
                      <CopyButton
                        text={t.seats.join(', ')}
                        size="xs"
                        variant="ghost"
                        title="Copy seats"
                      />
                    )}
                  </div>
                  <span className="font-mono font-bold text-[#4ABD5D] shrink-0">₹{t.totalAmount}</span>
                </div>
              </div>

              <div className="p-4 mt-3 border-t border-[#EEEEF2] bg-gray-50/40 text-[10px] text-gray-400 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span>Guest: <strong className="text-gray-600">{t.user?.name || 'Customer'}</strong></span>
                  {(t.user?.email || t.user?.phone) && (
                    <CopyButton
                      text={t.user?.email || t.user?.phone}
                      size="xs"
                      variant="ghost"
                      title="Copy guest contact"
                    />
                  )}
                </div>
                <span className="font-mono">{t.ticketValidated && t.validatedAt ? new Date(t.validatedAt).toLocaleTimeString() : ''}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
