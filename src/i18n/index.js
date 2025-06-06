import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN.json'
import en from './locales/en.json'

const messages = {
  'zh-CN': zhCN,
  'en': en
}

// 从本地存储中获取用户设置的语言，如果没有则默认使用中文
const savedLocale = localStorage.getItem('locale') || 'zh-CN'

const i18n = createI18n({
  locale: savedLocale,
  fallbackLocale: 'en',
  messages
})

export default i18n
