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
  name: 'PhotoWallLoading',
}
</script>

<style scoped>
.loading-container {
  padding: var(--spacing-xl);
  background-color: var(--blur-bg-strong);
  backdrop-filter: var(--blur-strong);
  -webkit-backdrop-filter: var(--blur-strong);
  border-radius: var(--radius-large);
  box-shadow: var(--shadow-small);
  border: var(--border-width) solid var(--blur-border);
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
