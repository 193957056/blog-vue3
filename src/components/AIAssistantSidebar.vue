<template>
  <div class="ai-assistant" :class="{ expanded: isExpanded }">
    <!-- Toggle Button -->
    <button class="toggle-btn" @click="toggleSidebar" :title="isExpanded ? '收起AI助手' : '展开AI助手'">
      <span class="ai-icon">✨</span>
      <span class="ai-text">AI助手</span>
      <span class="toggle-arrow" :class="{ rotated: isExpanded }">‹</span>
    </button>

    <!-- Sidebar Panel -->
    <div class="sidebar-panel" v-show="isExpanded">
      <div class="panel-header">
        <h3>AI 写作助手</h3>
        <span class="powered-by">Powered by AI</span>
      </div>

      <!-- Feature Tabs -->
      <div class="feature-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id" 
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.name }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Smart Polish -->
        <div v-if="activeTab === 'polish'" class="feature-panel">
          <p class="feature-desc">对选中或全文进行智能润色，提升文案质量</p>
          
          <div class="input-area">
            <label>选择范围：</label>
            <div class="scope-row">
              <select v-model="polishScope">
                <option value="selection">选中文字</option>
                <option value="full">全文内容</option>
              </select>
              <button v-if="polishScope === 'selection'" class="refresh-btn" @click="emit('refresh-selection')" title="刷新选中文字">
                🔄
              </button>
            </div>
          </div>

          <div v-if="polishScope === 'selection'" class="hint-text" v-show="!selectedText">
            请先在编辑器中选中需要润色的文字，然后点击刷新按钮
          </div>

          <div v-if="polishScope === 'selection' && selectedText" class="preview-text">
            <label>选中内容：</label>
            <div class="text-preview">{{ selectedText }}</div>
          </div>

          <button 
            class="action-btn primary" 
            @click="handlePolish" 
            :disabled="polishLoading || (polishScope === 'selection' && !selectedText)"
          >
            {{ polishLoading ? '润色中...' : '✨ 开始润色' }}
          </button>

          <div v-if="polishResult" class="result-area">
            <label>润色结果：</label>
            <div class="result-text">{{ polishResult }}</div>
            <div class="result-actions">
              <button class="action-btn" @click="copyResult(polishResult)">复制</button>
              <button class="action-btn primary" @click="applyPolish">一键采纳</button>
            </div>
          </div>
        </div>

        <!-- Generate Summary -->
        <div v-if="activeTab === 'summary'" class="feature-panel">
          <p class="feature-desc">基于文章内容生成简洁、SEO友好的摘要</p>
          
          <div class="input-area">
            <label>摘要长度：</label>
            <select v-model="summaryLength">
              <option value="short">简短 (50字内)</option>
              <option value="medium">中等 (100字内)</option>
              <option value="long">详细 (200字内)</option>
            </select>
          </div>

          <button 
            class="action-btn primary" 
            @click="handleGenerateSummary" 
            :disabled="summaryLoading || !editorContent"
          >
            {{ summaryLoading ? '生成中...' : '📝 生成摘要' }}
          </button>

          <div v-if="summaryResult" class="result-area">
            <label>生成结果：</label>
            <div class="result-text">{{ summaryResult }}</div>
            <div class="result-actions">
              <button class="action-btn" @click="copyResult(summaryResult)">复制</button>
              <button class="action-btn primary" @click="applySummary">一键采纳</button>
            </div>
          </div>
        </div>

        <!-- SEO Optimization -->
        <div v-if="activeTab === 'seo'" class="feature-panel">
          <p class="feature-desc">分析文章SEO表现，提供优化建议</p>
          
          <div class="input-area">
            <label>目标关键词：</label>
            <input 
              v-model="seoKeyword" 
              type="text" 
              placeholder="输入主要关键词"
            />
          </div>

          <button 
            class="action-btn primary" 
            @click="handleSEOAnalysis" 
            :disabled="seoLoading || !editorContent"
          >
            {{ seoLoading ? '分析中...' : '🔍 SEO分析' }}
          </button>

          <div v-if="seoResult" class="result-area seo-result">
            <div class="seo-score">
              <div class="score-circle" :class="getSEOScoreClass(seoResult.score)">
                <span class="score-value">{{ seoResult.score }}</span>
                <span class="score-label">分</span>
              </div>
              <div class="score-desc">{{ seoResult.scoreDesc }}</div>
            </div>

            <div class="seo-items">
              <div class="seo-item" v-for="item in seoResult.items" :key="item.name">
                <div class="seo-item-header">
                  <span class="seo-item-name">{{ item.name }}</span>
                  <span class="seo-item-status" :class="item.status">{{ item.statusText }}</span>
                </div>
                <div class="seo-item-bar">
                  <div class="seo-item-progress" :style="{ width: item.score + '%' }" :class="item.status"></div>
                </div>
                <p class="seo-item-suggestion" v-if="item.suggestion">{{ item.suggestion }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Translation -->
        <div v-if="activeTab === 'translate'" class="feature-panel">
          <p class="feature-desc">将内容翻译为其他语言</p>
          
          <div class="input-area">
            <label>源语言：</label>
            <select v-model="sourceLang">
              <option value="zh-CN">中文</option>
              <option value="en">英语</option>
              <option value="ja">日语</option>
              <option value="ko">韩语</option>
            </select>
          </div>

          <div class="input-area">
            <label>目标语言：</label>
            <select v-model="targetLang">
              <option value="en">英语</option>
              <option value="ja">日语</option>
              <option value="ko">韩语</option>
              <option value="zh-CN">中文</option>
            </select>
          </div>

          <div v-if="sourceLang === targetLang" class="hint-text">
            源语言和目标语言不能相同
          </div>

          <div class="input-area">
            <label>翻译范围：</label>
            <div class="scope-row">
              <select v-model="translateScope">
                <option value="selection">选中文字</option>
                <option value="full">全文内容</option>
              </select>
              <button v-if="translateScope === 'selection'" class="refresh-btn" @click="emit('refresh-selection')" title="刷新选中文字">
                🔄
              </button>
            </div>
          </div>

          <div v-if="translateScope === 'selection'" class="hint-text" v-show="!selectedText">
            请先在编辑器中选中需要翻译的文字，然后点击刷新按钮
          </div>

          <button 
            class="action-btn primary" 
            @click="handleTranslate" 
            :disabled="translateLoading || sourceLang === targetLang || (translateScope === 'selection' && !selectedText)"
          >
            {{ translateLoading ? '翻译中...' : '🌐 开始翻译' }}
          </button>

          <div v-if="translateResult" class="result-area">
            <label>翻译结果 ({{ getLangName(targetLang) }})：</label>
            <div class="result-text">{{ translateResult }}</div>
            <div class="result-actions">
              <button class="action-btn" @click="copyResult(translateResult)">复制</button>
              <button class="action-btn primary" @click="applyTranslation">一键采纳</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div v-if="isAnyLoading" class="loading-overlay">
        <div class="spinner"></div>
        <span>AI 处理中...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  editorContent: {
    type: String,
    default: ''
  },
  selectedText: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['apply-content', 'show-message', 'refresh-selection'])

