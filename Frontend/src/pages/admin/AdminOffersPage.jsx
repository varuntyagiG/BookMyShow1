import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../services/adminApi';
import { useRealtimeRefresh } from '../../services/realtimeSync';
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  CreditCard,
  Percent,
  Sparkles,
  Gift,
  Building2,
  X,
  RefreshCw
} from 'lucide-react';

export default function AdminOffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const initialForm = {
    code: '',
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: 20,
    maxDiscountAmount: 200,
    minBookingAmount: 300,
    bankName: 'ICICI Bank',
    cardType: 'Credit',
    category: 'bank',
    badgeText: '20% OFF',
    usageLimitPerUser: 1,
    isActive: true
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getOffers();
      if (res.success && res.data) {
        setOffers(res.data);
      }
    } catch (err) {
      console.error('Failed to load offers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  // Real-time reactive sync across tabs & portals
  useRealtimeRefresh(['OFFER_MUTATION'], () => {
    fetchOffers();
  });

  const handleOpenAdd = () => {
    setEditingOffer(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const handleOpenEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      code: offer.code || '',
      title: offer.title || '',
      description: offer.description || '',
      discountType: offer.discountType || 'percentage',
      discountValue: offer.discountValue || 20,
      maxDiscountAmount: offer.maxDiscountAmount || 200,
      minBookingAmount: offer.minBookingAmount || 300,
      bankName: offer.bankName || 'All Banks',
      cardType: offer.cardType || 'All',
      category: offer.category || 'bank',
      badgeText: offer.badgeText || '',
      usageLimitPerUser: offer.usageLimitPerUser || 1,
      isActive: offer.isActive ?? true
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        discountValue: Number(formData.discountValue),
        maxDiscountAmount: Number(formData.maxDiscountAmount),
        minBookingAmount: Number(formData.minBookingAmount),
        usageLimitPerUser: Number(formData.usageLimitPerUser)
      };

      if (editingOffer) {
        await adminApi.updateOffer(editingOffer._id || editingOffer.id, payload);
        setToastMessage('Bank Alliance offer updated');
      } else {
        await adminApi.createOffer(payload);
        setToastMessage('New Bank Promo Campaign launched');
      }

      setShowModal(false);
      setTimeout(() => setToastMessage(null), 3000);
      fetchOffers();
    } catch (err) {
      alert(err.message || 'Failed to save offer');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOffer = async (offerId, code) => {
    if (!window.confirm(`Are you sure you want to retire offer code ${code}?`)) {
      return;
    }
    try {
      await adminApi.deleteOffer(offerId);
      setToastMessage('Offer campaign terminated');
      setTimeout(() => setToastMessage(null), 3000);
      fetchOffers();
    } catch (err) {
      alert(err.message || 'Failed to delete offer');
    }
  };

  const handleToggleActive = async (offer) => {
    try {
      await adminApi.updateOffer(offer._id || offer.id, { isActive: !offer.isActive });
      setToastMessage(`Offer ${!offer.isActive ? 'Activated' : 'Paused'}`);
      setTimeout(() => setToastMessage(null), 3000);
      fetchOffers();
    } catch (err) {
      alert(err.message || 'Failed to toggle offer status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tag size={16} className="text-[#F84464]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Commercial Alliances Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Bank Deals, B1G1 & Promos
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Configure co-branded credit card concessions, Buy 1 Get 1 Free rules & nationwide coupons
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-[#F84464] hover:bg-[#d83552] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition"
          >
            <Plus size={16} />
            <span>Launch Offer</span>
          </button>

          <button
            onClick={() => fetchOffers()}
            className="p-2 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 rounded-xl border border-gray-300 shadow-sm transition"
            title="Refresh List"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-[#F84464]' : ''} />
          </button>
        </div>
      </div>

      {/* Offers Cards Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-[#F84464] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Loading Bank Alliance campaigns...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500 shadow-sm">
          <Tag size={36} className="mx-auto text-gray-400 mb-3" />
          <p className="text-sm font-semibold text-gray-700">No active promotional campaigns</p>
          <p className="text-xs text-gray-500 mt-1">Launch your first Bank Card Alliance or B1G1 promo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {offers.map((o) => {
            const offerId = o._id || o.id;
            const isB1G1 = o.discountType === 'b1g1';
            const isFlat = o.discountType === 'flat';
            const isPercent = o.discountType === 'percentage';

            return (
              <div
                key={offerId}
                className="bg-white border border-gray-200 hover:border-gray-300 rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Badge & Code */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-gray-900 bg-gray-50 border border-gray-200 px-3 py-1 rounded-lg tracking-wider">
                      {o.code}
                    </span>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          o.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {o.isActive ? 'Active' : 'Paused'}
                      </span>
                      {o.badgeText && (
                        <span className="bg-[#F84464] text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shadow-sm">
                          {o.badgeText}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="text-base font-bold text-gray-900">{o.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {o.description}
                  </p>

                  {/* Commercial Specifications */}
                  <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-gray-700">
                      <span className="text-gray-500 flex items-center gap-1.5">
                        <CreditCard size={13} className="text-[#F84464]" />
                        <span>Partner Bank:</span>
                      </span>
                      <span className="font-bold text-gray-900">{o.bankName || 'Universal'}</span>
                    </div>

                    <div className="flex items-center justify-between text-gray-700">
                      <span className="text-gray-500 flex items-center gap-1.5">
                        <Sparkles size={13} className="text-amber-500" />
                        <span>Benefit:</span>
                      </span>
                      <span className="font-bold text-emerald-700">
                        {isB1G1 && 'Buy 1 Get 1 Free'}
                        {isFlat && `Flat ₹${o.discountValue} OFF`}
                        {isPercent && `${o.discountValue}% OFF (Max ₹${o.maxDiscountAmount})`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-gray-700">
                      <span className="text-gray-500">Min Cart Value:</span>
                      <span className="font-semibold text-gray-900">₹{o.minBookingAmount || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleActive(o)}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition"
                  >
                    {o.isActive ? 'Pause Campaign' : 'Activate Campaign'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(o)}
                      className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded-lg border border-gray-200 transition"
                      title="Edit Campaign"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteOffer(offerId, o.code)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200 transition"
                      title="Delete Campaign"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Offer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Gift size={18} className="text-[#F84464]" />
                <span>{editingOffer ? 'Edit Bank Alliance Promo' : 'Launch Bank Alliance / Offer'}</span>
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="ICICIB1G1"
                    className="w-full bg-white border border-gray-300 text-gray-900 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-[#F84464] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Badge Pill Text
                  </label>
                  <input
                    type="text"
                    value={formData.badgeText}
                    onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                    placeholder="B1G1 / 20% OFF"
                    className="w-full bg-white border border-gray-300 text-gray-900 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-[#F84464]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Offer Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="ICICI Bank Buy 1 Get 1 Free"
                  className="w-full bg-white border border-gray-300 text-gray-900 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-[#F84464]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Terms & Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="1 complimentary ticket on select credit cards..."
                  className="w-full bg-white border border-gray-300 text-gray-900 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-[#F84464] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Discount Model
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-800 px-3 py-2 rounded-xl text-xs outline-none focus:border-[#F84464]"
                  >
                    <option value="b1g1">Buy 1 Get 1 Free (B1G1)</option>
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="flat">Flat Cash Discount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Discount Value (% or ₹)
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-900 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-[#F84464]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-900 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-[#F84464]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Min Booking Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.minBookingAmount}
                    onChange={(e) => setFormData({ ...formData, minBookingAmount: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-900 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-[#F84464]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Alliance Bank Partner
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="e.g. ICICI Bank, SBI, HDFC"
                    className="w-full bg-white border border-gray-300 text-gray-900 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-[#F84464]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Eligible Card Tier
                  </label>
                  <input
                    type="text"
                    value={formData.cardType}
                    onChange={(e) => setFormData({ ...formData, cardType: e.target.value })}
                    placeholder="Credit / Debit / Signature"
                    className="w-full bg-white border border-gray-300 text-gray-900 px-3.5 py-2 rounded-xl text-sm outline-none focus:border-[#F84464]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#F84464] hover:bg-[#d83552] rounded-xl shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingOffer ? 'Update Campaign' : 'Launch Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
