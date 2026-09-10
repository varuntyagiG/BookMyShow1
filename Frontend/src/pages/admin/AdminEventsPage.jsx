import React, { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../../services/api';
import { useAdminToast } from '../../components/admin/AdminToastContext';
import AdminConfirmModal from '../../components/admin/AdminConfirmModal';
import AdminPagination from '../../components/admin/AdminPagination';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import {
  Sparkles,
  Plus,
  Trash2,
  Image,
  MapPin,
  Calendar,
  IndianRupee,
  AlertCircle,
  Loader2,
  X,
  Search
} from 'lucide-react';

const CATEGORY_TABS = [
  { key: 'event', label: 'Live Events & Concerts' },
  { key: 'banner', label: 'Hero Banners' },
  { key: 'sport', label: 'Sports Matches' },
  { key: 'play', label: 'Theatre Plays' },
  { key: 'activity', label: 'Activities' },
  { key: 'premiere', label: 'Stream Premieres' }
];

export default function AdminEventsPage() {
  const { showToast } = useAdminToast();
  const [activeTab, setActiveTab] = useState('event');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    isDestructive: false,
    onConfirm: null,
    loading: false
  });

  const [formData, setFormData] = useState({
    categoryType: 'event',
    title: '',
    subtitle: '',
    category: 'Music Shows',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
    date: 'Fri, 15 Nov, 7:00 PM',
    venue: 'Mahalaxmi Race Course',
    price: '₹ 1,500 onwards',
    rentPrice: '₹ 149',
    buyPrice: '₹ 499',
    city: 'Mumbai',
    description: 'Spectacular visual and musical production.',
    tag: 'Trending Worldwide',
    badge: 'Selling Fast'
  });

  const loadItems = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setLoading(true);
    setError('');
    try {
      const res = await adminApi.getItems({ type: activeTab });
      if (res.success) {
        setItems(res.items || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load items.');
      showToast('error', err.message || 'Failed to load items.');
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    loadItems(true);
    setCurrentPage(1);
  }, [activeTab]);

  const handleOpenAdd = () => {
    setFormData(prev => ({
      ...prev,
      categoryType: activeTab,
      title: '',
      subtitle: '',
      venue: activeTab === 'premiere' ? 'Digital Stream' : 'Venue Arena',
      date: 'Available Now'
    }));
    setIsModalOpen(true);
  };

  const handleDeletePrompt = (item) => {
    const id = item.id || item._id;
    setConfirmModal({
      isOpen: true,
      title: 'Delete Catalog Item?',
      message: `Are you sure you want to delete "${item.title}"? This item will immediately disappear from the BookMyShow customer feed.`,
      confirmText: 'Delete Item',
      isDestructive: true,
      loading: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        try {
          const res = await adminApi.deleteItem(id);
          if (res.success) {
            // Local state update — NO full table wipe / refetch
            setItems(prev => prev.filter(i => (i.id || i._id) !== id));
            showToast('success', `Deleted "${item.title}" successfully.`);
            setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
          } else {
            showToast('error', res.message || 'Failed to delete item.');
            setConfirmModal(prev => ({ ...prev, loading: false }));
          }
        } catch (err) {
          showToast('error', err.message || 'Failed to delete item.');
          setConfirmModal(prev => ({ ...prev, loading: false }));
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await adminApi.createItem(formData);
      if (res.success && res.item) {
        // Local state update — PREPEND to current list without refetching
        setItems(prev => [res.item, ...prev]);
        showToast('success', `Created "${formData.title}" successfully.`);
        setIsModalOpen(false);
      } else {
        showToast('error', res.message || 'Failed to create item.');
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to create item.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(item =>
      item.title?.toLowerCase().includes(term) ||
      item.subtitle?.toLowerCase().includes(term) ||
      item.venue?.toLowerCase().includes(term) ||
      item.city?.toLowerCase().includes(term)
    );
  }, [items, searchTerm]);

  // Paginated items
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        badgeIcon={Sparkles}
        badgeText="Live Experiences"
        title="Events &amp; Media Catalog"
        description="Oversee live concerts, theatre plays, sports tournaments, workshops, and promotional hero banners"
      >
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F84464] hover:bg-[#E03A58] text-white text-xs font-bold transition shadow-md shadow-[#F84464]/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New {CATEGORY_TABS.find(t => t.key === activeTab)?.label.slice(0, -1) || 'Item'}</span>
        </button>
      </AdminPageHeader>

      {/* Category Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-1.5 rounded-2xl shadow-xs border border-gray-100">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === tab.key
                ? 'bg-[#F84464] text-white shadow-xs'
                : 'text-gray-600 hover:text-[#222432] hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4 border border-gray-100">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search items by title, venue, or city..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#222432] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#F84464] focus:ring-1 focus:ring-[#F84464] transition"
          />
        </div>
        <div className="text-xs text-gray-400 font-bold">
          Total in tab: <span className="text-[#222432] font-black">{filteredItems.length}</span>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Content Table Card */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-100">
        {loading ? (
          <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#F84464] animate-spin mb-3" />
            <span className="text-xs font-semibold text-gray-500">Fetching items from MongoDB Atlas...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <AdminEmptyState
            icon={Sparkles}
            title="No Items in this Category"
            description={`No media or events have been published under "${CATEGORY_TABS.find(t => t.key === activeTab)?.label}".`}
            actionText={`Add First ${CATEGORY_TABS.find(t => t.key === activeTab)?.label.slice(0, -1)}`}
            onAction={handleOpenAdd}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-100 bg-gray-50/70 text-gray-500 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Category / Type</th>
                    <th className="py-3 px-4">Schedule &amp; Venue</th>
                    <th className="py-3 px-4">City</th>
                    <th className="py-3 px-4">Pricing</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedItems.map((item) => (
                    <tr key={item.id || item._id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-12 h-12 object-cover rounded-xl bg-gray-100 border border-gray-200 shrink-0 shadow-2xs"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop';
                            }}
                          />
                          <div>
                            <p className="font-black text-[#222432] text-sm leading-snug">{item.title}</p>
                            <p className="text-[11px] text-gray-500 truncate max-w-[240px] mt-0.5">{item.subtitle || item.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                          {item.category || item.categoryType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        <p className="font-bold text-[#222432]">{item.venue || 'Digital / Online'}</p>
                        <p className="text-[10px] text-gray-400">{item.date || 'Open All Days'}</p>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 font-medium">{item.city || 'All Cities'}</td>
                      <td className="py-3.5 px-4 font-black text-[#222432]">
                        {activeTab === 'premiere'
                          ? `Rent: ${item.rentPrice} / Buy: ${item.buyPrice}`
                          : (item.price || 'Free / N/A')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeletePrompt(item)}
                          className="p-2 rounded-xl bg-gray-100 hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition cursor-pointer"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <AdminPagination
              totalItems={filteredItems.length}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
            />
          </>
        )}
      </div>

      {/* Modal for Creating Category Item */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-[#333545] text-white flex items-center justify-between">
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F84464]" />
                Add New {CATEGORY_TABS.find(t => t.key === activeTab)?.label}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Coldplay: Music of the Spheres"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">Subtitle / Sub-category</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Stadium Tour Live in Mumbai"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">Date String</label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="e.g. Sun, 19 Jan, 6:00 PM"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Mumbai"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">Venue / Stadium</label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="DY Patil Stadium, Navi Mumbai"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">Price String</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="₹ 2,500 onwards"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-[#222432] focus:bg-white focus:outline-none focus:border-[#F84464]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-[#F84464] hover:bg-[#E03A58] text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Publish Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <AdminConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDestructive={confirmModal.isDestructive}
        loading={confirmModal.loading}
      />
    </div>
  );
}
