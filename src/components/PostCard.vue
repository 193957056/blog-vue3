<template>
  <article class="post-card" @click="goToPost">
    <div class="card-category" :style="{ background: categoryColor }">
      {{ post.category?.name || '未分类' }}
    </div>
    
    <div class="card-content">
      <h3 class="card-title">{{ post.title }}</h3>
      <p class="card-excerpt">{{ post.excerpt || generateExcerpt(post.content) }}</p>
      
      <div class="card-meta">
        <span class="meta-date">{{ formatDate(post.created_at) }}</span>
        <span class="meta-divider">·</span>
        <span class="meta-read-time">{{ post.read_time || 1 }} 分钟阅读</span>
        <span class="meta-divider">·</span>
        <span class="meta-views">{{ post.view_count || 0 }} 阅读</span>
      </div>
      
      <div class="card-tags" v-if="post.tags?.length">
        <span 
          v-for="tag in post.tags.slice(0, 3)" 
          :key="tag.id" 
          class="tag"
          :style="{ background: tag.color + '20', color: tag.color }"
        >
          {{ tag.name }}
        </span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const categoryColor = props.post.category?.color || '#7C3AED'

const goToPost = () => {
  router.push(`/post/${props.post.slug}`)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const generateExcerpt = (content) => {
  if (!content) return ''
  // Strip markdown and HTML
  const text = content.replace(/[#*`\[\]]/g, '').slice(0, 150)
  return text + (content.length > 150 ? '...' : '')
}
</script>

<style scoped>
.post-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  padding: 24px;
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-xl);
    border-color: var(--accent-primary);
    
    .card-title {
      color: var(--accent-primary);
    }
  }
}

.card-category {
  display: inline-block;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  border-radius: 20px;
  width: fit-content;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text-primary);
  transition: color var(--transition-fast);
}

.card-excerpt {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.meta-divider {
  opacity: 0.5;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.tag {
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 12px;
}
</style>
