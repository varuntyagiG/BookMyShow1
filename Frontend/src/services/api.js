import { broadcastSync } from './realtimeSync';

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const API_BASE_URL = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`)
  : '/api';

const inFlightRequests = new Map();
const staticCache = new Map();

export async function request(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const token = localStorage.getItem('bms_token');

  // In-flight deduplication & static caching for GET requests
  const cacheKey = method === 'GET' ? `${endpoint}:${token || 'anon'}` : null;
  const now = Date.now();

  // Return static cached result if still fresh
  if (cacheKey && staticCache.has(cacheKey)) {
    const cached = staticCache.get(cacheKey);
    if (cached.expiresAt > now) {
      return cached.data;
    }
    staticCache.delete(cacheKey);
  }

  // Deduplicate simultaneous identical in-flight requests
  if (cacheKey && inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const reqPromise = (async () => {
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
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Automatically invalidate client cache & broadcast real-time sync on mutations
      if (method !== 'GET') {
        staticCache.clear();
        if (endpoint.includes('/bookings')) {
          broadcastSync('BOOKING_MUTATION', { endpoint, data });
        } else if (endpoint.includes('/movies')) {
          broadcastSync('MOVIE_MUTATION', { endpoint, data });
        } else if (endpoint.includes('/offers')) {
          broadcastSync('OFFER_MUTATION', { endpoint, data });
        }
      }

      // Cache high-frequency static endpoints for 30s
      if (cacheKey && (endpoint === '/cities' || endpoint === '/offers')) {
        staticCache.set(cacheKey, { data, expiresAt: now + 30000 });
      }

      return data;
    } catch (error) {
      console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, error);
      throw error;
    } finally {
      if (cacheKey) {
        inFlightRequests.delete(cacheKey);
      }
    }
  })();

  if (cacheKey) {
    inFlightRequests.set(cacheKey, reqPromise);
  }

  return reqPromise;
}

// Authentication API
export const authApi = {
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  getMe: () => request('/auth/me'),
  updateMe: (data) =>
    request('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Content API
export const contentApi = {
  getHomeData: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/home${query ? `?${query}` : ''}`);
  },
  getMovieById: (id) => request(`/movies/${id}`),
  getCategoryItems: (category, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/categories/${category}${query ? `?${query}` : ''}`);
  },
  getCities: () => request('/cities'),
  getCinemas: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/cinemas${query ? `?${query}` : ''}`);
  },
  getOffers: () => request('/offers'),
};

// Booking API
export const bookingApi = {
  createBooking: (bookingData) =>
    request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    }),
  getMyBookings: () => request('/bookings/my'),
  getBookingById: (id) => request(`/bookings/${id}`),
  cancelBooking: (id, reason) =>
    request(`/bookings/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }),
  getShowSeats: (params = {}) => {
    let queryObj = {};
    if (typeof params === 'string') {
      queryObj = { showId: params };
    } else if (params && typeof params === 'object') {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== '') {
          queryObj[k] = v;
        }
      }
    }
    const query = new URLSearchParams(queryObj).toString();
    return request(`/bookings/seats${query ? `?${query}` : ''}`);
  },
};
