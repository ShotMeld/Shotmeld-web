<template>
  <sf-modal
    v-model="isOpen"
    class="photo-viewer"
    :show-close="false"
    @close="$emit('close')"
  >
    <div class="photo-viewer__container">
      <div class="photo-viewer__main">
        <div class="photo-viewer__image-container">
          <img
            :src="currentPhoto.url"
            :alt="currentPhoto.description || currentPhoto.title"
            class="photo-viewer__image"
          >
        </div>
        
        <div class="photo-viewer__controls">
          <button
            class="photo-viewer__control"
            :disabled="currentIndex === 0"
            @click="previousPhoto"
          >
            <span class="photo-viewer__control-icon">←</span>
          </button>
          <button
            class="photo-viewer__control"
            :disabled="currentIndex === photos.length - 1"
            @click="nextPhoto"
          >
            <span class="photo-viewer__control-icon">→</span>
          </button>
        </div>
      </div>

      <div class="photo-viewer__sidebar">
        <div class="photo-viewer__header">
          <h2 class="photo-viewer__title">
            {{ currentPhoto.title || '未命名照片' }}
          </h2>
          <button class="photo-viewer__close" @click="$emit('close')">
            ×
          </button>
        </div>

        <div class="photo-viewer__info">
          <div v-if="currentPhoto.description" class="photo-viewer__description">
            {{ currentPhoto.description }}
          </div>

          <div class="photo-viewer__meta">
            <div class="photo-viewer__meta-item">
              <span class="photo-viewer__meta-label">拍摄时间</span>
              <span class="photo-viewer__meta-value">
                {{ formatDate(currentPhoto.takenAt) }}
              </span>
            </div>

            <div class="photo-viewer__meta-item">
              <span class="photo-viewer__meta-label">上传时间</span>
              <span class="photo-viewer__meta-value">
                {{ formatDate(currentPhoto.createdAt) }}
              </span>
            </div>

            <div class="photo-viewer__meta-item">
              <span class="photo-viewer__meta-label">文件大小</span>
              <span class="photo-viewer__meta-value">
                {{ formatFileSize(currentPhoto.fileSize) }}
              </span>
            </div>

            <div class="photo-viewer__meta-item">
              <span class="photo-viewer__meta-label">分辨率</span>
              <span class="photo-viewer__meta-value">
                {{ currentPhoto.width }} × {{ currentPhoto.height }}
              </span>
            </div>
          </div>

          <div v-if="currentPhoto.tags && currentPhoto.tags.length > 0" class="photo-viewer__tags">
            <span
              v-for="tag in currentPhoto.tags"
              :key="tag"
              class="photo-viewer__tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </sf-modal>
</template>

<script>
import SfModal from '../ui/SfModal.vue'

export default {
  name: 'PhotoViewer',
  components: {
    SfModal
  },
  props: {
    photo: {
      type: Object,
      required: true
    },
    photos: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      currentIndex: 0
    }
  },
  computed: {
    isOpen: {
      get() {
        return true
      },
      set() {
        this.$emit('close')
      }
    },
    currentPhoto() {
      return this.photos[this.currentIndex]
    }
  },
  watch: {
    photo: {
      immediate: true,
      handler(newPhoto) {
        this.currentIndex = this.photos.findIndex(p => p.id === newPhoto.id)
      }
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return '未知'
      return new Date(date).toLocaleString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    formatFileSize(bytes) {
      if (!bytes) return '未知'
      const units = ['B', 'KB', 'MB', 'GB']
      let size = bytes
      let unitIndex = 0
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
      }
      return `${size.toFixed(1)} ${units[unitIndex]}`
    },
    previousPhoto() {
      if (this.currentIndex > 0) {
        this.currentIndex--
      }
    },
    nextPhoto() {
      if (this.currentIndex < this.photos.length - 1) {
        this.currentIndex++
      }
    }
  }
}
</script>

<style scoped>
.photo-viewer {
  --photo-viewer-width: 90vw;
  --photo-viewer-height: 90vh;
  --photo-viewer-sidebar-width: 320px;
}

.photo-viewer :deep(.sf-modal__container) {
  width: var(--photo-viewer-width);
  height: var(--photo-viewer-height);
  max-width: none;
  max-height: none;
  padding: 0;
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.photo-viewer__container {
  display: flex;
  width: 100%;
  height: 100%;
}

.photo-viewer__main {
  flex: 1;
  position: relative;
  background: var(--bg-tertiary);
  overflow: hidden;
}

.photo-viewer__image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-viewer__image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.photo-viewer__controls {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 var(--spacing-lg);
  pointer-events: none;
}

.photo-viewer__control {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  transition: background-color 0.2s ease;
}

.photo-viewer__control:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.7);
}

.photo-viewer__control:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.photo-viewer__control-icon {
  font-size: 24px;
  line-height: 1;
}

.photo-viewer__sidebar {
  width: var(--photo-viewer-sidebar-width);
  background: var(--bg-primary);
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.photo-viewer__header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.photo-viewer__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
  padding-right: var(--spacing-lg);
}

.photo-viewer__close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  border: none;
  color: var(--text-primary);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.photo-viewer__close:hover {
  background: var(--bg-quaternary);
}

.photo-viewer__info {
  flex: 1;
  padding: var(--spacing-lg);
  overflow-y: auto;
}

.photo-viewer__description {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
  line-height: 1.6;
}

.photo-viewer__meta {
  margin-bottom: var(--spacing-xl);
}

.photo-viewer__meta-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-color);
}

.photo-viewer__meta-item:last-child {
  border-bottom: none;
}

.photo-viewer__meta-label {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

.photo-viewer__meta-value {
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.photo-viewer__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.photo-viewer__tag {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
}

@media (max-width: 768px) {
  .photo-viewer {
    --photo-viewer-sidebar-width: 100%;
  }

  .photo-viewer__container {
    flex-direction: column;
  }

  .photo-viewer__main {
    height: 60vh;
  }

  .photo-viewer__sidebar {
    height: 40vh;
    border-left: none;
    border-top: 1px solid var(--border-color);
  }
}
</style> 