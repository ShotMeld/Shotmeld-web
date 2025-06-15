<!--
  SettingsPage.vue - 设置页面
-->

<template>
  <div class="page-container">
    <div class="settings-container">
      <!-- Left Column: Header, Logo, Version -->
      <div class="left-column">
        <!-- Header Section -->
        <div class="settings-header">
          <div class="header-icon">
            <i class="fas fa-cog"></i>
          </div>
          <h1>{{ $t('settings.title') }}</h1>
          <p class="settings-subtitle">{{ $t('settings.subtitle') }}</p>
        </div>

        <!-- Brand/Logo Section -->
        <div class="settings-section brand-section">
          <div class="brand-content">
            <div class="brand-container">
              <img src="@/assets/LOGO/LOGO.svg" alt="ShotMeld Logo" class="brand-logo" />
              <span class="brand-text">ShotMeld</span>
            </div>
          </div>
        </div>

        <!-- Version Info Section -->
        <div
          v-if="versionInfo.version || versionInfo.updateDate"
          class="settings-section version-section"
        >
          <div class="section-header">
            <div class="section-icon">
              <i class="fas fa-info-circle"></i>
            </div>
            <div class="section-title">
              <h2>{{ $t('settings.versionInfo.title') }}</h2>
              <p class="section-description">{{ $t('settings.versionInfo.description') }}</p>
            </div>
          </div>

          <div class="version-list">
            <div v-if="versionInfo.version" class="version-item">
              <div class="version-icon">
                <i class="fas fa-code-branch"></i>
              </div>
              <div class="version-info">
                <span class="version-label">{{ $t('settings.version') }}</span>
                <span class="version-value">{{ versionInfo.version }}</span>
              </div>
            </div>

            <div v-if="versionInfo.updateDate" class="version-item">
              <div class="version-icon">
                <i class="fas fa-clock"></i>
              </div>
              <div class="version-info">
                <span class="version-label">{{ $t('settings.lastUpdate') }}</span>
                <span class="version-value">{{ formatDate(versionInfo.updateDate) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Settings -->
      <div class="right-column">
        <!-- Theme Settings -->
        <div class="settings-section">
          <div class="section-header">
            <div class="section-icon">
              <i class="fas fa-palette"></i>
            </div>
            <div class="section-title">
              <h2>{{ $t('settings.theme.title') }}</h2>
              <p class="section-description">{{ $t('settings.theme.description') }}</p>
            </div>
          </div>

          <div class="options-grid">
            <button
              v-for="theme in themes"
              :key="theme.value"
              class="option-card"
              :class="{ active: selectedTheme === theme.value }"
              @click="selectTheme(theme.value)"
            >
              <div class="option-icon">
                <i :class="theme.icon"></i>
              </div>
              <span class="option-label">{{ $t(theme.label) }}</span>
            </button>
          </div>
        </div>

        <!-- Material Settings -->
        <div class="settings-section">
          <div class="section-header">
            <div class="section-icon">
              <i class="fas fa-magic"></i>
            </div>
            <div class="section-title">
              <h2>{{ $t('settings.material.title') }}</h2>
              <p class="section-description">{{ $t('settings.material.description') }}</p>
            </div>
          </div>

          <div class="options-grid">
            <button
              v-for="material in materials"
              :key="material.value"
              class="option-card"
              :class="{ active: advancedMaterial === material.value }"
              @click="selectMaterial(material.value)"
            >
              <div class="option-icon">
                <i :class="material.value ? 'fas fa-gem' : 'fas fa-cube'"></i>
              </div>
              <span class="option-label">{{ $t(material.label) }}</span>
            </button>
          </div>
        </div>

        <!-- Language Settings -->
        <div class="settings-section">
          <div class="section-header">
            <div class="section-icon">
              <i class="fas fa-language"></i>
            </div>
            <div class="section-title">
              <h2>{{ $t('settings.language.title') }}</h2>
              <p class="section-description">{{ $t('settings.language.description') }}</p>
            </div>
          </div>

          <div class="options-grid">
            <button
              v-for="lang in languages"
              :key="lang.value"
              class="option-card"
              :class="{ active: selectedLanguage === lang.value }"
              @click="selectLanguage(lang.value)"
            >
              <div class="option-icon language-icon">
                <span class="language-text">{{ lang.value === 'zh-CN' ? '中' : 'EN' }}</span>
              </div>
              <span class="option-label">{{ $t(lang.label) }}</span>
            </button>
          </div>
        </div>

        <!-- Experimental Features -->
        <div class="settings-section">
          <div class="section-header">
            <div class="section-icon">
              <i class="fas fa-flask"></i>
            </div>
            <div class="section-title">
              <h2>{{ $t('settings.experimental.title') }}</h2>
              <p class="section-description">{{ $t('settings.experimental.description') }}</p>
            </div>
          </div>

          <div class="feature-list">
            <div class="feature-item">
              <div class="feature-content">
                <div class="feature-icon">
                  <i class="fas fa-edit"></i>
                </div>
                <div class="feature-info">
                  <div class="feature-name">{{ $t('settings.experimental.photoEdit.title') }}</div>
                  <div class="feature-description">
                    {{ $t('settings.experimental.photoEdit.description') }}
                  </div>
                </div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="photoEditEnabled" @change="handlePhotoEditToggle" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Photo Edit Consent Modal -->
    <SfModal
      v-model="showPhotoEditConsent"
      :title="$t('settings.experimental.photoEdit.consent.title')"
      size="default"
      :close-on-click-overlay="false"
      @update:modelValue="handleModalClose"
    >
      <div class="consent-content">
        <div class="consent-icon">
          <i class="fas fa-shield-alt"></i>
        </div>
        <p class="consent-text">
          {{ $t('settings.experimental.photoEdit.consent.message') }}
        </p>
        <ul class="consent-points">
          <li>{{ $t('settings.experimental.photoEdit.consent.point1') }}</li>
          <li>{{ $t('settings.experimental.photoEdit.consent.point2') }}</li>
          <li>{{ $t('settings.experimental.photoEdit.consent.point3') }}</li>
        </ul>
      </div>

      <template #footer>
        <div class="consent-actions">
          <SfButton variant="secondary" @click="cancelPhotoEditToggle">
            {{ $t('settings.experimental.photoEdit.consent.decline') }}
          </SfButton>
          <SfButton variant="primary" @click="confirmPhotoEditToggle">
            {{ $t('settings.experimental.photoEdit.consent.accept') }}
          </SfButton>
        </div>
      </template>
    </SfModal>
  </div>
</template>

<script>
import { useThemeStore } from '../store/theme'
import { SfModal, SfButton } from '../components/ui'

export default {
  name: 'SettingsPage',
  components: {
    SfModal,
    SfButton,
  },
  data() {
    return {
      userName: '',
      selectedTheme: 'system',
      selectedLanguage: '',
      advancedMaterial: true,
      photoEditEnabled: false,
      showPhotoEditConsent: false,
      themes: [
        { value: 'light', label: 'settings.theme.light', icon: 'fas fa-sun' },
        { value: 'dark', label: 'settings.theme.dark', icon: 'fas fa-moon' },
        { value: 'system', label: 'settings.theme.system', icon: 'fas fa-circle-half-stroke' },
      ],
      languages: [
        { value: 'zh-CN', label: 'settings.language.zh' },
        { value: 'en', label: 'settings.language.en' },
      ],
      materials: [
        { value: true, label: 'settings.material.advanced' },
        { value: false, label: 'settings.material.simple' },
      ],
      versionInfo: {
        version: '',
        updateDate: '',
      },
    }
  },
  created() {
    // 获取用户信息
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    this.userName = user.username || '用户'

    // 获取当前主题设置
    const themeStore = useThemeStore()
    this.selectedTheme = themeStore.theme
    this.advancedMaterial = themeStore.advancedMaterial

    // 获取当前语言设置
    const savedLocale = localStorage.getItem('locale')
    if (savedLocale) {
      this.selectedLanguage = savedLocale
      this.$i18n.locale = savedLocale
    } else {
      this.selectedLanguage = this.$i18n.locale
    }

    // 获取图片编辑功能设置
    this.photoEditEnabled = localStorage.getItem('photoEditEnabled') === 'true'

    // 获取版本信息
    this.fetchVersionInfo()
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
    },
    toggleAdvancedMaterial() {
      this.advancedMaterial = !this.advancedMaterial
      const themeStore = useThemeStore()
      themeStore.setAdvancedMaterial(this.advancedMaterial)
    },
    selectMaterial(materialValue) {
      this.advancedMaterial = materialValue
      const themeStore = useThemeStore()
      themeStore.setAdvancedMaterial(materialValue)
    },

    handlePhotoEditToggle() {
      // 如果是从关闭切换到开启，显示隐私同意模态框
      if (this.photoEditEnabled && !localStorage.getItem('photoEditConsentGiven')) {
        this.showPhotoEditConsent = true
      } else {
        // 如果是关闭功能，直接保存设置
        this.savePhotoEditSetting()
      }
    },

    confirmPhotoEditToggle() {
      // 用户同意，保存同意状态和功能开启状态
      localStorage.setItem('photoEditConsentGiven', 'true')
      this.savePhotoEditSetting()
      this.showPhotoEditConsent = false

      this.$notify({
        title: this.$t('settings.experimental.photoEdit.consent.success.title'),
        message: this.$t('settings.experimental.photoEdit.consent.success.message'),
        type: 'success',
      })
    },

    cancelPhotoEditToggle() {
      // 用户拒绝，恢复开关状态
      this.photoEditEnabled = false
      this.showPhotoEditConsent = false
    },

    handleModalClose(isOpen) {
      // 当模态框关闭时（包括点击右上角关闭按钮），如果用户没有同意，恢复开关状态
      if (!isOpen) {
        // 检查是否是通过右上角关闭按钮关闭的（没有通过确认或取消按钮）
        // 如果用户还没有给出同意，就恢复开关状态
        if (!localStorage.getItem('photoEditConsentGiven')) {
          this.photoEditEnabled = false
        }
      }
    },

    savePhotoEditSetting() {
      localStorage.setItem('photoEditEnabled', this.photoEditEnabled.toString())
    },

    async fetchVersionInfo() {
      try {
        const response = await fetch(
          'https://api.github.com/repos/ShotMeld/Shotmeld-web/commits?per_page=1'
        )
        if (response.ok) {
          const commits = await response.json()
          if (commits && commits.length > 0) {
            const latestCommit = commits[0]
            this.versionInfo.version = latestCommit.sha.substring(0, 7) // 取前7位作为版本号
            this.versionInfo.updateDate = latestCommit.commit.author.date
          }
        }
      } catch (error) {
        console.warn('Failed to fetch version info from GitHub:', error)
        // 静默失败，不显示版本信息
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleString(this.$i18n.locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    },
  },
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  padding: var(--spacing-xl) var(--spacing-md);
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* Main Container */
.settings-container {
  width: 100%;
  max-width: 1200px;
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: var(--spacing-2xl);
  align-items: start;
}

/* Left Column */
.left-column {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

/* Right Column */
.right-column {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

/* Header Section */
.settings-header {
  background: var(--blur-bg-strong);
  backdrop-filter: var(--blur-strong);
  -webkit-backdrop-filter: var(--blur-strong);
  border-radius: var(--radius-extra-large);
  padding: var(--spacing-4xl) var(--spacing-2xl);
  text-align: center;
  border: 1px solid var(--blur-border);
  box-shadow: var(--blur-shadow-strong);
  position: relative;
  overflow: hidden;
}

.header-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-3xl);
  margin: 0 auto var(--spacing-xl);
  box-shadow: 0 8px 32px rgba(var(--color-primary-rgb), 0.3);
  animation: rotate 8s linear infinite;
}

h1 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  letter-spacing: -0.5px;
}

.settings-subtitle {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0;
  font-weight: var(--font-weight-medium);
}

/* Content Container */
.settings-content {
  display: contents;
}

/* Brand Section */
.brand-section {
  padding: var(--spacing-2xl);
  text-align: center;
}

.brand-content {
  display: flex;
  justify-content: center;
  align-items: center;
}

.brand-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  opacity: 0.9;
  transition: var(--transition-base);
}

.brand-container:hover {
  opacity: 1;
}

.brand-logo {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.brand-text {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  font-family: 'Dancing Script', cursive;
}

/* Version Section */
.version-section .section-header {
  padding-bottom: var(--spacing-md);
}

.version-list {
  padding: var(--spacing-lg) var(--spacing-xl) var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.version-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--blur-bg-medium);
  backdrop-filter: var(--blur-medium);
  -webkit-backdrop-filter: var(--blur-medium);
  border-radius: var(--radius-large);
  box-shadow: var(--shadow-small);
  border: var(--border-width) solid var(--blur-border);
  transition: var(--transition-base);
}

.version-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-medium);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  color: var(--color-white);
  flex-shrink: 0;
}

