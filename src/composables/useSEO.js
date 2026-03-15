import { ref, computed, watch } from 'vue'

// Flesch Reading Ease calculation
function calculateFleschReadingEase(text) {
  if (!text || text.length < 10) return 0
  
  // Count sentences (split by . ! ?)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1
  
  // Count words
  const words = text.split(/\s+/).filter(w => w.length > 0)
  const wordCount = words.length || 1
  
  // Count syllables (approximate)
  let syllableCount = 0
  words.forEach(word => {
    const cleaned = word.toLowerCase().replace(/[^a-z]/g, '')
    if (cleaned.length <= 3) {
      syllableCount += 1
    } else {
      const vowels = cleaned.match(/[aeiouy]{1,2}/g)
      syllableCount += vowels ? vowels.length : 1
    }
  })
  
  // Flesch Reading Ease formula
  // 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
  const avgWordsPerSentence = wordCount / sentences
  const avgSyllablesPerWord = syllableCount / wordCount
  
  let score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
  
  // Clamp to 0-100
  return Math.max(0, Math.min(100, Math.round(score)))
}

// Get readability level
function getReadabilityLevel(score) {
  if (score >= 90) return { level: '非常简单', color: '#10b981' }
  if (score >= 80) return { level: '简单', color: '#34d399' }
  if (score >= 70) return { level: '较简单', color: '#6ee7b7' }
  if (score >= 60) return { level: '标准', color: '#fcd34d' }
  if (score >= 50) return { level: '较难', color: '#fbbf24' }
  if (score >= 30) return { level: '困难', color: '#f59e0b' }
  return { level: '非常困难', color: '#ef4444' }
}

// Extract keywords from text (simple frequency-based approach)
function extractKeywords(text, minLength = 2) {
  if (!text) return []
  
  // Remove HTML tags
  const cleanText = text.replace(/<[^>]*>/g, ' ')
  
  // Common stop words
  const stopWords = new Set([
    '的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
    '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
    '自己', '这', '那', '它', '他', '她', '们', '但', '而', '与', '或', '等', '以',
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
    'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it',
    'we', 'they', 'what', 'which', 'who', 'whom', 'and', 'but', 'or', 'not', 'for',
    'with', 'of', 'in', 'on', 'at', 'to', 'from', 'by'
  ])
  
  // Extract words
  const words = cleanText.toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= minLength && !stopWords.has(w))
  
  // Count frequency
  const freq = {}
  words.forEach(w => {
    freq[w] = (freq[w] || 0) + 1
  })
  
  // Sort by frequency and return top 10
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }))
}

// Calculate keyword density
function calculateKeywordDensity(text, keyword) {
  if (!text || !keyword) return 0
  
  const cleanText = text.toLowerCase().replace(/<[^>]*>/g, ' ')
  const words = cleanText.split(/\s+/).filter(w => w.length > 0)
  const totalWords = words.length || 1
  
  const keywordLower = keyword.toLowerCase()
  const keywordCount = words.filter(w => w.includes(keywordLower)).length
  
  return (keywordCount / totalWords) * 100
}

