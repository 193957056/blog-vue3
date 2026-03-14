<template>
  <div class="about-view">
    <div class="container">
      <section class="about-hero">
        <div class="avatar-container">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=lumina&backgroundColor=b6e3f4" 
            alt="Lumina" 
            class="avatar"
          />
          <div class="avatar-ring"></div>
        </div>
        
        <h1 class="name">Lumina</h1>
        <p class="tagline">用文字记录思考，用设计诠释美学</p>
        
        <div class="social-links">
          <a href="#" class="social-link" title="GitHub">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
          <a href="#" class="social-link" title="Twitter">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </a>
          <a href="#" class="social-link" title="Email">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </a>
        </div>
      </section>
      
      <section class="about-content">
        <div class="content-block">
          <h2>关于我</h2>
          <p>
            你好！我是 Lumina，一个热爱技术和设计的开发者。
            我相信美好的事物值得被记录，优秀的代码值得被分享。
          </p>
          <p>
            这个博客是我的个人空间，用来记录学习笔记、分享技术见解，
            以及存放那些值得纪念的设计思考。
          </p>
        </div>
        
        <div class="content-block">
          <h2>技能标签</h2>
          <div class="skills-grid">
            <span 
              v-for="skill in skills" 
              :key="skill.name"
              class="skill-tag"
              :style="{ background: skill.color + '20', color: skill.color, borderColor: skill.color }"
            >
              {{ skill.name }}
            </span>
          </div>
        </div>
        
        <div class="content-block">
          <h2>博客统计</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-number">{{ stats?.post_count || 0 }}</span>
              <span class="stat-label">文章</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">{{ stats?.category_count || 0 }}</span>
              <span class="stat-label">分类</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">{{ stats?.tag_count || 0 }}</span>
              <span class="stat-label">标签</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">{{ formatNumber(stats?.total_views || 0) }}</span>
              <span class="stat-label">总阅读</span>
            </div>
          </div>
        </div>
        
        <div class="content-block">
          <h2>联系我</h2>
          <p>
            欢迎通过以下方式与我交流：
          </p>
          <ul class="contact-list">
            <li>
              <strong>邮箱</strong>: hello@lumina.dev
            </li>
            <li>
              <strong>GitHub</strong>: github.com/lumina
            </li>
          </ul>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useBlogStore } from '@/stores/blog'

const store = useBlogStore()

const stats = computed(() => store.stats)

const skills = [
  { name: 'Vue', color: '#42B883' },
  { name: 'React', color: '#61DAFB' },
  { name: 'Go', color: '#00ADD8' },
  { name: 'Node.js', color: '#339933' },
  { name: 'Python', color: '#3776AB' },
  { name: 'UI/UX', color: '#FF61F6' },
  { name: 'Docker', color: '#2496ED' },
  { name: 'Git', color: '#F05032' }
]

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num
}

onMounted(() => {
  store.fetchStats()
})
</script>

<style scoped>
.about-view {
  min-height: 100vh;
  padding: 64px 24px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

/* Hero */
.about-hero {
  text-align: center;
  margin-bottom: 64px;
}

.avatar-container {
  position: relative;
  width: 160px;
  height: 160px;
  margin: 0 auto 32px;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  position: relative;
  z-index: 1;
}

.avatar-ring {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: var(--gradient-main);
  z-index: 0;
  animation: rotate 8s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.avatar-container:hover .avatar-ring {
  animation-duration: 2s;
}

.name {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  background: var(--gradient-main);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tagline {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 50%;
  transition: all var(--transition-base);
  
  svg {
    width: 22px;
    height: 22px;
  }
  
  &:hover {
    color: white;
    background: var(--gradient-main);
    border-color: transparent;
    transform: translateY(-4px);
  }
}

/* Content */
.about-content {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.content-block {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  padding: 32px;
  
  h2 {
    font-size: 1.5rem;
    margin-bottom: 20px;
    color: var(--text-primary);
  }
  
  p {
    color: var(--text-secondary);
    line-height: 1.8;
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  ul {
    list-style: none;
    padding: 0;
    
    li {
      padding: 8px 0;
      color: var(--text-secondary);
      
      strong {
        color: var(--text-primary);
        margin-right: 8px;
      }
    }
  }
}

/* Skills */
.skills-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.skill-tag {
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 20px;
  border: 1px solid;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  text-align: center;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.stat-number {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
  background: var(--gradient-main);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* Contact List */
.contact-list {
  li {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
