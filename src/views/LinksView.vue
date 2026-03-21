<template>
  <div class="links-view">
    <div class="links-container">
      <!-- Header -->
      <header class="links-header">
        <h1 class="links-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          友链
        </h1>
        <p class="links-subtitle">交换链接 · 共同成长</p>
      </header>
      
      <!-- Loading -->
      <div v-if="loading" class="loading-container">
        <div class="link-skeleton" v-for="i in 6" :key="i">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-content">
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
          </div>
        </div>
      </div>
      
      <!-- Links Grid -->
      <div v-else-if="links.length > 0" class="links-grid">
        <a 
          v-for="link in links" 
          :key="link.id"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="link-card"
        >
          <div class="link-avatar">
            <img 
              :src="link.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${link.name}`" 
              :alt="link.name"
            />
          </div>
          <div class="link-info">
            <h3 class="link-name">{{ link.name }}</h3>
            <p class="link-description">{{ link.description }}</p>
          </div>
          <svg class="link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      </div>
      
      <!-- No Links -->
      <div v-else class="no-links">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
        <h2>暂无友链</h2>
        <p>快来交换友链吧！</p>
      </div>
      
      <!-- Apply Section -->
      <section class="apply-section">
        <h2>申请友链</h2>
        <p>欢迎交换友链，请先添加本站链接，然后通过以下方式联系：</p>
        <div class="contact-info">
          <div class="contact-item">
            <span class="contact-label">网站名称</span>
            <span class="contact-value">Lumina</span>
          </div>
          <div class="contact-item">
            <span class="contact-label">网站地址</span>
            <span class="contact-value">https://lumina.blog</span>
          </div>
          <div class="contact-item">
            <span class="contact-label">网站描述</span>
            <span class="contact-value">用文字记录思考，用设计诠释美学</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getLinks } from '@/api'

const links = ref([])
const loading = ref(true)

const fetchLinks = async () => {
  loading.value = true
  try {
    const { data } = await getLinks()
    links.value = data.links || data || []
  } catch (err) {
    console.error('Failed to fetch links:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLinks()
})
</script>

<style scoped>
.links-view {
  min-height: 100vh;
  padding: 48px 24px;
}

.links-container {
  max-width: var(--content-width);
  margin: 0 auto;
}

/* Header */
.links-header {
  text-align: center;
  margin-bottom: 64px;
}

.links-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  
  svg {
    width: 40px;
    height: 40px;
    color: var(--accent-primary);
  }
}

.links-subtitle {
  font-size: 1.1rem;
  color: var(--text-muted);
}

/* Links Grid */
.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 64px;
}

.link-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: all var(--transition-base);
  
  &:hover {
    border-color: var(--accent-primary);
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
    
    .link-arrow {
      transform: translate(4px, -4px);
      color: var(--accent-primary);
    }
  }
}

.link-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.link-info {
  flex: 1;
  min-width: 0;
}

.link-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.link-description {
  font-size: 0.9rem;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-arrow {
  width: 20px;
  height: 20px;
  color: var(--text-muted);
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

/* Loading */
.loading-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 64px;
}

.link-skeleton {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.skeleton-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--border-light);
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
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

/* No Links */
.no-links {
  text-align: center;
  padding: 80px 24px;
  margin-bottom: 64px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  
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
  }
}

/* Apply Section */
.apply-section {
  text-align: center;
  padding: 48px 32px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  
  h2 {
    font-size: 1.5rem;
    margin-bottom: 16px;
  }
  
  > p {
    color: var(--text-secondary);
    margin-bottom: 32px;
  }
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 400px;
  margin: 0 auto;
  text-align: left;
}

.contact-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
}

.contact-label {
  font-weight: 500;
  color: var(--text-secondary);
}

.contact-value {
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .links-grid {
    grid-template-columns: 1fr;
  }
  
  .contact-item {
    flex-direction: column;
    gap: 4px;
    text-align: center;
  }
}
</style>
