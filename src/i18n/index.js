import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN.json'
import en from './locales/en.json'

const messages = {
  'zh-CN': zhCN,
  en: en,
}

// 从本地存储中获取用户设置的语言，如果没有则默认使用英文
let savedLocale = 'en'
try {
  savedLocale = localStorage.getItem('locale') || 'en'
} catch (e) {
  console.warn('Cannot access localStorage, using default locale zh-CN')
}

const i18n = createI18n({
  legacy: true, // 使用 legacy 模式保证兼容性
  locale: savedLocale,
  fallbackLocale: 'en',
  messages,
  globalInjection: true, // 确保全局注入$t
  silentTranslationWarn: false, // 显示翻译警告来帮助调试
  missingWarn: false,
  silentFallbackWarn: false,
})

export default i18n
