<!--
  LoginForm.vue - 登录表单组件
-->

<template>
  <div class="auth-card">
    <div class="card-header">
      <h2 class="auth-title">{{ $t('auth.login.welcome') }}</h2>
      <p class="auth-description">{{ $t('auth.login.description') }}</p>
    </div>

    <form @submit.prevent="handleLogin" class="auth-form">
      <div class="form-group">
        <SfInput
          v-model="formData.emailOrUsername"
          :placeholder="$t('auth.login.emailOrUsername')"
          required
          :error="errors.emailOrUsername"
          class="auth-input"
        />
      </div>

      <div class="form-group">
        <SfInput
          v-model="formData.password"
          :placeholder="$t('auth.login.password')"
          type="password"
          required
          :error="errors.password"
          @keyup.enter="handleLogin"
          class="auth-input"
        />
      </div>

      <SfButton
        type="primary"
        full-width
        :loading="loading"
        class="auth-button"
        @click="handleLogin"
      >
        {{ loading ? $t('auth.login.button.loading') : $t('auth.login.button.login') }}
      </SfButton>
    </form>

    <div class="auth-footer">
      <span class="footer-text">{{ $t('auth.login.noAccount') }}</span>
      <button type="button" @click="$emit('switch-mode', 'register')" class="footer-link">
        {{ $t('auth.login.registerNow') }}
      </button>
    </div>
  </div>
</template>

<script>
import { authService } from '../../api'

export default {
  name: 'LoginForm',
  emits: ['login-success', 'switch-mode'],
  data() {
    return {
      formData: {
        emailOrUsername: '',
        password: '',
      },
      errors: {
        emailOrUsername: '',
        password: '',
      },
      loading: false,
    }
  },
  methods: {
    validateForm() {
      let isValid = true
      this.errors = {
        emailOrUsername: '',
        password: '',
      }

      if (!this.formData.emailOrUsername) {
        this.errors.emailOrUsername = this.$t('auth.login.errors.emailOrUsernameRequired')
        isValid = false
      }

      if (!this.formData.password) {
        this.errors.password = this.$t('auth.login.errors.passwordRequired')
        isValid = false
      }

      return isValid
    },
    async handleLogin() {
      try {
        if (!this.validateForm()) return

        this.loading = true

        const response = await authService.login({
          emailOrUsername: this.formData.emailOrUsername,
          password: this.formData.password,
        })

        const { token, user } = response.data

        // 保存认证信息
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))

        this.loading = false

        // 触发登录成功事件
        this.$emit('login-success', user)
      } catch (error) {
        let errorMessage = this.$t('auth.login.errors.loginFailed')
        if (error.response) {
          errorMessage = error.response.data.message || errorMessage

          // 处理特定错误
          if (error.response.status === 401) {
            this.errors.password = this.$t('auth.login.errors.invalidCredentials')
          } else {
            this.errors.emailOrUsername = errorMessage
          }
        } else {
          this.errors.emailOrUsername = errorMessage
        }
        console.error('登录失败:', error)
      } finally {
        this.loading = false
      }
    },
  },
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
  transition:
    transform var(--transition-base),
    box-shadow var(--transition-base);
}
/* 深色模式适配 */
.theme-dark .auth-card {
  background: rgba(28, 28, 30, 0.95) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 1px 2px rgba(0, 0, 0, 0.2) !important;
}

.theme-dark .auth-card:hover {
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.3) !important;
}

/* 文字颜色适配 */
.theme-dark .auth-title {
  color: rgba(255, 255, 255, 0.9) !important;
}

.theme-dark .auth-description,
.theme-dark .footer-text {
  color: rgba(255, 255, 255, 0.7) !important;
}

/* 输入框适配 */
.theme-dark .auth-input {
  background: rgba(44, 44, 46, 0.8) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

.theme-dark .auth-input::placeholder {
  color: rgba(255, 255, 255, 0.5) !important;
}

/* 按钮适配 */
.theme-dark .auth-button {
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.2) !important;
}

/* 底部链接适配 */
.theme-dark .footer-link {
  color: var(--color-primary-light) !important;
}

.theme-dark .footer-link:hover {
  color: var(--color-primary-lighter) !important;
}

/* 分割线适配 */
.theme-dark .auth-footer {
  border-top-color: rgba(255, 255, 255, 0.1) !important;
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
