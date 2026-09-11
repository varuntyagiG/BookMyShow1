import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import {
  Store,
  Search,
  MapPin,
  Building2,
  Tv,
  Calendar,
  Layers,
  Power
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
  ConfirmModal,
  EmptyState,
  SkeletonTableRows
} from '../../components/ui';

export default function AdminCinemasPage() {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Status toggle confirmation modal
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    cinema: null,
    loading: false
  });

  const fetchCinemas = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCinemas({
        search,
        city: cityFilter,
        status: statusFilter
      });
      if (res.success) {
        setCinemas(res.cinemas || []);
      }
    } catch (err) {
      console.error('Error fetching cinemas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, [search, cityFilter, statusFilter]);

  const handleConfirmStatusToggle = async () => {
    const cinema = statusModal.cinema;
    if (!cinema) return;

    const newStatus = cinema.status === 'active' ? 'inactive' : 'active';
    setStatusModal((prev) => ({ ...prev, loading: true }));

    try {
      const res = await adminApi.updateCinemaStatus(cinema._id, { status: newStatus });
      if (res.success) {
        setCinemas((prev) =>
          prev.map((c) => (c._id === cinema._id ? { ...c, status: newStatus } : c))
        );
        setStatusModal({ isOpen: false, cinema: null, loading: false });
      }
    } catch (err) {
      console.error('Failed to update cinema status:', err);
      setStatusModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const distinctCities = Array.from(new Set(cinemas.map((c) => c.city).filter(Boolean)));

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Page Header */}
      <PageHeader
        title="Global Cinema Multiplexes"
        subtitle="Oversight across all physical theatre venues, city locations, auditorium capacities, and active screening statuses."
        icon={Store}
        badge="Venues"
      />

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search multiplex name or city..."
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Cities' },
                ...distinctCities.map((city) => ({ value: city, label: city }))
              ]}
              wrapperClassName="w-full sm:w-44"
            />

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active Only' },
                { value: 'inactive', label: 'Inactive Only' }
              ]}
              wrapperClassName="w-full sm:w-40"
            />
          </div>
        </div>
      </Card>

      {/* Cinemas Table */}
      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow hover={false}>
              <TableHead>Cinema Multiplex</TableHead>
              <TableHead>Operating City</TableHead>
              <TableHead>Partner Operator</TableHead>
              <TableHead>Screens</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Venue Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <SkeletonTableRows rows={6} cols={7} />
            ) : cinemas.length > 0 ? (
              cinemas.map((c) => (
                <TableRow key={c._id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-red-50 text-[#F84464] font-black text-xs flex items-center justify-center shrink-0 border border-red-100">
                        <Store className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[#222432] truncate">{c.name}</div>
                        <div className="text-[11px] text-gray-400 truncate">{c.address}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="inline-flex items-center gap-1 font-bold text-[#222432]">
                      <MapPin className="w-3.5 h-3.5 text-[#F84464]" />
                      {c.city}
                    </span>
                  </TableCell>

                  <TableCell className="text-gray-600">
                    {c.partner?.businessName || c.partner?.name || 'Independent Partner'}
                  </TableCell>

                  <TableCell>
                    <span className="font-bold text-[#222432]">{c.activeScreensCount || 0} Audis</span>
                  </TableCell>

                  <TableCell className="font-mono text-gray-700 font-bold">
                    {(c.managedCapacity || 120).toLocaleString()} seats
                  </TableCell>

                  <TableCell>
                    <Badge variant={c.status === 'active' ? 'active' : 'inactive'} dot>
                      {c.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant={c.status === 'active' ? 'secondary' : 'primary'}
                      size="xs"
                      onClick={() => setStatusModal({ isOpen: true, cinema: c, loading: false })}
                    >
                      <Power className="w-3.5 h-3.5 mr-1" />
                      {c.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow hover={false}>
                <TableCell colSpan={7} className="py-12">
                  <EmptyState
                    icon={Store}
                    title="No Cinema Multiplexes Found"
                    description="No cinema locations match your selected filter criteria."
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, cinema: null, loading: false })}
        onConfirm={handleConfirmStatusToggle}
        title={statusModal.cinema?.status === 'active' ? 'Deactivate Cinema Multiplex' : 'Activate Cinema Multiplex'}
        description={
          statusModal.cinema?.status === 'active'
            ? `Deactivate "${statusModal.cinema?.name}"? Shows for this cinema will not appear in the customer search catalog.`
            : `Activate "${statusModal.cinema?.name}"? Its screens and scheduled shows will become visible to customers.`
        }
        confirmText={statusModal.cinema?.status === 'active' ? 'Deactivate Venue' : 'Activate Venue'}
        variant={statusModal.cinema?.status === 'active' ? 'destructive' : 'primary'}
        loading={statusModal.loading}
      />
    </div>
  );
}
