import { broadcastSync } from './realtimeSync';

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

  const candidateUrls = [];
  // 1. Primary relative or configured URL
  candidateUrls.push(`${API_BASE_URL}/admin${endpoint}`);

  // 2. If on localhost and no explicit VITE_API_URL, add direct localhost:5000 and clean /admin paths
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && !rawApiUrl) {
    candidateUrls.push(`http://localhost:5000/api/admin${endpoint}`);
    candidateUrls.push(`http://localhost:5000/admin${endpoint}`);
  }

  // 3. Fallback to production cloud if local backend is not reachable
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    candidateUrls.push(`https://bookmytrip-seven.vercel.app/api/admin${endpoint}`);
  }

  let lastError = null;

  for (const url of candidateUrls) {
    try {
      const response = await fetch(url, config);

      // If 404 or 502/503 and we have other candidates, try next candidate
      if ((response.status === 404 || response.status === 502 || response.status === 503) && url !== candidateUrls[candidateUrls.length - 1]) {
        continue;
      }

      let data;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { success: false, message: text || `HTTP ${response.status} ${response.statusText}` };
      }

      if (!response.ok) {
        const err = new Error(data.message || 'Platform Admin API request failed');
        err.data = data;
        err.status = response.status;
        throw err;
      }

      // Broadcast real-time mutation events across portals and tabs
      const method = (options.method || 'GET').toUpperCase();
      if (method !== 'GET') {
        if (endpoint.includes('/movies')) {
          broadcastSync('MOVIE_MUTATION', { endpoint, data });
        } else if (endpoint.includes('/bookings')) {
          broadcastSync('BOOKING_MUTATION', { endpoint, data });
        } else if (endpoint.includes('/offers')) {
          broadcastSync('OFFER_MUTATION', { endpoint, data });
        } else if (endpoint.includes('/vendors')) {
          broadcastSync('VENDOR_STATUS_MUTATION', { endpoint, data });
        } else if (endpoint.includes('/settlements')) {
          broadcastSync('BOOKING_MUTATION', { endpoint, data });
        }
      }

      return data;
    } catch (err) {
      lastError = err;
      // If it's a 401/403 credentials error, don't fallback to other servers - rethrow immediately
      if (err.status === 401 || err.status === 403) {
        throw err;
      }
      // If we have more candidates, continue trying
      if (url !== candidateUrls[candidateUrls.length - 1]) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('All candidate API endpoints failed');
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
