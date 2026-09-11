import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vendorApi } from '../../services/vendorApi';
import {
  PageHeader,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Modal,
  ConfirmModal,
  Input,
  Select,
  EmptyState
} from '../../components/ui';
import {
  MapPin,
  Plus,
  Tv,
  Phone,
  Mail,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const POPULAR_CITIES = [
  'Mumbai',
  'Delhi-NCR',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Kolkata',
  'Ahmedabad',
  'Chandigarh',
  'Jaipur'
];

const AVAILABLE_FACILITIES = [
  'M-Ticket',
  'F&B',
  'Recliner',
  'IMAX Laser',
  'Dolby Atmos',
  'Valet Parking',
  'Wheelchair Access',
  'Food Court'
];

export default function VendorCinemasPage() {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    city: 'Bengaluru',
    state: '',
    address: '',
    contactPhone: '',
    contactEmail: '',
    facilities: ['M-Ticket', 'F&B', 'Recliner']
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchCinemas = async () => {
    try {
      const res = await vendorApi.getCinemas();
      if (res.success && res.data) {
        setCinemas(res.data);
      }
    } catch (err) {
      console.error('Failed to load cinemas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  const openAddModal = () => {
    setFormData({
      name: '',
      city: 'Bengaluru',
      state: '',
      address: '',
      contactPhone: '',
      contactEmail: '',
      facilities: ['M-Ticket', 'F&B', 'Recliner']
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (cinema) => {
    setSelectedCinema(cinema);
    setFormData({
      name: cinema.name,
      city: cinema.city,
      state: cinema.state || '',
      address: cinema.address,
      contactPhone: cinema.contactPhone || '',
      contactEmail: cinema.contactEmail || '',
      facilities: cinema.facilities || []
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (cinema) => {
    setSelectedCinema(cinema);
    setIsDeleteModalOpen(true);
  };

  const toggleFacility = (facility) => {
    setFormData(prev => {
      const current = prev.facilities || [];
      if (current.includes(facility)) {
        return { ...prev, facilities: current.filter(f => f !== facility) };
      } else {
        return { ...prev, facilities: [...current, facility] };
      }
    });
  };

  const handleCreateCinema = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.city || !formData.address) {
      setFormError('Cinema name, city, and address are required.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      const res = await vendorApi.createCinema(formData);
      if (res.success) {
        setIsAddModalOpen(false);
        await fetchCinemas();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to create cinema.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateCinema = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.city || !formData.address) {
      setFormError('Cinema name, city, and address are required.');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      const res = await vendorApi.updateCinema(selectedCinema.id || selectedCinema._id, formData);
      if (res.success) {
        setIsEditModalOpen(false);
        await fetchCinemas();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to update cinema.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCinema = async () => {
    if (!selectedCinema) return;
    try {
      const res = await vendorApi.deleteCinema(selectedCinema.id || selectedCinema._id);
      if (res.success) {
        setIsDeleteModalOpen(false);
        await fetchCinemas();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete cinema');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <MapPin className="text-[#F84464]" size={24} />
            <span>Cinemas & Multiplexes</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your cinema properties, venue facilities, and contact details.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 shadow-sm"
        >
          <Plus size={16} />
          <span>Add Multiplex</span>
        </Button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-500">
          Loading your cinema venues...
        </div>
      ) : cinemas.length === 0 ? (
        <EmptyState
          title="No Cinema Venues Added"
          description="Add your first multiplex or theatre to start configuring auditoriums and scheduling movie shows for customers."
          actionText="Add Cinema Venue"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cinemas.map((cinema) => (
            <Card key={cinema.id || cinema._id} className="shadow-sm border-gray-200 flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base text-gray-900 leading-tight">
                        {cinema.name}
                      </CardTitle>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                        <MapPin size={13} className="text-[#F84464] shrink-0" />
                        <span>{cinema.city}{cinema.state ? `, ${cinema.state}` : ''}</span>
                      </div>
                    </div>
                    <Badge variant={cinema.status === 'active' ? 'success' : 'secondary'} className="text-[10px]">
                      {cinema.status === 'active' ? 'Operational' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 text-xs text-gray-600">
                  <p className="line-clamp-2">{cinema.address}</p>

                  <div className="flex items-center gap-4 py-2 border-y border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <Tv size={14} className="text-indigo-600" />
                      <span className="font-semibold text-gray-900">
                        {cinema.screensCount || 0}
                      </span>
                      <span className="text-gray-500">Screen(s)</span>
                    </div>

                    {cinema.contactPhone && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <Phone size={12} />
                        <span>{cinema.contactPhone}</span>
                      </div>
                    )}
                  </div>

                  {/* Facilities Badges */}
                  <div>
                    <p className="text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                      Facilities
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(cinema.facilities || []).map((f) => (
                        <span
                          key={f}
                          className="bg-gray-100 text-gray-700 text-[10px] font-medium px-2 py-0.5 rounded-full"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </div>

              <CardFooter className="pt-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                <Link
                  to={`/vendor/screens?cinemaId=${cinema.id || cinema._id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                >
                  <Tv size={13} />
                  <span>Configure Audi Screens</span>
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(cinema)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md transition"
                    title="Edit Venue Details"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(cinema)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 rounded-md transition"
                    title="Delete Venue"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Cinema Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Add Cinema Venue' : 'Edit Cinema Venue'}
        maxWidth="max-w-lg"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={isAddModalOpen ? handleCreateCinema : handleUpdateCinema} className="space-y-4">
          <Input
            label="Cinema / Multiplex Name"
            required
            placeholder="e.g. CineWorld: Grand Galleria Mall"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              options={POPULAR_CITIES.map(c => ({ value: c, label: c }))}
            />
            <Input
              label="State / Province"
              placeholder="e.g. Karnataka"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
          </div>

          <Input
            label="Full Physical Address"
            required
            placeholder="e.g. Level 4, Grand Galleria, MG Road, Bengaluru"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact Phone"
              placeholder="e.g. 9820198201"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            />
            <Input
              label="Contact Email"
              type="email"
              placeholder="manager@theatre.com"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Venue Amenities & Facilities
            </label>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_FACILITIES.map((fac) => {
                const isSelected = (formData.facilities || []).includes(fac);
                return (
                  <button
                    key={fac}
                    type="button"
                    onClick={() => toggleFacility(fac)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border text-left font-medium transition flex items-center justify-between ${
                      isSelected
                        ? 'border-[#F84464] bg-rose-50 text-[#F84464]'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{fac}</span>
                    {isSelected && <CheckCircle size={13} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={formLoading}
            >
              {isAddModalOpen ? 'Add Cinema Venue' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteCinema}
        title="Delete Cinema Venue"
        message={`Are you sure you want to delete '${selectedCinema?.name}'? All its screens and show layouts will be permanently removed.`}
        confirmText="Yes, Delete Venue"
        type="danger"
      />
    </div>
  );
}