.version-item:first-child .version-icon {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
}

.version-item:last-child .version-icon {
  background: linear-gradient(135deg, var(--color-success) 0%, #10b981 100%);
}

.version-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xs);
  flex: 1;
  min-width: 0;
}

.version-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.version-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  letter-spacing: 0.2px;
}

/* Settings Section */
.settings-section {
  background: var(--blur-bg-strong);
  backdrop-filter: var(--blur-strong);
  -webkit-backdrop-filter: var(--blur-strong);
  border-radius: var(--radius-extra-large);
  border: 1px solid var(--blur-border);
  box-shadow: var(--blur-shadow-strong);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.section-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-medium);
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.section-title {
  flex: 1;
  min-width: 0;
  height: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-2xs) 0;
  letter-spacing: -0.3px;
  line-height: 1.2;
}

.section-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.3;
}

/* Options Grid */
.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--spacing-md);
  padding: var(--spacing-lg) var(--spacing-xl) var(--spacing-xl);
}

.option-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: var(--blur-bg-medium);
  backdrop-filter: var(--blur-medium);
  -webkit-backdrop-filter: var(--blur-medium);
  border-radius: var(--radius-large);
  box-shadow: var(--shadow-small);
  border: var(--border-width) solid var(--blur-border);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-base);
  outline: none;
  position: relative;
  overflow: hidden;
}

