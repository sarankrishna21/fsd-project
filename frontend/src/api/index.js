import api from './axios';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const booksApi = {
  getAll: (params) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  getFeatured: () => api.get('/books/featured'),
  getPopular: () => api.get('/books/popular'),
  create: (formData) => api.post('/books', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/books/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/books/${id}`),
};

export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const libraryApi = {
  getMyLibrary: () => api.get('/library'),
  addToLibrary: (bookId) => api.post(`/library/${bookId}`),
  getBookAccess: (bookId) => api.get(`/library/${bookId}/access`),
};

export const ordersApi = {
  create: (bookIds) => api.post('/orders', { bookIds }),
  confirmPayment: (orderId, paymentId) => api.post(`/orders/${orderId}/confirm-payment`, { paymentId }),
  getMyOrders: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
};

export const readingProgressApi = {
  get: (bookId) => api.get(`/reading-progress/${bookId}`),
  update: (bookId, data) => api.put(`/reading-progress/${bookId}`, data),
};

export const bookmarksApi = {
  get: (bookId) => api.get(`/bookmarks/${bookId}`),
  add: (bookId, pageNumber, note) => api.post(`/bookmarks/${bookId}`, { pageNumber, note }),
  remove: (bookmarkId) => api.delete(`/bookmarks/${bookmarkId}`),
};

export const reviewsApi = {
  getByBook: (bookId) => api.get(`/reviews/book/${bookId}`),
  add: (bookId, data) => api.post(`/reviews/book/${bookId}`, data),
};

export const usersApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  changePassword: (data) => api.put('/users/me/password', data),
};

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (userId, status) => api.patch(`/admin/users/${userId}/status`, { status }),
  updateUserRole: (userId, role) => api.patch(`/admin/users/${userId}/role`, { role }),
  getOrders: (params) => api.get('/admin/orders', { params }),
};
