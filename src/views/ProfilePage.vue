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
          <span class="value">{{ user.photoCount != 0 ? user.photoCount : $t('profile.noPhotos') }}</span>
        </div>
        <div class="info-item">
          <span class="label">{{ $t('profile.albums') }}</span>
          <span class="value">{{ user.albumCount != 0 ? user.albumCount : $t('profile.noAlbums') }}</span>
        </div>
      </div>
      <button @click="handleLogout" class="md-button outlined">{{ $t('profile.logout') }}</button>
    </div>
  </div>
</template>

<script>
import { authService } from '@/api';

export default {
  name: 'ProfilePage',
  data() {
    return {
      user: {},
      loading: true
    }
  },
  created() {
    this.fetchUserData();
  },
  methods: {
    async fetchUserData() {
      try {
        const response = await authService.getCurrentUser();
        this.user = response.data;
        this.loading = false;
      } catch (error) {
        console.error(this.$t('profile.fetchError'), error);
        this.$router.push('/login');
      }
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleString(this.$i18n.locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },
    handleLogout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.$router.push('/login');
    }
  }
}
</script>

<style scoped>
.page-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 32px;
}

.profile-card {
  background: #ffffff;
  border-radius: 28px;
  padding: 32px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #8ebef1;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 500;
  margin-bottom: 16px;
}

h1 {
  color: #1f1f1f;
  font-size: 1.5rem;
  margin-bottom: 32px;
  font-weight: 500;
}

.info-container {
  width: 100%;
  background: #f8f9fa;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  color: #666;
  font-size: 0.9rem;
}

.value {
  color: #1f1f1f;
  font-weight: 500;
}

.md-button {
  padding: 14px 24px;
  border: none;
  border-radius: 100px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
}

.md-button.outlined {
  background: transparent;
  border: 2px solid #8ebef1;
  color: #8ebef1;
}

.md-button.outlined:hover {
  background: rgba(103, 80, 164, 0.05);
}

.md-button.outlined:active {
  transform: scale(0.98);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-radius: 28px;
  padding: 32px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading p {
  margin-top: 16px;
  color: #666;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #8ebef1;
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