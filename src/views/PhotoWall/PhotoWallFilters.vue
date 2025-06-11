<!--
  PhotoWallFilters.vue - 照片墙/搜索与筛选
-->

<template>
  <div class="filters-section">
    <SfCard class="search-card" shadow="medium">
      <div class="search-container">
        <SfInput
          v-model="localSearchQuery"
          :placeholder="$t('photoWall.filters.searchPlaceholder')"
          @input="debouncedSearch"
          class="search-input"
          id="photo-search"
          name="photo-search"
        >
          <template #prefix>
            <i class="fas fa-search"></i>
          </template>
        </SfInput>
        <SfButton
          v-if="localSearchQuery && localSearchQuery.trim() !== ''"
          @click="handleSearchButtonClick"
          class="search-button"
          :aria-label="$t('photoWall.filters.searchButtonAriaLabel')"
        >
          {{ $t('photoWall.filters.searchButton') }}
        </SfButton>
      </div>
      <div class="filter-controls">
        <div class="filter-item">
          <div class="select-wrapper">
            <el-select
              v-model="localFilters.albumId"
              :placeholder="$t('photoWall.filters.album.all')"
              clearable
              @change="handleFilterChange"
              class="select"
              id="album-filter"
              name="album-filter"
            >
              <el-option
                v-for="album in albums"
                :key="album.id"
                :label="album.name"
                :value="album.id"
              ></el-option>
            </el-select>
          </div>
        </div>
        <div class="filter-item">
          <div class="datepicker-wrapper">
            <el-date-picker
              v-model="localDateRange"
              type="daterange"
              :range-separator="$t('photoWall.filters.date.separator')"
              :start-placeholder="$t('photoWall.filters.date.start')"
              :end-placeholder="$t('photoWall.filters.date.end')"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleDateRangeChange"
              class="photo-wall-datepicker"
              data-test-id="photo-date-range"
              :id="['photo-date-range-start', 'photo-date-range-end']"
              :name="['photo-date-range-start', 'photo-date-range-end']"
              aria-label="Photo date range selector"
            ></el-date-picker>
          </div>
        </div>
        <div class="filter-item">
          <div class="sort-controls">
            <div class="select-wrapper sort-field">
              <el-select v-model="localFilters.sort" @change="handleFilterChange" class="select" id="sort-field" name="sort-field">
                <el-option
                  :label="$t('photoWall.filters.sort.takenAt')"
                  value="takenAt"
                ></el-option>
                <el-option
                  :label="$t('photoWall.filters.sort.createdAt')"
                  value="createdAt"
                ></el-option>
                <el-option :label="$t('photoWall.filters.sort.title')" value="title"></el-option>
              </el-select>
            </div>
            <div class="select-wrapper sort-order">
              <el-select v-model="localFilters.order" @change="handleFilterChange" class="select" id="sort-order" name="sort-order">
                <el-option
                  :label="$t('photoWall.filters.sort.order.desc')"
                  value="desc"
                ></el-option>
                <el-option :label="$t('photoWall.filters.sort.order.asc')" value="asc"></el-option>
              </el-select>
            </div>
          </div>
        </div>
      </div>
    </SfCard>
  </div>
</template>

<script>
import { photoService } from '../../api'

