import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
  IndianRupee,
  Percent,
  X,
  Sparkles
} from 'lucide-react';

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
      alert(err.message || 'Failed to create promo code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm('Delete this promo coupon?')) return;
    try {
      const res = await adminApi.deleteOffer(id);
      if (res.success) {
        setOffers((prev) => prev.filter((o) => o._id !== id));
      }
    } catch (err) {
      alert(err.message || 'Failed to remove offer.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#222432] tracking-tight flex items-center gap-2">
            <Tag className="w-6 h-6 text-[#F84464]" />
            <span>Platform Promotional Offers &amp; Coupons</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Create global consumer discount vouchers, flash-sale promo codes, and campaign incentives.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold transition shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Promo Coupon</span>
        </button>
      </div>

      {/* Offers List */}
      {loading ? (
        <div className="py-20 text-center text-gray-400">
          <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mx-auto mb-2" />
          <p className="text-xs">Loading campaign coupons...</p>
        </div>
      ) : offers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {offers.map((offer) => (
            <div
              key={offer._id}
              className="bg-white border border-[#EEEEF2] rounded-3xl p-5 hover:shadow-md transition flex flex-col justify-between shadow-sm relative overflow-hidden"
            >
              <div className="w-full h-1 bg-[#F84464] absolute top-0 left-0" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-sm font-black text-[#222432] bg-gray-100 border border-gray-200 px-3 py-1 rounded-xl tracking-wider">
                    {offer.code}
                  </span>
                  <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {offer.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#222432] mb-1">{offer.title}</h3>
                <p className="text-xs text-gray-500 mb-4">{offer.description || 'Valid on all movie screenings and live experiences'}</p>

                <div className="grid grid-cols-2 gap-2 text-xs py-3 border border-[#EEEEF2] bg-[#F9F9FB] p-3 rounded-2xl">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-black block">Discount Value</span>
                    <strong className="text-[#222432] font-mono text-sm">
                      {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-black block">Min Booking</span>
                    <strong className="text-gray-700 font-mono text-sm">₹{offer.minBookingAmount || 0}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500 mt-3 pt-2">
                  <span>Usage: <strong className="text-[#222432] font-mono">{offer.timesUsed || 0}</strong> redeemed</span>
                  <span>Expires: <strong className="text-[#222432]">{new Date(offer.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#EEEEF2] flex justify-end">
                <button
                  onClick={() => handleDeleteOffer(offer._id)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  title="Delete Offer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#EEEEF2] rounded-3xl p-12 text-center text-gray-400 shadow-sm">
          No promotional coupons active. Create your first campaign code above.
        </div>
      )}

      {/* Create Coupon Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#EEEEF2] rounded-3xl p-6 shadow-2xl text-[#222432]">
            <div className="flex items-center justify-between pb-4 border-b border-[#EEEEF2] mb-4">
              <h3 className="text-base font-black text-[#222432]">Create Platform Promotion</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOffer} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Coupon Code * (e.g. BMS50)</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="WELCOME100"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#222432] font-mono uppercase focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Campaign Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Flat 20% Off Weekend Blockbusters"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, discountType: e.target.value }))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Discount Value *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.discountValue}
                    onChange={(e) => setFormData((prev) => ({ ...prev, discountValue: Number(e.target.value) }))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minBookingAmount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, minBookingAmount: Number(e.target.value) }))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData((prev) => ({ ...prev, validUntil: e.target.value }))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-2 focus:ring-[#F84464]/20"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-[#EEEEF2]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#F84464] hover:bg-[#E03A58] text-white rounded-xl font-bold transition shadow-sm cursor-pointer"
                >
                  {submitting ? 'Creating...' : 'Activate Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
