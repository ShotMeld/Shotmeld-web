<template>
  <div class="page-container">
    <div class="card">
      <h1>注册账号</h1>
      <form @submit.prevent="handleRegister">
        <div class="input-group">
          <input
            type="email"
            v-model="formData.email"
            required
            class="md-input"
            :class="{ 'error-input': emailError }"
          />
          <label>邮箱地址</label>
          <span v-if="emailError" class="error-message">{{ emailError }}</span>
        </div>
        <div class="input-group">
          <input
            type="text"
            v-model="formData.username"
            required
            class="md-input"
            :class="{ 'error-input': usernameError }"
          />
          <label>用户名</label>
          <span v-if="usernameError" class="error-message">{{ usernameError }}</span>
        </div>
        <div class="input-group">
          <input
            type="password"
            v-model="formData.password"
            required
            class="md-input"
          />
          <label>密码</label>
        </div>
        <button type="submit" :disabled="loading" class="md-button">
          <span class="button-content">{{ loading ? '注册中...' : '注册' }}</span>
        </button>
        <div class="additional-links">
          <router-link to="/login" class="text-link">已有账号？立即登录</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'RegisterPage',
  data() {
    return {
      formData: {
        email: '',
        username: '',
        password: ''
      },
      loading: false,
      usernameError: '',
      emailError: ''
    }
  },
  watch: {
    'formData.username'(newVal) {
      this.usernameError = this.validateUsername(newVal);
    },
    'formData.email'(newVal) {
      this.emailError = this.validateEmail(newVal);
    }
  },
  methods: {
    validateUsername(username) {
      return username.includes('@') ? '用户名不能包含@符号' : '';
    },
    validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return email && !emailRegex.test(email) ? '请输入有效的邮箱地址' : '';
    },
    async handleRegister() {
      if (this.usernameError || this.emailError) {
        return;
      }
      // 验证用户名
      const usernameError = this.validateUsername(this.formData.username);
      if (usernameError) {
        alert(usernameError);
        return;
      }
      
      try {
        this.loading = true;
        const response = await axios.post('http://120.55.78.33:3000/auth/register', this.formData);
        alert('注册成功！');
        this.$router.push('/login');
      } catch (error) {
        alert(error.response?.data?.message || '注册失败，请重试');
      } finally {
        this.loading = false;
      }
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
  padding: 16px;
  background-image: url('../assets/photo-bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 28px;
  padding: 32px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

h1 {
  color: #1f1f1f;
  font-size: 2rem;
  margin-bottom: 32px;
  font-weight: 500;
  text-align: center;
}

.input-group {
  position: relative;
  margin-bottom: 40px;
}

.md-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background: transparent;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}

.md-input:focus {
  border-color: #6750a4;
  box-shadow: 0 0 0 4px rgba(103, 80, 164, 0.1);
}

.md-input + label {
  position: absolute;
  left: 16px;
  top: -20px;
  transform: scale(0.8);
  transform-origin: left;
  pointer-events: none;
}

.md-input:focus + label,
.md-input:not(:placeholder-shown) + label {
  top: -20px;
  transform: scale(0.8);
  transform-origin: left;
}

label {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  transition: all 0.2s;
  pointer-events: none;
  font-size: 1rem;
  background: transparent;
}

.md-input:focus + label,
.md-input:not(:placeholder-shown) + label {
  top: -25px;
  transform: scale(0.8);
  background: transparent;
  color: #6750a4;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.md-button {
  width: 100%;
  padding: 14px 24px;
  background: #6750a4;
  color: white;
  border: none;
  border-radius: 100px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  position: relative;
  overflow: hidden;
}

.md-button:hover {
  background: #7c63b9;
}

.md-button:active {
  transform: scale(0.98);
}

.md-button:disabled {
  background: #e0e0e0;
  cursor: not-allowed;
}

.button-content {
  position: relative;
  z-index: 1;
}

.additional-links {
  margin-top: 24px;
  text-align: center;
}

.text-link {
  color: #6750a4;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.text-link:hover {
  color: #7c63b9;
}

.error-input {
  border-color: #dc3545 !important;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  position: absolute;
  bottom: -22px;
  left: 16px;
}
</style>