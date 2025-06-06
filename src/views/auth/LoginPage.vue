<!--
  LoginPage.vue - 登录页
-->

<template>
  <div class="auth-container">
    <!-- 登录过渡动画 -->
    <LoginTransition 
      :show="showTransition" 
      :user-name="currentUser?.name || currentUser?.username || ''"
      @start-fade-to-main="startFadeToMain"
      @transition-complete="onTransitionComplete"
    />
    
    <!-- 登录表单容器 - 过渡动画显示时隐藏 -->
    <div class="login-form-container" :class="{ 'fade-out': showTransition }">
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
        <p class="brand-subtitle">{{ $t('auth.brand.subtitle') }}</p>
      </div>
      
      <!-- 登录表单 -->
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
          <router-link to="/register" class="footer-link">{{ $t('auth.login.registerNow') }}</router-link>
        </div>
      </div>
      
      <!-- ICP备案信息 -->
      <IcpFooter class="icp-footer" />
    </div>
    </div>
  </div>
</template>
<script>
import { authService } from '../../api';
import IcpFooter from '../../layout/IcpFooter.vue';
import { LoginTransition } from '../../components/ui';

export default {
  name: 'LoginPage',
  components: {
    IcpFooter,
    LoginTransition
  },
  data() {
    return {
      formData: {
        emailOrUsername: '',
        password: ''
      },
      errors: {
        emailOrUsername: '',
        password: ''
      },
      loading: false,
      showTransition: false,
      currentUser: null
    }
  },
  methods: {
    validateForm() {
      let isValid = true;
      this.errors = {
        emailOrUsername: '',
        password: ''
      };

      if (!this.formData.emailOrUsername) {
        this.errors.emailOrUsername = this.$t('auth.login.errors.emailOrUsernameRequired');
        isValid = false;
      }

      if (!this.formData.password) {
        this.errors.password = this.$t('auth.login.errors.passwordRequired');
        isValid = false;
      }

      return isValid;
    },
    async handleLogin() {
      try {
        if (!this.validateForm()) return;

        this.loading = true;

        const response = await authService.login({
          emailOrUsername: this.formData.emailOrUsername,
          password: this.formData.password
        });

        const { token, user } = response.data;

        // 保存认证信息
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // 设置当前用户
        this.currentUser = user;
        this.loading = false;
        
        // 立即显示过渡动画
        this.showTransition = true;

      } catch (error) {
        let errorMessage = this.$t('auth.login.errors.loginFailed');
        if (error.response) {
          errorMessage = error.response.data.message || errorMessage;

          // 处理特定错误
          if (error.response.status === 401) {
            this.errors.password = this.$t('auth.login.errors.invalidCredentials');
          } else {
            this.errors.emailOrUsername = errorMessage;
          }
        } else {
          this.errors.emailOrUsername = errorMessage;
        }
        console.error('登录失败:', error);
      } finally {
        this.loading = false;
      }
    },
    
    startFadeToMain() {
      setTimeout(() => {
        this.navigateToPhotoWall();
      }, 100);
    },
    
    navigateToPhotoWall() {
      // 跳转到照片墙页面（主页）
      this.$router.push({ path: '/photowall', replace: true });
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
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
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
  background: linear-gradient(45deg, rgba(0, 122, 255, 0.1), rgba(0, 122, 255, 0.05));
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 120px;
  height: 120px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 80px;
  height: 80px;
  top: 60%;
  right: 15%;
  animation-delay: -2s;
}

.circle-3 {
  width: 60px;
  height: 60px;
  bottom: 20%;
  left: 20%;
  animation-delay: -4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: translateY(-20px) scale(1.05);
    opacity: 0.8;
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
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
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
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
  letter-spacing: -0.02em;
}

.brand-subtitle {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  font-weight: var(--font-weight-regular);
}

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

/* 登录表单容器 */
.login-form-container {
  transition: opacity 0.4s ease-out;
}

.login-form-container.fade-out {
  opacity: 0;
  pointer-events: none;
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