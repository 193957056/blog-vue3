import { ref } from 'vue'

/**
 * 博客全局配置
 */

const config = ref({
  // 站点信息
  site: {
    name: 'Lumina Blog',
    title: '极光博客',
    description: '用文字记录思考，用设计诠释美学。探索技术与设计的交汇点。',
    url: 'https://lumina-blog.example.com',
    author: 'Lumina',
    authorBio: '用文字记录思考，用设计诠释美学'
  },
  
  // 备案信息
  icp: {
    enabled: true,  // 是否显示备案号
    number: '京ICP备2024012345号',  // 备案号
    link: 'https://beian.miit.gov.cn/'  // 备案查询链接
  },
  
  // Open Graph
  og: {
    image: 'https://lumina-blog.example.com/og-image.png',
    locale: 'zh_CN'
  },
  
  // 功能开关
  features: {
    toc: {
      enabled: true,
      minHeadings: 2  // 最少需要多少个标题才显示 TOC
    },
    readingTime: {
      enabled: true,
      wordsPerMinute: 200  // 每分钟阅读字数
    },
    shareImage: {
      enabled: true
    }
  }
})

/**
 * 获取配置
 */
export function useConfig() {
  const getConfig = () => config.value
  
  const getSiteConfig = () => config.value.site
  
  const getIcpConfig = () => config.value.icp
  
  const isIcpEnabled = () => config.value.icp.enabled
  
  const getFeaturesConfig = () => config.value.features
  
  /**
   * 更新配置
   */
  const updateConfig = (newConfig) => {
    config.value = { ...config.value, ...newConfig }
  }
  
  /**
   * 更新站点信息
   */
  const updateSiteConfig = (siteConfig) => {
    config.value.site = { ...config.value.site, ...siteConfig }
  }
  
  /**
   * 更新备案信息
   */
  const updateIcpConfig = (icpConfig) => {
    config.value.icp = { ...config.value.icp, ...icpConfig }
  }
  
  /**
   * 更新功能开关
   */
  const updateFeatures = (features) => {
    config.value.features = { ...config.value.features, ...features }
  }
  
  return {
    config,
    getConfig,
    getSiteConfig,
    getIcpConfig,
    isIcpEnabled,
    getFeaturesConfig,
    updateConfig,
    updateSiteConfig,
    updateIcpConfig,
    updateFeatures
  }
}
