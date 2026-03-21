<template>
  <nav class="toc" :class="{ 'toc-visible': isVisible, 'toc-mobile-open': mobileOpen }">
    <div class="toc-header">
      <h4>目录</h4>
      <button class="toc-close" @click="closeMobile" v-if="isMobile">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    
    <ul class="toc-list" ref="tocList">
      <li 
        v-for="item in tocItems" 
        :key="item.id"
        class="toc-item"
        :class="{ 
          'toc-item-active': activeId === item.id,
          [`toc-level-${item.level}`]: true
        }"
      >
        <a 
          :href="`#${item.id}`" 
          @click.prevent="scrollToHeading(item.id)"
        >
          {{ item.text }}
        </a>
      </li>
    </ul>
    
    <!-- Mobile Toggle Button -->
    <button 
      class="toc-mobile-toggle" 
      @click="toggleMobile"
      v-if="isMobile && tocItems.length > 0"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
      <span>目录</span>
    </button>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

const tocItems = ref([])
const activeId = ref('')
const mobileOpen = ref(false)
const isMobile = ref(false)
const isVisible = ref(false)
const tocList = ref(null)

// 检测是否移动设备
const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024
}

// 切换移动端目录显示
const toggleMobile = () => {
  mobileOpen.value = !mobileOpen.value
}

const closeMobile = () => {
  mobileOpen.value = false
}

// 从内容中提取标题生成 TOC
const generateToc = () => {
  if (!props.content) {
    tocItems.value = []
    return
  }
  
  // 使用正则匹配 Markdown 标题
  const headingRegex = /^(#{1,3})\s+(.+)$/gm
  const items = []
  let match
  
  while ((match = headingRegex.exec(props.content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    // 生成 ID（与 marked 生成的 ID 保持一致）
    const id = text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    
    items.push({ id, text, level })
  }
  
  tocItems.value = items
  
  // 如果有标题，显示 TOC
  isVisible.value = items.length > 0
  
  // 为标题添加 ID
  nextTick(() => {
    addIdsToHeadings()
  })
}

// 为内容中的标题添加 ID
const addIdsToHeadings = () => {
  if (!props.content) return
  
  // 找到渲染后的 h2, h3 元素并添加 ID
  const contentEl = document.querySelector('.post-body')
  if (!contentEl) return
  
  const headings = contentEl.querySelectorAll('h2, h3')
  headings.forEach((heading, index) => {
    if (!heading.id && tocItems.value[index]) {
      heading.id = tocItems.value[index].id
    }
  })
}

// 滚动到指定标题
const scrollToHeading = (id) => {
  const heading = document.getElementById(id)
  if (heading) {
    const offsetTop = heading.getBoundingClientRect().top + window.scrollY - 80
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    })
    
    // 关闭移动端目录
    closeMobile()
    
    // 更新 URL hash（不触发跳转）
    history.pushState(null, '', `#${id}`)
  }
}

// 监听滚动，更新当前高亮的标题
const handleScroll = () => {
  if (tocItems.value.length === 0) return
  
  const scrollTop = window.scrollY + 100 // 偏移量
  
  // 找到当前可见的标题
  let currentId = ''
  
  for (let i = 0; i < tocItems.value.length; i++) {
    const heading = document.getElementById(tocItems.value[i].id)
    if (heading) {
      const headingTop = heading.getBoundingClientRect().top + window.scrollY
      if (scrollTop >= headingTop) {
        currentId = tocItems.value[i].id
      } else {
        break
      }
    }
  }
  
  if (currentId && currentId !== activeId.value) {
    activeId.value = currentId
  }
}

watch(() => props.content, () => {
  generateToc()
})

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  window.addEventListener('scroll', handleScroll)
  generateToc()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.toc {
  position: relative;
}

/* Desktop TOC - 悬浮在右侧 */
@media (min-width: 1024px) {
  .toc {
    position: fixed;
    right: 24px;
    top: 120px;
    width: 220px;
    max-height: calc(100vh - 160px);
    overflow-y: auto;
    z-index: 100;
    opacity: 0;
    transform: translateX(20px);
    transition: all 0.3s ease;
    
    &.toc-visible {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .toc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-light);
    
    h4 {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  }
  
  .toc-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .toc-item {
    position: relative;
    margin-bottom: 4px;
    
    a {
      display: block;
      padding: 6px 12px;
      font-size: 0.85rem;
      color: var(--text-secondary);
      text-decoration: none;
      border-left: 2px solid transparent;
      transition: all 0.2s ease;
      line-height: 1.4;
      
      &:hover {
        color: var(--accent-primary);
        background: var(--bg-secondary);
      }
    }
    
    &.toc-item-active {
      a {
        color: var(--accent-primary);
        border-left-color: var(--accent-primary);
        background: var(--bg-secondary);
        font-weight: 500;
      }
    }
    
    &.toc-level-2 a {
      padding-left: 12px;
    }
    
    &.toc-level-3 a {
      padding-left: 24px;
      font-size: 0.8rem;
    }
  }
}

/* Mobile TOC */
@media (max-width: 1023px) {
  .toc-mobile-toggle {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 99;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: var(--accent-primary);
    color: white;
    border: none;
    border-radius: 24px;
    font-size: 0.9rem;
    font-weight: 500;
    box-shadow: var(--shadow-lg);
    cursor: pointer;
    transition: all 0.2s ease;
    
    svg {
      width: 18px;
      height: 18px;
    }
    
    &:hover {
      transform: scale(1.05);
      box-shadow: var(--shadow-xl);
    }
  }
  
  .toc {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 200;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    
    &.toc-mobile-open {
      opacity: 1;
      visibility: visible;
      
      .toc-list {
        transform: translateX(0);
      }
    }
  }
  
  .toc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-light);
    
    h4 {
      font-size: 1.1rem;
      font-weight: 600;
    }
  }
  
  .toc-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: var(--bg-secondary);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
  
  .toc-list {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 70vh;
    padding: 16px;
    background: var(--bg-primary);
    border-radius: 24px 24px 0 0;
    list-style: none;
    overflow-y: auto;
    transform: translateY(100%);
    transition: transform 0.3s ease;
  }
  
  .toc-item {
    margin-bottom: 4px;
    
    a {
      display: block;
      padding: 12px 16px;
      font-size: 1rem;
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: 8px;
      
      &:hover, &:active {
        background: var(--bg-secondary);
        color: var(--accent-primary);
      }
    }
    
    &.toc-item-active {
      a {
        color: var(--accent-primary);
        background: var(--bg-secondary);
        font-weight: 500;
      }
    }
    
    &.toc-level-3 a {
      padding-left: 32px;
      font-size: 0.9rem;
    }
  }
}
</style>
