<template>
  <div class="page-container">
    <div class="card">
      <h1>登录</h1>
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <input
            type="text"
            v-model="formData.emailOrUsername"
            required
            class="md-input"
            @focus="handleInputFocus"
            @blur="handleInputBlur"
          />
          <label :class="{ 'active': isEmailFocused || formData.emailOrUsername }">用户名或邮箱地址</label>
        </div>
        <div class="input-group">
          <input
            type="password"
            v-model="formData.password"
            required
            class="md-input"
            @focus="handlePasswordFocus"
            @blur="handlePasswordBlur"
          />
          <label :class="{ 'active': isPasswordFocused || formData.password }">密码</label>
        </div>
        <button type="submit" :disabled="loading" class="md-button">
          <span class="button-content">
            <span v-if="loading" class="button-loader"></span>
            {{ loading ? '登录中...' : '登录' }}
          </span>
        </button>
        <div class="additional-links">
          <router-link to="/register" class="text-link">没有账号？立即注册</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { authService } from '../api';

export default {
  name: 'LoginPage',
  data() {
    return {
      formData: {
        emailOrUsername: '',
        password: ''
      },
      loading: false,
      isEmailFocused: false,
      isPasswordFocused: false
    }
  },
  methods: {
    handleInputFocus() {
      this.isEmailFocused = true;
    },
    handleInputBlur() {
      this.isEmailFocused = false;
    },
    handlePasswordFocus() {
      this.isPasswordFocused = true;
    },
    handlePasswordBlur() {
      this.isPasswordFocused = false;
    },
    async handleLogin() {
      try {
        this.loading = true;
        
        // 基本输入验证
        if (!this.formData.emailOrUsername || !this.formData.password) {
          throw new Error('请输入用户名/邮箱和密码');
        }

        const response = await authService.login({
          emailOrUsername: this.formData.emailOrUsername,
          password: this.formData.password
        });

        const { token, user } = response.data;

        // 保存认证信息
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // 确保路由跳转前完成状态更新
        await this.$nextTick();

        // 跳转到照片墙页面
        this.$router.push({ path: '/photowall', replace: true });
        
      } catch (error) {
        let errorMessage = '登录失败，请重试';
        if (error.response) {
          errorMessage = error.response.data.message || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.$notify.error({
          title: '登录错误',
          message: errorMessage
        });
        
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
  /* TODO: 背景图换成自动API，两边都要改 */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.card {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 28px;
  padding: 32px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  transition: box-shadow 0.2s;
}

.card:hover {
  box-shadow: 0 6px 16px rgba(0,0,0,0.5);
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
  margin-bottom: 24px;
}

.md-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  border: 2px solid #4b4b4b8a;
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
.page-container {
  /* 添加渐变遮罩提升文字可读性 */
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('../assets/photo-bg.jpg');
  background-size: cover;
  background-position: center;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.button-loader {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 480px) {
  .card {
    padding: 24px;
    margin: 0 16px;
  }
  
  h1 {
    font-size: 1.8rem;
  }
}
</style>