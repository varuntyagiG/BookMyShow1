import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import {
  Tag,
  Plus,
  Trash2,
  Calendar,
  Percent,
  Sparkles,
  Ticket,
  Clock,
  Coins
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

export default function AdminOffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: 20,
    minBookingAmount: 300,
    maxDiscount: 100,
    validUntil: '2026-12-31'
  });

  // Delete Confirm State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOffers();
      if (res.success) {
        setOffers(res.offers || []);
      }
    } catch (err) {
      console.error('Error fetching offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await adminApi.createOffer(formData);
      if (res.success) {
        setOffers((prev) => [res.offer, ...prev]);
        setModalOpen(false);
        setFormData({
          code: '',
          title: '',
          description: '',
          discountType: 'percentage',
          discountValue: 20,
          minBookingAmount: 300,
          maxDiscount: 100,
          validUntil: '2026-12-31'
        });
      }
    } catch (err) {
      console.error('Failed to create offer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteConfirm = (offer) => {
    setOfferToDelete(offer);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteOffer = async () => {
    if (!offerToDelete) return;
    setDeleting(true);
    try {
      const res = await adminApi.deleteOffer(offerToDelete._id);
      if (res.success) {
        setOffers((prev) => prev.filter((o) => o._id !== offerToDelete._id));
        setDeleteConfirmOpen(false);
        setOfferToDelete(null);
      }
    } catch (err) {
      console.error('Failed to remove offer:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Promotional Offers & Consumer Coupons"
        subtitle="Configure platform discount vouchers, flash-sale codes, and consumer incentive campaigns."
        icon={Tag}
        badge="Marketing Engine"
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setModalOpen(true)}
          >
            Create Promo Coupon
          </Button>
        }
      />

      {/* Offers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : offers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {offers.map((offer) => (
            <Card key={offer._id} className="relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              {/* Top Accent Strip */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F84464] to-[#f76781]" />

              <div className="p-5 pb-0">
                {/* Coupon Code Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gray-100 border border-gray-200 font-mono text-xs font-black text-[#222432] tracking-wider">
                    <Ticket className="w-3.5 h-3.5 text-[#F84464]" />
                    <span>{offer.code}</span>
                  </div>
                  <Badge variant={offer.status === 'active' ? 'approved' : 'neutral'} dot>
                    {offer.status || 'Active'}
                  </Badge>
                </div>

                {/* Title & Description */}
                <h3 className="text-sm font-bold text-[#222432] line-clamp-1 mb-1">
                  {offer.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 min-h-[32px] mb-4">
                  {offer.description || 'Valid on all movie screenings and multiplex experiences across India.'}
                </p>

                {/* Offer Metrics Pill Card */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-[#F9F9FB] rounded-xl border border-[#EEEEF2] text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Discount Value</span>
                    <strong className="text-[#222432] font-mono text-sm font-black">
                      {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Min Booking</span>
                    <strong className="text-gray-700 font-mono text-sm">
                      ₹{offer.minBookingAmount || 0}
                    </strong>
                  </div>
                </div>

                {/* Redemption & Validity Meta */}
                <div className="flex items-center justify-between text-[11px] text-gray-500 mt-4 pt-2">
                  <span className="flex items-center gap-1">
                    <Coins className="w-3 h-3 text-amber-500" />
                    <span>Usage:</span>
                    <strong className="font-mono text-[#222432]">{offer.timesUsed || 0}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span>Expires:</span>
                    <strong className="text-[#222432]">
                      {new Date(offer.validUntil).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-4 mt-2 border-t border-[#EEEEF2] flex items-center justify-end bg-gray-50/40">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  onClick={() => openDeleteConfirm(offer)}
                  className="text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-12">
          <EmptyState
            icon={Tag}
            title="No Active Promotional Coupons"
            description="Create your first campaign voucher to offer consumer discounts on ticket bookings."
            actionLabel="Create Promo Coupon"
            onAction={() => setModalOpen(true)}
          />
        </Card>
      )}

      {/* Create Promo Coupon Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Platform Promotional Coupon"
        description="Launch a new promotional voucher code for BookMyTrip customer bookings."
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
              onClick={handleCreateOffer}
              loading={submitting}
            >
              Activate Coupon
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateOffer} className="space-y-4">
          <Input
            label="Coupon Code *"
            value={formData.code}
            onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
            placeholder="e.g. BLOCKBUSTER50"
            helper="Uppercase letters and numbers only"
            required
          />

          <Input
            label="Campaign Title *"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Flat 20% Off Weekend Premiere"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Discount Type"
              value={formData.discountType}
              onChange={(e) => setFormData((prev) => ({ ...prev, discountType: e.target.value }))}
              options={[
                { value: 'percentage', label: 'Percentage (%)' },
                { value: 'fixed', label: 'Flat Amount (₹)' }
              ]}
            />

            <Input
              label="Discount Value *"
              type="number"
              min="1"
              value={formData.discountValue}
              onChange={(e) => setFormData((prev) => ({ ...prev, discountValue: Number(e.target.value) }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Min Order Value (₹)"
              type="number"
              min="0"
              value={formData.minBookingAmount}
              onChange={(e) => setFormData((prev) => ({ ...prev, minBookingAmount: Number(e.target.value) }))}
            />

            <Input
              label="Expiry Date *"
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData((prev) => ({ ...prev, validUntil: e.target.value }))}
              required
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteOffer}
        title="Delete Promo Coupon?"
        message={`Are you sure you want to permanently remove coupon "${offerToDelete?.code}"? Customers will no longer be able to apply this discount at checkout.`}
        confirmText="Delete Coupon"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
