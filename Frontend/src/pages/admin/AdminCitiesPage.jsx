import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import {
  MapPin,
  Plus,
  Store,
  Sparkles,
  Building,
  Navigation
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
  Input,
  EmptyState,
  Skeleton
} from '../../components/ui';

export default function AdminCitiesPage() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    icon: '🏙️',
    isPopular: false
  });

  const fetchCities = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCities();
      if (res.success) {
        setCities(res.cities || []);
      }
    } catch (err) {
      console.error('Error fetching cities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleCreateCity = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await adminApi.createCity(formData);
      if (res.success) {
        fetchCities();
        setModalOpen(false);
        setFormData({ name: '', state: '', icon: '🏙️', isPopular: false });
      }
    } catch (err) {
      console.error('Failed to add city:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (city) => {
    const newStatus = city.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await adminApi.updateCity(city._id, { status: newStatus });
      if (res.success) {
        setCities((prev) =>
          prev.map((c) => (c._id === city._id ? { ...c, status: newStatus } : c))
        );
      }
    } catch (err) {
      console.error('Failed to update city status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Operational Cities & Geographic Zones"
        subtitle="Manage metropolitan territories where BookMyTrip services and cinema partner ticketing operations are active."
        icon={MapPin}
        badge="Coverage Zones"
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setModalOpen(true)}
          >
            Add Operational City
          </Button>
        }
      />

      {/* Cities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : cities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cities.map((city) => (
            <Card
              key={city._id}
              className="flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="p-5 pb-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">
                    {city.icon || '🏙️'}
                  </div>
                  {city.isPopular && (
                    <Badge variant="warning" pill>
                      Tier 1 Metro
                    </Badge>
                  )}
                </div>

                <h3 className="text-base font-bold text-[#222432] mb-0.5">
                  {city.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {city.state || 'India'}
                </p>

                <div className="mt-4 pt-3 border-t border-[#EEEEF2] flex items-center justify-between text-xs">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-gray-400" />
                    <span>Active Venues:</span>
                  </span>
                  <strong className="text-[#F84464] font-mono font-bold">
                    {city.cinemasCount || 0} Multiplexes
                  </strong>
                </div>
              </div>

              <div className="p-4 mt-3 border-t border-[#EEEEF2] bg-gray-50/40 flex items-center justify-between text-xs">
                <span className="text-gray-400 font-medium text-[11px]">Lifecycle</span>
                <button
                  onClick={() => handleToggleStatus(city)}
                  className="cursor-pointer"
                >
                  <Badge
                    variant={city.status === 'active' ? 'approved' : 'neutral'}
                    dot
                  >
                    {city.status === 'active' ? 'Active' : 'Suspended'}
                  </Badge>
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-12">
          <EmptyState
            icon={MapPin}
            title="No Operational Cities Registered"
            description="Add territories to enable venue onboarding and regional customer searches."
            actionLabel="Add Operational City"
            onAction={() => setModalOpen(true)}
          />
        </Card>
      )}

      {/* Add City Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Operational City"
        description="Register a new metropolitan hub for multiplex discovery and booking operations."
        size="md"
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
              onClick={handleCreateCity}
              loading={submitting}
            >
              Add City
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateCity} className="space-y-4">
          <Input
            label="City Name *"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Hyderabad"
            required
          />

          <Input
            label="State / Province"
            value={formData.state}
            onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
            placeholder="e.g. Telangana"
          />

          <div className="grid grid-cols-2 gap-3 items-end">
            <Input
              label="City Emoji Icon"
              value={formData.icon}
              onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
              placeholder="🏰"
              className="text-center"
            />

            <div className="flex items-center gap-2 pb-2.5">
              <input
                type="checkbox"
                id="isPopularCity"
                checked={formData.isPopular}
                onChange={(e) => setFormData((prev) => ({ ...prev, isPopular: e.target.checked }))}
                className="w-4 h-4 rounded text-[#F84464] accent-[#F84464] focus:ring-[#F84464]"
              />
              <label htmlFor="isPopularCity" className="text-xs font-bold text-gray-700 cursor-pointer">
                Tier 1 Metro (Featured)
              </label>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
