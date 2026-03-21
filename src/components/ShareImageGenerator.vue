<template>
  <div class="share-image-generator">
    <!-- Hidden canvas for generation -->
    <canvas ref="canvas" width="1200" height="630" style="display: none;"></canvas>
    
    <!-- Share preview/ download button -->
    <div class="share-preview" v-if="generatedImage">
      <img :src="generatedImage" alt="分享图预览" />
      <button @click="downloadImage" class="download-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7,10 12,15 17,10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        下载分享图
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  excerpt: {
    type: String,
    default: ''
  },
  author: {
    type: String,
    default: 'Lumina'
  },
  coverImage: {
    type: String,
    default: ''
  }
})

const canvas = ref(null)
const generatedImage = ref('')

// 生成分享图
const generateShareImage = () => {
  if (!canvas.value || !props.title) return
  
  const ctx = canvas.value.getContext('2d')
  const width = 1200
  const height = 630
  
  // 背景渐变
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#1a1a2e')
  gradient.addColorStop(0.5, '#16213e')
  gradient.addColorStop(1, '#0f3460')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  // 添加装饰性圆形
  ctx.save()
  ctx.globalAlpha = 0.1
  ctx.beginPath()
  ctx.arc(100, 100, 200, 0, Math.PI * 2)
  ctx.fillStyle = '#e94560'
  ctx.fill()
  
  ctx.beginPath()
  ctx.arc(1100, 500, 180, 0, Math.PI * 2)
  ctx.fillStyle = '#7c3aed'
  ctx.fill()
  ctx.restore()
  
  // 标题
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 48px "Noto Sans SC", "PingFang SC", sans-serif'
  
  // 处理标题换行
  const title = props.title.length > 30 ? props.title.slice(0, 30) + '...' : props.title
  const lines = wrapText(ctx, title, width - 160)
  let titleY = 200
  lines.forEach((line, index) => {
    ctx.fillText(line, 80, titleY + index * 60)
  })
  
  // 摘要
  if (props.excerpt) {
    ctx.font = '24px "Noto Sans SC", "PingFang SC", sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    const excerptLines = wrapText(ctx, props.excerpt.slice(0, 100), width - 160)
    let excerptY = titleY + lines.length * 60 + 30
    excerptLines.slice(0, 2).forEach((line, index) => {
      ctx.fillText(line, 80, excerptY + index * 36)
    })
  }
  
  // 作者信息
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.font = '20px "Noto Sans SC", "PingFang SC", sans-serif'
  ctx.fillText(`作者: ${props.author}`, 80, height - 80)
  
  // 网站名称
  ctx.fillStyle = '#e94560'
  ctx.font = 'bold 24px "Playfair Display", serif'
  ctx.fillText('Lumina Blog', width - 200, height - 80)
  
  // 生成图片
  generatedImage.value = canvas.value.toDataURL('image/png')
}

// 文本换行处理
const wrapText = (ctx, text, maxWidth) => {
  const words = text.split('')
  const lines = []
  let currentLine = ''
  
  words.forEach(char => {
    const testLine = currentLine + char
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && currentLine !== '') {
      lines.push(currentLine)
      currentLine = char
    } else {
      currentLine = testLine
    }
  })
  
  if (currentLine) {
    lines.push(currentLine)
  }
  
  return lines
}

// 下载图片
const downloadImage = () => {
  if (!generatedImage.value) return
  
  const link = document.createElement('a')
  link.download = `share-${props.title.slice(0, 10)}.png`
  link.href = generatedImage.value
  link.click()
}

// 监听属性变化，自动生成
watch(() => [props.title, props.excerpt], () => {
  if (props.title) {
    generateShareImage()
  }
}, { immediate: true })

onMounted(() => {
  if (props.title) {
    generateShareImage()
  }
})

// 暴露方法供外部调用
defineExpose({
  generateShareImage,
  downloadImage,
  generatedImage
})
</script>

<style scoped>
.share-image-generator {
  .share-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 24px;
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
    
    img {
      max-width: 100%;
      height: auto;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
    }
  }
  
  .download-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: var(--accent-primary);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    
    svg {
      width: 18px;
      height: 18px;
    }
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
  }
}
</style>
