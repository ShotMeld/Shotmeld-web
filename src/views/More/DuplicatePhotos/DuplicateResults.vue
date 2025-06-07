<template>
  <div class="duplicate-results">
    <div class="results-header">
      <div class="results-summary">
        <h2>{{ $t('duplicatePhotos.results.title') }}</h2>
        <div class="summary-stats">
          <div class="stat-item">
            <span class="stat-value">{{ duplicateGroups.length }}</span>
            <span class="stat-label">{{ $t('duplicatePhotos.results.summary.groups') }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ totalDuplicates }}</span>
            <span class="stat-label">{{ $t('duplicatePhotos.results.summary.duplicates') }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ estimatedSpace }}</span>
            <span class="stat-label">{{ $t('duplicatePhotos.results.summary.space') }}</span>
          </div>
        </div>
      </div>

      <div class="results-actions">
        <SfButton type="secondary" @click="selectSmartRecommendations">
          {{ $t('duplicatePhotos.results.actions.smartRecommendations') }}
        </SfButton>
        <SfButton type="danger" @click="deleteAllSelected" :disabled="totalSelected === 0">
          {{ $t('duplicatePhotos.results.actions.deleteSelected', { count: totalSelected }) }}
        </SfButton>
      </div>
    </div>

    <div v-if="duplicateGroups.length === 0" class="no-results">
      <div class="no-results-icon">
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 12L11 14L15 10"
            stroke="var(--color-success)"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle cx="12" cy="12" r="10" stroke="var(--color-success)" stroke-width="2" />
        </svg>
      </div>
      <h3>{{ $t('duplicatePhotos.results.noDuplicates') }}</h3>
      <p>{{ $t('duplicatePhotos.results.noDuplicatesDescription') }}</p>
    </div>

    <div v-else class="results-content">
      <DuplicateGroup
        v-for="(group, index) in duplicateGroups"
        :key="`group-${index}`"
        :photos="group"
        :group-index="index"
        :similarity="calculateSimilarity(group)"
        @delete-photos="handleDeletePhotos"
        @selection-change="handleSelectionChange"
        ref="duplicateGroups"
      />
    </div>

    <div v-if="duplicateGroups.length > 0" class="results-footer">
      <div class="pagination-info">
        {{ $t('duplicatePhotos.results.totalGroups', { count: duplicateGroups.length }) }}
      </div>

      <SfButton type="primary" @click="$emit('restart')">
        {{ $t('duplicatePhotos.results.actions.restart') }}
      </SfButton>
    </div>

    <!-- 批量删除确认对话框 -->
    <SfDeleteConfirmModal
      v-model="showDeleteSelectedModal"
      item-name="{{ $t('duplicatePhotos.results.confirm.delete.itemName') }}"
      :count="totalSelected"
      @confirm="confirmDeleteAllSelected"
    />
  </div>
</template>

<script>
import SfButton from '@/components/ui/SfButton.vue'
import SfDeleteConfirmModal from '@/components/ui/SfDeleteConfirmModal.vue'
import DuplicateGroup from './DuplicateGroup.vue'