export default {
  name: 'PhotoWallFilters',
  props: {
    searchQuery: {
      type: String,
      default: '',
    },
    filters: {
      type: Object,
      required: true,
    },
    dateRange: {
      type: Array,
      default: () => null,
    },
    albums: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      localSearchQuery: this.searchQuery,
      localFilters: { ...this.filters },
      localDateRange: this.dateRange,
      searchTimeout: null,
    }
  },
  watch: {
    searchQuery(val) {
      this.localSearchQuery = val
      // 如果外部清空了 searchQuery，也触发一次 debouncedSearch 来清空结果
      if (!val || val.trim() === '') {
        this.debouncedSearch()
      }
    },
    filters: {
      handler(val) {
        this.localFilters = { ...val }
      },
      deep: true,
    },
    dateRange(val) {
      this.localDateRange = val
    },
  },
  methods: {
    async executeSearch() {
      if (!this.localSearchQuery || this.localSearchQuery.trim() === '') {
        // 通常由 debouncedSearch 中的逻辑处理清空，这里作为保险
        this.$emit('update:searchResults', {
          data: [],
          total: 0,
          page: 1,
          limit: 50,
          totalPages: 0,
          searchTerm: '',
        })
        this.$emit('fetchPhotos') // 确保在清除搜索词时重新加载默认照片列表
        return
      }

      try {
        const response = await photoService.searchPhotos({
          searchKey: this.localSearchQuery.trim(),
          page: 1, // 注意：分页参数目前是硬编码的
          limit: 50,
          sort: this.localFilters.sort,
          order: this.localFilters.order,
        })
        this.$emit('update:searchResults', response.data)
      } catch (error) {
        console.error(this.$t('photoWall.error.searchFailed') + ':', error)
        this.$emit('update:searchResults', {
          data: [],
          error: '搜索失败',
          searchTerm: this.localSearchQuery.trim(),
        })
      }
    },

    debouncedSearch() {
      clearTimeout(this.searchTimeout)
      if (!this.localSearchQuery || this.localSearchQuery.trim() === '') {
        // 当输入框被清空时，清除搜索结果并通知父组件获取所有照片
        this.$emit('update:searchResults', {
          data: [],
          total: 0,
          page: 1,
          limit: 50,
          totalPages: 0,
          searchTerm: '',
        })
        this.$emit('fetchPhotos')
        return
      }
      this.searchTimeout = setTimeout(async () => {
        await this.executeSearch()
      }, 500)
    },

    async handleSearchButtonClick() {
      clearTimeout(this.searchTimeout) // 取消任何待处理的防抖搜索
      if (this.localSearchQuery && this.localSearchQuery.trim() !== '') {
        await this.executeSearch()
      }
    },

    handleFilterChange() {
      this.$emit('update:filters', this.localFilters)
      this.$emit('fetchPhotos')
    },
    handleDateRangeChange(dates) {
      this.$emit('update:dateRange', dates)
      this.$emit('fetchPhotos')
    },
  },
}
</script>

<style scoped>
.filters-section {
  margin-bottom: var(--spacing-xl);
}
.search-card {
  padding: var(--spacing-lg);
  background-color: var(--bg-primary);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: var(--border-width) solid var(--border-color);
}
.search-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}
.search-input {
  flex-grow: 1; /* 修改，让输入框占据可用空间 */
  /* width: 100%; 可能不再需要，或改为 width: auto; */
}
/* 新增搜索按钮样式 */
.search-button {
  flex-shrink: 0;
  height: auto;
  align-self: stretch;
  padding-top: 0;
  padding-bottom: 0;
  border-radius: var(--radius-round);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 70px;
}
.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}
.filter-item {
  flex: 1 1 240px;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.sort-controls {
  display: flex;
  gap: var(--spacing-sm);
}
.sort-field {
  flex: 2;
}
.sort-order {
  flex: 1;
}
.select-wrapper {
  position: relative;
}

/* 筛选器特定的 el-select 样式调整 */
:deep(.select) {
  width: 100%;
}

:deep(.select .el-input) {
  height: 40px;
}

:deep(.select .el-input__inner) {
  height: 38px;
  line-height: 38px;
  font-size: var(--font-size-base);
  padding-left: var(--spacing-sm);
}

/* 日期选择器样式 */
:deep(.photo-wall-datepicker) {
  width: 100%;
}

/* 针对日期范围选择器的主容器 */
:deep(.photo-wall-datepicker.el-date-editor.el-date-editor--daterange) {
  width: 100%;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.6) 0%,
    rgba(248, 248, 248, 0.4) 100%
  ) !important;
  border-radius: var(--radius-medium) !important;
  border: 1px solid rgba(0, 0, 0, 0.06) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  transition: all var(--transition-fast) !important;
  height: 40px !important;
  position: relative !important;
  overflow: hidden !important;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
}

