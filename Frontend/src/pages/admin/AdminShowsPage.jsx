import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import {
  Calendar,
  Search,
  Store,
  Tv,
  Film,
  Clock,
  IndianRupee,
  AlertTriangle,
  XCircle,
  CheckCircle,
  X
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  PageHeader,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Select,
  Modal,
  EmptyState,
  SkeletonTableRows
} from '../../components/ui';

export default function AdminShowsPage() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Cancel Modal State
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    show: null,
    reason: '',
    submitting: false
  });

  const fetchShows = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getShows({ status: statusFilter });
      if (res.success) {
        setShows(res.shows || []);
      }
    } catch (err) {
      console.error('Error fetching shows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShows();
  }, [statusFilter]);

  const filteredShows = shows.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (s.movieTitle && s.movieTitle.toLowerCase().includes(q)) ||
      (s.cinema?.name && s.cinema.name.toLowerCase().includes(q)) ||
      (s.cinema?.city && s.cinema.city.toLowerCase().includes(q))
    );
  });

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelModal.show) return;

    setCancelModal((prev) => ({ ...prev, submitting: true }));
    try {
      const res = await adminApi.cancelShow(cancelModal.show._id, cancelModal.reason);
      if (res.success) {
        setShows((prev) =>
          prev.map((s) => (s._id === cancelModal.show._id ? { ...s, status: 'cancelled' } : s))
        );
        setCancelModal({ isOpen: false, show: null, reason: '', submitting: false });
      }
    } catch (err) {
      console.error('Failed to cancel show:', err);
      setCancelModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Page Header */}
      <PageHeader
        title="Screening Schedules Monitor"
        subtitle="Global monitoring of auditorium showtimes, booked seats, occupancy rates, and operational cancellations."
        icon={Calendar}
        badge="Screenings"
      />

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search by movie title, cinema, or city..."
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Show Statuses' },
                { value: 'active', label: 'Active Screenings' },
                { value: 'cancelled', label: 'Cancelled Screenings' }
              ]}
              wrapperClassName="w-full sm:w-56"
            />
          </div>
        </div>
      </Card>

      {/* Shows Table */}
      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow hover={false}>
              <TableHead>Movie Title</TableHead>
              <TableHead>Cinema Multiplex</TableHead>
              <TableHead>Auditorium</TableHead>
              <TableHead>Date &amp; Time</TableHead>
              <TableHead>Format &amp; Price</TableHead>
              <TableHead>Occupancy</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <SkeletonTableRows rows={6} cols={8} />
            ) : filteredShows.length > 0 ? (
              filteredShows.map((s) => {
                const bookedCount = s.bookedSeats?.length || 0;
                const capacity = s.capacity || s.screen?.totalCapacity || 120;
                const occupancyRate = s.occupancyRate || Math.round((bookedCount / capacity) * 100);

                return (
                  <TableRow key={s._id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 font-black text-xs flex items-center justify-center shrink-0 border border-purple-100">
                          <Film className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 font-bold text-[#222432] truncate">
                          {s.movieTitle || s.movie?.title || 'Screening Film'}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-[#222432] truncate max-w-[160px]">
                        {s.cinema?.name || 'Multiplex'}
                      </div>
                      <div className="text-[11px] text-gray-400">{s.cinema?.city}</div>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-gray-700 font-bold text-[11px] bg-gray-100 px-2 py-0.5 rounded">
                        {s.screen?.name || s.screenNumber || 'Audi 1'}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-[#222432]">{s.showDate}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{s.startTime}</div>
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-[#222432]">{s.format || '2D'}</div>
                      <div className="text-[11px] font-black text-[#F84464]">₹{s.ticketPrice || 250}</div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1 w-24">
                        <div className="flex justify-between text-[10px] font-bold text-gray-500">
                          <span>{bookedCount}/{capacity}</span>
                          <span>{occupancyRate}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              occupancyRate > 80
                                ? 'bg-rose-500'
                                : occupancyRate > 50
                                ? 'bg-amber-500'
                                : 'bg-[#4ABD5D]'
                            }`}
                            style={{ width: `${Math.min(100, occupancyRate)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={s.status === 'active' ? 'active' : 'cancelled'} dot>
                        {s.status === 'active' ? 'Active' : 'Cancelled'}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      {s.status === 'active' && (
                        <Button
                          variant="destructive"
                          size="xs"
                          onClick={() => setCancelModal({ isOpen: true, show: s, reason: '', submitting: false })}
                        >
                          Cancel Show
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow hover={false}>
                <TableCell colSpan={8} className="py-12">
                  <EmptyState
                    icon={Calendar}
                    title="No Screenings Scheduled"
                    description="No show schedules match your filter criteria."
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Show Cancellation Modal */}
      <Modal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, show: null, reason: '', submitting: false })}
        title="Cancel Show Screening"
        subtitle={`Cancel show for "${cancelModal.show?.movieTitle}" at ${cancelModal.show?.cinema?.name}?`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCancelSubmit} className="space-y-4">
          <Input
            label="Cancellation Reason"
            placeholder="E.g. Technical projector failure, distributor request."
            value={cancelModal.reason}
            onChange={(e) => setCancelModal((prev) => ({ ...prev, reason: e.target.value }))}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setCancelModal({ isOpen: false, show: null, reason: '', submitting: false })}
            >
              Back
            </Button>

            <Button type="submit" variant="destructive" loading={cancelModal.submitting}>
              Confirm Cancellation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
