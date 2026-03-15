<template>
  <div class="seo-panel" :class="{ expanded: isExpanded }">
    <!-- Toggle Button -->
    <button class="toggle-btn" @click="togglePanel" :title="isExpanded ? '收起SEO面板' : '展开SEO面板'">
      <span class="seo-icon">📊</span>
      <span class="seo-text">SEO</span>
      <span class="toggle-arrow" :class="{ rotated: isExpanded }">‹</span>
    </button>

    <!-- Panel -->
    <div class="sidebar-panel" v-show="isExpanded">
      <div class="panel-header">
        <h3>智能SEO分析</h3>
        <span class="score-badge" :style="{ background: scoreGrade.color }">
          {{ scoreGrade.grade }}
        </span>
      </div>

      <!-- Score Overview -->
      <div class="score-overview">
        <div class="score-circle">
          <svg viewBox="0 0 100 100">
            <circle class="score-bg" cx="50" cy="50" r="45" />
            <circle 
              class="score-progress" 
              cx="50" 
              cy="50" 
              r="45"
              :stroke="scoreGrade.color"
              :style="{ 
                strokeDashoffset: 283 - (283 * totalScore / 100),
                stroke: scoreGrade.color 
              }"
            />
          </svg>
          <div class="score-value">
            <span class="number">{{ totalScore }}</span>
            <span class="label">分</span>
          </div>
        </div>
        <div class="score-label" :style="{ color: scoreGrade.color }">
          {{ scoreGrade.label }}
        </div>
      </div>

      <!-- Analysis Items -->
      <div class="analysis-section">
        <h4 class="section-title">分析项</h4>
        
        <!-- Title -->
        <div class="analysis-item" :class="titleStatus.status">
          <div class="item-header">
            <span class="item-icon">📝</span>
            <span class="item-name">标题</span>
            <span class="item-score" :class="titleStatus.status">{{ titleStatus.score }}</span>
          </div>
          <div class="item-bar">
            <div class="bar-fill" :style="{ width: titleStatus.score + '%', background: getStatusColor(titleStatus.status) }"></div>
          </div>
          <div class="item-message">{{ titleStatus.message }}</div>
        </div>

        <!-- Excerpt -->
        <div class="analysis-item" :class="excerptStatus.status">
          <div class="item-header">
            <span class="item-icon">📋</span>
            <span class="item-name">摘要</span>
            <span class="item-score" :class="excerptStatus.status">{{ excerptStatus.score }}</span>
          </div>
          <div class="item-bar">
            <div class="bar-fill" :style="{ width: excerptStatus.score + '%', background: getStatusColor(excerptStatus.status) }"></div>
          </div>
          <div class="item-message">{{ excerptStatus.message }}</div>
        </div>

        <!-- Content -->
        <div class="analysis-item" :class="contentStatus.status">
          <div class="item-header">
            <span class="item-icon">📄</span>
            <span class="item-name">内容</span>
            <span class="item-score" :class="contentStatus.status">{{ contentStatus.score }}</span>
          </div>
          <div class="item-bar">
            <div class="bar-fill" :style="{ width: contentStatus.score + '%', background: getStatusColor(contentStatus.status) }"></div>
          </div>
          <div class="item-message">{{ contentStatus.message }} ({{ wordCount }}字)</div>
        </div>

        <!-- Keyword -->
        <div class="analysis-item" :class="keywordStatus.status">
          <div class="item-header">
            <span class="item-icon">🔑</span>
            <span class="item-name">关键词</span>
            <span class="item-score" :class="keywordStatus.status">{{ keywordStatus.score }}</span>
          </div>
          <div class="item-bar">
            <div class="bar-fill" :style="{ width: keywordStatus.score + '%', background: getStatusColor(keywordStatus.status) }"></div>
          </div>
          <div class="item-message">
            <span v-if="primaryKeyword">核心词: <strong>{{ primaryKeyword }}</strong> ({{ keywordDensity.toFixed(1) }}%)</span>
            <span v-else>{{ keywordStatus.message }}</span>
          </div>
        </div>

        <!-- Readability -->
        <div class="analysis-item" :class="readabilityStatus.status">
          <div class="item-header">
            <span class="item-icon">📖</span>
            <span class="item-name">可读性</span>
            <span class="item-score" :class="readabilityStatus.status">{{ readabilityScore }}</span>
          </div>
          <div class="item-bar">
            <div class="bar-fill" :style="{ width: readabilityScore + '%', background: readabilityLevel.color }"></div>
          </div>
          <div class="item-message">{{ readabilityStatus.message }}</div>
        </div>

        <!-- Structured Data -->
        <div class="analysis-item" :class="structuredDataStatus.status">
          <div class="item-header">
            <span class="item-icon">🏗️</span>
            <span class="item-name">结构化</span>
            <span class="item-score" :class="structuredDataStatus.status">{{ structuredDataStatus.score }}</span>
          </div>
          <div class="item-bar">
            <div class="bar-fill" :style="{ width: structuredDataStatus.score + '%', background: getStatusColor(structuredDataStatus.status) }"></div>
          </div>
          <div class="item-message">{{ structuredDataStatus.message }}</div>
          <div class="structure-items">
            <span 
              v-for="item in structuredDataStatus.items" 
              :key="item.name"
              class="structure-tag"
              :class="{ ok: item.ok, missing: !item.ok }"
            >
              {{ item.ok ? '✓' : '✗' }} {{ item.name }}
            </span>
          </div>
        </div>
      </div>

      <!-- Suggestions -->
      <div class="suggestions-section" v-if="suggestions.length > 0">
        <h4 class="section-title">优化建议</h4>
        <div class="suggestions-list">
          <div 
            v-for="(suggestion, index) in suggestions.slice(0, 5)" 
            :key="index"
            class="suggestion-item"
            :class="suggestion.priority"
          >
            <div class="suggestion-header">
              <span class="priority-tag" :class="suggestion.priority">{{ getPriorityLabel(suggestion.priority) }}</span>
              <span class="suggestion-action">{{ suggestion.action }}</span>
            </div>
            <div class="suggestion-message">{{ suggestion.message }}</div>
          </div>
        </div>
      </div>

      <!-- Schema.org -->
      <div class="schema-section" v-if="schemaOrg">
        <h4 class="section-title">结构化数据</h4>
        <div class="schema-preview">
          <pre>{{ JSON.stringify(schemaOrg, null, 2) }}</pre>
        </div>
        <button class="copy-schema-btn" @click="copySchema">
          复制 JSON-LD
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useSEO } from '../composables/useSEO'