:deep(.photo-wall-datepicker.el-date-editor.el-date-editor--daterange::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  pointer-events: none;
  z-index: 1;
}

/* Tooltip trigger 样式 */
:deep(.photo-wall-datepicker .el-tooltip__trigger) {
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
}

/* Range editor 核心容器 */
:deep(.photo-wall-datepicker .el-range-editor) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 var(--spacing-sm) !important;
  position: relative !important;
  z-index: 2 !important;
  width: 100% !important;
  height: 38px !important;
  display: flex !important;
  align-items: center !important;
}

/* Input wrapper 样式重置 */
:deep(.photo-wall-datepicker .el-input__wrapper) {
  background-color: transparent !important;
  box-shadow: none !important;
  border: none !important;
  padding: 0 !important;
  position: relative !important;
  z-index: 2 !important;
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
}

/* 输入框文本样式 */
:deep(.photo-wall-datepicker .el-range-input) {
  color: var(--text-primary) !important;
  background-color: transparent !important;
  border: none !important;
  font-weight: var(--font-weight-medium) !important;
  font-size: var(--font-size-base) !important;
  line-height: 1 !important;
}

/* 分隔符样式 */
:deep(.photo-wall-datepicker .el-range-separator) {
  color: var(--text-secondary) !important;
  font-weight: var(--font-weight-medium) !important;
  font-size: var(--font-size-sm) !important;
}

/* Hover 状态 */
:deep(.photo-wall-datepicker.el-date-editor.el-date-editor--daterange:hover) {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(248, 248, 248, 0.7) 100%
  ) !important;
  border-color: rgba(0, 122, 255, 0.3) !important;
  box-shadow:
    0 4px 12px rgba(0, 122, 255, 0.12),
    0 2px 4px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
}

/* Focus 状态 */
:deep(.photo-wall-datepicker.el-date-editor.el-date-editor--daterange.is-focus),
:deep(.photo-wall-datepicker.el-date-editor.el-date-editor--daterange:focus-within) {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(248, 248, 248, 0.8) 100%
  ) !important;
  border-color: var(--color-primary) !important;
  box-shadow:
    0 6px 20px rgba(0, 122, 255, 0.15),
    0 0 0 3px rgba(0, 122, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 1) !important;
}

/* 深色模式适配 */
.theme-dark :deep(.photo-wall-datepicker.el-date-editor.el-date-editor--daterange) {
  background: linear-gradient(
    135deg,
    rgba(44, 44, 46, 0.8) 0%,
    rgba(28, 28, 30, 0.6) 100%
  ) !important;
  border-color: rgba(84, 84, 88, 0.3) !important;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
}

.theme-dark :deep(.photo-wall-datepicker.el-date-editor.el-date-editor--daterange::before) {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
}

.theme-dark :deep(.photo-wall-datepicker.el-date-editor.el-date-editor--daterange:hover) {
  background: linear-gradient(
    135deg,
    rgba(58, 58, 60, 0.9) 0%,
    rgba(44, 44, 46, 0.8) 100%
  ) !important;
  border-color: rgba(0, 122, 255, 0.4) !important;
  box-shadow:
    0 4px 12px rgba(0, 122, 255, 0.2),
    0 2px 4px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
}

.theme-dark :deep(.photo-wall-datepicker.el-date-editor.el-date-editor--daterange.is-focus),
.theme-dark :deep(.photo-wall-datepicker.el-date-editor.el-date-editor--daterange:focus-within) {
  background: linear-gradient(
    135deg,
    rgba(58, 58, 60, 0.95) 0%,
    rgba(44, 44, 46, 0.9) 100%
  ) !important;
  border-color: var(--color-primary) !important;
  box-shadow:
    0 6px 20px rgba(0, 122, 255, 0.25),
    0 0 0 3px rgba(0, 122, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
}

.theme-dark :deep(.photo-wall-datepicker .el-range-input) {
  color: var(--text-primary-dark) !important;
}

.theme-dark :deep(.photo-wall-datepicker .el-range-separator) {
  color: var(--text-secondary-dark) !important;
}
</style>
