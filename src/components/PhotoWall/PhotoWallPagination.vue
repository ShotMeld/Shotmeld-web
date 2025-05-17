<!--
  PhotoWallPagination.vue - 照片墙/分页组件
-->

<template>
  <div class="pagination-container">
    <el-pagination
      :currentPage="currentPage"
      :pageSize="pageSize"
      :page-sizes="[20, 50, 100]"
      :total="total"
      layout="total, sizes, prev, pager, next"
      @update:currentPage="$emit('update:currentPage', $event)"
      @update:pageSize="$emit('update:pageSize', $event)"
      @size-change="$emit('sizeChange', $event)"
      @current-change="$emit('currentChange', $event)"
    />
  </div>
</template>

<script>
export default {
  name: 'PhotoWallPagination',
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    pageSize: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  }
};
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  margin: var(--spacing-xl) 0;
  padding: var(--spacing-md);
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: var(--radius-large);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: var(--shadow-small);
}
:deep(.el-pagination) {
  --el-pagination-font-size: var(--font-size-base);
  --el-pagination-button-color: var(--text-primary);
  --el-pagination-button-bg-color: transparent;
  --el-pagination-button-disabled-color: var(--text-disabled);
  --el-pagination-button-disabled-bg-color: transparent;
  --el-pagination-hover-color: var(--color-primary);
}
:deep(.el-pagination .el-pager li) {
  border-radius: var(--radius-round);
  min-width: 32px;
  height: 32px;
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
}
:deep(.el-pagination .el-pager li.is-active) {
  background-color: var(--color-primary);
  color: var(--color-white);
}
</style> 