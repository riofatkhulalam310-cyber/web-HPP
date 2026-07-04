import axios from 'axios';

// Base API URL - using the local PHP server that we'll run on port 8000
const API_URL = 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API Service functions
export const authService = {
  login: (credentials) => api.post('/login', credentials),
  register: (data) => api.post('/register', data),
  getMe: () => api.get('/me'),
};

export const dashboardService = {
  getSummary: (tanggal) => api.get('/dashboard/summary', { params: { tanggal } }),
};

export const hppService = {
  hitung: (data) => api.post('/hpp/hitung', data),
  hitungSemua: (tanggal) => api.get('/hpp/hitung-semua', { params: { tanggal } }),
  getLog: (produkId) => api.get('/hpp/log', { params: { produk_id: produkId } }),
};

export const satuanService = {
  getAll: () => api.get('/satuan'),
  getById: (id) => api.get(`/satuan/${id}`),
  create: (data) => api.post('/satuan', data),
  update: (id, data) => api.put(`/satuan/${id}`, data),
  delete: (id) => api.delete(`/satuan/${id}`),
  convert: (data) => api.post('/satuan/convert', data),
};

export const bahanBakuService = {
  getAll: () => api.get('/bahan-baku'),
  getById: (id) => api.get(`/bahan-baku/${id}`),
  create: (data) => api.post('/bahan-baku', data),
  update: (id, data) => api.put(`/bahan-baku/${id}`, data),
  delete: (id) => api.delete(`/bahan-baku/${id}`),
};

export const produkService = {
  getAll: () => api.get('/produk'),
  getById: (id) => api.get(`/produk/${id}`),
  create: (data) => api.post('/produk', data),
  update: (id, data) => api.put(`/produk/${id}`, data),
  delete: (id) => api.delete(`/produk/${id}`),
  
  // Resep
  getResep: (id) => api.get(`/produk/${id}/resep`),
  addResep: (id, data) => api.post(`/produk/${id}/resep`, data),
  updateResep: (id, resepId, data) => api.put(`/produk/${id}/resep/${resepId}`, data),
  deleteResep: (id, resepId) => api.delete(`/produk/${id}/resep/${resepId}`),
};

export const pengeluaranService = {
  getAll: (filters) => api.get('/pengeluaran-harian', { params: filters }),
  getById: (id) => api.get(`/pengeluaran-harian/${id}`),
  create: (data) => api.post('/pengeluaran-harian', data),
  update: (id, data) => api.put(`/pengeluaran-harian/${id}`, data),
  delete: (id) => api.delete(`/pengeluaran-harian/${id}`),
  getRekap: (periode, tanggal) => api.get('/pengeluaran-harian/rekap', { params: { periode, tanggal } }),
};

export const biayaTempatService = {
  getAll: () => api.get('/biaya-tempat'),
  getById: (id) => api.get(`/biaya-tempat/${id}`),
  create: (data) => api.post('/biaya-tempat', data),
  update: (id, data) => api.put(`/biaya-tempat/${id}`, data),
  delete: (id) => api.delete(`/biaya-tempat/${id}`),
};

export const karyawanService = {
  getAll: () => api.get('/karyawan'),
  getById: (id) => api.get(`/karyawan/${id}`),
  create: (data) => api.post('/karyawan', data),
  update: (id, data) => api.put(`/karyawan/${id}`, data),
  delete: (id) => api.delete(`/karyawan/${id}`),
};

export const transaksiService = {
  getAll: (filters) => api.get('/transaksi', { params: filters }),
  getById: (id) => api.get(`/transaksi/${id}`),
  create: (data) => api.post('/transaksi', data),
  update: (id, data) => api.put(`/transaksi/${id}`, data),
  delete: (id) => api.delete(`/transaksi/${id}`),
};
