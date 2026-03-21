<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-brand">
          <span class="logo-text">Lumina</span>
          <p class="footer-tagline">{{ $t('footer.tagline') }}</p>
        </div>
        
        <div class="footer-links">
          <div class="link-group">
            <h4>{{ $t('footer.navigation') }}</h4>
            <router-link to="/">{{ $t('nav.home') }}</router-link>
            <router-link to="/category/tech">{{ $t('nav.tech') }}</router-link>
            <router-link to="/category/design">{{ $t('nav.design') }}</router-link>
          </div>
          
          <div class="link-group">
            <h4>{{ $t('footer.about') }}</h4>
            <router-link to="/about">{{ $t('nav.about') }}</router-link>
            <a href="mailto:hello@example.com">{{ $t('footer.contact') }}</a>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} Lumina Blog. {{ $t('footer.allRights') }}</p>
        <p class="footer-credit">Made with ❤️ and Vue 3</p>
        
        <!-- ICP 备案号显示 -->
        <div v-if="icpEnabled" class="icp-info">
          <a 
            :href="icpLink" 
            target="_blank" 
            rel="noopener noreferrer"
            class="icp-link"
          >
            {{ icpNumber }}
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useConfig } from '@/composables/useConfig'

const { getIcpConfig } = useConfig()

const currentYear = new Date().getFullYear()

// 备案信息
const icpConfig = computed(() => getIcpConfig())
const icpEnabled = computed(() => icpConfig.value?.enabled ?? true)
const icpNumber = computed(() => icpConfig.value?.number ?? '')
const icpLink = computed(() => icpConfig.value?.link ?? 'https://beian.miit.gov.cn/')
</script>

<style scoped>
.footer {
  margin-top: 80px;
  padding: 48px 0 24px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-light);
}

.footer-container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 24px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--border-light);
}

.footer-brand {
  .logo-text {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 700;
    background: var(--gradient-main);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.footer-tagline {
  margin-top: 8px;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.footer-links {
  display: flex;
  gap: 64px;
}

.link-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  h4 {
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    margin-bottom: 4px;
  }
  
  a {
    font-size: 0.95rem;
    color: var(--text-secondary);
    
    &:hover {
      color: var(--accent-primary);
    }
  }
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
  font-size: 0.85rem;
  color: var(--text-muted);
  flex-wrap: wrap;
  gap: 12px;
}

.footer-credit {
  opacity: 0.7;
}

/* ICP 备案信息样式 */
.icp-info {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  justify-content: center;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);
}

.icp-link {
  color: var(--text-muted);
  font-size: 0.8rem;
  text-decoration: none;
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--accent-primary);
  }
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
  }
  
  .footer-links {
    flex-wrap: wrap;
    gap: 32px;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
  
  .icp-info {
    margin-top: 16px;
  }
}
</style>
