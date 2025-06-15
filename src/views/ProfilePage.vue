<!--
  ProfilePage.vue - 个人页
-->

<template>
  <div class="page-container">
    <div v-if="loading" class="loading-container">
      <div class="loading-content">
        <div class="spinner"></div>
        <p class="loading-text">{{ $t('profile.loading') }}</p>
      </div>
    </div>

    <div v-else class="profile-container">
      <!-- Header Section -->
      <div class="profile-header">
        <div class="avatar-container">
          <div class="avatar">
            {{ user.username?.[0]?.toUpperCase() || '?' }}
          </div>
          <div class="avatar-ring"></div>
        </div>
        <h1 class="username">{{ user.username }}</h1>
        <p class="user-subtitle">{{ $t('profile.welcome') }}</p>
      </div>

      <!-- Info Section -->
      <div class="info-section">
        <div class="section-header">
          <h2>{{ $t('profile.accountInfo') }}</h2>
        </div>

        <div class="info-list">
          <div class="info-item">
            <div class="info-icon">
              <i class="fas fa-envelope"></i>
            </div>
            <div class="info-content">
              <div class="info-label">{{ $t('profile.email') }}</div>
              <div class="info-value">{{ user.email }}</div>
            </div>
          </div>

          <div class="info-item">
            <div class="info-icon">
              <i class="fas fa-calendar"></i>
            </div>
            <div class="info-content">
              <div class="info-label">{{ $t('profile.registerDate') }}</div>
              <div class="info-value">{{ formatDate(user.createdAt) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-images"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">
              {{ user.photoCount || 0 }}
            </div>
            <div class="stat-label">{{ $t('profile.photos') }}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-folder"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">
              {{ user.albumCount || 0 }}
            </div>
            <div class="stat-label">{{ $t('profile.albums') }}</div>
          </div>
        </div>
      </div>

      <!-- Actions Section -->
      <div class="actions-section">
        <button @click="handleLogout" class="logout-button">
          <i class="fas fa-sign-out-alt"></i>
          <span>{{ $t('profile.logout') }}</span>
        </button>
      </div>
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
  min-height: 100vh;
  padding: var(--spacing-xl) var(--spacing-md);
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* Loading State */
.loading-container {
  width: 100%;
  max-width: 480px;
  padding: var(--spacing-4xl) var(--spacing-xl);
}

.loading-content {
  background: var(--blur-bg-strong);
  backdrop-filter: var(--blur-strong);
  -webkit-backdrop-filter: var(--blur-strong);
  border-radius: var(--radius-extra-large);
  padding: var(--spacing-4xl) var(--spacing-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid var(--blur-border);
  box-shadow: var(--blur-shadow-strong);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: var(--spacing-lg);
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
}

/* Main Profile Container */
.profile-container {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
}

/* Header Section */
.profile-header {
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

.avatar-container {
  position: relative;
  display: inline-block;
  margin-bottom: var(--spacing-xl);
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-semibold);
  position: relative;
  z-index: 2;
  box-shadow: 0 8px 32px rgba(var(--color-primary-rgb), 0.3);
  transition: var(--transition-base);
}

.avatar-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  opacity: 0.3;
  z-index: 1;
  animation: pulse 2s ease-in-out infinite;
}

.username {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  letter-spacing: -0.5px;
}

.user-subtitle {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0;
  font-weight: var(--font-weight-medium);
}

/* Stats Section */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.stat-card {
  background: var(--blur-bg-strong);
  backdrop-filter: var(--blur-strong);
  -webkit-backdrop-filter: var(--blur-strong);
  border-radius: var(--radius-large);
  padding: var(--spacing-xl);
  border: 1px solid var(--blur-border);
  box-shadow: var(--blur-shadow);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  transition: var(--transition-base);
  cursor: default;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--blur-shadow-strong);
}

.stat-icon {
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

.stat-content {
  min-width: 0;
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: 1.2;
  margin-bottom: var(--spacing-2xs);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

/* Info Section */
.info-section {
  background: var(--blur-bg-strong);
  backdrop-filter: var(--blur-strong);
  -webkit-backdrop-filter: var(--blur-strong);
  border-radius: var(--radius-extra-large);
  border: 1px solid var(--blur-border);
  box-shadow: var(--blur-shadow-strong);
  overflow: hidden;
}

.section-header {
  padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.section-header h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.3px;
}

.info-list {
  padding: var(--spacing-md) 0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-xl);
  transition: var(--transition-fast);
}

.info-item:hover {
  background: var(--bg-hover);
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-medium);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-base);
  flex-shrink: 0;
}

.info-content {
  flex: 1;
  min-width: 0;
}

.info-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-2xs);
}

.info-value {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
  word-break: break-word;
}

/* Actions Section */
.actions-section {
  display: flex;
  justify-content: center;
}

.logout-button {
  background: transparent;
  border: 2px solid var(--color-danger);
  color: var(--color-danger);
  border-radius: var(--radius-round);
  padding: var(--spacing-md) var(--spacing-2xl);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  transition: var(--transition-base);
  outline: none;
  min-width: 140px;
  justify-content: center;
}

.logout-button:hover {
  background: var(--color-danger-subtle);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--color-danger-rgb), 0.2);
}

.logout-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(var(--color-danger-rgb), 0.15);
}

/* Animations */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.1;
  }
}

/* Responsive Design */
@media (max-width: 640px) {
  .page-container {
    padding: var(--spacing-lg) var(--spacing-sm);
  }

  .profile-header {
    padding: var(--spacing-3xl) var(--spacing-xl);
  }

  .avatar {
    width: 80px;
    height: 80px;
    font-size: var(--font-size-3xl);
  }

  .username {
    font-size: var(--font-size-2xl);
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }

  .stat-card {
    padding: var(--spacing-lg);
  }

  .info-item {
    padding: var(--spacing-sm) var(--spacing-lg);
  }

  .section-header {
    padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-sm);
  }
}

@media (max-width: 480px) {
  .profile-container {
    gap: var(--spacing-xl);
  }

  .logout-button {
    padding: var(--spacing-sm) var(--spacing-xl);
    font-size: var(--font-size-sm);
  }
}
</style>
