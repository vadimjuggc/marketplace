import api from './axios';

export const authApi = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
};

export const productApi = {
    getAll: (keyword, city) =>
        api.get('/products', {
            params: {
                keyword: keyword || undefined,
                city: city || undefined,
            },
        }),
    getById: (id) => api.get(`/products/${id}`),
    getMyProducts: () => api.get('/products/my'),
    create: (formData) => api.post('/products', formData),
    delete: (id) => api.delete(`/products/${id}`),
};

export const orderApi = {
    create: (productId) => api.post('/orders', { productId }),
    getMyOrders: () => api.get('/orders/my'),
};

export const userApi = {
    getByNickname: (nickName) => api.get(`/users/${nickName}`),
};

export const imageApi = {
    getUrl: (id) => `http://localhost:8080/api/images/${id}`,
};