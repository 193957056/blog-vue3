<template>
  <div class="search-view">
    <div class="search-container">
      <!-- Search Header -->
      <header class="search-header">
        <h1 class="search-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          搜索结果
        </h1>
        <p v-if="store.keyword" class="search-keyword">
          关键词: <span>"{{ store.keyword }}"</span>
          <span class="result-count">({{ store.results.length }} 个结果)</span>
        </p>
      </header>
      
      <!-- Loading -->
      <div v-if="store.loading" class="loading-container">
        <div class="search-skeleton">
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
          <div class="skeleton-line"></div>
        </div>
        <div class="search-skeleton">
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
          <div class="skeleton-line"></div>
        </div>
      </div>
      
      <!-- Search Results -->
      <div v-else-if="store.results.length > 0" class="results-list">
        <PostCard 
          v-for="post in store.results" 
          :key="post.id" 
          :post="post"
          :search-keyword="store.keyword"
        />
      </div>
      
      <!-- No Results -->
      <div v-else class="no-results">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
          <line x1="8" y1="8" x2="14" y2="14"/>
          <line x1="14" y1="8" x2="8" y2="14"/>
        </svg>
        <h2>未找到相关结果</h2>
        <p>请尝试其他关键词</p>
        <router-link to="/" class="btn btn-primary">返回首页</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSearchStore } from '@/stores/search'
import PostCard from '@/components/PostCard.vue'

const route = useRoute()
const store = useSearchStore()

const performSearch = (keyword) => {
  if (keyword) {
    store.search(keyword)
  }
}

watch(() => route.query.q, (newKeyword) => {
  performSearch(newKeyword)
}, { immediate: true })

onMounted(() => {
  if (route.query.q) {
    performSearch(route.query.q)
  }
})
</script>

<style scoped>
.search-view {
  min-height: 100vh;
  padding: 48px 24px;
}

.search-container {
  max-width: var(--content-width);
  margin: 0 auto;
}

.search-header {
  margin-bottom: 48px;
}

.search-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 16px;
  
  svg {
    width: 32px;
    height: 32px;
    color: var(--accent-primary);
  }
}

.search-keyword {
  font-size: 1.1rem;
  color: var(--text-secondary);
  
  span {
    color: var(--accent-primary);
    font-weight: 600;
  }
  
  .result-count {
    color: var(--text-muted);
    font-weight: 400;
    margin-left: 8px;
  }
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.search-skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.skeleton-line {
  width: 100%;
  height: 20px;
  border-radius: var(--radius-sm);
  background: var(--border-light);
  animation: shimmer 1.5s ease-in-out infinite;
  
  &.short {
    width: 60%;
  }
}

@keyframes shimmer {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* No Results */
.no-results {
  text-align: center;
  padding: 80px 24px;
  
  svg {
    width: 64px;
    height: 64px;
    color: var(--text-muted);
    margin-bottom: 24px;
  }
  
  h2 {
    font-size: 1.5rem;
    margin-bottom: 8px;
  }
  
  p {
    color: var(--text-muted);
    margin-bottom: 24px;
  }
}

.btn {
  display: inline-block;
  padding: 12px 32px;
  background: var(--accent-primary);
  color: white;
  text-decoration: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all var(--transition-fast);
  
  &:hover {
    background: var(--accent-hover);
    transform: translateY(-2px);
  }
}
</style>
