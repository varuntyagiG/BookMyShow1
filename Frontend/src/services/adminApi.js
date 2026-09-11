const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const API_BASE_URL = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`)
  : '/api';

export async function adminRequest(endpoint, options = {}) {
  const token = localStorage.getItem('bms_admin_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/admin${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      const err = new Error(data.message || 'Platform Admin API request failed');
      err.data = data;
      err.status = response.status;
      throw err;
    }

    return data;
  } catch (error) {
    console.error(`Admin API Error on [${options.method || 'GET'}] ${endpoint}:`, error);
    throw error;
  }
}

export const adminApi = {
  // Authentication
  login: (credentials) =>
    adminRequest('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getMe: () => adminRequest('/me'),

  // 1. Dashboard & Analytics
  getOverview: (range = 'all') => adminRequest(`/overview?range=${range}`),

  // 2. Cinema Partner Governance
  getVendors: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    const queryString = query.toString();
    return adminRequest(`/vendors${queryString ? `?${queryString}` : ''}`);
  },

  updateVendorStatus: (vendorId, statusData) =>
    adminRequest(`/vendors/${vendorId}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    }),

  // 3. Central Film Registry & CMS
  getMovies: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.genre && params.genre !== 'all') query.append('genre', params.genre);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    const queryString = query.toString();
    return adminRequest(`/movies${queryString ? `?${queryString}` : ''}`);
  },

  createMovie: (movieData) =>
    adminRequest('/movies', {
      method: 'POST',
      body: JSON.stringify(movieData),
    }),

  updateMovie: (movieId, movieData) =>
    adminRequest(`/movies/${movieId}`, {
      method: 'PUT',
      body: JSON.stringify(movieData),
    }),

  deleteMovie: (movieId) =>
    adminRequest(`/movies/${movieId}`, {
      method: 'DELETE',
    }),

  togglePromoteMovie: (movieId) =>
    adminRequest(`/movies/${movieId}/promote`, {
      method: 'PATCH',
    }),

  // 4. Universal Bookings Audit & Forced Refunds
  getBookings: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.limit) query.append('limit', params.limit);
    const queryString = query.toString();
    return adminRequest(`/bookings${queryString ? `?${queryString}` : ''}`);
  },

  refundBooking: (bookingId, refundData = {}) =>
    adminRequest(`/bookings/${bookingId}/refund`, {
      method: 'POST',
      body: JSON.stringify(refundData),
    }),

  // 5. Offers & Bank Alliances Engine
  getOffers: () => adminRequest('/offers'),

  createOffer: (offerData) =>
    adminRequest('/offers', {
      method: 'POST',
      body: JSON.stringify(offerData),
    }),

  updateOffer: (offerId, offerData) =>
    adminRequest(`/offers/${offerId}`, {
      method: 'PUT',
      body: JSON.stringify(offerData),
    }),

  deleteOffer: (offerId) =>
    adminRequest(`/offers/${offerId}`, {
      method: 'DELETE',
    }),

  // 6. Nodal Settlements & Financial Ledger
  getSettlements: () => adminRequest('/settlements'),

  disburseSettlement: (partnerId, data = {}) =>
    adminRequest(`/settlements/${partnerId}/disburse`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