// Sidebar state
const isExpanded = ref(false)
const activeTab = ref('polish')

const tabs = [
  { id: 'polish', name: '智能润色' },
  { id: 'summary', name: '生成摘要' },
  { id: 'seo', name: 'SEO优化' },
  { id: 'translate', name: '翻译' }
]

// Polish state
const polishScope = ref('selection')
const polishLoading = ref(false)
const polishResult = ref('')

// Summary state
const summaryLength = ref('medium')
const summaryLoading = ref(false)
const summaryResult = ref('')

// SEO state
const seoKeyword = ref('')
const seoLoading = ref(false)
const seoResult = ref(null)

// Translate state
const sourceLang = ref('zh-CN')
const targetLang = ref('en')
const translateScope = ref('full')
const translateLoading = ref(false)
const translateResult = ref('')

// Computed
const isAnyLoading = computed(() => 
  polishLoading.value || summaryLoading.value || seoLoading.value || translateLoading.value
)

// Methods
const toggleSidebar = () => {
  isExpanded.value = !isExpanded.value
}

const getLangName = (code) => {
  const langs = { 'zh-CN': '中文', 'en': '英语', 'ja': '日语', 'ko': '韩语' }
  return langs[code] || code
}

// Mock AI API calls - In production, replace with real API
const mockAIRequest = (delay = 1500) => new Promise(resolve => setTimeout(resolve, delay))

const handlePolish = async () => {
  polishLoading.value = true
  polishResult.value = ''
  
  try {
    await mockAIRequest()
    
    const text = polishScope.value === 'selection' ? props.selectedText : props.editorContent
    // Mock result - in production, this would be from actual AI
    polishResult.value = text 
      ? `${text}\n\n[润色后的版本]\n${text.replace(/([。！？])\s*/g, '$1\n').trim()}\n\n✨ 已优化句子结构，提升表达流畅度。`
      : '请输入要润色的内容'
  } catch (err) {
    emit('show-message', '润色失败，请重试')
  } finally {
    polishLoading.value = false
  }
}