const props = defineProps({
  postTitle: {
    type: String,
    default: ''
  },
  postContent: {
    type: String,
    default: ''
  },
  postExcerpt: {
    type: String,
    default: ''
  }
})

const isExpanded = ref(true)
const {
  titleStatus,
  excerptStatus,
  contentStatus,
  wordCount,
  primaryKeyword,
  keywordDensity,
  keywordStatus,
  readabilityScore,
  readabilityLevel,
  readabilityStatus,
  structuredDataStatus,
  totalScore,
  scoreGrade,
  suggestions,
  schemaOrg,
  setTitle,
  setContent,
  setExcerpt
} = useSEO()

// Watch for prop changes and update SEO analysis
watch(() => props.postTitle, (newVal) => {
  setTitle(newVal)
}, { immediate: true })

watch(() => props.postContent, (newVal) => {
  setContent(newVal)
}, { immediate: true })

watch(() => props.postExcerpt, (newVal) => {
  setExcerpt(newVal)
}, { immediate: true })

const togglePanel = () => {
  isExpanded.value = !isExpanded.value
}

const getStatusColor = (status) => {
  const colors = {
    perfect: '#10b981',
    good: '#34d399',
    ideal: '#10b981',
    good: '#6ee7b7',
    few: '#fcd34d',
    medium: '#fbbf24',
    short: '#f59e0b',
    long: '#f59e0b',
    low: '#fbbf24',
    high: '#f59e0b',
    empty: '#ef4444',
    no: '#ef4444',
    missing: '#ef4444',
    poor: '#ef4444'
  }
  return colors[status] || '#6b7280'
}

