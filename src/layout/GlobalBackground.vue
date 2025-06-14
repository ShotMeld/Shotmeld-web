<!--
  GlobalBackground.vue - 全局背景动画组件
  为整个应用提供统一的背景动画效果
-->

<template>
  <div class="global-background">
    <div v-for="orb in orbs" :key="orb.id" class="gradient-orb" :style="orbStyle(orb)"></div>
  </div>
</template>

<script>
import { useBackgroundStore } from '@/store/background'

export default {
  name: 'GlobalBackground',
  setup() {
    const backgroundStore = useBackgroundStore()
    return { backgroundStore }
  },
  computed: {
    orbs() {
      return this.backgroundStore.getOrbs
    },
  },
  created() {
    // 确保小球只初始化一次，全应用共享
    this.backgroundStore.initializeOrbs()
  },
  methods: {
    orbStyle(orb) {
      return {
        width: `${orb.size}px`,
        height: `${orb.size}px`,
        left: `${orb.x}%`,
        top: `${orb.y}%`,
        background: orb.color,
        animationDuration: `${orb.duration}s`,
        animationDelay: `${orb.delay}s`,
        '--move-x': `${orb.moveX}px`,
        '--move-y': `${orb.moveY}px`,
      }
    },
  },
}
</script>

<style scoped>
/* 背景动画层 - 随机生成的动态小球 */
.global-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.6;
  animation: slowFloat infinite ease-in-out;
  transform: translate(-50%, -50%);
}

/* 缓慢浮动动画 */
@keyframes slowFloat {
  0% {
    transform: translate(-50%, -50%) translate(0, 0) scale(1);
    opacity: 0.6;
  }

  25% {
    transform: translate(-50%, -50%) translate(var(--move-x), calc(var(--move-y) * 0.5)) scale(1.05);
    opacity: 0.4;
  }

  50% {
    transform: translate(-50%, -50%) translate(calc(var(--move-x) * 1.2), var(--move-y)) scale(0.95);
    opacity: 0.7;
  }

  75% {
    transform: translate(-50%, -50%) translate(calc(var(--move-x) * 0.3), calc(var(--move-y) * 1.1))
      scale(1.1);
    opacity: 0.5;
  }

  100% {
    transform: translate(-50%, -50%) translate(0, 0) scale(1);
    opacity: 0.6;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .gradient-orb {
    filter: blur(20px);
    opacity: 0.3;
  }
}

@media (max-width: 480px) {
  .gradient-orb {
    display: none;
  }
}
</style>
