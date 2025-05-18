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
      </div>
      <div class="filter-controls">
        <div class="filter-item">
          <label class="filter-label">相册</label>
          <div class="apple-select-wrapper">
            <el-select v-model="localFilters.albumId" placeholder="全部相册" clearable @change="handleFilterChange" class="apple-select">
              <el-option v-for="album in albums" :key="album.id" :label="album.name" :value="album.id"></el-option>
            </el-select>
          </div>
        </div>
        <div class="filter-item">
          <label class="filter-label">日期范围</label>
          <div class="apple-datepicker-wrapper">
            <el-date-picker v-model="localDateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" @change="handleDateRangeChange" class="apple-datepicker"></el-date-picker>
          </div>
        </div>
        <div class="filter-item">
          <label class="filter-label">排序</label>
          <div class="sort-controls">
            <div class="apple-select-wrapper sort-field">
              <el-select v-model="localFilters.sort" @change="handleFilterChange" class="apple-select">
                <el-option label="拍摄时间" value="takenAt"></el-option>
                <el-option label="上传时间" value="createdAt"></el-option>
                <el-option label="标题" value="title"></el-option>
              </el-select>
            </div>
            <div class="apple-select-wrapper sort-order">
              <el-select v-model="localFilters.order" @change="handleFilterChange" class="apple-select">
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
    debouncedSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.$emit('update:searchQuery', this.localSearchQuery);
        this.$emit('fetchPhotos');
      }, 500);
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
  margin-bottom: var(--spacing-lg);
}
.search-input {
  width: 100%;
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
.apple-select-wrapper {
  position: relative;
}
:deep(.apple-select) {
  width: 100%;
}
:deep(.apple-select .el-input__wrapper) {
  background-color: var(--bg-secondary);
  border-radius: var(--radius-round);
  padding: var(--spacing-xs) var(--spacing-sm);
  box-shadow: none;
  border: 2px solid transparent;
  transition: all var(--transition-base);
}
:deep(.apple-select .el-input__wrapper:hover) {
  background-color: var(--bg-tertiary);
}
:deep(.apple-select .el-input__wrapper.is-focus) {
  background-color: var(--bg-primary);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.15);
}
:deep(.apple-select .el-input__inner) {
  color: var(--text-primary);
  font-family: var(--font-family);
  font-size: var(--font-size-base);
}
:deep(.apple-datepicker) {
  width: 100%;
}
:deep(.apple-datepicker .el-input__wrapper) {
  background-color: var(--bg-secondary);
  border-radius: var(--radius-round);
  padding: var(--spacing-xs) var(--spacing-sm);
  box-shadow: none;
  border: 2px solid transparent;
  transition: all var(--transition-base);
}
:deep(.apple-datepicker .el-input__wrapper:hover) {
  background-color: var(--bg-tertiary);
}
:deep(.apple-datepicker .el-input__wrapper.is-focus) {
  background-color: var(--bg-primary);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.15);
}
</style> 