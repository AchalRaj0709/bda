import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000, // 60s timeout for large uploads/aggregations
});

// Response interceptor for clean error message unwrapping
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network or server error occurred.';
    return Promise.reject(new Error(message));
  }
);

export const salesService = {
  getSales: (params) => api.get('/sales', { params }),
  getSaleById: (id) => api.get(`/sales/${id}`),
  deleteSale: (id) => api.delete(`/sales/${id}`),
  deleteAllSales: () => api.delete('/sales'),
  uploadCSV: (formData, onUploadProgress) =>
    api.post('/sales/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }),
  previewCSV: (formData) =>
    api.post('/sales/upload?preview=true', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  generateData: (count) => api.post('/sales/generate', { count }),
  getExportUrl: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return `/api/sales/export?${query}`;
  },
};

export const analyticsService = {
  getOverview: (params) => api.get('/analytics/overview', { params }),
  getCategoryAnalytics: (params) => api.get('/analytics/category', { params }),
  getRegionAnalytics: (params) => api.get('/analytics/region', { params }),
  getMonthlyAnalytics: (params) => api.get('/analytics/monthly', { params }),
  getTopProducts: (params) => api.get('/analytics/top-products', { params }),
  getProfitAnalytics: (params) => api.get('/analytics/profit', { params }),
  getInsights: (params) => api.get('/analytics/insights', { params }),
};

export const systemService = {
  getHealth: () => api.get('/health'),
};

export default api;

