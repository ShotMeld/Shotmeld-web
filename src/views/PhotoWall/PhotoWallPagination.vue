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
  background: rgba(248, 248, 248, 0.7);
  border-radius: var(--radius-extra-large);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.04),
    0 1px 2px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.pagination-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  pointer-events: none;
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
  background-color: rgba(255, 255, 255, 0.4);
  color: var(--text-primary);
  border: 1px solid rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
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
  background-color: rgba(255, 255, 255, 0.8);
  border-color: rgba(0, 122, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.15);
}

:deep(.el-pagination .el-pager li.is-active) {
  background: rgba(0, 122, 255, 0.1);
  color: var(--color-primary);
  border-color: var(--color-primary);
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);
}

/* 前进后退按钮 */
:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  background-color: rgba(255, 255, 255, 0.4);
  color: var(--text-primary);
  border-radius: var(--radius-medium);
  border: 1px solid rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
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
  background-color: rgba(255, 255, 255, 0.8);
  border-color: rgba(0, 122, 255, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.15);
}

:deep(.el-pagination .btn-prev:disabled),
:deep(.el-pagination .btn-next:disabled) {
  color: var(--text-disabled);
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(0, 0, 0, 0.04);
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

/* 深色模式适配 */
.theme-dark .pagination-container {
  background: rgba(28, 28, 30, 0.8);
  border-color: rgba(84, 84, 88, 0.4);
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.2),
    0 1px 2px rgba(0, 0, 0, 0.3);
}

.theme-dark .pagination-container::before {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
}

.theme-dark :deep(.el-pagination .el-pager li) {
  background-color: rgba(44, 44, 46, 0.6);
  border-color: rgba(84, 84, 88, 0.3);
  color: var(--text-primary);
}

.theme-dark :deep(.el-pagination .el-pager li:hover) {
  background-color: rgba(58, 58, 60, 0.8);
  border-color: rgba(0, 122, 255, 0.4);
}

.theme-dark :deep(.el-pagination .btn-prev),
.theme-dark :deep(.el-pagination .btn-next) {
  background-color: rgba(44, 44, 46, 0.6);
  border-color: rgba(84, 84, 88, 0.3);
}

.theme-dark :deep(.el-pagination .btn-prev:hover),
.theme-dark :deep(.el-pagination .btn-next:hover) {
  background-color: rgba(58, 58, 60, 0.8);
  border-color: rgba(0, 122, 255, 0.4);
}
</style>
