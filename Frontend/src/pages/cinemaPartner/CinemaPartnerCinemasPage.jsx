import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cinemaPartnerApi } from '../../services/cinemaPartnerApi';
import { useCinemaToast } from '../../components/cinemaPartner/CinemaPartnerToastContext';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Tv,
  Calendar,
  CheckCircle2,
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
  Modal,
  ConfirmModal,
  Input,
  Select,
  EmptyState,
  Skeleton
} from '../../components/ui';

export default function CinemaPartnerCinemasPage() {
  const toast = useCinemaToast();
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCinema, setEditingCinema] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    city: 'Delhi-NCR',
    state: 'Delhi',
    address: '',
    contactPhone: '',
    contactEmail: '',
    facilities: ['M-Ticket', 'F&B', 'Parking'],
    status: 'active'
  });

  const availableFacilities = ['M-Ticket', 'F&B', 'Recliner', 'Parking', 'Wheelchair Access', 'Dolby Atmos'];

  const fetchCinemas = async () => {
    try {
      const res = await cinemaPartnerApi.getCinemas();
      if (res.success && res.cinemas) {
        setCinemas(res.cinemas);
      }
    } catch (err) {
      toast.error('Load Error', err.message || 'Failed to fetch cinemas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  const handleOpenAdd = () => {
    setEditingCinema(null);
    setFormData({
      name: '',
      city: 'Delhi-NCR',
      state: 'Delhi',
      address: '',
      contactPhone: '',
      contactEmail: '',
      facilities: ['M-Ticket', 'F&B', 'Parking'],
      status: 'active'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (cinema) => {
    setEditingCinema(cinema);
    setFormData({
      name: cinema.name,
      city: cinema.city,
      state: cinema.state || '',
      address: cinema.address,
      contactPhone: cinema.contactPhone || '',
      contactEmail: cinema.contactEmail || '',
      facilities: cinema.facilities || ['M-Ticket', 'F&B'],
      status: cinema.status || 'active'
    });
    setModalOpen(true);
  };

  const handleFacilityToggle = (fac) => {
    setFormData((prev) => {
      const exists = prev.facilities.includes(fac);
      return {
        ...prev,
        facilities: exists ? prev.facilities.filter((f) => f !== fac) : [...prev.facilities, fac]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCinema) {
        const res = await cinemaPartnerApi.updateCinema(editingCinema._id, formData);
        if (res.success) {
          toast.success('Cinema Updated', `${formData.name} updated successfully.`);
          setModalOpen(false);
          fetchCinemas();
        } else {
          toast.error('Update Failed', res.message);
        }
      } else {
        const res = await cinemaPartnerApi.createCinema(formData);
        if (res.success) {
          toast.success('Cinema Registered', `${formData.name} is now live.`);
          setModalOpen(false);
          fetchCinemas();
        } else {
          toast.error('Creation Failed', res.message);
        }
      }
    } catch (err) {
      toast.error('Submission Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const res = await cinemaPartnerApi.deleteCinema(deleteConfirm._id);
      if (res.success) {
        toast.success('Cinema Deleted', `${deleteConfirm.name} removed from your network.`);
        setDeleteConfirm(null);
        fetchCinemas();
      } else {
        toast.error('Delete Failed', res.message);
      }
    } catch (err) {
      toast.error('Delete Error', err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#222432]">
      {/* Header */}
      <PageHeader
        title="My Multiplexes & Theatres"
        subtitle="Manage your circuit venues, street addresses, auditorium screens, and guest amenities."
        icon={Building2}
        badge="Circuit Management"
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleOpenAdd}
          >
            Add New Cinema
          </Button>
        }
      />

      {/* Cinema Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-3xl" />
          ))}
        </div>
      ) : cinemas.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            icon={Building2}
            title="No Cinemas Registered"
            description="Add your first cinema hall or multiplex property to start configuring screens and scheduling movie shows."
            actionLabel="Add Cinema"
            onAction={handleOpenAdd}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cinemas.map((c) => (
            <Card
              key={c._id}
              className="flex flex-col justify-between hover:shadow-lg transition-all group overflow-hidden"
            >
              <div className="p-6 pb-0">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-[#222432] group-hover:text-[#F84464] transition-colors truncate">
                      {c.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#F84464] shrink-0" />
                      <span className="truncate">{c.address}, {c.city}</span>
                    </div>
                  </div>
                  <Badge variant={c.status === 'active' ? 'approved' : 'neutral'} dot>
                    {c.status}
                  </Badge>
                </div>

                {/* Capacity & Screens Cards */}
                <div className="grid grid-cols-2 gap-2.5 my-4 p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#F84464]/10 text-[#F84464] flex items-center justify-center shrink-0">
                      <Tv className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Auditoriums</div>
                      <div className="text-xs font-bold text-[#222432]">{c.screensCount || 0} Screens</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Scheduled</div>
                      <div className="text-xs font-bold text-[#222432]">{c.activeShowsCount || 0} Shows</div>
                    </div>
                  </div>
                </div>

                {/* Amenities Badges */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(c.facilities || []).map((fac, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-medium border border-gray-200/60"
                    >
                      {fac}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 mt-4 border-t border-[#EEEEF2] bg-gray-50/40 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Link to="/cinema-partner/screens">
                    <Button variant="outline" size="sm" className="bg-white">
                      Screens
                    </Button>
                  </Link>
                  <Link to="/cinema-partner/shows">
                    <Button variant="outline" size="sm" className="bg-white">
                      Shows
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Edit2}
                    onClick={() => handleOpenEdit(c)}
                    title="Edit Venue Details"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => setDeleteConfirm(c)}
                    className="text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Delete Venue"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Cinema Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCinema ? 'Edit Cinema Property' : 'Register New Cinema Property'}
        description="Configure theatre venue details, location, and guest amenities."
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={saving}
            >
              {editingCinema ? 'Update Cinema' : 'Create Cinema'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Cinema / Multiplex Name *"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. INOX: Vegas Mall, Dwarka"
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Operational City *"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              options={[
                { value: 'Delhi-NCR', label: 'Delhi-NCR' },
                { value: 'Mumbai', label: 'Mumbai' },
                { value: 'Bengaluru', label: 'Bengaluru' },
                { value: 'Jaipur', label: 'Jaipur' },
                { value: 'Chandigarh', label: 'Chandigarh' },
                { value: 'Pune', label: 'Pune' },
                { value: 'Hyderabad', label: 'Hyderabad' },
                { value: 'Kolkata', label: 'Kolkata' }
              ]}
            />

            <Select
              label="Operating Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'active', label: 'Active & Operational' },
                { value: 'inactive', label: 'Temporarily Inactive' }
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Full Street Address *
            </label>
            <textarea
              required
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Sector 14, Vegas Mall, Dwarka, New Delhi"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#222432] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Venue Desk Contact Phone"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              placeholder="011-28034567"
              icon={Phone}
            />

            <Input
              label="Operations Email"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              placeholder="operations@multiplex.com"
              icon={Mail}
            />
          </div>

          {/* Amenities checklist */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Guest Facilities &amp; Amenities
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableFacilities.map((fac) => {
                const selected = formData.facilities.includes(fac);
                return (
                  <button
                    type="button"
                    key={fac}
                    onClick={() => handleFacilityToggle(fac)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between border transition cursor-pointer ${
                      selected
                        ? 'bg-[#F84464]/10 border-[#F84464] text-[#F84464]'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span>{fac}</span>
                    {selected && <CheckCircle2 className="w-3.5 h-3.5 text-[#F84464]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Cinema Property?"
        message={`Are you sure you want to permanently remove "${deleteConfirm?.name}"? All associated screen halls and shows without active bookings will also be deleted.`}
        confirmText="Confirm Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
