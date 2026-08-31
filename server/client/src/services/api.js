import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
client.interceptors.request.use(
  config => {
    const token = localStorage.getItem('st-admin-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response extractor interceptor
client.interceptors.response.use(
  response => response.data?.data !== undefined ? response.data.data : response.data,
  error => {
    if (error.response?.status === 401 && window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem('st-admin-token');
      localStorage.removeItem('st-admin-user');
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      'An error occurred while communicating with the server';
    return Promise.reject(new Error(message));
  }
);

// Auth
export const loginAdmin = (credentials) => client.post('/auth/login', credentials);
export const getAdminMe = () => client.get('/auth/me');
export const logoutAdmin = () => client.post('/auth/logout');
export const changeAdminPassword = (data) => client.post('/auth/change-password', data);

// Services
export const getServices = (params) => client.get('/services', { params });
export const getServiceById = (id) => client.get(`/services/${id}`);
export const createService = (data) => client.post('/services', data);
export const updateService = (id, data) => client.put(`/services/${id}`, data);
export const deleteService = (id) => client.delete(`/services/${id}`);

// Packages
export const getPackages = (params) => client.get('/packages', { params });
export const getPackageById = (id) => client.get(`/packages/${id}`);
export const createPackage = (data) => client.post('/packages', data);
export const updatePackage = (id, data) => client.put(`/packages/${id}`, data);
export const deletePackage = (id) => client.delete(`/packages/${id}`);

// Inquiries
export const getInquiries = (params) => client.get('/inquiries', { params });
export const getInquiryById = (id) => client.get(`/inquiries/${id}`);
export const createInquiry = (data) => client.post('/inquiries', data);
export const updateInquiryStatus = (id, data) => client.put(`/inquiries/${id}`, data);
export const deleteInquiry = (id) => client.delete(`/inquiries/${id}`);

// Accommodations
export const getAccommodations = () => client.get('/accommodations');
export const createAccommodation = (data) => client.post('/accommodations', data);
export const updateAccommodation = (id, data) => client.put(`/accommodations/${id}`, data);
export const deleteAccommodation = (id) => client.delete(`/accommodations/${id}`);

// Admissions
export const getAdmissions = (params) => client.get('/admissions', { params });
export const getAdmissionById = (id) => client.get(`/admissions/${id}`);
export const createAdmission = (data) => client.post('/admissions', data);
export const updateAdmission = (id, data) => client.put(`/admissions/${id}`, data);
export const dischargePatient = (id, data) => client.post(`/admissions/${id}/discharge`, data);
export const deleteAdmission = (id) => client.delete(`/admissions/${id}`);

// Progress Records
export const getProgressByAdmission = (admissionId) => client.get(`/progress/admission/${admissionId}`);
export const createProgressRecord = (data) => client.post('/progress', data);
export const deleteProgressRecord = (id) => client.delete(`/progress/${id}`);

// Billing
export const getBillingByAdmission = (admissionId, params) => client.get(`/billing/admission/${admissionId}`, { params });
export const saveBillingProfile = (admissionId, data) => client.post(`/billing/admission/${admissionId}`, data);
export const previewBill = (data) => client.post('/billing/preview', data);

// Payments
export const getPaymentsByAdmission = (admissionId) => client.get(`/payments/admission/${admissionId}`);
export const recordPayment = (data) => client.post('/payments', data);
export const deletePayment = (id) => client.delete(`/payments/${id}`);

// Media & Blog
export const getMediaItems = (params) => client.get('/media', { params });
export const getMediaItemById = (id) => client.get(`/media/${id}`);
export const createMediaItem = (data) => client.post('/media', data);
export const updateMediaItem = (id, data) => client.put(`/media/${id}`, data);
export const deleteMediaItem = (id) => client.delete(`/media/${id}`);

// File Uploads
export const uploadSingleFile = (file, category = 'general') => {
  const formData = new FormData();
  formData.append('file', file);
  return client.post(`/uploads/single?category=${encodeURIComponent(category)}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const uploadMultipleFiles = (files, category = 'general') => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  return client.post(`/uploads/multiple?category=${encodeURIComponent(category)}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// Stats
export const getDashboardStats = () => client.get('/stats/dashboard');

export default client;
