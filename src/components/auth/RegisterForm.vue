<!--
  RegisterForm.vue - 注册表单组件
-->

<template>
  <div class="auth-card">
    <div class="card-header">
      <h2 class="auth-title">{{ $t('auth.register.title') }}</h2>
      <p class="auth-description">{{ $t('auth.register.description') }}</p>
    </div>
    
    <form @submit.prevent="handleRegister" class="auth-form">
      <div class="form-group">
        <SfInput 
          v-model="formData.username" 
          :placeholder="$t('auth.register.username')"
          required 
          :error="errors.username"
          class="auth-input"
        />
      </div>

      <div class="form-group">
        <SfInput 
          v-model="formData.email" 
          type="email" 
          :placeholder="$t('auth.register.email')"
          required 
          :error="errors.email"
          class="auth-input"
        />
      </div>

      <div class="form-group">
        <SfInput 
          v-model="formData.password" 
          type="password" 
          :placeholder="$t('auth.register.password')"
          required 
          :error="errors.password"
          @keyup.enter="handleRegister"
          class="auth-input"
        />
      </div>

      <SfButton 
        type="primary" 
        full-width 
        :loading="loading" 
        class="auth-button"
        @click="handleRegister"
      >
        {{ loading ? $t('auth.register.button.loading') : $t('auth.register.button.register') }}
      </SfButton>
    </form>

    <div class="auth-footer">
      <span class="footer-text">{{ $t('auth.register.hasAccount') }}</span>
      <button type="button" @click="$emit('switch-mode', 'login')" class="footer-link">
        {{ $t('auth.register.loginNow') }}
      </button>
    </div>
  </div>
</template>

<script>
import { authService } from '../../api';

export default {
  name: 'RegisterForm',
  emits: ['register-success', 'switch-mode'],
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
        this.errors.username = this.$t('auth.register.errors.usernameRequired');
        return false;
      }

      if (this.formData.username.includes('@')) {
        this.errors.username = this.$t('auth.register.errors.usernameNoAt');
        return false;
      }

      if (this.formData.username.length < 3) {
        this.errors.username = this.$t('auth.register.errors.usernameLength');
        return false;
      }

      return true;
    },

    validateEmail() {
      this.errors.email = '';

      if (!this.formData.email) {
        this.errors.email = this.$t('auth.register.errors.emailRequired');
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.formData.email)) {
        this.errors.email = this.$t('auth.register.errors.emailInvalid');
        return false;
      }

      return true;
    },

    validatePassword() {
      this.errors.password = '';

      if (!this.formData.password) {
        this.errors.password = this.$t('auth.register.errors.passwordRequired');
        return false;
      }

      if (this.formData.password.length < 8) {
        this.errors.password = this.$t('auth.register.errors.passwordLength');
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

        this.$emit('register-success');
      } catch (error) {
        let errorMessage = this.$t('auth.register.errors.registerFailed');
        if (error.response) {
          errorMessage = error.response.data.message || errorMessage;

          const matchesErrorType = (message, keywords) => {
            return keywords.some(keyword => 
              message.toLowerCase().includes(keyword.toLowerCase())
            );
          };

          // 根据错误类型显示不同的错误提示
          if (matchesErrorType(errorMessage, ['email', '邮箱', '该邮箱已被注册'])) {
            this.errors.email = errorMessage;
          } else if (matchesErrorType(errorMessage, ['username', '用户名']) &&
                   matchesErrorType(errorMessage, ['已存在', '已被占用', '重复'])) {
            this.errors.username = errorMessage;
          } else if (matchesErrorType(errorMessage, ['password', '密码'])) {
            this.errors.password = errorMessage;
          } else {
            this.errors.username = errorMessage;
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
.auth-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-large);
  padding: var(--spacing-3xl);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: cardSlideUp 0.8s ease-out 0.2s both;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.auth-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 16px 40px rgba(0, 0, 0, 0.12),
    0 2px 4px rgba(0, 0, 0, 0.08);
}

@keyframes cardSlideUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.card-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.auth-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  letter-spacing: -0.01em;
}

.auth-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-regular);
}

.auth-form {
  margin-bottom: var(--spacing-xl);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.auth-input {
  transition: all var(--transition-base);
}

.auth-input:focus-within {
  transform: translateY(-2px);
}

.auth-button {
  margin-top: var(--spacing-lg);
  height: 48px;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-large);
  transition: all var(--transition-base);
}

.auth-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-large);
}

.auth-footer {
  text-align: center;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

.footer-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-right: var(--spacing-xs);
}

.footer-link {
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  background: none;
  border: none;
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.footer-link:hover {
  color: var(--color-primary-dark);
}
</style>
