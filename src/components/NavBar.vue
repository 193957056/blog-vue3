<template>
  <nav class="navbar">
    <div class="navbar-container">
      <router-link to="/" class="logo">
        <span class="logo-text">Lumina</span>
        <span class="logo-dot"></span>
      </router-link>
      
      <div class="nav-links">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/category/tech" class="nav-link">技术</router-link>
        <router-link to="/category/design" class="nav-link">设计</router-link>
        <router-link to="/about" class="nav-link">关于</router-link>
      </div>
      
      <button class="theme-toggle" @click="$emit('toggle-theme')" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
        <svg v-if="isDark" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        <svg v-else class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>
    </div>
  </nav>
</template>

<script setup>
defineProps({
  isDark: Boolean
})

defineEmits(['toggle-theme'])
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--nav-height);
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-light);
  z-index: 1000;
  transition: background var(--transition-base);
}

.navbar-container {
  max-width: var(--max-width);
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  text-decoration: none;
}

.logo-text {
  background: var(--gradient-main);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-dot {
  width: 8px;
  height: 8px;
  background: var(--gradient-main);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-link {
  position: relative;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
  
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--gradient-main);
    transition: width var(--transition-base);
  }
  
  &:hover,
  &.router-link-active {
    color: var(--text-primary);
    
    &::after {
      width: 100%;
    }
  }
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 50%;
  cursor: pointer;
  transition: all var(--transition-base);
  
  &:hover {
    background: var(--accent-primary);
    border-color: var(--accent-primary);
    
    .icon {
      color: white;
    }
  }
}

.icon {
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
  transition: color var(--transition-fast);
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
}
</style>
