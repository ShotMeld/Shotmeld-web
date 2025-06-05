<template>
  <sf-card class="duplicate-group" shadow="medium" hoverable>
    <template #header>
      <div class="group-header">
        <div class="group-info">
          <h3>相似图片组 {{ groupIndex + 1 }}</h3>
          <span class="photo-count">{{ photos.length }} 张图片</span>
        </div>
        <div class="group-actions">
          <sf-button
            type="text"
            size="small"
            @click="selectAll"
            :disabled="isAllSelected"
          >
            全选
          </sf-button>
          <sf-button
            type="text"
            size="small"
            @click="clearSelection"
            :disabled="selectedCount === 0"
          >
            清除选择
          </sf-button>
          <sf-button
            type="danger"
            size="small"
            @click="deleteSelected"
            :disabled="selectedCount === 0"
          >
            删除选中 ({{ selectedCount }})
          </sf-button>
        </div>
      </div>
    </template>

    <div class="photo-grid">
      <DuplicateItem
        v-for="photo in photos"
        :key="photo.id || photo.filename"
        :photo="photo"
        :selected="isPhotoSelected(photo)"
        @select="toggleSelection"
      />
    </div>

    <template #footer>
      <div class="group-stats">
        <span class="similarity-info">
          相似度: <strong>{{ similarity }}%</strong>
        </span>
        <span class="space-info">
          可释放空间: <strong>{{ estimatedSpace }}</strong>
        </span>
      </div>
    </template>
  </sf-card>
</template>

<script>
import SfCard from '@/components/ui/SfCard.vue'
import SfButton from '@/components/ui/SfButton.vue'
import DuplicateItem from './DuplicateItem.vue'

export default {
  name: 'DuplicateGroup',
  components: {
    SfCard,
    SfButton,
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
      default: 95
    }
  },
  emits: ['delete-photos'],
  data() {
    return {
      selectedPhotos: []
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
    async deleteSelected() {
      if (this.selectedCount === 0) return
      
      try {
        // 使用Element Plus的确认对话框
        await this.$confirm(
          `确定要删除选中的 ${this.selectedCount} 张图片吗？此操作不可恢复。`,
          '确认删除',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        this.$emit('delete-photos', this.selectedPhotos)
        this.selectedPhotos = []
      } catch (error) {
        // 用户取消删除，不需要处理
      }
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

.photo-count {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.group-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
  padding: var(--spacing-md) 0;
}

.group-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.similarity-info strong,
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
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--spacing-sm);
  }
  
  .group-stats {
    flex-direction: column;
    gap: var(--spacing-xs);
    text-align: center;
  }
}
</style>
