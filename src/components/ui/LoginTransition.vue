<!--
  LoginTransition.vue - 登录过渡动画
-->

<template>
  <transition name="login-transition" @after-leave="$emit('transition-complete')">
    <div v-if="show" class="login-transition-overlay">
      <!-- 背景动画层使用独立组件 -->
      <AuthBackground />

      <!-- 内容层 -->
      <div class="transition-content">
        <!-- 欢迎文字动画 -->
        <div class="welcome-sequence">
          <div class="welcome-text primary" :class="{ animate: step >= 1 }">
            {{ $t('loginTransition.welcomeBack') }}
          </div>
          <div class="welcome-text secondary" :class="{ animate: step >= 2 }">
            {{ userName || $t('loginTransition.defaultUser') }}
          </div>
        </div>
        
        <!-- 底部品牌标识 -->
        <div class="brand-footer" :class="{ animate: step >= 1 }">
          <img src="@/assets/LOGO/LOGO.svg" alt="ShotMeld Logo" class="brand-logo" />
          <span class="brand-text">ShotMeld</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import AuthBackground from '../auth/AuthBackground.vue'

export default {
  name: 'LoginTransition',
  components: {
    AuthBackground,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    userName: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      step: 0,
      animationTimer: null,
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.startAnimation()
      } else {
        this.resetAnimation()
      }
    },
  },
  methods: {
    startAnimation() {
      this.step = 0
      // 分步执行动画
      const steps = [
        () => {
          this.step = 1
        }, // 欢迎回来
        () => {
          this.step = 2
        }, // 用户名
        () => {
          // 动画完成，开始渐变到主页
          setTimeout(() => {
            this.$emit('start-fade-to-main')
          }, 800)
        },
      ]

      steps.forEach((step, index) => {
        setTimeout(step, (index + 1) * 200)
      })
    },

    resetAnimation() {
      this.step = 0
      if (this.animationTimer) {
        clearTimeout(this.animationTimer)
        this.animationTimer = null
      }
    },
  },

  beforeUnmount() {
    this.resetAnimation()
  },
}
</script>

<style scoped>
.login-transition-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* 过渡动画 */
.login-transition-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.login-transition-leave-active {
  transition: all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.login-transition-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.login-transition-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

/* 内容层 */
.transition-content {
  position: relative;
  z-index: 10000;
  text-align: center;
  max-width: 600px;
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

/* 欢迎文字序列 */
.welcome-sequence {
  margin-bottom: var(--spacing-3xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  flex-grow: 1;
  justify-content: center;
}

.welcome-text {
  opacity: 0;
  transform: translateY(20px);
  transition: all 1s cubic-bezier(0.23, 1, 0.32, 1);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif;
  font-weight: 300;
  letter-spacing: -0.01em;
  line-height: 1.2;
  text-align: center;
  will-change: transform, opacity;
}

.welcome-text.animate {
  opacity: 1;
  transform: translateY(0);
}

.welcome-text.primary {
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  color: #1d1d1f;
  font-weight: 600;
  letter-spacing: -0.025em;
  margin-bottom: var(--spacing-xs);
}

.welcome-text.secondary {
  font-size: clamp(1.125rem, 2.5vw, 1.375rem);
  color: #86868b;
  font-weight: 400;
  letter-spacing: 0.01em;
  transition-delay: 0.2s;
}

/* 底部品牌标识 */
.brand-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  opacity: 0;
  transform: translateY(20px);
  transition: all 1s cubic-bezier(0.23, 1, 0.32, 1);
  margin-bottom: var(--spacing-xl);
}

.brand-footer.animate {
  opacity: 1;
  transform: translateY(0);
}

.brand-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.brand-text {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  font-family: 'Dancing Script', cursive;
  font-weight: 400;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-sequence {
    gap: var(--spacing-sm);
  }

  .welcome-text.primary {
    font-size: clamp(1.875rem, 6vw, 2.75rem);
  }

  .welcome-text.secondary {
    font-size: clamp(1rem, 3vw, 1.25rem);
  }

  .brand-logo {
    width: 28px;
    height: 28px;
  }

  .orb-1,
  .orb-2,
  .orb-3 {
    display: none;
  }
}

@media (max-width: 480px) {
  .transition-content {
    padding: var(--spacing-lg);
  }

  .welcome-text.primary {
    font-size: clamp(1.5rem, 8vw, 2.25rem);
  }

  .welcome-text.secondary {
    font-size: clamp(0.875rem, 4vw, 1.125rem);
  }
}
</style>
