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
  getShowSeats: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/bookings/seats${query ? `?${query}` : ''}`);
  },
};

// Super Admin API
export const adminApi = {
  getStats: () => request('/admin/stats'),
  getMovies: () => request('/admin/movies'),
  createMovie: (movieData) =>
    request('/admin/movies', {
      method: 'POST',
      body: JSON.stringify(movieData),
    }),
  updateMovie: (id, movieData) =>
    request(`/admin/movies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(movieData),
    }),
  updateMovieStatus: (id, status) =>
    request(`/admin/movies/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  deleteMovie: (id) =>
    request(`/admin/movies/${id}`, {
      method: 'DELETE',
    }),
  addTheatre: (movieId, theatreData) =>
    request(`/admin/movies/${movieId}/theatres`, {
      method: 'POST',
      body: JSON.stringify(theatreData),
    }),
  deleteTheatre: (movieId, theatreId) =>
    request(`/admin/movies/${movieId}/theatres/${theatreId}`, {
      method: 'DELETE',
    }),
  addShowtime: (movieId, theatreId, showtimeData) =>
    request(`/admin/movies/${movieId}/theatres/${theatreId}/showtimes`, {
      method: 'POST',
      body: JSON.stringify(showtimeData),
    }),
  deleteShowtime: (movieId, theatreId, showtimeId) =>
    request(`/admin/movies/${movieId}/theatres/${theatreId}/showtimes/${showtimeId}`, {
      method: 'DELETE',
    }),
  getBookings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/bookings${query ? `?${query}` : ''}`);
  },
  updateBookingStatus: (id, status) =>
    request(`/admin/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  getItems: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/items${query ? `?${query}` : ''}`);
  },
  createItem: (itemData) =>
    request('/admin/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    }),
  deleteItem: (id) =>
    request(`/admin/items/${id}`, {
      method: 'DELETE',
    }),
  getUsers: () => request('/admin/users'),
  updateUserRole: (id, role) =>
    request(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),
};

