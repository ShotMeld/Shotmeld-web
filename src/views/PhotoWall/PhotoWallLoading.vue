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
  background-color: var(--bg-primary);
  border-radius: var(--radius-large);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: var(--shadow-small);
  border: var(--border-width) solid var(--border-color);
}
:deep(.el-skeleton) {
  --el-skeleton-color: var(--bg-secondary);
  --el-skeleton-to-color: var(--bg-tertiary);
}
:deep(.el-skeleton__item) {
  height: 200px;
  margin-bottom: var(--spacing-md);
  border-radius: var(--radius-medium);
  background-color: var(--bg-secondary);
}
</style> 