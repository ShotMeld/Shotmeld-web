<!--
  PhotoWallLoading.vue - 照片墙/加载状态组件
-->

<template>
  <div class="loading-container">
    <el-skeleton :rows="3" animated />
  </div>
</template>

<script>
export default {
  name: 'PhotoWallLoading'
};
</script>

<style scoped>
.loading-container {
  padding: var(--spacing-xl);
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: var(--radius-large);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: var(--shadow-small);
}
:deep(.el-skeleton) {
  --el-skeleton-color: var(--color-gray-200);
  --el-skeleton-to-color: var(--color-gray-100);
}
:deep(.el-skeleton__item) {
  height: 200px;
  margin-bottom: var(--spacing-md);
  border-radius: var(--radius-medium);
}
</style> 