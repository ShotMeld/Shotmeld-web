<!--
  ProfilePage.vue - 个人页
-->

<template>
  <div class="page-container">
    <div class="profile-card">
      <div class="avatar">{{ user.username?.[0]?.toUpperCase() || '?' }}</div>
      <h1>{{ user.username }}</h1>
      <div class="info-container">
        <div class="info-item">
          <span class="label">邮箱</span>
          <span class="value">{{ user.email }}</span>
        </div>
        <div class="info-item">
          <span class="label">注册时间</span>
          <span class="value">{{ formatDate(user.createdAt) }}</span>
        </div>
        <div class="info-item">
          <span class="label">用户ID</span>
          <span class="value id-text">{{ user.id }}</span>
        </div>
      </div>
      <button @click="handleLogout" class="md-button outlined">退出登录</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfilePage',
  data() {
    return {
      user: {}
    }
  },
  created() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
    } else {
      this.$router.push('/login');
    }
  },
  methods: {
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 16px;
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
  background: #6750a4;
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

.id-text {
  font-family: monospace;
  font-size: 0.9rem;
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
  border: 2px solid #6750a4;
  color: #6750a4;
}

.md-button.outlined:hover {
  background: rgba(103, 80, 164, 0.05);
}

.md-button.outlined:active {
  transform: scale(0.98);
}
</style>