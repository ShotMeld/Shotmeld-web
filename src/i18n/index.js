import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'
import en from './locales/en'

const messages = {
  'zh-CN': zhCN,
  'en': en
}

const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages
})

export default i18n
