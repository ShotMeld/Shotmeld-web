<template>
  <sf-card class="duplicate-group" shadow="medium" hoverable>
    <template #header>
      <div class="group-header">
        <div class="group-info">
          <h3>{{ $t('duplicatePhotos.group.title', { index: groupIndex + 1 }) }}</h3>
          <span class="group-count">{{ $t('duplicatePhotos.group.count', { count: photos.length }) }}</span>
          <span class="group-similarity">{{ $t('duplicatePhotos.group.similarity', { percent: similarity }) }}</span>
        </div>
        <div class="group-actions">
          <sf-button type="text" size="small" @click="selectAll" :disabled="isAllSelected">
            全选
          </sf-button>
          <sf-button type="text" size="small" @click="clearSelection" :disabled="selectedCount === 0">
            清除选择
          </sf-button>
          <sf-button type="danger" size="small" @click="deleteSelected" :disabled="selectedCount === 0">
            删除选中 ({{ selectedCount }})
          </sf-button>
        </div>
      </div>
    </template>

    <div class="photo-grid">
      <DuplicateItem v-for="photo in photos" :key="photo.id || photo.filename" :photo="photo"
        :selected="isPhotoSelected(photo)" @select="toggleSelection" />
    </div>

    <template #footer>
      <div class="group-stats">
        <span class="photo-count">
          {{ photos.length }} 张图片
        </span>
        <span class="space-info">
          可释放空间: <strong>{{ estimatedSpace }}</strong>
        </span>
      </div>
    </template>

    <!-- 删除确认对话框 -->
    <sf-delete-confirm-modal v-model="showDeleteModal" item-name="图片" :count="selectedCount"
      @confirm="confirmDeleteSelected" />
  </sf-card>
</template>

<script>
import SfCard from '@/components/ui/SfCard.vue'
import SfButton from '@/components/ui/SfButton.vue'
import SfDeleteConfirmModal from '@/components/ui/SfDeleteConfirmModal.vue'
import DuplicateItem from './DuplicateItem.vue'

export default {
  name: 'DuplicateGroup',
  components: {
    SfCard,
    SfButton,
    SfDeleteConfirmModal,
    DuplicateItem
  },
  props: {
    photos: {
      type: Array,
      required: true
    },
    groupIndex: {
      type: Number,
      required: true
    },
    similarity: {
      type: Number,
      required: true
    }
  },
  emits: ['delete-photos', 'selection-change'],
  data() {
    return {
      selectedPhotos: [],
      showDeleteModal: false // 控制删除确认对话框显示
    }
  },
  watch: {
    selectedPhotos: {
      handler(newSelected) {
        // 通知父组件选中状态变化
        this.$emit('selection-change', {
          groupIndex: this.groupIndex,
          selectedCount: newSelected.length,
          selectedPhotos: [...newSelected]
        })
      },
      immediate: true,
      deep: true
    }
  },
  computed: {
    selectedCount() {
      return this.selectedPhotos.length
    },
    isAllSelected() {
      return this.selectedPhotos.length === this.photos.length
    },
    estimatedSpace() {
      // 计算选中照片的总大小
      const totalBytes = this.selectedPhotos.reduce((total, photo) => {
        return total + (photo.fileSize || photo.size || 2500000) // 默认2.5MB
      }, 0)

      if (totalBytes > 1024 * 1024 * 1024) {
        return `${(totalBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
      } else if (totalBytes > 1024 * 1024) {
        return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`
      }
      return `${(totalBytes / 1024).toFixed(1)} KB`
    }
  },
  methods: {
    getPhotoId(photo) {
      return photo.id || photo.filename || photo.name
    },
    isPhotoSelected(photo) {
      const photoId = this.getPhotoId(photo)
      return this.selectedPhotos.some(selected => this.getPhotoId(selected) === photoId)
    },
    toggleSelection(photo) {
      const photoId = this.getPhotoId(photo)
      const index = this.selectedPhotos.findIndex(selected => this.getPhotoId(selected) === photoId)

      if (index > -1) {
        this.selectedPhotos.splice(index, 1)
      } else {
        this.selectedPhotos.push(photo)
      }
    },
    selectAll() {
      this.selectedPhotos = [...this.photos]
    },
    clearSelection() {
      this.selectedPhotos = []
    },
    smartSelect() {
      // 智能推荐：保留体积最大的图片，选择其他图片删除
      if (this.photos.length <= 1) return

      // 找到体积最大的图片
      const largestPhoto = this.photos.reduce((largest, current) => {
        const currentSize = current.fileSize || current.size || 0
        const largestSize = largest.fileSize || largest.size || 0

        if (currentSize > largestSize) {
          return current
        } else if (currentSize === largestSize) {
          // 如果体积相同，随机选择一张
          return Math.random() > 0.5 ? current : largest
        }
        return largest
      })

      // 选择除了最大体积之外的所有图片
      this.selectedPhotos = this.photos.filter(photo =>
        this.getPhotoId(photo) !== this.getPhotoId(largestPhoto)
      )
    },
    smartSelectByResolution() {
      // 智能推荐：保留像素最高的图片，选择其他图片删除
      if (this.photos.length <= 1) return

      // 找到像素最高的图片
      const highestPixelPhoto = this.photos.reduce((highest, current) => {
        const currentPixels = (current.width || 1920) * (current.height || 1080)
        const highestPixels = (highest.width || 1920) * (highest.height || 1080)

        if (currentPixels > highestPixels) {
          return current
        } else if (currentPixels === highestPixels) {
          // 像素相同时，选择文件大小更大的
          const currentSize = current.fileSize || current.size || 0
          const highestSize = highest.fileSize || highest.size || 0
          return currentSize > highestSize ? current : highest
        }
        return highest
      })

      // 选择除了像素最高之外的所有图片
      this.selectedPhotos = this.photos.filter(photo =>
        this.getPhotoId(photo) !== this.getPhotoId(highestPixelPhoto)
      )
    },
    async deleteSelected() {
      if (this.selectedCount === 0) return

      // 显示删除确认对话框
      this.showDeleteModal = true
    },

    confirmDeleteSelected() {
      // 确认删除选中的图片
      this.$emit('delete-photos', this.selectedPhotos)
      this.selectedPhotos = []
    }
  }
}
</script>

<style scoped>
.duplicate-group {
  margin-bottom: var(--spacing-xl);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.group-info h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-2xs);
}

.group-count,
.group-similarity {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
}

.group-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  padding: var(--spacing-md) 0;
}

.group-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.space-info strong {
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .group-header {
    flex-direction: column;
    align-items: stretch;
  }

  .group-actions {
    justify-content: center;
  }

  .photo-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--spacing-md);
  }

  .group-stats {
    flex-direction: column;
    gap: var(--spacing-xs);
    text-align: center;
  }
}
</style>
