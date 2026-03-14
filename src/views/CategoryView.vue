<template>
  <div class="category-view">
    <div class="container">
      <!-- Category Header -->
      <header class="category-header">
        <router-link to="/" class="back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          返回首页
        </router-link>
        
        <div v-if="category" class="category-info">
          <h1 class="category-title" :style="{ color: category.color }">
            {{ category.name }}
          </h1>
          <p class="category-description">
            {{ getCategoryDescription(category.slug) }}
          </p>
        </div>
        
        <div v-else class="category-loading">
          <div class="skeleton-title"></div>
        </div>
      </header>
      
      <!-- Posts Grid -->
      <section class="posts-section">
        <div v-if="loading" class="posts-grid">
          <div v-for="i in 6" :key="i" class="post-skeleton">
            <div class="skeleton-category"></div>
            <div class="skeleton-title"></div>
            <div class="skeleton-excerpt"></div>
          </div>
        </div>
        
        <div v-else-if="posts.length === 0" class="empty-state">
          <p>暂无文章</p>
          <router-link to="/" class="btn btn-outline">返回首页</router-link>
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
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useBlogStore } from '@/stores/blog'
import PostCard from '@/components/PostCard.vue'

const route = useRoute()
const store = useBlogStore()

const category = computed(() => {
  return store.categories.find(c => c.slug === route.params.slug)
})

const posts = computed(() => store.posts)
const loading = computed(() => store.loading)

const categoryDescriptions = {
  tech: '探索技术的边界，分享编程经验和最佳实践',
  design: '发现设计的美学，交流UI/UX设计理念',
  life: '记录生活的点滴，分享日常感悟',
  essay: '随性而写，随心而记'
}

const getCategoryDescription = (slug) => {
  return categoryDescriptions[slug] || '查看分类文章'
}

const fetchData = async () => {
  await Promise.all([
    store.fetchPosts({ category: route.params.slug }),
    store.fetchCategories()
  ])
}

watch(() => route.params.slug, fetchData)

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.category-view {
  min-height: 100vh;
  padding: 48px 0;
}

.category-header {
  max-width: 800px;
  margin: 0 auto 48px;
  padding: 0 24px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 32px;
  transition: color var(--transition-fast);
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  &:hover {
    color: var(--accent-primary);
  }
}

.category-info {
  text-align: center;
}

.category-title {
  font-size: clamp(2rem, 6vw, 3rem);
  font-weight: 700;
  margin-bottom: 16px;
}

.category-description {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

.category-loading {
  text-align: center;
}

.skeleton-title {
  width: 200px;
  height: 48px;
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  margin: 0 auto;
}

/* Posts Grid */
.posts-section {
  padding: 0 24px;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 32px;
  max-width: var(--max-width);
  margin: 0 auto;
}

.post-item {
  animation: fadeInUp 0.6s ease-out both;
}

/* Skeleton */
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

/* Empty State */
.empty-state {
  text-align: center;
  padding: 64px 24px;
  color: var(--text-muted);
  
  p {
    margin-bottom: 24px;
  }
}

@media (max-width: 768px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
