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
            {{ displayReadTime }} 分钟阅读
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
      
      <!-- Post Body with TOC -->
      <div class="post-content-wrapper">
        <div class="post-body" v-html="renderedContent"></div>
        
        <!-- TOC 目录组件 -->
        <TableOfContents 
          v-if="features.toc.enabled && post.content"
          :content="post.content"
        />
      </div>
      
      <!-- Post Footer -->
      <footer class="post-footer">
        <div class="footer-actions">
          <button 
            class="action-btn" 
            :class="{ active: isLiked }" 
            @click="handleLike"
          >
            <svg viewBox="0 0 24 24" :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {{ likeCount }} 点赞
          </button>
          <button 
            class="action-btn" 
            :class="{ active: isFavorited }" 
            @click="handleFavorite"
          >
            <svg viewBox="0 0 24 24" :fill="isFavorited ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            {{ isFavorited ? '已收藏' : '收藏' }}
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
        
        <!-- Share Image Generator (hidden by default) -->
        <ShareImageGenerator
          v-if="features.shareImage.enabled"
          ref="shareImageRef"
          :title="post.title"
          :excerpt="post.excerpt"
          :author="authorName"
          :cover-image="post.cover"
        />
        
        <div class="author-info">
          <div class="author-avatar">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=lumina" alt="Author" />
          </div>
          <div class="author-details">
            <span class="author-name">{{ authorName }}</span>
            <span class="author-bio">{{ authorBio }}</span>
          </div>
        </div>
      </footer>
      
      <!-- Comments Section -->
      <CommentsSection 
        :post-id="post.id" 
        :search-keyword="searchKeyword"
      />
      
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
import { useSearchStore } from '@/stores/search'
import { useConfig } from '@/composables/useConfig'
import { useReadingTime } from '@/composables/useReadingTime'
import PostCard from '@/components/PostCard.vue'
import CommentsSection from '@/components/CommentsSection.vue'
import TableOfContents from '@/components/TableOfContents.vue'
import ShareImageGenerator from '@/components/ShareImageGenerator.vue'
import { marked } from 'marked'
import { likePost, favoritePost } from '@/api'

const route = useRoute()
const store = useBlogStore()
const searchStore = useSearchStore()
const { getSiteConfig, getFeaturesConfig } = useConfig()
const { calculateReadingTime } = useReadingTime()

const post = computed(() => store.currentPost)
const loading = computed(() => store.loading)
const posts = computed(() => store.posts)
const searchKeyword = computed(() => route.query.q || '')

// 配置
const siteConfig = computed(() => getSiteConfig())
const features = computed(() => getFeaturesConfig())
const authorName = computed(() => siteConfig.value?.author || 'Lumina')
const authorBio = computed(() => siteConfig.value?.authorBio || '用文字记录思考，用设计诠释美学')

// 计算阅读时间
const displayReadTime = computed(() => {
  if (!post.value) return 1
  // 优先使用后端返回的阅读时间，否则前端计算
  if (post.value.read_time) return post.value.read_time
  return calculateReadingTime(post.value.content || post.value.excerpt || '')
})

const isLiked = ref(false)
const isFavorited = ref(false)
const likeCount = ref(0)
const shareImageRef = ref(null)

const relatedPosts = computed(() => {
  if (!post.value) return []
  return posts.value
    .filter(p => p.id !== post.value.id && p.category_id === post.value.category_id)
    .slice(0, 3)
})

const renderedContent = computed(() => {
  if (!post.value?.content) return ''
  let content = marked(post.value.content)
  
  // Highlight search keyword in content
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.trim()
    const regex = new RegExp(`(${keyword})`, 'gi')
    content = content.replace(regex, '<mark>$1</mark>')
  }
  
  return content
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

const handleLike = async () => {
  if (!post.value) return
  
  try {
    await likePost(post.value.id)
    isLiked.value = !isLiked.value
    likeCount.value += isLiked.value ? 1 : -1
  } catch (err) {
    console.error('Failed to like post:', err)
    alert('点赞失败，请稍后重试')
  }
}

const handleFavorite = async () => {
  if (!post.value) return
  
  try {
    await favoritePost(post.value.id)
    isFavorited.value = !isFavorited.value
  } catch (err) {
    console.error('Failed to favorite post:', err)
    alert('收藏失败，请稍后重试')
  }
}

const handleShare = () => {
  if (navigator.share) {
    navigator.share({
      title: post.value.title,
      url: window.location.href
    })
  } else {
    // 复制链接
    navigator.clipboard.writeText(window.location.href)
    alert('链接已复制到剪贴板')
    
    // 如果开启了分享图功能，显示下载选项
    if (features.value.shareImage?.enabled) {
      const download = confirm('是否下载文章分享图？')
      if (download && shareImageRef.value) {
        shareImageRef.value.downloadImage()
      }
    }
  }
}

const fetchPost = async () => {
  await store.fetchPost(route.params.slug)
  if (post.value) {
    likeCount.value = post.value.like_count || 0
    isLiked.value = post.value.is_liked || false
    isFavorited.value = post.value.is_favorited || false
    
    // 更新页面标题和 meta 标签
    updateMetaTags()
  }
}

// 更新页面 meta 标签（用于社交分享）
const updateMetaTags = () => {
  if (!post.value) return
  
  // 更新 title
  document.title = `${post.value.title} - ${siteConfig.value?.name || 'Lumina Blog'}`
  
  // 更新 meta 标签
  const metaDescription = document.querySelector('meta[name="description"]')
  if (metaDescription) {
    metaDescription.setAttribute('content', post.value.excerpt || siteConfig.value?.description || '')
  }
  
  // 更新 Open Graph 标签
  const ogTitle = document.querySelector('meta[property="og:title"]')
  const ogDescription = document.querySelector('meta[property="og:description"]')
  const ogImage = document.querySelector('meta[property="og:image"]')
  const ogUrl = document.querySelector('meta[property="og:url"]')
  
  if (ogTitle) ogTitle.setAttribute('content', post.value.title)
  if (ogDescription) ogDescription.setAttribute('content', post.value.excerpt || '')
  if (ogImage) ogImage.setAttribute('content', post.value.cover || siteConfig.value?.url + '/og-image.png')
  if (ogUrl) ogUrl.setAttribute('content', window.location.href)
  
  // 更新 Twitter 标签
  const twitterTitle = document.querySelector('meta[property="twitter:title"]')
  const twitterDescription = document.querySelector('meta[property="twitter:description"]')
  const twitterImage = document.querySelector('meta[property="twitter:image"]')
  
  if (twitterTitle) twitterTitle.setAttribute('content', post.value.title)
  if (twitterDescription) twitterDescription.setAttribute('content', post.value.excerpt || '')
  if (twitterImage) twitterImage.setAttribute('content', post.value.cover || siteConfig.value?.url + '/og-image.png')
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

/* Content Wrapper with TOC */
.post-content-wrapper {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
}

@media (min-width: 1280px) {
  .post-content-wrapper {
    grid-template-columns: 1fr 220px;
    gap: 48px;
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
    scroll-margin-top: 100px;
  }
  
  :deep(h3) {
    font-size: 1.25rem;
    margin: 32px 0 16px;
    scroll-margin-top: 100px;
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
  
  :deep(mark) {
    background: var(--accent-primary);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
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
  flex-wrap: wrap;
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
  
  &.active {
    background: var(--accent-primary);
    border-color: var(--accent-primary);
    color: white;
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
  
  .footer-actions {
    flex-direction: column;
    align-items: stretch;
    
    .action-btn {
      justify-content: center;
    }
  }
}
</style>
