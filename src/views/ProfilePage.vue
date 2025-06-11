<!--
  ProfilePage.vue - 个人页
-->

<template>
  <div class="page-container">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>{{ $t('profile.loading') }}</p>
    </div>
    <div v-else class="profile-card">
      <div class="avatar">{{ user.username?.[0]?.toUpperCase() || '?' }}</div>
      <h1>{{ user.username }}</h1>
      <div class="info-container">
        <div class="info-item">
          <span class="label">{{ $t('profile.email') }}</span>
          <span class="value">{{ user.email }}</span>
        </div>
        <div class="info-item">
          <span class="label">{{ $t('profile.registerDate') }}</span>
          <span class="value">{{ formatDate(user.createdAt) }}</span>
        </div>
        <div class="info-item">
          <span class="label">{{ $t('profile.photos') }}</span>
          <span class="value">
            {{ user.photoCount != 0 ? user.photoCount : $t('profile.noPhotos') }}
          </span>
        </div>
        <div class="info-item">
          <span class="label">{{ $t('profile.albums') }}</span>
          <span class="value">
            {{ user.albumCount != 0 ? user.albumCount : $t('profile.noAlbums') }}
          </span>
        </div>
      </div>
      <button @click="handleLogout" class="md-button outlined">{{ $t('profile.logout') }}</button>
    </div>
  </div>
</template>

<script>
import { authService } from '@/api'

export default {
  name: 'ProfilePage',
  data() {
    return {
      user: {},
      loading: true,
    }
  },
  created() {
    this.fetchUserData()
  },
  methods: {
    async fetchUserData() {
      try {
        const response = await authService.getCurrentUser()
        this.user = response.data
        this.loading = false
      } catch (error) {
        console.error(this.$t('profile.fetchError'), error)
        this.$router.push('/login')
      }
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleString(this.$i18n.locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    },
    handleLogout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$router.push('/login')
    },
  },
}
</script>

<style scoped>
.page-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  /* 移除背景颜色，让全局背景显示 */
  padding: var(--spacing-2xl);
}

.profile-card {
  background: var(--blur-bg-strong);
  backdrop-filter: var(--blur-strong);
  -webkit-backdrop-filter: var(--blur-strong);
  border-radius: var(--radius-extra-large);
  padding: var(--spacing-2xl);
  width: 100%;
  max-width: 500px;
  box-shadow: var(--shadow-medium);
  border: 1px solid var(--blur-border);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-md);
}

h1 {
  color: var(--text-primary);
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-2xl);
  font-weight: var(--font-weight-medium);
}

.info-container {
  width: 100%;
  background: var(--bg-secondary);
  border-radius: var(--radius-medium);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: var(--border-width) solid var(--border-color);
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.value {
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

.md-button {
  padding: 14px var(--spacing-xl);
  border: none;
  border-radius: var(--radius-round);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-fast);
  min-width: 120px;
}

.md-button.outlined {
  background: transparent;
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
}

.md-button.outlined:hover {
  background: var(--color-primary-hover);
}

.md-button.outlined:active {
  transform: scale(0.98);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  border-radius: var(--radius-extra-large);
  padding: var(--spacing-2xl);
  width: 100%;
  max-width: 500px;
  box-shadow: var(--shadow-medium);
}

.loading p {
  margin-top: var(--spacing-md);
  color: var(--text-secondary);
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: var(--color-primary);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
