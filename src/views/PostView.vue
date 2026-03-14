<template>
  <div class="post-view">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="post-skeleton">
        <div class="skeleton-category"></div>
        <div class="skeleton-title"></div>
        <div class="skeleton-meta"></div>
        <div class="skeleton-content">
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>
    </div>
    
    <!-- Post Content -->
    <article v-else-if="post" class="post-container">
      <!-- Post Header -->
      <header class="post-header">
        <div class="post-meta-top">
          <router-link 
            v-if="post.category" 
            :to="`/category/${post.category.slug}`"
            class="category-tag"
            :style="{ background: post.category.color }"
          >
            {{ post.category.name }}
          </router-link>
          <span class="post-date">{{ formatDate(post.created_at) }}</span>
        </div>
        
        <h1 class="post-title">{{ post.title }}</h1>
        
        <div class="post-meta">
          <span class="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            {{ post.read_time || 1 }} 分钟阅读
          </span>
          <span class="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            {{ post.view_count || 0 }} 阅读
          </span>
        </div>
        
        <div v-if="post.tags?.length" class="post-tags">
          <span 
            v-for="tag in post.tags" 
            :key="tag.id" 
            class="tag"
            :style="{ background: tag.color + '20', color: tag.color }"
          >
            {{ tag.name }}
          </span>
        </div>
      </header>
      
      <!-- Post Cover Image -->
      <div v-if="post.cover" class="post-cover">
        <img :src="post.cover" :alt="post.title" />
      </div>
      
      <!-- Post Body -->
      <div class="post-body" v-html="renderedContent"></div>
      
      <!-- Post Footer -->
      <footer class="post-footer">
        <div class="footer-actions">
          <button class="action-btn" @click="handleLike">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            点赞
          </button>
          <button class="action-btn" @click="handleShare">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            分享
          </button>
        </div>
        
        <div class="author-info">
          <div class="author-avatar">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=lumina" alt="Author" />
          </div>
          <div class="author-details">
            <span class="author-name">Lumina</span>
            <span class="author-bio">用文字记录思考，用设计诠释美学</span>
          </div>
        </div>
      </footer>
      
      <!-- Related Posts -->
      <section class="related-posts">
        <h3>相关文章</h3>
        <div class="related-grid">
          <PostCard 
            v-for="relatedPost in relatedPosts" 
            :key="relatedPost.id"
            :post="relatedPost"
          />
        </div>
      </section>
    </article>
    
    <!-- Not Found -->
    <div v-else class="not-found">
      <h2>文章不存在</h2>
      <router-link to="/" class="btn btn-primary">返回首页</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useBlogStore } from '@/stores/blog'
import PostCard from '@/components/PostCard.vue'
import { marked } from 'marked'

const route = useRoute()
const store = useBlogStore()

const post = computed(() => store.currentPost)
const loading = computed(() => store.loading)
const posts = computed(() => store.posts)

const relatedPosts = computed(() => {
  if (!post.value) return []
  return posts.value
    .filter(p => p.id !== post.value.id && p.category_id === post.value.category_id)
    .slice(0, 3)
})

const renderedContent = computed(() => {
  if (!post.value?.content) return ''
  return marked(post.value.content)
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const handleLike = () => {
  // TODO: Implement like functionality
  alert('感谢您的支持！')
}

const handleShare = () => {
  if (navigator.share) {
    navigator.share({
      title: post.value.title,
      url: window.location.href
    })
  } else {
    navigator.clipboard.writeText(window.location.href)
    alert('链接已复制到剪贴板')
  }
}

const fetchPost = async () => {
  await store.fetchPost(route.params.slug)
}

watch(() => route.params.slug, fetchPost)

onMounted(() => {
  fetchPost()
  store.fetchPosts()
})
</script>

<style scoped>
.post-view {
  min-height: 100vh;
  padding: 48px 24px;
}

.post-container {
  max-width: var(--content-width);
  margin: 0 auto;
}

/* Header */
.post-header {
  text-align: center;
  margin-bottom: 48px;
}

.post-meta-top {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.category-tag {
  padding: 6px 16px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  border-radius: 20px;
}

.post-date {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.post-title {
  font-size: clamp(1.75rem, 5vw, 2.5rem);
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 24px;
}

.post-meta {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 24px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: var(--text-muted);
  
  svg {
    width: 16px;
    height: 16px;
  }
}

.post-tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 12px;
}

/* Cover */
.post-cover {
  margin-bottom: 48px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  
  img {
    width: 100%;
    height: auto;
    display: block;
  }
}

/* Body */
.post-body {
  font-size: 1.0625rem;
  line-height: 1.8;
  color: var(--text-primary);
  
  :deep(h2) {
    font-size: 1.75rem;
    margin: 48px 0 24px;
  }
  
  :deep(h3) {
    font-size: 1.25rem;
    margin: 32px 0 16px;
  }
  
  :deep(p) {
    margin-bottom: 24px;
  }
  
  :deep(code) {
    font-family: var(--font-mono);
    font-size: 0.9em;
    background: var(--bg-secondary);
    padding: 2px 6px;
    border-radius: 4px;
  }
  
  :deep(pre) {
    background: var(--bg-secondary);
    padding: 20px;
    border-radius: var(--radius-md);
    overflow-x: auto;
    margin: 24px 0;
    
    code {
      background: none;
      padding: 0;
    }
  }
  
  :deep(blockquote) {
    border-left: 4px solid var(--accent-primary);
    padding-left: 20px;
    margin: 24px 0;
    color: var(--text-secondary);
    font-style: italic;
  }
  
  :deep(img) {
    max-width: 100%;
    border-radius: var(--radius-md);
  }
  
  :deep(a) {
    color: var(--accent-primary);
    
    &:hover {
      text-decoration: underline;
    }
  }
}

/* Footer */
.post-footer {
  margin-top: 64px;
  padding-top: 32px;
  border-top: 1px solid var(--border-light);
}

.footer-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 48px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  &:hover {
    border-color: var(--accent-primary);
    color: var(--accent-primary);
  }
}

.author-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.author-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-weight: 600;
  color: var(--text-primary);
}

.author-bio {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* Related Posts */
.related-posts {
  margin-top: 80px;
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 32px;
  }
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

/* Skeleton */
.loading-container,
.not-found {
  max-width: var(--content-width);
  margin: 0 auto;
  padding: 48px 24px;
}

.post-skeleton {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.skeleton-category {
  width: 80px;
  height: 32px;
  border-radius: 16px;
  background: var(--bg-secondary);
}

.skeleton-title {
  width: 100%;
  height: 48px;
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
}

.skeleton-meta {
  width: 40%;
  height: 20px;
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-line {
  width: 100%;
  height: 20px;
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  
  &.short {
    width: 60%;
  }
}

.not-found {
  text-align: center;
  
  h2 {
    margin-bottom: 24px;
  }
}

@media (max-width: 768px) {
  .post-meta {
    flex-direction: column;
    gap: 12px;
  }
  
  .author-info {
    flex-direction: column;
    text-align: center;
  }
}
</style>
