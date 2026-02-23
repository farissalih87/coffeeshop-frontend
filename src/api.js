import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 
    'Content-Type': 'application/json', 
    'Accept': 'application/json' 
  },
})

// Attach auth token automatically
api.interceptors.request.use((config) => {
  try {
    // Check all possible storage keys
    const keys = ['coffeeshop-auth', 'auth']
    let token = null

    for (const key of keys) {
      const stored = localStorage.getItem(key)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Handle both formats
        token = parsed?.state?.token || parsed?.token || null
        if (token) break
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (e) {
    console.warn('Error reading auth token:', e)
  }
  return config
})

// Handle 401 - redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('coffeeshop-auth')
      window.location.href = '/staff/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
}

// ─── Menu ─────────────────────────────────────────────────────────────────────
export const menuApi = {
  getCategories: () => api.get('/menu/categories'),
  getItems: (categoryId) => api.get('/menu/items', { params: { category_id: categoryId } }),
  getAllItems: () => api.get('/menu/items'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  createItem: (data) => api.post('/admin/items', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateItem: (id, data) => api.post(`/admin/items/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteItem: (id) => api.delete(`/admin/items/${id}`),
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orderApi = {
  place: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/staff/orders', { params }),
  getById: (id) => api.get(`/staff/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/staff/orders/${id}/status`, { status }),
  getStats: () => api.get('/admin/stats'),
  getReport: (params) => api.get('/admin/reports', { params }),
}

// ─── Users (Admin) ────────────────────────────────────────────────────────────
export const userApi = {
  getAll: () => api.get('/admin/users'),
  create: (data) => api.post('/admin/users', data),
  update: (id, data) => api.put(`/admin/users/${id}`, data),
  delete: (id) => api.delete(`/admin/users/${id}`),
}

export default api