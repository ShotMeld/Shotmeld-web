/* global localStorage, document, window */
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 从 localStorage 获取保存的主题设置，默认为 'light'
  const theme = ref(localStorage.getItem('theme') || 'light')

  // 监听主题变化并保存到 localStorage
  watch(theme, newTheme => {
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  })

  // 应用主题
  const applyTheme = themeValue => {
    const root = document.documentElement
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    // 移除所有主题类
    root.classList.remove('theme-light', 'theme-dark')

    // 根据主题设置应用相应的类
    if (themeValue === 'system') {
      if (prefersDark) {
        root.classList.add('theme-dark')
      } else {
        root.classList.add('theme-light')
      }
    } else {
      root.classList.add(`theme-${themeValue}`)
    }
  }

  // 初始化主题
  const initTheme = () => {
    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (theme.value === 'system') {
        applyTheme('system')
      }
    })

    // 应用初始主题
    applyTheme(theme.value)
  }

  // 切换主题
  const setTheme = newTheme => {
    theme.value = newTheme
  }

  return {
    theme,
    setTheme,
    initTheme,
  }
})
