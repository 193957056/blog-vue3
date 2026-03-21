import { defineStore } from 'pinia'
import { searchPosts } from '@/api'

export const useSearchStore = defineStore('search', {
  state: () => ({
    results: [],
    keyword: '',
    loading: false,
    error: null
  }),
  
  actions: {
    async search(keyword) {
      if (!keyword.trim()) {
        this.results = []
        return
      }
      
      this.loading = true
      this.error = null
      this.keyword = keyword
      
      try {
        const { data } = await searchPosts(keyword)
        this.results = data.results || data || []
      } catch (err) {
        this.error = err.message
        console.error('Failed to search:', err)
      } finally {
        this.loading = false
      }
    },
    
    clearResults() {
      this.results = []
      this.keyword = ''
    }
  }
})