.option-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  opacity: 0;
  transition: var(--transition-base);
}

.option-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
  border-color: var(--border-color-hover);
}

.option-card:active {
  transform: translateY(0);
}

.option-card.active {
  color: var(--color-white);
  border-color: var(--color-primary);
  background: var(--color-primary);
  box-shadow: 0 4px 16px rgba(var(--color-primary-rgb), 0.3);
}

.option-card.active::before {
  opacity: 1;
}

.option-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-medium);
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  position: relative;
  z-index: 1;
}

.option-card:not(.active) .option-icon {
  background: var(--bg-primary);
  color: var(--text-secondary);
}

.option-label {
  position: relative;
  z-index: 1;
  text-align: center;
  line-height: 1.3;
}

/* Feature List */
.feature-list {
  padding: var(--spacing-lg) var(--spacing-xl) var(--spacing-xl);
}

.feature-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg) 0;
}

.feature-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
  min-width: 0;
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-medium);
  background: var(--color-warning);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(255, 164, 116, 0.3);
}

.feature-info {
  flex: 1;
  min-width: 0;
}

.feature-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-2xs);
}

.feature-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.4;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 56px;
  height: 32px;
  cursor: pointer;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: 16px;
  transition: var(--transition-base);
}

.toggle-slider:before {
  position: absolute;
  content: '';
  height: 24px;
  width: 24px;
  left: 2px;
  bottom: 2px;
  background-color: var(--text-primary);
  border-radius: 50%;
  transition: var(--transition-base);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input:checked + .toggle-slider {
  background-color: var(--color-success);
  border-color: var(--color-success);
}

input:checked + .toggle-slider:before {
  transform: translateX(24px);
  background-color: var(--color-white);
}

input:focus + .toggle-slider {
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.version-card {
  cursor: default;
  pointer-events: none;
}

.version-card .version-card .version-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xs);
  flex: 1;
  min-width: 0;
}