export default {
  name: 'DuplicateResults',
  components: {
    SfButton,
    SfDeleteConfirmModal,
    DuplicateGroup,
  },
  props: {
    duplicateGroups: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['restart', 'delete-photos', 'smart-select'],
  data() {
    return {
      groupSelections: {}, // 存储每个组的选中状态
      showDeleteSelectedModal: false, // 控制删除确认对话框显示
    }
  },
  watch: {
    duplicateGroups: {
      handler() {
        // 重复组数据变化时重置选中状态
        this.groupSelections = {}
      },
      immediate: true,
    },
  },
  computed: {
    totalDuplicates() {
      return this.duplicateGroups.reduce((total, group) => total + group.length, 0)
    },
    totalSelected() {
      // 计算所有组的选中图片总数
      return Object.values(this.groupSelections).reduce((total, group) => {
        return total + (group.selectedCount || 0)
      }, 0)
    },
    estimatedSpace() {
      // 计算智能推荐后可释放的空间
      let totalBytes = 0

      this.duplicateGroups.forEach(group => {
        if (group.length <= 1) return

        // 找到像素最高的照片（保留）
        const highestPixelPhoto = group.reduce((highest, current) => {
          const currentPixels = (current.width || 1920) * (current.height || 1080)
          const highestPixels = (highest.width || 1920) * (highest.height || 1080)

          if (currentPixels > highestPixels) {
            return current
          } else if (currentPixels === highestPixels) {
            // 像素相同时，选择文件大小更大的
            const currentSize = current.fileSize || current.size || 2500000
            const highestSize = highest.fileSize || highest.size || 2500000
            return currentSize > highestSize ? current : highest
          }
          return highest
        })

        // 计算其他照片（将被删除）的总大小
        group.forEach(photo => {
          const photoId = photo.id || photo.filename || photo.name
          const highestId =
            highestPixelPhoto.id || highestPixelPhoto.filename || highestPixelPhoto.name

          if (photoId !== highestId) {
            totalBytes += photo.fileSize || photo.size || 2500000 // 默认2.5MB
          }
        })
      })

      // 格式化显示
      if (totalBytes > 1024 * 1024 * 1024) {
        return `${(totalBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
      } else if (totalBytes > 1024 * 1024) {
        return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`
      }
      return `${(totalBytes / 1024).toFixed(1)} KB`
    },
  },
  methods: {
    calculateSimilarity(group) {
      // 模拟相似度计算
      return Math.floor(Math.random() * 10) + 90 // 90-99%
    },

    selectSmartRecommendations() {
      // 智能推荐选择策略：每组保留像素最高的图片，选择其他图片进行删除
      if (this.$refs.duplicateGroups) {
        this.$refs.duplicateGroups.forEach(groupRef => {
          if (groupRef.smartSelectByResolution) {
            groupRef.smartSelectByResolution()
          } else if (groupRef.smartSelect) {
            groupRef.smartSelect()
          }
        })
      }

      this.$notify({
        message: '已应用智能推荐',
        type: 'success',
      })
    },

    async deleteAllSelected() {
      if (this.totalSelected === 0) return

      // 显示删除确认对话框
      this.showDeleteSelectedModal = true
    },

    confirmDeleteAllSelected() {
      // 收集所有选中的图片
      const allSelectedPhotos = []
      Object.values(this.groupSelections).forEach(group => {
        if (group.selectedPhotos && group.selectedPhotos.length > 0) {
          allSelectedPhotos.push(...group.selectedPhotos)
        }
      })

      // 触发删除
      this.$emit('delete-photos', allSelectedPhotos)

      // 清除所有选择
      if (this.$refs.duplicateGroups) {
        this.$refs.duplicateGroups.forEach(groupRef => {
          if (groupRef.clearSelection) {
            groupRef.clearSelection()
          }
        })
      }
    },

    handleDeletePhotos(photoIds) {
      this.$emit('delete-photos', photoIds)
    },

    handleSelectionChange(selectionData) {
      // 更新对应组的选中状态
      this.groupSelections[selectionData.groupIndex] = {
        selectedCount: selectionData.selectedCount,
        selectedPhotos: selectionData.selectedPhotos,
      }
    },
  },
}
</script>

<style scoped>
.duplicate-results {
  max-width: 1200px;
  margin: 0 auto;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-2xl);
  gap: var(--spacing-xl);
}

.results-summary h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.summary-stats {
  display: flex;
  gap: var(--spacing-md);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-color: var(--bg-primary);
  border-radius: 12px;
  padding: var(--spacing-sm) var(--spacing-xs);
  transition: transform 0.2s ease;
  min-width: 80px;
}

.stat-item:hover {
  transform: scale(1.02);
}

.stat-value {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: var(--font-weight-normal);
}

.results-actions {
  display: flex;
  gap: var(--spacing-md);
  flex-shrink: 0;
}

.no-results {
  text-align: center;
  padding: var(--spacing-4xl) var(--spacing-xl);
  background: var(--bg-secondary);
  border-radius: var(--radius-large);
}

.no-results-icon {
  margin-bottom: var(--spacing-xl);
}

.no-results h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.no-results p {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: 1.5;
}

.results-content {
  margin-bottom: var(--spacing-2xl);
}

.results-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl);
  background: var(--bg-secondary);
  border-radius: var(--radius-large);
}

.pagination-info {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .results-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-lg);
  }

  .summary-stats {
    justify-content: center;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
  }

  .results-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .results-footer {
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
  }
}
</style>
