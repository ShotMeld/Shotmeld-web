<!--
  RegisterPage.vue - 注册页
-->

<template>
  <div class="auth-container">
    <!-- 背景装饰 -->
    <div class="auth-background">
      <div class="floating-circle circle-1"></div>
      <div class="floating-circle circle-2"></div>
      <div class="floating-circle circle-3"></div>
    </div>
    
    <div class="auth-content">
      <!-- Logo 和品牌 -->
      <div class="brand-section">
        <!-- <div class="brand-logo">
          <div class="logo-icon">📸</div>
        </div> -->
        <h1 class="brand-title">ShotMeld</h1>
        <p class="brand-subtitle">{{ $t('auth.brand.startYourMemory') }}</p>
      </div>
      
      <!-- 注册表单 -->
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
          <router-link to="/login" class="footer-link">{{ $t('auth.register.loginNow') }}</router-link>
        </div>
      </div>
      
      <!-- ICP备案信息 -->
      <IcpFooter class="icp-footer" />
    </div>
  </div>
</template>

<script>
import { authService } from '../../api';
import IcpFooter from '../../layout/IcpFooter.vue';

export default {
  name: 'RegisterPage',
  components: {
    IcpFooter
  },
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

        this.$router.push({
          path: '/login',
          query: { registered: 'success' }
        });
      } catch (error) {
        let errorMessage = this.$t('auth.register.errors.registerFailed');
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
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.auth-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.floating-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 120px;
  height: 120px;
  top: 15%;
  right: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 80px;
  height: 80px;
  top: 70%;
  left: 15%;
  animation-delay: -2s;
}

.circle-3 {
  width: 60px;
  height: 60px;
  bottom: 25%;
  right: 20%;
  animation-delay: -4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) scale(1);
    opacity: 0.4;
  }
  50% {
    transform: translateY(-20px) scale(1.05);
    opacity: 0.7;
  }
}

.auth-content {
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 1;
}

.brand-section {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
  animation: slideUp 0.8s ease-out;
}

.brand-logo {
  margin-bottom: var(--spacing-lg);
}

.logo-icon {
  width: 80px;
  height: 80px;
  font-size: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff6b6b, #ffa500);
  border-radius: var(--radius-large);
  margin: 0 auto;
  box-shadow: var(--shadow-large);
  animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}

.brand-title {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-white);
  margin-bottom: var(--spacing-xs);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
  letter-spacing: -0.02em;
}

.brand-subtitle {
  font-size: var(--font-size-base);
  color: rgba(255, 255, 255, 0.8);
  font-weight: var(--font-weight-regular);
}

.auth-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-large);
  padding: var(--spacing-3xl);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.15),
    0 1px 2px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: cardSlideUp 0.8s ease-out 0.2s both;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.auth-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 16px 40px rgba(0, 0, 0, 0.2),
    0 2px 4px rgba(0, 0, 0, 0.12);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  transition: color var(--transition-fast);
}

.footer-link:hover {
  color: var(--color-primary-dark);
}

.icp-footer {
  margin-top: var(--spacing-xl);
  opacity: 0.6;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .auth-container {
    padding: var(--spacing-md);
  }
  
  .auth-card {
    padding: var(--spacing-xl);
  }
  
  .brand-title {
    font-size: var(--font-size-3xl);
  }
  
  .logo-icon {
    width: 60px;
    height: 60px;
    font-size: 28px;
  }
  
  .circle-1,
  .circle-2,
  .circle-3 {
    display: none;
  }
}

@media (max-width: 320px) {
  .auth-card {
    padding: var(--spacing-lg);
  }
}
</style>