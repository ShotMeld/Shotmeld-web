<!--
  AuthPage.vue - 统一的认证页面
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

    <!-- 认证表单容器 - 过渡动画显示时隐藏 -->
    <div class="auth-form-container" :class="{ 'fade-out': showTransition }">
      <div class="auth-content">
        <!-- Logo 和品牌 -->
        <div class="brand-section">
          <img src="@/assets/LOGO/LOGO.svg" alt="ShotMeld Logo" class="brand-logo" />
          <h1 class="brand-title">ShotMeld</h1>
          <p class="brand-subtitle">
            {{ mode === 'login' ? $t('auth.brand.subtitle') : $t('auth.brand.startYourMemory') }}
          </p>
        </div>

        <!-- 表单区域 -->
        <transition name="form-switch" mode="out-in">
          <LoginForm
            v-if="mode === 'login'"
            key="login"
            @login-success="handleLoginSuccess"
            @switch-mode="handleSwitchMode"
          />
          <RegisterForm
            v-else
            key="register"
            @register-success="handleRegisterSuccess"
            @switch-mode="handleSwitchMode"
          />
        </transition>

        <!-- ICP备案信息 -->
        <IcpFooter class="icp-footer" />
      </div>
    </div>
  </div>
</template>

<script>
import { LoginTransition } from '../../components/ui'
import LoginForm from '../../components/auth/LoginForm.vue'
import RegisterForm from '../../components/auth/RegisterForm.vue'
import IcpFooter from '../../layout/IcpFooter.vue'

export default {
  name: 'AuthPage',
  components: {
    LoginTransition,
    LoginForm,
    RegisterForm,
    IcpFooter,
  },
  data() {
    return {
      mode: 'login', // 'login' 或 'register'
      showTransition: false,
      currentUser: null,
    }
  },
  created() {
    // 根据路由确定初始模式
    this.mode = this.$route.path === '/register' ? 'register' : 'login'
  },
  watch: {
    '$route.path'(newPath) {
      this.mode = newPath === '/register' ? 'register' : 'login'
    },
  },
  methods: {
    handleSwitchMode(newMode) {
      this.mode = newMode
      // 更新路由但不触发导航
      const path = newMode === 'register' ? '/register' : '/login'
      if (this.$route.path !== path) {
        this.$router.replace(path)
      }
    },

    handleLoginSuccess(user) {
      this.currentUser = user
      this.showTransition = true
    },

    handleRegisterSuccess() {
      // 注册成功后切换到登录模式
      this.mode = 'login'
      this.$router.replace('/login')

      // 可以显示成功提示
      this.$nextTick(() => {
        // 这里可以添加成功提示逻辑
        console.log('注册成功，请登录')
      })
    },

    startFadeToMain() {
      setTimeout(() => {
        this.navigateToPhotoWall()
      }, 100)
    },

    navigateToPhotoWall() {
      this.$router.push({ path: '/photowall', replace: true })
    },

    onTransitionComplete() {
      // 过渡动画完成后的处理
      this.showTransition = false
    },
  },
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  background: var(--bg-gradient);
  position: relative;
  overflow: hidden;
}

.auth-form-container {
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 10;
  transition: opacity 0.4s ease-out;
}

.auth-form-container.fade-out {
  opacity: 0;
  pointer-events: none;
}

.auth-content {
  position: relative;
  z-index: 20;
}

.brand-section {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
  animation: slideUp 0.8s ease-out;
}

.brand-logo {
  width: 64px;
  height: 64px;
  object-fit: contain;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.brand-title {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  letter-spacing: -0.02em;
}

.brand-subtitle {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  font-weight: var(--font-weight-regular);
  transition: all var(--transition-base);
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

.icp-footer {
  margin-top: var(--spacing-xl);
  opacity: 0.6;
}

/* 表单切换动画 */
.form-switch-enter-active,
.form-switch-leave-active {
  transition: all 0.3s ease-in-out;
}

.form-switch-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.form-switch-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .auth-container {
    padding: var(--spacing-md);
  }

  .brand-logo {
    width: 56px;
    height: 56px;
    margin-bottom: var(--spacing-sm);
  }

  .brand-title {
    font-size: var(--font-size-3xl);
  }
}

@media (max-width: 320px) {
  .auth-form-container {
    max-width: 100%;
  }
}
</style>
