import { request } from './api';

export const adminApi = {
  // Telemetry & Deep Analytics
  getDashboardStats: () => request('/admin/dashboard'),
  getAnalytics: () => request('/admin/analytics'),

  // Customers Governance
  getCustomers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/customers${query ? `?${query}` : ''}`);
  },
  getCustomerById: (id) => request(`/admin/customers/${id}`),
  updateCustomerStatus: (id, data) =>
    request(`/admin/customers/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Cinema Partners
  getPartners: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/partners${query ? `?${query}` : ''}`);
  },
  getPartnerById: (id) => request(`/admin/partners/${id}`),
  updatePartnerStatus: (id, data) =>
    request(`/admin/partners/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Global Cinemas
  getCinemas: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/cinemas${query ? `?${query}` : ''}`);
  },
  updateCinemaStatus: (id, data) =>
    request(`/admin/cinemas/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Global Movie Catalog
  getMovies: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/movies${query ? `?${query}` : ''}`);
  },
  createMovie: (movieData) =>
    request('/admin/movies', {
      method: 'POST',
      body: JSON.stringify(movieData)
    }),
  updateMovie: (id, movieData) =>
    request(`/admin/movies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(movieData)
    }),
  deleteMovie: (id) =>
    request(`/admin/movies/${id}`, {
      method: 'DELETE'
    }),

  // Global Shows Schedule
  getShows: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/shows${query ? `?${query}` : ''}`);
  },
  cancelShow: (id, reason) =>
    request(`/admin/shows/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    }),

  // Global Bookings Ledger
  getBookings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/bookings${query ? `?${query}` : ''}`);
  },
  getBookingById: (id) => request(`/admin/bookings/${id}`),
  cancelBooking: (id, reason) =>
    request(`/admin/bookings/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    }),

  // Revenue & Settlements
  getRevenueOverview: () => request('/admin/revenue'),

  // Offers & Promo Coupons
  getOffers: () => request('/admin/offers'),
  createOffer: (data) =>
    request('/admin/offers', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateOffer: (id, data) =>
    request(`/admin/offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteOffer: (id) =>
    request(`/admin/offers/${id}`, {
      method: 'DELETE'
    }),

  // Cities Management
  getCities: () => request('/admin/cities'),
  createCity: (data) =>
    request('/admin/cities', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateCity: (id, data) =>
    request(`/admin/cities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Compliance & Security Audit Logs
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/audit-logs${query ? `?${query}` : ''}`);
  },

  // Reports
  getReportData: (reportType, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/reports/${reportType}${query ? `?${query}` : ''}`);
  }
};
