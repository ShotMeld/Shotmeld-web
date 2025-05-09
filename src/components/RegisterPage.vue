<template>
  <div class="page-container">
    <div class="register-card">
      <h1 class="register-title">注册账号</h1>
      <form @submit.prevent="handleRegister">
        <SfInput
          v-model="formData.email"
          type="email"
          label="邮箱地址"
          required
          :error="errors.email"
        >
          <template #prefix>
            <i class="sf-icon">✉️</i>
          </template>
        </SfInput>
        
        <SfInput
          v-model="formData.username"
          label="用户名"
          required
          :error="errors.username"
        >
          <template #prefix>
            <i class="sf-icon">👤</i>
          </template>
        </SfInput>
        
        <SfInput
          v-model="formData.password"
          type="password"
          label="密码"
          required
          :error="errors.password"
          hint="密码至少包含6个字符"
        >
          <template #prefix>
            <i class="sf-icon">🔒</i>
          </template>
        </SfInput>
        
        <SfButton 
          type="primary"
          htmlType="submit"
          rounded 
          full-width
          :loading="loading"
          class="register-button"
        >
          {{ loading ? '注册中...' : '注册' }}
        </SfButton>
        
        <div class="additional-links">
          <router-link to="/login" class="text-link">已有账号？立即登录</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { authService } from '../api';

export default {
  name: 'RegisterPage',
  data() {
    return {
      formData: {
        email: '',
        username: '',
        password: ''
      },
      errors: {
        email: '',
        username: '',
        password: ''
      },
      loading: false
    }
  },
  watch: {
    'formData.username'() {
      if (this.errors.username) {
        this.validateUsername();
      }
    },
    'formData.email'() {
      if (this.errors.email) {
        this.validateEmail();
      }
    },
    'formData.password'() {
      if (this.errors.password) {
        this.validatePassword();
      }
    }
  },
  methods: {
    validateUsername() {
      this.errors.username = '';
      
      if (!this.formData.username) {
        this.errors.username = '请输入用户名';
        return false;
      }
      
      if (this.formData.username.includes('@')) {
        this.errors.username = '用户名不能包含@符号';
        return false;
      }
      
      if (this.formData.username.length < 3) {
        this.errors.username = '用户名至少需要3个字符';
        return false;
      }
      
      return true;
    },
    
    validateEmail() {
      this.errors.email = '';
      
      if (!this.formData.email) {
        this.errors.email = '请输入邮箱地址';
        return false;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.formData.email)) {
        this.errors.email = '请输入有效的邮箱地址';
        return false;
      }
      
      return true;
    },
    
    validatePassword() {
      this.errors.password = '';
      
      if (!this.formData.password) {
        this.errors.password = '请输入密码';
        return false;
      }
      
      if (this.formData.password.length < 6) {
        this.errors.password = '密码至少需要6个字符';
        return false;
      }
      
      return true;
    },
    
    validateForm() {
      const isUsernameValid = this.validateUsername();
      const isEmailValid = this.validateEmail();
      const isPasswordValid = this.validatePassword();
      
      return isUsernameValid && isEmailValid && isPasswordValid;
    },
    
    async handleRegister() {
      if (!this.validateForm()) {
        return;
      }
      
      try {
        this.loading = true;
        await authService.register(this.formData);
        
        this.$router.push({
          path: '/login',
          query: { registered: 'success' }
        });
      } catch (error) {
        let errorMessage = '注册失败，请重试';
            if (error.response) {
            errorMessage = error.response.data.message || errorMessage;
            
            const matchesErrorType = (message, keywords) => {
              const lowerMessage = message.toLowerCase();
              return keywords.some(keyword => 
              lowerMessage.includes(keyword.toLowerCase())
              );
            };

            // 根据错误类型显示不同的错误提示
            if (matchesErrorType(errorMessage, ['email', '邮箱', '该邮箱已被注册'])) {
              this.errors.email = errorMessage;
            } else if (matchesErrorType(errorMessage, ['username', '用户名']) && 
                  !errorMessage.includes('该邮箱已被注册')) {
              this.errors.username = errorMessage;
            } else if (matchesErrorType(errorMessage, ['password', '密码'])) {
            this.errors.password = errorMessage;
          } else {
            // 如果无法确定错误类型，根据字段名显示在对应位置
            if (error.response.data.field === 'username') {
              this.errors.username = errorMessage;
            } else if (error.response.data.field === 'email') {
              this.errors.email = errorMessage;
            } else if (error.response.data.field === 'password') {
              this.errors.password = errorMessage;
            } else {
              // 默认不再显示在email，而是显示在用户输入有问题的地方
              this.errors = {
                ...this.errors,
                [Object.keys(this.formData).find(key => 
                  errorMessage.toLowerCase().includes(key.toLowerCase())
                ) || 'username']: errorMessage
              };
            }
          }
        }
        
        console.error('注册失败:', error);
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
  padding: var(--spacing-md);
  background-image: url('../assets/photo-bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.page-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  z-index: 0;
}

.register-card {
  position: relative;
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-large);
  padding: var(--spacing-2xl);
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-large);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  animation: card-appear 0.5s var(--transition-bounce);
}

.register-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-extra-large);
}

.register-title {
  color: var(--text-primary);
  font-size: var(--font-size-2xl);
  margin-bottom: var(--spacing-xl);
  font-weight: var(--font-weight-semibold);
  text-align: center;
}

.register-button {
  margin-top: var(--spacing-lg);
}

.sf-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-style: normal;
}

.additional-links {
  margin-top: var(--spacing-xl);
  text-align: center;
}

.text-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-fast);
}

.text-link:hover {
  color: rgba(0, 122, 255, 0.8);
}

@keyframes card-appear {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 480px) {
  .register-card {
    padding: var(--spacing-xl);
    margin: 0 var(--spacing-md);
  }
  
  .register-title {
    font-size: var(--font-size-xl);
  }
}
</style>