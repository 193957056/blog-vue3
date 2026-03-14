import { defineStore } from 'pinia'
import { getPosts, getPost, getCategories, getTags, getStats } from '@/api'

export const useBlogStore = defineStore('blog', {
  state: () => ({
    posts: [],
    currentPost: null,
    categories: [],
    tags: [],
    stats: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0
    }
  }),
  
  getters: {
    publishedPosts: (state) => state.posts.filter(p => p.status === 'published'),
    getCategoryBySlug: (state) => (slug) => state.categories.find(c => c.slug === slug)
  },
  
  actions: {
    async fetchPosts(params = {}) {
      this.loading = true
      this.error = null
      try {
        const { data } = await getPosts(params)
        this.posts = data.posts || data
        if (data.total) {
          this.pagination.total = data.total
          this.pagination.page = data.page
        }
      } catch (err) {
        this.error = err.message
        console.error('Failed to fetch posts:', err)
      } finally {
        this.loading = false
      }
    },
    
    async fetchPost(slug) {
      this.loading = true
      this.error = null
      this.currentPost = null
      try {
        const { data } = await getPost(slug)
        this.currentPost = data
      } catch (err) {
        this.error = err.message
        console.error('Failed to fetch post:', err)
      } finally {
        this.loading = false
      }
    },
    
    async fetchCategories() {
      try {
        const { data } = await getCategories()
        this.categories = data
      } catch (err) {
        console.error('Failed to fetch categories:', err)
      }
    },
    
    async fetchTags() {
      try {
        const { data } = await getTags()
        this.tags = data
      } catch (err) {
        console.error('Failed to fetch tags:', err)
      }
    },
    
    async fetchStats() {
      try {
        const { data } = await getStats()
        this.stats = data
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      }
    }
  }
})
