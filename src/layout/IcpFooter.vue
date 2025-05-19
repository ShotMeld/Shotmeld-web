<!--
  IcpFooter.vue - ICP备案信息
-->

<template>
  <div class="icp-footer">
    <a href="https://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer">
      © {{ currentYear }} 闽ICP备2025099091号
    </a>
  </div>
</template>

<script>
export default {
  name: 'IcpFooter',
  computed: {
    currentYear() {
      return new Date().getFullYear();
    }
  }
}
</script>

<style scoped>
.icp-footer {
  text-align: center;
  padding: var(--spacing-md) 0;
  margin-top: var(--spacing-xl);
  font-size: var(--font-size-xs);
}

.icp-footer a {
  color: var(--text-tertiary);
  text-decoration: none;
  transition: color var(--transition-fast);
  opacity: 0.7;
}

.icp-footer a:hover {
  color: var(--text-secondary);
  opacity: 1;
}
</style>
