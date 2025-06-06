<!--
  LoginTransition.vue - 登录过渡动画
-->

<template>
    <transition name="login-transition" @after-leave="$emit('transition-complete')">
        <div v-if="show" class="login-transition-overlay">
            <!-- 背景动画层 -->
            <div class="transition-background">
                <div class="gradient-orb orb-1"></div>
                <div class="gradient-orb orb-2"></div>
                <div class="gradient-orb orb-3"></div>
            </div>

            <!-- 内容层 -->
            <div class="transition-content">
                <!-- 欢迎文字动画 -->
                <div class="welcome-sequence">
                    <div class="welcome-text primary" :class="{ 'animate': step >= 1 }">
                        {{ $t('loginTransition.welcomeBack') }}
                    </div>
                    <div class="welcome-text secondary" :class="{ 'animate': step >= 2 }">
                        {{ userName || $t('loginTransition.defaultUser') }}
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    name: 'LoginTransition',
    props: {
        show: {
            type: Boolean,
            default: false
        },
        userName: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            step: 0,
            animationTimer: null
        }
    },
    watch: {
        show(newVal) {
            if (newVal) {
                this.startAnimation()
            } else {
                this.resetAnimation()
            }
        }
    },
    methods: {
        startAnimation() {
            this.step = 0
            // 分步执行动画
            const steps = [
                () => { this.step = 1 }, // 欢迎回来
                () => { this.step = 2 }, // 用户名
                () => {
                    // 动画完成，开始渐变到主页
                    setTimeout(() => {
                        this.$emit('start-fade-to-main')
                    }, 800)
                }
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
        }
    },

    beforeUnmount() {
        this.resetAnimation()
    }
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

/* 背景动画层 */
.transition-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.gradient-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(40px);
    opacity: 0.6;
    animation: float 8s ease-in-out infinite;
}

.orb-1 {
    width: 300px;
    height: 300px;
    background: linear-gradient(45deg, rgba(0, 122, 255, 0.3), rgba(88, 86, 214, 0.3));
    top: 10%;
    right: 10%;
    animation-delay: 0s;
}

.orb-2 {
    width: 200px;
    height: 200px;
    background: linear-gradient(45deg, rgba(255, 45, 85, 0.2), rgba(255, 149, 0, 0.2));
    bottom: 15%;
    left: 15%;
    animation-delay: -3s;
}

.orb-3 {
    width: 150px;
    height: 150px;
    background: linear-gradient(45deg, rgba(50, 215, 75, 0.2), rgba(0, 199, 190, 0.2));
    top: 50%;
    left: 50%;
    animation-delay: -6s;
    transform: translate(-50%, -50%);
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0px) scale(1);
    }

    50% {
        transform: translateY(-30px) scale(1.1);
    }
}

/* 内容层 */
.transition-content {
    position: relative;
    z-index: 2;
    text-align: center;
    max-width: 600px;
    padding: var(--spacing-xl);
}

/* 欢迎文字序列 */
.welcome-sequence {
    margin-bottom: var(--spacing-3xl);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
}

.welcome-text {
    opacity: 0;
    transform: translateY(20px);
    transition: all 1.0s cubic-bezier(0.23, 1, 0.32, 1);
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif;
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
