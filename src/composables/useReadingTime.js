/**
 * 阅读时间计算工具
 * 按 200 字/分钟计算
 */

export function useReadingTime() {
  /**
   * 根据内容计算阅读时间（分钟）
   * @param {string} content - 文章内容（支持 Markdown 或纯文本）
   * @returns {number} 阅读时间（分钟），最少1分钟
   */
  const calculateReadingTime = (content) => {
    if (!content) return 1
    
    // 移除 Markdown 语法，提取纯文本
    const text = content
      .replace(/```[\s\S]*?```/g, '') // 移除代码块
      .replace(/`[^`]+`/g, '') // 移除行内代码
      .replace(/!\[.*?\]\(.*?\)/g, '') // 移除图片
      .replace(/\[([^\]]+)\]\(.*?\)/g, '$1') // 保留链接文字
      .replace(/#{1,6}\s+/g, '') // 移除标题标记
      .replace(/[*_~]+/g, '') // 移除强调标记
      .replace(/>\s+/g, '') // 移除引用标记
      .replace(/\n+/g, ' ') // 换行转空格
      .trim()
    
    // 计算中文字符和英文字符
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length
    const numbers = (text.match(/[0-9]+/g) || []).join('').length
    
    // 中文按字计，英文按词计，数字按字符计
    const totalChars = chineseChars + englishWords + numbers
    
    // 按 200 字/分钟计算
    const minutes = Math.ceil(totalChars / 200)
    
    return Math.max(1, minutes)
  }
  
  /**
   * 格式化阅读时间显示
   * @param {number} minutes - 阅读分钟数
   * @returns {string} 格式化后的阅读时间字符串
   */
  const formatReadingTime = (minutes) => {
    if (minutes < 1) return '1 分钟阅读'
    return `${minutes} 分钟阅读`
  }
  
  return {
    calculateReadingTime,
    formatReadingTime
  }
}