export function useSEO() {
  const title = ref('')
  const content = ref('')
  const excerpt = ref('')
  
  // Title analysis
  const titleLength = computed(() => title.value.length)
  const titleStatus = computed(() => {
    const len = titleLength.value
    if (len === 0) return { status: 'empty', message: '请输入标题', score: 0 }
    if (len < 30) return { status: 'short', message: '标题过短 (建议50-60字符)', score: 30 }
    if (len > 80) return { status: 'long', message: '标题过长 (建议50-60字符)', score: 50 }
    if (len >= 50 && len <= 60) return { status: 'perfect', message: '标题长度完美', score: 100 }
    return { status: 'good', message: '标题长度合适', score: 80 }
  })
  
  // Excerpt/description analysis
  const excerptLength = computed(() => excerpt.value.length)
  const excerptStatus = computed(() => {
    const len = excerptLength.value
    if (len === 0) return { status: 'empty', message: '建议填写摘要', score: 0 }
    if (len < 100) return { status: 'short', message: '摘要过短 (建议150-160字符)', score: 40 }
    if (len > 200) return { status: 'long', message: '摘要过长 (建议150-160字符)', score: 60 }
    if (len >= 150 && len <= 160) return { status: 'perfect', message: '摘要长度完美', score: 100 }
    return { status: 'good', message: '摘要长度合适', score: 80 }
  })
  
  // Content analysis
  const contentText = computed(() => {
    return content.value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  })
  
  const contentLength = computed(() => contentText.value.length)
  const wordCount = computed(() => {
    const text = contentText.value
    return text ? text.split(/\s+/).filter(w => w.length > 0).length : 0
  })
  
  const contentStatus = computed(() => {
    const len = wordCount.value
    if (len < 100) return { status: 'short', message: '内容过短', score: 20 }
    if (len < 300) return { status: 'few', message: '内容较少', score: 50 }
    if (len < 500) return { status: 'good', message: '内容适中', score: 80 }
    if (len >= 500) return { status: 'perfect', message: '内容丰富', score: 100 }
    return { status: 'empty', message: '请输入内容', score: 0 }
  })
  
  // Keyword analysis
  const primaryKeyword = computed(() => {
    const keywords = extractKeywords(title.value + ' ' + contentText.value)
    return keywords.length > 0 ? keywords[0].word : ''
  })
  
  const keywords = computed(() => {
    return extractKeywords(title.value + ' ' + contentText.value)
  })
  
  const keywordDensity = computed(() => {
    if (!primaryKeyword.value) return 0
    return calculateKeywordDensity(contentText.value, primaryKeyword.value)
  })
  
  const keywordStatus = computed(() => {
    const density = keywordDensity.value
    if (density === 0) return { status: 'empty', message: '未检测到关键词', score: 0 }
    if (density < 0.5) return { status: 'low', message: '关键词密度过低 (建议1-3%)', score: 30 }
    if (density > 5) return { status: 'high', message: '关键词密度过高 (建议1-3%)', score: 40 }
    if (density >= 1 && density <= 3) return { status: 'perfect', message: '关键词密度完美', score: 100 }
    return { status: 'good', message: '关键词密度合适', score: 70 }
  })
  
  // Readability analysis
  const readabilityScore = computed(() => {
    return calculateFleschReadingEase(contentText.value)
  })
  
  const readabilityLevel = computed(() => {
    return getReadabilityLevel(readabilityScore.value)
  })
  
  const readabilityStatus = computed(() => {
    const score = readabilityScore.value
    if (score === 0) return { status: 'empty', message: '请输入内容', score: 0 }
    if (score >= 60) return { status: 'good', message: `可读性${readabilityLevel.value.level}`, score: 100 }
    if (score >= 40) return { status: 'medium', message: `可读性${readabilityLevel.value.level}`, score: 60 }
    return { status: 'poor', message: `可读性${readabilityLevel.value.level}`, score: 30 }
  })
  
  // Structured data check
  const hasHeadings = computed(() => {
    return content.value.includes('<h1') || content.value.includes('<h2') || content.value.includes('<h3')
  })
  
  const hasLinks = computed(() => {
    return content.value.includes('<a ')
  })
  
  const hasImages = computed(() => {
    return content.value.includes('<img')
  })
  
  const structuredDataStatus = computed(() => {
    let score = 0
    const items = []
    
    if (title.value) {
      score += 20
      items.push({ name: '标题', ok: true })
    } else {
      items.push({ name: '标题', ok: false })
    }
    
    if (excerpt.value) {
      score += 20
      items.push({ name: '摘要', ok: true })
    } else {
      items.push({ name: '摘要', ok: false })
    }
    
    if (hasHeadings.value) {
      score += 20
      items.push({ name: '段落标题', ok: true })
    } else {
      items.push({ name: '段落标题', ok: false })
    }
    
    if (hasImages.value) {
      score += 20
      items.push({ name: '图片', ok: true })
    } else {
      items.push({ name: '图片', ok: false })
    }
    
    if (hasLinks.value) {
      score += 20
      items.push({ name: '链接', ok: true })
    } else {
      items.push({ name: '链接', ok: false })
    }
    
    const status = score >= 80 ? 'good' : score >= 50 ? 'medium' : 'poor'
    const message = score >= 80 ? '结构完整' : score >= 50 ? '建议完善结构' : '缺少结构化元素'
    
    return { status, message, score, items }
  })
  
  // Total SEO score
  const totalScore = computed(() => {
    const weights = {
      title: 25,
      excerpt: 15,
      content: 20,
      keyword: 15,
      readability: 15,
      structured: 10
    }
    
    const score = Math.round(
      titleStatus.value.score * (weights.title / 100) +
      excerptStatus.value.score * (weights.excerpt / 100) +
      contentStatus.value.score * (weights.content / 100) +
      keywordStatus.value.score * (weights.keyword / 100) +
      readabilityStatus.value.score * (weights.readability / 100) +
      structuredDataStatus.value.score * (weights.structured / 100)
    )
    
    return score
  })
  
  const scoreGrade = computed(() => {
    const score = totalScore.value
    if (score >= 90) return { grade: 'A', color: '#10b981', label: '优秀' }
    if (score >= 80) return { grade: 'B', color: '#34d399', label: '良好' }
    if (score >= 70) return { grade: 'C', color: '#fcd34d', label: '一般' }
    if (score >= 60) return { grade: 'D', color: '#fbbf24', label: '待改进' }
    return { grade: 'F', color: '#ef4444', label: '需优化' }
  })
  
  // Optimization suggestions
  const suggestions = computed(() => {
    const result = []
    
    if (titleStatus.value.score < 80) {
      result.push({
        type: 'title',
        priority: 'high',
        message: titleStatus.value.message,
        action: '优化标题'
      })
    }
    
    if (excerptStatus.value.score < 80) {
      result.push({
        type: 'excerpt',
        priority: 'high',
        message: excerptStatus.value.message,
        action: '完善摘要'
      })
    }
    
    if (contentStatus.value.score < 80) {
      result.push({
        type: 'content',
        priority: contentStatus.value.score < 50 ? 'high' : 'medium',
        message: contentStatus.value.message,
        action: '扩充内容'
      })
    }
    
    if (keywordStatus.value.score < 80) {
      result.push({
        type: 'keyword',
        priority: 'medium',
        message: keywordStatus.value.message,
        action: '优化关键词'
      })
    }
    
    if (readabilityStatus.value.score < 80) {
      result.push({
        type: 'readability',
        priority: 'low',
        message: readabilityStatus.value.message,
        action: '提升可读性'
      })
    }
    
    if (!hasHeadings.value) {
      result.push({
        type: 'structure',
        priority: 'medium',
        message: '建议添加段落标题 (H1/H2/H3)',
        action: '添加标题'
      })
    }
    
    if (!hasImages.value) {
      result.push({
        type: 'structure',
        priority: 'medium',
        message: '建议添加图片以增强内容',
        action: '添加图片'
      })
    }
    
    if (!hasLinks.value) {
      result.push({
        type: 'structure',
        priority: 'low',
        message: '建议添加相关链接',
        action: '添加链接'
      })
    }
    
    return result.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  })
  
  // Schema.org structured data (JSON-LD)
  const schemaOrg = computed(() => {
    if (!title.value || !content.value) return null
    
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title.value,
      "description": excerpt.value || undefined,
      "author": {
        "@type": "Person",
        "name": "Author"
      },
      "datePublished": new Date().toISOString(),
      "articleSection": "Blog"
    }
    
    if (wordCount.value > 0) {
      schema.wordCount = wordCount.value
    }
    
    return schema
  })
  
  // Set data
  const setTitle = (value) => { title.value = value }
  const setContent = (value) => { content.value = value }
  const setExcerpt = (value) => { excerpt.value = value }
  
  return {
    // Data
    title,
    content,
    excerpt,
    
    // Computed
    titleLength,
    titleStatus,
    excerptLength,
    excerptStatus,
    contentLength,
    wordCount,
    contentStatus,
    primaryKeyword,
    keywords,
    keywordDensity,
    keywordStatus,
    readabilityScore,
    readabilityLevel,
    readabilityStatus,
    hasHeadings,
    hasLinks,
    hasImages,
    structuredDataStatus,
    totalScore,
    scoreGrade,
    suggestions,
    schemaOrg,
    
    // Methods
    setTitle,
    setContent,
    setExcerpt
  }
}