const handleGenerateSummary = async () => {
  summaryLoading.value = true
  summaryResult.value = ''
  
  try {
    await mockAIRequest()
    
    // Extract plain text from HTML content
    const plainText = props.editorContent.replace(/<[^>]+>/g, '').slice(0, 500)
    const limits = { short: 50, medium: 100, long: 200 }
    const limit = limits[summaryLength.value]
    
    summaryResult.value = plainText 
      ? `${plainText.slice(0, limit)}${plainText.length > limit ? '...' : ''}\n\n📌 这是一篇关于${plainText.includes('技术') ? '技术' : '生活'}主题的文章摘要，包含核心要点。`
      : '请先输入文章内容'
  } catch (err) {
    emit('show-message', '生成摘要失败，请重试')
  } finally {
    summaryLoading.value = false
  }
}

const handleSEOAnalysis = async () => {
  seoLoading.value = true
  seoResult.value = null
  
  try {
    await mockAIRequest(2000)
    
    const content = props.editorContent.replace(/<[^>]+>/g, '')
    const keyword = seoKeyword.value || '主题'
    const keywordCount = (content.match(new RegExp(keyword, 'g')) || []).length
    const keywordDensity = ((keywordCount / content.split(/\s+/).length) * 100).toFixed(1)
    
    // Calculate score based on various factors
    const hasTitle = content.length > 0
    const hasKeyword = keywordCount > 0
    const goodDensity = keywordDensity >= 1 && keywordDensity <= 3
    const hasMeta = content.length > 100
    const readability = content.length > 200
    
    const score = Math.min(100, (
      (hasTitle ? 15 : 0) +
      (hasKeyword ? 20 : 0) +
      (goodDensity ? 20 : 0) +
      (hasMeta ? 20 : 0) +
      (readability ? 25 : 0)
    ))
    
    seoResult.value = {
      score,
      scoreDesc: score >= 80 ? '优秀' : score >= 60 ? '良好' : '需要优化',
      items: [
        {
          name: '关键词密度',
          score: goodDensity ? 100 : keywordDensity > 3 ? 30 : 60,
          status: goodDensity ? 'good' : keywordDensity > 3 ? 'bad' : 'warning',
          statusText: goodDensity ? '优秀' : keywordDensity > 3 ? '过高' : '偏低',
          suggestion: goodDensity ? '' : `建议将关键词密度控制在1%-3%之间，当前为${keywordDensity}%`
        },
        {
          name: '内容长度',
          score: readability ? 100 : content.length > 100 ? 60 : 30,
          status: readability ? 'good' : 'warning',
          statusText: readability ? '充足' : '偏短',
          suggestion: readability ? '' : '建议内容长度超过200字以获得更好的SEO效果'
        },
        {
          name: '关键词出现',
          score: hasKeyword ? 100 : 20,
          status: hasKeyword ? 'good' : 'bad',
          statusText: hasKeyword ? '已包含' : '未包含',
          suggestion: hasKeyword ? '' : `请在内容中适当提及关键词"${keyword}"`
        }
      ]
    }
  } catch (err) {
    emit('show-message', 'SEO分析失败，请重试')
  } finally {
    seoLoading.value = false
  }
}

const handleTranslate = async () => {
  translateLoading.value = true
  translateResult.value = ''
  
  try {
    await mockAIRequest()
    
    const text = translateScope.value === 'selection' ? props.selectedText : props.editorContent
    const targetLangName = getLangName(targetLang.value)
    
    // Mock translation - in production, use real translation API
    const translations = {
      'en': '[English Translation]\n' + (text || ''),
      'ja': '【日本語翻訳】\n' + (text || ''),
      'ko': '【한국어 번역】\n' + (text || '')
    }
    
    translateResult.value = text ? translations[targetLang.value] : '请输入要翻译的内容'
  } catch (err) {
    emit('show-message', '翻译失败，请重试')
  } finally {
    translateLoading.value = false
  }
}

const getSEOScoreClass = (score) => {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  return 'poor'
}

const copyResult = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    emit('show-message', '已复制到剪贴板')
  } catch (err) {
    emit('show-message', '复制失败')
  }
}

