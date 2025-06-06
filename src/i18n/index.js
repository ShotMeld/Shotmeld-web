import { createI18n } from 'vue-i18n'

// 直接导入并内联翻译文件，避免生产环境路径问题
import zhCNData from './locales/zh-CN.json'
import enData from './locales/en.json'

const messages = {
  'zh-CN': zhCNData,
  'en': enData
}

// 从本地存储中获取用户设置的语言，如果没有则默认使用中文
const savedLocale = localStorage.getItem('locale') || 'zh-CN'

// 调试信息（仅在开发环境）
if (process.env.NODE_ENV === 'development') {
  console.log('i18n messages loaded:', Object.keys(messages))
  console.log('Current locale:', savedLocale)
}

const i18n = createI18n({
  locale: savedLocale,
  fallbackLocale: 'en',
  messages,
  // 在生产环境中禁用警告
  silentTranslationWarn: process.env.NODE_ENV === 'production',
  // 确保翻译缺失时显示键名而不是空字符串
  missingWarn: process.env.NODE_ENV === 'development',
  // Legacy 模式设置为 false，使用 Composition API
  legacy: false,
  // 全局注入
  globalInjection: true
})

export default i18n
