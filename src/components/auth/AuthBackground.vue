<!--
  AuthBackground.vue - 认证页面背景动画组件
  与 LoginTransition 保持完全一致的背景动画效果
-->

<template>
  <div class="auth-background">
    <div class="gradient-orb orb-1"></div>
    <div class="gradient-orb orb-2"></div>
    <div class="gradient-orb orb-3"></div>
  </div>
</template>

<script>
export default {
  name: 'AuthBackground'
}
</script>

<style scoped>
/* 背景动画层 - 确保动画球位置在所有页面中保持一致 */
.auth-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.gradient-orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.6;
  animation: float 8s ease-in-out infinite;
  z-index: 1;
}

.orb-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(45deg, rgba(0, 122, 255, 0.3), rgba(88, 86, 214, 0.3));
  top: 10%;
  right: 10%;
  animation-delay: 0s;
  animation-fill-mode: both;
}

.orb-2 {
  width: 200px;
  height: 200px;
  background: linear-gradient(45deg, rgba(255, 45, 85, 0.2), rgba(255, 149, 0, 0.2));
  bottom: 15%;
  left: 15%;
  animation-delay: -3s;
  animation-fill-mode: both;
}

.orb-3 {
  width: 150px;
  height: 150px;
  background: linear-gradient(45deg, rgba(50, 215, 75, 0.2), rgba(0, 199, 190, 0.2));
  top: 50%;
  left: 50%;
  animation-delay: -6s;
  animation-fill-mode: both;
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

/* orb-3 的特殊动画 - 保持居中的同时进行浮动 */
.orb-3 {
  animation: floatCentered 8s ease-in-out infinite;
  animation-delay: -6s;
  animation-fill-mode: both;
}

@keyframes floatCentered {
  0%,
  100% {
    transform: translate(-50%, -50%) translateY(0px) scale(1);
  }

  50% {
    transform: translate(-50%, -50%) translateY(-30px) scale(1.1);
  }
}

/* 响应式设计 - 与 LoginTransition 一致 */
@media (max-width: 768px) {
  .orb-1,
  .orb-2,
  .orb-3 {
    display: none;
  }
}
</style>