const getPriorityLabel = (priority) => {
  const labels = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return labels[priority] || priority
}

const copySchema = async () => {
  if (schemaOrg.value) {
    try {
      await navigator.clipboard.writeText(JSON.stringify(schemaOrg.value, null, 2))
      alert('已复制到剪贴板')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
}
</script>

<style scoped>
.seo-panel {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1100;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Toggle Button */
.toggle-btn {
  position: absolute;
  left: -40px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 12px 12px 8px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  border-radius: 12px 0 0 12px;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: -4px 0 20px rgba(99, 102, 241, 0.3);
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
}

.seo-icon {
  font-size: 1.1rem;
}

.seo-text {
  font-weight: 600;
}

.toggle-arrow {
  transition: transform 0.3s ease;
  font-size: 1.2rem;
}

.toggle-arrow.rotated {
  transform: rotate(180deg);
}

/* Panel */
.sidebar-panel {
  width: 340px;
  max-height: 90vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16162a 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px 0 0 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.4);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(99, 102, 241, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.panel-header h3 {
  margin: 0;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
}

.score-badge {
  padding: 4px 12px;
  border-radius: 20px;
  color: #000;
  font-size: 0.85rem;
  font-weight: 700;
}

/* Score Overview */
.score-overview {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
}

.score-circle {
  position: relative;
  width: 120px;
  height: 120px;
}

.score-circle svg {
  transform: rotate(-90deg);
}

.score-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 8;
}

.score-progress {
  fill: none;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 283;
  transition: stroke-dashoffset 0.5s ease;
}

.score-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.score-value .number {
  color: #fff;
  font-size: 2.5rem;
  font-weight: 700;
}

.score-value .label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
}

.score-label {
  margin-top: 8px;
  font-size: 1rem;
  font-weight: 600;
}

/* Analysis Section */
.analysis-section {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.section-title {
  margin: 0 0 8px 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.analysis-item {
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.item-icon {
  font-size: 0.9rem;
}

.item-name {
  flex: 1;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
}

.item-score {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.1);
}

.item-score.perfect,
.item-score.good,
.item-score.ideal {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.item-score.medium,
.item-score.few,
.item-score.few {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.item-score.short,
.item-score.long,
.item-score.low,
.item-score.high,
.item-score.empty,
.item-score.poor {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.item-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}

.bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease, background 0.3s ease;
}

.item-message {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
}

.item-message strong {
  color: #a78bfa;
}

.structure-items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.structure-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  background: rgba(255, 255, 255, 0.1);
}

.structure-tag.ok {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.structure-tag.missing {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

/* Suggestions */
.suggestions-section {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.suggestion-item {
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border-left: 3px solid;
}

.suggestion-item.high {
  border-left-color: #ef4444;
}

.suggestion-item.medium {
  border-left-color: #f59e0b;
}

.suggestion-item.low {
  border-left-color: #6366f1;
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.priority-tag {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
}

.priority-tag.high {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.priority-tag.medium {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.priority-tag.low {
  background: rgba(99, 102, 241, 0.2);
  color: #a78bfa;
}

.suggestion-action {
  color: #fff;
  font-size: 0.85rem;
  font-weight: 500;
}

.suggestion-message {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
}

/* Schema Section */
.schema-section {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.schema-preview {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  max-height: 150px;
  overflow-y: auto;
}

.schema-preview pre {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.7rem;
  font-family: 'Monaco', 'Menlo', monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

.copy-schema-btn {
  width: 100%;
  padding: 10px;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 8px;
  color: #a78bfa;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-schema-btn:hover {
  background: rgba(99, 102, 241, 0.3);
}
</style>