.version-card .version-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  letter-spacing: 0.2px;
}

/* Special version icon styles */
.version-card:first-child .option-icon {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  color: white;
}

.version-card:last-child .option-icon {
  background: linear-gradient(135deg, var(--color-success) 0%, #10b981 100%);
  color: white;
}

/* Modal Styles */
.consent-content {
  text-align: center;
  padding: var(--spacing-xl) 0;
}

.consent-icon {
  font-size: 64px;
  color: var(--color-primary);
  margin-bottom: var(--spacing-xl);
  animation: pulse-scale 2s ease-in-out infinite;
}

.consent-text {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xl);
  line-height: 1.6;
}

.consent-points {
  text-align: left;
  list-style: none;
  padding: 0;
  margin: 0 0 var(--spacing-xl) 0;
}

.consent-points li {
  position: relative;
  padding: var(--spacing-xs) 0 var(--spacing-xs) var(--spacing-xl);
  color: var(--text-secondary);
  line-height: 1.5;
}

.consent-points li:before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--color-primary);
  font-weight: bold;
  font-size: var(--font-size-lg);
}

.consent-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
}

/* Special icon effects */
.language-icon {
  background: var(--color-primary-subtle) !important;
}

.language-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  user-select: none;
}

.option-card.active .language-icon {
  background: rgba(255, 255, 255, 0.2) !important;
  border-color: rgba(255, 255, 255, 0.3);
}

