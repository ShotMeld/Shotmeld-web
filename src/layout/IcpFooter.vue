<!--
  IcpFooter.vue - ICP备案信息
-->

<template>
  <div class="icp-footer">
    <a href="https://seeridia.top" target="_blank" rel="noopener noreferrer">
      @{{ currentYear }} Seeridia
    </a>
    <span>·</span>
    <a href="https://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer">
      闽ICP备2025099091号
    </a>
    <span>·</span>
    <a
      href="https://beian.mps.gov.cn/#/query/webSearch?code=35018302000247"
      rel="noreferrer"
      target="_blank"
    >
      闽公网安备35018302000247号
    </a>
  </div>
</template>

<script>
export default {
  name: 'IcpFooter',
  computed: {
    currentYear() {
      return new Date().getFullYear()
    },
  },
}
</script>

<style scoped>
.icp-footer {
  text-align: center;
  padding: var(--spacing-md) 0;
  margin-top: var(--spacing-xl);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.icp-footer a {
  color: inherit;
  text-decoration: none;
  transition: color var(--transition-fast);
}

.icp-footer a:hover {
  color: var(--text-secondary);
}
</style>
