import api from './axios';

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export const productApi = {
  getAll: (keyword, city) => {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (city) params.append('city', city);
    return api.get(`/products?${params.toString()}`);
  },
  getById: (id) => api.get(`/products/${id}`),
  create: (formData) => api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/products/${id}`),
};

export const orderApi = {
  create: (productId) => api.post('/orders', { productId }),
  getMyOrders: () => api.get('/orders'),
};

export const imageApi = {
  getUrl: (id) => `http://localhost:8080/api/images/${id}`,
};