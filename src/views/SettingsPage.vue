<!--
  SettingsPage.vue - 设置页面
-->

<template>
  <div class="page-container">
    <div class="settings-content">
      <div class="settings-card">
        <div class="settings-header">
          <h1>{{ $t('settings.title') }}</h1>
          <p class="settings-subtitle">{{ $t('settings.subtitle') }}</p>
        </div>
        
        <!-- 主题设置 -->
        <div class="settings-section">
          <div class="section-header">
            <i class="fas fa-palette section-icon"></i>
            <h2>{{ $t('settings.theme.title') }}</h2>
          </div>
          <p class="section-description">{{ $t('settings.theme.description') }}</p>
          <div class="settings-options">
            <button 
              v-for="theme in themes" 
              :key="theme.value"
              class="settings-option"
              :class="{ active: selectedTheme === theme.value }"
              @click="selectTheme(theme.value)"
            >
              <i :class="theme.icon"></i>
              <span>{{ $t(theme.label) }}</span>
            </button>
          </div>
        </div>

        <div class="settings-divider"></div>

        <!-- 语言设置 -->
        <div class="settings-section">
          <div class="section-header">
            <i class="fas fa-language section-icon"></i>
            <h2>{{ $t('settings.language.title') }}</h2>
          </div>
          <p class="section-description">{{ $t('settings.language.description') }}</p>
          <div class="settings-options">
            <button 
              v-for="lang in languages" 
              :key="lang.value"
              class="settings-option"
              :class="{ active: selectedLanguage === lang.value }"
              @click="selectLanguage(lang.value)"
            >
              <span>{{ $t(lang.label) }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useThemeStore } from '../store/theme'

export default {
  name: 'SettingsPage',
  components: {
  },
  data() {
    return {
      userName: '',
      selectedTheme: 'system',
      selectedLanguage: 'zh-CN',
      themes: [
        { value: 'light', label: 'settings.theme.light', icon: 'fas fa-sun' },
        { value: 'dark', label: 'settings.theme.dark', icon: 'fas fa-moon' },
        { value: 'system', label: 'settings.theme.system', icon: 'fas fa-circle-half-stroke' }
      ],
      languages: [
        { value: 'zh-CN', label: 'settings.language.zh' },
        { value: 'en', label: 'settings.language.en' }
      ]
    }
  },
  created() {
    // 获取用户信息
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    this.userName = user.username || '用户'

    // 获取当前主题设置
    const themeStore = useThemeStore()
    this.selectedTheme = themeStore.theme

    // 获取当前语言设置
    const savedLocale = localStorage.getItem('locale')
    if (savedLocale) {
      this.selectedLanguage = savedLocale
      this.$i18n.locale = savedLocale
    }
  },
  methods: {
    selectTheme(theme) {
      this.selectedTheme = theme
      const themeStore = useThemeStore()
      themeStore.setTheme(theme)
    },
    selectLanguage(lang) {
      this.selectedLanguage = lang
      this.$i18n.locale = lang
      // 将语言设置保存到本地存储
      localStorage.setItem('locale', lang)
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.settings-content {
  padding: 32px 16px;
  display: flex;
  justify-content: center;
}

.settings-card {
  background: var(--bg-primary);
  border-radius: 28px;
  padding: 40px;
  width: 100%;
  max-width: 680px;
  box-shadow: var(--shadow-medium);
}

.settings-header {
  margin-bottom: 40px;
  text-align: center;
}

h1 {
  color: var(--text-primary);
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.settings-subtitle {
  color: var(--text-secondary);
  font-size: 16px;
  margin: 0;
}

.settings-section {
  margin-bottom: 40px;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.section-icon {
  font-size: 20px;
  color: var(--primary);
}

h2 {
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.3px;
}

.section-description {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0 0 20px 0;
}

.settings-options {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.settings-option {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-radius: 16px;
  border: 2px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 160px;
}

.settings-option:hover {
  background: var(--bg-hover);
  border-color: var(--border-color-hover);
  transform: translateY(-1px);
}

.settings-option:active {
  transform: translateY(0);
}

.settings-option.active {
  color: var(--primary);
  background: rgba(var(--primary-rgb), 0.08);
  border-color: var(--primary);
}

.settings-option.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary);
  border-radius: 1px;
}

.settings-option i {
  font-size: 18px;
}

.settings-divider {
  height: 1px;
  background: var(--border-color);
  margin: 40px 0;
  opacity: 0.5;
}

@media (max-width: 640px) {
  .settings-content {
    padding: 24px 16px;
  }

  .settings-card {
    padding: 24px;
  }

  h1 {
    font-size: 28px;
  }

  .settings-options {
    flex-direction: column;
  }

  .settings-option {
    width: 100%;
    justify-content: center;
  }
}
</style>
