<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-line">探索</span>
          <span class="title-gradient">思想的星辰</span>
        </h1>
        <p class="hero-subtitle">用文字记录思考，用设计诠释美学</p>
        <div class="hero-scroll" @click="scrollToPosts">
          <span>向下滚动</span>
          <svg class="scroll-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </div>
      </div>
    </section>

    <!-- Categories Filter -->
    <section class="categories-section">
      <div class="container">
        <div class="categories-filter">
          <button 
            v-for="cat in categories" 
            :key="cat.id"
            class="category-btn"
            :class="{ active: activeCategory === cat.slug }"
            @click="filterByCategory(cat.slug)"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>
    </section>

    <!-- Posts Grid -->
    <section class="posts-section" id="posts">
      <div class="container">
        <div v-if="loading" class="posts-grid">
          <div v-for="i in 6" :key="i" class="post-skeleton">
            <div class="skeleton-category"></div>
            <div class="skeleton-title"></div>
            <div class="skeleton-excerpt"></div>
            <div class="skeleton-meta"></div>
          </div>
        </div>
        
        <div v-else-if="posts.length === 0" class="empty-state">
          <p>暂无文章</p>
        </div>
        
        <div v-else class="posts-grid">
          <PostCard 
            v-for="(post, index) in posts" 
            :key="post.id"
            :post="post"
            :style="{ animationDelay: `${index * 0.1}s` }"
            class="post-item"
          />
        </div>
        
        <!-- Pagination -->
        <div v-if="pagination.total > pagination.limit" class="pagination">
          <button 
            class="page-btn"
            :disabled="pagination.page <= 1"
            @click="changePage(pagination.page - 1)"
          >
            上一页
          </button>
          <span class="page-info">{{ pagination.page }} / {{ Math.ceil(pagination.total / pagination.limit) }}</span>
          <button 
            class="page-btn"
            :disabled="pagination.page >= Math.ceil(pagination.total / pagination.limit)"
            @click="changePage(pagination.page + 1)"
          >
            下一页
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useBlogStore } from '@/stores/blog'
import PostCard from '@/components/PostCard.vue'

const store = useBlogStore()
const activeCategory = ref('')

const posts = computed(() => store.posts)
const categories = computed(() => store.categories)
const loading = computed(() => store.loading)
const pagination = computed(() => store.pagination)

const fetchData = async () => {
  await Promise.all([
    store.fetchPosts(activeCategory.value ? { category: activeCategory.value } : {}),
    store.fetchCategories()
  ])
}

const filterByCategory = (slug) => {
  activeCategory.value = activeCategory.value === slug ? '' : slug
  store.fetchPosts(activeCategory.value ? { category: activeCategory.value } : {})
}

const changePage = (page) => {
  store.fetchPosts({ page, category: activeCategory.value || undefined })
  window.scrollTo({ top: 400, behavior: 'smooth' })
}

const scrollToPosts = () => {
  document.getElementById('posts')?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.home-view {
  min-height: 100vh;
}

/* Hero Section */
.hero {
  position: relative;
  height: calc(100vh - 72px);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse at 20% 50%, rgba(124, 58, 237, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 50%),
    var(--bg-primary);
}

.hero-content {
  position: relative;
  text-align: center;
  padding: 0 24px;
  animation: fadeInUp 0.8s ease-out;
}

.hero-title {
  font-size: clamp(2.5rem, 8vw, 4rem);
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 24px;
}

.title-line {
  display: block;
  color: var(--text-primary);
}

.title-gradient {
  display: block;
  background: var(--gradient-main);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 48px;
}

.hero-scroll {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 0.875rem;
  transition: color var(--transition-fast);
  
  &:hover {
    color: var(--accent-primary);
  }
}

.scroll-arrow {
  width: 24px;
  height: 24px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(8px);
  }
  60% {
    transform: translateY(4px);
  }
}

/* Categories */
.categories-section {
  padding: 32px 0;
  background: var(--bg-secondary);
}

.categories-filter {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.category-btn {
  padding: 8px 20px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 24px;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    border-color: var(--accent-primary);
    color: var(--accent-primary);
  }
  
  &.active {
    background: var(--gradient-main);
    color: white;
    border-color: transparent;
  }
}

/* Posts Grid */
.posts-section {
  padding: 64px 0;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 32px;
}

.post-item {
  animation: fadeInUp 0.6s ease-out both;
}

/* Skeleton Loading */
.post-skeleton {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-category {
  width: 60px;
  height: 24px;
  border-radius: 12px;
  background: var(--bg-secondary);
}

.skeleton-title {
  width: 80%;
  height: 28px;
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
}

.skeleton-excerpt {
  width: 100%;
  height: 60px;
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
}

.skeleton-meta {
  width: 60%;
  height: 16px;
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 64px 24px;
  color: var(--text-muted);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin-top: 48px;
}

.page-btn {
  padding: 10px 20px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover:not(:disabled) {
    border-color: var(--accent-primary);
    color: var(--accent-primary);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.page-info {
  font-size: 0.9rem;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
