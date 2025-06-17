<template>
  <div class="pagination-container">
    <el-pagination
      :currentPage="currentPage"
      :pageSize="pageSize"
      :page-sizes="[20, 50, 100]"
      :total="total"
      layout="total, sizes, prev, pager, next"
      :hide-on-single-page="false"
      :small="isSmallScreen"
      @update:currentPage="$emit('update:currentPage', $event)"
      @update:pageSize="$emit('update:pageSize', $event)"
      @size-change="$emit('sizeChange', $event)"
      @current-change="$emit('currentChange', $event)"
    />
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'

export default {
  name: 'PhotoWallPagination',
  props: {
    currentPage: {
      type: Number,
      required: true,
    },
    pageSize: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  setup() {
    const isSmallScreen = ref(false)

    const handleResize = debounce(() => {
      isSmallScreen.value = window.innerWidth < 768
    }, 150)

    function debounce(func, wait) {
      let timeout
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout)
          func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
      }
    }

    const checkScreenSize = () => {
      isSmallScreen.value = window.innerWidth < 768
    }

    onMounted(() => {
      handleResize()
      window.addEventListener('resize', handleResize)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize)
    })

    return {
      isSmallScreen,
    }
  },
}
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: var(--spacing-2xl) 0;
  padding: var(--spacing-lg) var(--spacing-xl);
  background: var(--blur-bg-strong);
  border-radius: var(--radius-extra-large);
  backdrop-filter: var(--blur-strong);
  -webkit-backdrop-filter: var(--blur-strong);
  box-shadow: var(--blur-shadow-strong);
  border: 1px solid var(--blur-border);
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

:deep(.el-pagination) {
  --el-pagination-font-size: var(--font-size-sm);
  --el-pagination-button-color: var(--text-primary);
  --el-pagination-button-bg-color: transparent;
  --el-pagination-button-disabled-color: var(--text-disabled);
  --el-pagination-button-disabled-bg-color: transparent;
  --el-pagination-hover-color: var(--color-primary);
  --el-pagination-bg-color: transparent;
  font-family: var(--font-family);
  font-weight: var(--font-weight-medium);
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

/* 小屏幕样式 */
:deep(.el-pagination.is-small) {
  --el-pagination-font-size: var(--font-size-xs);
  gap: 6px;
}

/* 分页各部分样式 */
:deep(.el-pagination > *) {
  margin: 0 !important;
  flex-shrink: 0;
}

/* 页码按钮样式 */
:deep(.el-pagination .el-pager li) {
  border-radius: var(--radius-medium);
  min-width: 36px;
  height: 36px;
  line-height: 34px;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
  background-color: var(--blur-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  backdrop-filter: var(--blur-light);
  -webkit-backdrop-filter: var(--blur-light);
  margin: 0 1px;
}

:deep(.el-pagination.is-small .el-pager li) {
  min-width: 28px;
  height: 28px;
  line-height: 26px;
  font-size: var(--font-size-xs);
}

:deep(.el-pagination .el-pager li:hover) {
  color: var(--color-primary);
  background-color: var(--blur-bg-strong);
  border-color: var(--color-primary-subtle);
  box-shadow: var(--shadow-medium);
}

:deep(.el-pagination .el-pager li.is-active) {
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-large);
}

/* 前进后退按钮 */
:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  background-color: var(--blur-bg);
  color: var(--text-primary);
  border-radius: var(--radius-medium);
  border: 1px solid var(--border-color);
  backdrop-filter: var(--blur-light);
  -webkit-backdrop-filter: var(--blur-light);
  width: 36px;
  height: 36px;
  transition: all var(--transition-fast);
  margin: 0 2px;
}

:deep(.el-pagination.is-small .btn-prev),
:deep(.el-pagination.is-small .btn-next) {
  width: 28px;
  height: 28px;
}

:deep(.el-pagination .btn-prev:hover),
:deep(.el-pagination .btn-next:hover) {
  color: var(--color-primary);
  background-color: var(--blur-bg-strong);
  border-color: var(--color-primary-subtle);
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
}

:deep(.el-pagination .btn-prev:disabled),
:deep(.el-pagination .btn-next:disabled) {
  color: var(--text-disabled);
  background-color: var(--blur-bg-light);
  border-color: var(--border-color);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 每页数量选择器 */
:deep(.el-pagination .el-select) {
  margin: 0 !important;
}

:deep(.el-pagination .el-select .el-input) {
  width: 90px;
}

:deep(.el-pagination.is-small .el-select .el-input) {
  width: 80px;
}

:deep(.el-pagination .el-select .el-input__inner) {
  text-align: center;
  padding: 0 24px 0 8px;
}

/* 总数显示 */
:deep(.el-pagination__total) {
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  white-space: nowrap;
}

:deep(.el-pagination.is-small .el-pagination__total) {
  font-size: var(--font-size-xs);
}

/* 响应式调整 - 当空间不足时自动换行 */
@media (max-width: 992px) {
  :deep(.el-pagination) {
    row-gap: 12px;
  }
}

@media (max-width: 768px) {
  .pagination-container {
    padding: var(--spacing-md) var(--spacing-sm);
    margin: var(--spacing-xl) 0;
  }

  :deep(.el-pagination) {
    row-gap: 8px;
  }
}

.theme-dark :deep(.el-pagination .el-pager li) {
  background-color: var(--blur-bg);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.theme-dark :deep(.el-pagination .el-pager li:hover) {
  background-color: var(--blur-bg-strong);
  border-color: var(--color-primary-subtle);
}

.theme-dark :deep(.el-pagination .btn-prev),
.theme-dark :deep(.el-pagination .btn-next) {
  background-color: var(--blur-bg);
  border-color: var(--border-color);
}

.theme-dark :deep(.el-pagination .btn-prev:hover),
.theme-dark :deep(.el-pagination .btn-next:hover) {
  background-color: var(--blur-bg-strong);
  border-color: var(--color-primary-subtle);
}
</style>
