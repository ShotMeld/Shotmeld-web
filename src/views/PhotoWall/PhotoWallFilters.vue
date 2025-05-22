<!--
  PhotoWallFilters.vue - 照片墙/搜索与筛选
-->

<template>
  <div class="filters-section">
    <SfCard class="search-card" shadow="medium">
      <div class="search-container">
        <SfInput v-model="localSearchQuery" placeholder="搜索照片..." @input="debouncedSearch" class="search-input">
          <template #prefix>
            <i class="fas fa-search"></i>
          </template>
        </SfInput>
        <SfButton
          v-if="localSearchQuery && localSearchQuery.trim() !== ''"
          @click="handleSearchButtonClick"
          class="search-button"
          aria-label="执行搜索"
        >
          搜索
        </SfButton>
      </div>
      <div class="filter-controls">
        <div class="filter-item">
          <label class="filter-label">相册</label>
          <div class="select-wrapper">
            <el-select v-model="localFilters.albumId" placeholder="全部相册" clearable @change="handleFilterChange" class="select">
              <el-option v-for="album in albums" :key="album.id" :label="album.name" :value="album.id"></el-option>
            </el-select>
          </div>
        </div>
        <div class="filter-item">
          <label class="filter-label">日期范围</label>
          <div class="datepicker-wrapper">
            <el-date-picker v-model="localDateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" @change="handleDateRangeChange" class="photo-wall-datepicker"></el-date-picker>
          </div>
        </div>
        <div class="filter-item">
          <label class="filter-label">排序</label>
          <div class="sort-controls">
            <div class="select-wrapper sort-field">
              <el-select v-model="localFilters.sort" @change="handleFilterChange" class="select">
                <el-option label="拍摄时间" value="takenAt"></el-option>
                <el-option label="上传时间" value="createdAt"></el-option>
                <el-option label="标题" value="title"></el-option>
              </el-select>
            </div>
            <div class="select-wrapper sort-order">
              <el-select v-model="localFilters.order" @change="handleFilterChange" class="select">
                <el-option label="降序" value="desc"></el-option>
                <el-option label="升序" value="asc"></el-option>
              </el-select>
            </div>
          </div>
        </div>
      </div>
    </SfCard>
  </div>
</template>

<script>
import { photoService } from '../../api';

export default {
  name: 'PhotoWallFilters',
  props: {
    searchQuery: {
      type: String,
      default: ''
    },
    filters: {
      type: Object,
      required: true
    },
    dateRange: {
      type: Array,
      default: () => null
    },
    albums: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      localSearchQuery: this.searchQuery,
      localFilters: { ...this.filters },
      localDateRange: this.dateRange,
      searchTimeout: null
    };
  },
  watch: {
    searchQuery(val) {
      this.localSearchQuery = val;
      // 如果外部清空了 searchQuery，也触发一次 debouncedSearch 来清空结果
      if (!val || val.trim() === '') {
        this.debouncedSearch();
      }
    },
    filters: {
      handler(val) {
        this.localFilters = { ...val };
      },
      deep: true
    },
    dateRange(val) {
      this.localDateRange = val;
    }
  },
  methods: {
    async executeSearch() {
      if (!this.localSearchQuery || this.localSearchQuery.trim() === '') {
        // 通常由 debouncedSearch 中的逻辑处理清空，这里作为保险
        this.$emit('update:searchResults', { data: [], total: 0, page: 1, limit: 50, totalPages: 0, searchTerm: '' });
        this.$emit('fetchPhotos'); // 确保在清除搜索词时重新加载默认照片列表
        return;
      }

      try {
        const response = await photoService.searchPhotosByTitle({
          title: this.localSearchQuery.trim(),
          page: 1, // 注意：分页参数目前是硬编码的
          limit: 50,
          sort: this.localFilters.sort,
          order: this.localFilters.order
        });
        this.$emit('update:searchResults', response.data);
      } catch (error) {
        console.error('搜索照片失败:', error);
        this.$emit('update:searchResults', { data: [], error: '搜索失败', searchTerm: this.localSearchQuery.trim() });
      }
    },

    debouncedSearch() {
      clearTimeout(this.searchTimeout);
      if (!this.localSearchQuery || this.localSearchQuery.trim() === '') {
        // 当输入框被清空时，清除搜索结果并通知父组件获取所有照片
        this.$emit('update:searchResults', { data: [], total: 0, page: 1, limit: 50, totalPages: 0, searchTerm: '' });
        this.$emit('fetchPhotos');
        return;
      }
      this.searchTimeout = setTimeout(async () => {
        await this.executeSearch();
      }, 500);
    },

    async handleSearchButtonClick() {
      clearTimeout(this.searchTimeout); // 取消任何待处理的防抖搜索
      if (this.localSearchQuery && this.localSearchQuery.trim() !== '') {
        await this.executeSearch();
      }
    },

    handleFilterChange() {
      this.$emit('update:filters', this.localFilters);
      this.$emit('fetchPhotos');
    },
    handleDateRangeChange(dates) {
      this.$emit('update:dateRange', dates);
      this.$emit('fetchPhotos');
    }
  }
};
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
:deep(.select) {
  width: 100%;
}
:deep(.select .el-input__wrapper) {
  background-color: var(--bg-secondary);
  border-radius: var(--radius-round);
  padding: var(--spacing-xs) var(--spacing-sm);
  box-shadow: none;
  border: 2px solid transparent;
  transition: all var(--transition-base);
}
:deep(.select .el-input__wrapper:hover) {
  background-color: var(--bg-tertiary);
}
:deep(.select .el-input__wrapper.is-focus) {
  background-color: var(--bg-primary);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.15);
}
:deep(.select .el-input__inner) {
  color: var(--text-primary);
  font-family: var(--font-family);
  font-size: var(--font-size-base);
}
:deep(.photo-wall-datepicker) {
  width: 100%;
}
:deep(.photo-wall-datepicker .el-input__wrapper) {
  background-color: var(--bg-secondary);
  border-radius: var(--radius-round);
  padding: var(--spacing-xs) var(--spacing-sm);
  box-shadow: none;
  border: 2px solid transparent;
  transition: all var(--transition-base);
}
:deep(.photo-wall-datepicker .el-input__wrapper:hover) {
  background-color: var(--bg-tertiary);
}
:deep(.photo-wall-datepicker .el-input__wrapper.is-focus) {
  background-color: var(--bg-primary);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.15);
}
</style>