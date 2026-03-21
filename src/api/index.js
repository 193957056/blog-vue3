import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const login = (credentials) => api.post('/auth/login', credentials)
export const register = (userData) => api.post('/auth/register', userData)
export const getCurrentUser = () => api.get('/auth/me')

// Posts
export const getPosts = (params) => api.get('/posts', { params })
export const getPost = (slug) => api.get(`/posts/slug/${slug}`)
export const getAllPosts = (params) => api.get('/posts', { params: { ...params, status: 'all' } })
export const createPost = (data) => api.post('/posts', data)
export const updatePost = (id, data) => api.patch(`/posts/${id}`, data)
export const deletePost = (id) => api.delete(`/posts/${id}`)

// Categories
export const getCategories = () => api.get('/categories')
export const createCategory = (data) => api.post('/categories', data)
export const deleteCategory = (id) => api.delete(`/categories/${id}`)

// Tags
export const getTags = () => api.get('/tags')

// Stats
export const getStats = () => api.get('/stats')

// AI Writing Assistant
export const aiPolish = (text) => api.post('/ai/polish', { text })
export const aiSummary = (content) => api.post('/ai/summary', { content })
export const aiSEO = (title, content) => api.post('/ai/seo', { title, content })
export const aiTranslate = (text, target_lang) => api.post('/ai/translate', { text, target_lang })

// Comments
export const getComments = (postId) => api.get(`/posts/${postId}/comments`)
export const createComment = (data) => api.post('/comments', data)

// Search
export const searchPosts = (keyword) => api.get('/search', { params: { q: keyword } })

// Like & Favorite
export const likePost = (postId) => api.post(`/posts/${postId}/like`)
export const favoritePost = (postId) => api.post(`/posts/${postId}/favorite`)

// Links
export const getLinks = () => api.get('/links')

export default api
