const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const API_BASE_URL = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`)
  : '/api';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('bms_token');

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

    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, error);
    throw error;
  }
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
    const query = new URLSearchParams(params).toString();
    return request(`/bookings/seats${query ? `?${query}` : ''}`);
  },
};
