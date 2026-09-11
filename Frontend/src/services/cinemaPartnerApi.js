import { request } from './api';

export const cinemaPartnerApi = {
  // 1. Dashboard
  getDashboard: () => request('/cinema-partner/dashboard'),

  // 2. Cinemas
  getCinemas: () => request('/cinema-partner/cinemas'),
  createCinema: (data) =>
    request('/cinema-partner/cinemas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getCinemaById: (cinemaId) => request(`/cinema-partner/cinemas/${cinemaId}`),
  updateCinema: (cinemaId, data) =>
    request(`/cinema-partner/cinemas/${cinemaId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCinema: (cinemaId) =>
    request(`/cinema-partner/cinemas/${cinemaId}`, {
      method: 'DELETE',
    }),

  // 3. Screens & Seats
  getScreens: (cinemaId) =>
    request(`/cinema-partner/screens${cinemaId ? `?cinemaId=${cinemaId}` : ''}`),
  createScreen: (data) =>
    request('/cinema-partner/screens', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateScreen: (screenId, data) =>
    request(`/cinema-partner/screens/${screenId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteScreen: (screenId) =>
    request(`/cinema-partner/screens/${screenId}`, {
      method: 'DELETE',
    }),

  // 4. Central Movie Catalog
  getAvailableMovies: () => request('/cinema-partner/movies'),

  // 5. Shows
  getShows: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/cinema-partner/shows${query ? `?${query}` : ''}`);
  },
  createShow: (data) =>
    request('/cinema-partner/shows', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateShow: (showId, data) =>
    request(`/cinema-partner/shows/${showId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteShow: (showId) =>
    request(`/cinema-partner/shows/${showId}`, {
      method: 'DELETE',
    }),

  // 6. Bookings
  getBookings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/cinema-partner/bookings${query ? `?${query}` : ''}`);
  },
  getBookingById: (id) => request(`/cinema-partner/bookings/${id}`),

  // 7. Tickets Inventory
  getTickets: () => request('/cinema-partner/tickets'),

  // 8. QR / Ticket Gate Scanner
  validateTicket: (bookingId) =>
    request('/cinema-partner/scanner/validate', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    }),

  // 9. Revenue
  getRevenue: () => request('/cinema-partner/revenue'),

  // 10. Reports
  getReports: () => request('/cinema-partner/reports'),

  // 11. Profile
  getProfile: () => request('/cinema-partner/profile'),
  updateProfile: (data) =>
    request('/cinema-partner/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export default cinemaPartnerApi;
