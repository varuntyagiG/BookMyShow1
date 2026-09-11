const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const API_BASE_URL = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`)
  : '/api';

export async function vendorRequest(endpoint, options = {}) {
  const token = localStorage.getItem('bms_vendor_token');

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
    const response = await fetch(`${API_BASE_URL}/vendor${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      const err = new Error(data.message || 'Vendor API operation failed');
      err.data = data;
      err.status = response.status;
      throw err;
    }

    return data;
  } catch (error) {
    console.error(`Vendor API Error on [${options.method || 'GET'}] ${endpoint}:`, error);
    throw error;
  }
}

export const vendorApi = {
  // Auth & Profile
  login: (credentials) =>
    vendorRequest('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (partnerData) =>
    vendorRequest('/register', {
      method: 'POST',
      body: JSON.stringify(partnerData),
    }),

  getProfile: () => vendorRequest('/profile'),

  updateProfile: (data) =>
    vendorRequest('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Cinemas
  getCinemas: () => vendorRequest('/cinemas'),

  createCinema: (data) =>
    vendorRequest('/cinemas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCinema: (id, data) =>
    vendorRequest(`/cinemas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCinema: (id) =>
    vendorRequest(`/cinemas/${id}`, {
      method: 'DELETE',
    }),

  // Screens
  getScreens: (cinemaId) => {
    const query = cinemaId ? `?cinemaId=${cinemaId}` : '';
    return vendorRequest(`/screens${query}`);
  },

  createScreen: (data) =>
    vendorRequest('/screens', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateScreen: (id, data) =>
    vendorRequest(`/screens/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteScreen: (id) =>
    vendorRequest(`/screens/${id}`, {
      method: 'DELETE',
    }),

  // Movies
  getMovies: () => vendorRequest('/movies'),

  createMovie: (data) =>
    vendorRequest('/movies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Shows
  getShows: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return vendorRequest(`/shows${query ? `?${query}` : ''}`);
  },

  createShow: (data) =>
    vendorRequest('/shows', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  cancelShow: (id) =>
    vendorRequest(`/shows/${id}/cancel`, {
      method: 'PUT',
    }),

  getShowSeatMap: (showId) => vendorRequest(`/shows/${showId}/seatmap`),

  // Gate Scanner & Ticket Validation
  scanTicket: (payload) =>
    vendorRequest('/tickets/scan', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Bookings Manifest & Analytics
  getBookings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return vendorRequest(`/bookings${query ? `?${query}` : ''}`);
  },

  getAnalytics: () => vendorRequest('/analytics'),
};