.option-card.active .language-text {
  color: white;
}

.option-icon .fa-gem {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gem-shine 3s ease-in-out infinite;
}

.option-card.active .option-icon .fa-gem {
  -webkit-text-fill-color: white;
  background: none;
}

.option-icon .fa-cube {
  color: var(--text-secondary);
}

.option-card.active .option-icon .fa-cube {
  color: white;
}

@keyframes gem-shine {
  0%,
  100% {
    filter: brightness(1) saturate(1);
  }
  50% {
    filter: brightness(1.2) saturate(1.3);
  }
}

/* Animations */
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse-scale {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .settings-container {
    grid-template-columns: 1fr;
    max-width: 600px;
  }

  .left-column,
  .right-column {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .page-container {
    padding: var(--spacing-lg) var(--spacing-sm);
  }

  .settings-header {
    padding: var(--spacing-3xl) var(--spacing-xl);
  }

  .header-icon {
    width: 64px;
    height: 64px;
    font-size: var(--font-size-2xl);
  }

  h1 {
    font-size: var(--font-size-2xl);
  }

  .section-header {
    padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-md);
  }

  .options-grid {
    grid-template-columns: 1fr;
    padding: var(--spacing-md) var(--spacing-lg) var(--spacing-lg);
  }

  .option-card {
    flex-direction: row;
    justify-content: flex-start;
    text-align: left;
  }

  .feature-list {
    padding: var(--spacing-md) var(--spacing-lg) var(--spacing-lg);
  }

  .feature-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .feature-content {
    width: 100%;
  }

  .toggle-switch {
    align-self: flex-end;
  }

  .version-card .version-value {
    font-size: var(--font-size-xs);
  }
}

@media (max-width: 480px) {
  .settings-container {
    gap: var(--spacing-xl);
  }

  .left-column,
  .right-column {
    gap: var(--spacing-md);
  }

  .brand-logo {
    width: 48px;
    height: 48px;
  }

  .brand-text {
    font-size: var(--font-size-2xl);
  }
}
</style>
