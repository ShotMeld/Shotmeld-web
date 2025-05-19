<!--
  MorePage.vue - "更多"页面
-->

<template>
  <div class="more-container">
    <h1 class="more-title">更多功能</h1>
    <div class="more-content">
      <!-- 更多页面内容将放在这里 -->
      <p class="placeholder-text">更多功能即将上线，敬请期待...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MorePage'
}
</script>

<style scoped>
.more-container {
  padding: var(--spacing-xl);
  max-width: 1200px;
  margin: 0 auto;
}

.more-title {
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xl);
}

.more-content {
  background-color: var(--bg-card);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-text {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  text-align: center;
}
</style>