const applyPolish = () => {
  emit('apply-content', polishResult.value)
  emit('show-message', '已采纳润色结果')
}

const applySummary = () => {
  // This would set the excerpt field
  emit('apply-content', summaryResult.value, 'excerpt')
  emit('show-message', '已采纳摘要')
}

const applyTranslation = () => {
  emit('apply-content', translateResult.value)
  emit('show-message', '已采纳翻译结果')
}
</script>

<style scoped>
.ai-assistant {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1100;
  font-family: inherit;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  border: none;
  border-radius: 24px 0 0 24px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: -4px 0 20px rgba(168, 85, 247, 0.3);
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  padding-right: 20px;
}

.ai-icon {
  font-size: 1.1rem;
}

.toggle-arrow {
  transition: transform 0.3s ease;
  font-size: 1.2rem;
}

.toggle-arrow.rotated {
  transform: rotate(180deg);
}

.sidebar-panel {
  position: absolute;
  right: 100%;
  top: 0;
  width: 360px;
  max-height: 80vh;
  background: #1a1a24;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px 0 0 16px;
  box-shadow: -8px 0 32px rgba(0,0,0,0.4);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.panel-header h3 {
  margin: 0;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
}

.powered-by {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.feature-tabs {
  display: flex;
  padding: 12px 16px;
  gap: 8px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  overflow-x: auto;
}

.tab-btn {
  flex-shrink: 0;
  padding: 8px 14px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  color: rgba(255,255,255,0.6);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: rgba(255,255,255,0.05);
}

.tab-btn.active {
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  border-color: transparent;
  color: #fff;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.feature-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-desc {
  margin: 0;
  color: rgba(255,255,255,0.5);
  font-size: 0.85rem;
  line-height: 1.5;
}

.input-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-area label {
  color: rgba(255,255,255,0.7);
  font-size: 0.85rem;
  font-weight: 500;
}

.input-area select,
.input-area input {
  padding: 10px 14px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 0.9rem;
}

.input-area select:focus,
.input-area input:focus {
  outline: none;
  border-color: #a855f7;
}

.scope-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.scope-row select {
  flex: 1;
}

.refresh-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 10px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background: rgba(255,255,255,0.15);
}

.hint-text {
  padding: 12px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 10px;
  color: #f59e0b;
  font-size: 0.85rem;
}

.preview-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-text label {
  color: rgba(255,255,255,0.7);
  font-size: 0.85rem;
}

.text-preview {
  padding: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  color: rgba(255,255,255,0.7);
  font-size: 0.85rem;
  max-height: 80px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.action-btn {
  padding: 10px 20px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 10px;
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover:not(:disabled) {
  background: rgba(255,255,255,0.12);
}

.action-btn.primary {
  background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
  border: none;
}

.action-btn.primary:hover:not(:disabled) {
  box-shadow: 0 4px 16px rgba(168, 85, 247, 0.4);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.result-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 12px;
}

.result-area label {
  color: #10b981;
  font-size: 0.85rem;
  font-weight: 500;
}

.result-text {
  color: rgba(255,255,255,0.9);
  font-size: 0.9rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
}

.result-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.result-actions .action-btn {
  padding: 8px 16px;
  font-size: 0.85rem;
}

/* SEO Specific Styles */
.seo-result {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.2);
}

.seo-result label {
  color: #6366f1;
}

.seo-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 0;
}

.score-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 4px solid;
}

.score-circle.excellent {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.score-circle.good {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.score-circle.poor {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.score-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.score-label {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.6);
}

.score-desc {
  color: rgba(255,255,255,0.7);
  font-size: 0.9rem;
}

.seo-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.seo-item {
  padding: 12px;
  background: rgba(0,0,0,0.2);
  border-radius: 10px;
}

.seo-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.seo-item-name {
  color: rgba(255,255,255,0.9);
  font-size: 0.9rem;
  font-weight: 500;
}

.seo-item-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.seo-item-status.good {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.seo-item-status.warning {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.seo-item-status.bad {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.seo-item-bar {
  height: 4px;
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}

.seo-item-progress {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
}

.seo-item-progress.good {
  background: #10b981;
}

.seo-item-progress.warning {
  background: #f59e0b;
}

.seo-item-progress.bad {
  background: #ef4444;
}

.seo-item-suggestion {
  margin: 0;
  color: rgba(255,255,255,0.5);
  font-size: 0.8rem;
  line-height: 1.4;
}

/* Loading */
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(26, 26, 36, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: rgba(255,255,255,0.7);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: #a855f7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
