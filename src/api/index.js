import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Posts
export const getPosts = (params) => api.get('/posts', { params })
export const getPost = (slug) => api.get(`/posts/${slug}`)
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

export default api
