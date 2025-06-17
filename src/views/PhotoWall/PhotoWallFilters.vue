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
              <el-select
                v-model="localFilters.sort"
                @change="handleFilterChange"
                class="select"
                id="sort-field"
                name="sort-field"
              >
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
              <el-select
                v-model="localFilters.order"
                @change="handleFilterChange"
                class="select"
                id="sort-order"
                name="sort-order"
              >
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
        // 如果搜索词为空，通知父组件更新搜索查询状态，然后获取普通照片列表
        this.$emit('update:searchQuery', '')
        this.$emit('fetchPhotos')
        return
      }

      // 通知父组件更新搜索查询状态
      this.$emit('update:searchQuery', this.localSearchQuery.trim())

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
        // 当输入框被清空时，通知父组件更新搜索查询状态，然后获取所有照片
        this.$emit('update:searchQuery', '')
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
  flex-grow: 1;
}

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
  flex: 1;
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

:deep(.select .el-select__wrapper) {
  height: 40px !important;
}

:deep(.select .el-input__inner) {
  height: 38px;
  line-height: 38px;
  font-size: var(--font-size-base);
  padding-left: var(--spacing-sm);
}
</style>
