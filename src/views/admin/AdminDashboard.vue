<template>
  <div class="dashboard">
    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card" :style="{ '--accent': stat.color }">
        <div class="stat-icon">{{ stat.icon }}</div>
        <div class="stat-info">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </div>
    </div>
    
    <div class="dashboard-section">
      <h2 class="section-title">最近文章</h2>
      <div class="recent-posts">
        <div v-for="post in recentPosts" :key="post.id" class="post-item">
          <div class="post-info">
            <h3 class="post-title">{{ post.title }}</h3>
            <div class="post-meta">
              <span class="post-category" :style="{ color: post.category?.color || '#a855f7' }">
                {{ post.category?.name || '未分类' }}
              </span>
              <span class="post-date">{{ formatDate(post.created_at) }}</span>
            </div>
          </div>
          <div class="post-stats">
            <span class="view-count">👁 {{ post.view_count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getStats } from '../../api'

const stats = ref([])
const recentPosts = ref([])

const fetchStats = async () => {
  try {
    const { data } = await getStats()
    stats.value = [
      { label: '文章总数', value: data.post_count, icon: '📝', color: '#a855f7' },
      { label: '分类总数', value: data.category_count, icon: '🏷️', color: '#06b6d4' },
      { label: '标签总数', value: data.tag_count, icon: '🏷️', color: '#10b981' },
      { label: '总阅读量', value: data.total_views, icon: '👁', color: '#f59e0b' }
    ]
    recentPosts.value = data.recent_posts || []
  } catch (err) {
    console.error('Failed to fetch stats:', err)
  }
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.stat-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--accent);
}

.stat-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255,255,255,0.1);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(255,255,255,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
}

.stat-label {
  color: rgba(255,255,255,0.5);
  font-size: 0.9rem;
}

.dashboard-section {
  background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 24px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 20px 0;
}

.recent-posts {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(255,255,255,0.02);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.post-item:hover {
  background: rgba(255,255,255,0.04);
}

.post-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: #fff;
  margin: 0 0 6px 0;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
}

.post-category {
  font-weight: 500;
}

.post-date {
  color: rgba(255,255,255,0.4);
}

.post-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-count {
  color: rgba(255,255,255,0.5);
  font-size: 0.85rem;
}
</style>
