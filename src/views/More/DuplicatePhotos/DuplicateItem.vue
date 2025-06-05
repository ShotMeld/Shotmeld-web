<template>
  <div 
    class="duplicate-item" 
    :class="{ 'selected': selected }"
    @click="$emit('select', photo)"
  >
    <div class="photo-container">
      <img
        :src="photoUrl"
        :alt="`图片 ${photoName}`"
        class="photo-image"
        @error="handleImageError"
      />
      
      <div v-if="selected" class="selection-overlay">
        <div class="checkmark">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/>
          </svg>
        </div>
      </div>
      
      <div class="photo-overlay">
        <div class="photo-actions">
          <button 
            class="action-btn preview-btn"
            @click.stop="previewPhoto"
            title="预览"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
          
          <button 
            class="action-btn download-btn"
            @click.stop="downloadPhoto"
            title="下载"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <div class="photo-info">
      <div class="photo-name">{{ photoName }}</div>
      <div class="photo-details">
        <span class="file-size">{{ fileSize }}</span>
        <span class="separator">•</span>
        <span class="dimensions">{{ dimensions }}</span>
      </div>
      <div class="photo-date">{{ formatDate }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DuplicateItem',
  props: {
    photo: {
      type: Object,
      required: true
    },
    selected: {
      type: Boolean,
      default: false
    }
  },
  emits: ['select'],
  data() {
    return {
      imageError: false
    }
  },
  computed: {
    photoId() {
      return this.photo.id || this.photo.filename || 'unknown'
    },
    photoUrl() {
      if (this.imageError) {
        return this.placeholderUrl
      }
      // 使用真实的图片URL
      return this.photo.url || this.photo.thumbnailUrl || this.photo.previewUrl || this.placeholderUrl
    },
    placeholderUrl() {
      return 'data:image/svg+xml;base64,' + btoa(`
        <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f5f5f7"/>
          <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#86868b" text-anchor="middle" dy="0.3em">
            图片加载失败
          </text>
        </svg>
      `)
    },
    photoName() {
      return this.photo.title || this.photo.filename || this.photo.name || `图片 ${this.photoId}`
    },
    fileSize() {
      const bytes = this.photo.fileSize || this.photo.size || 0
      if (bytes > 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      } else if (bytes > 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`
      }
      return `${bytes} B`
    },
    dimensions() {
      const width = this.photo.width || this.photo.metadata?.width || 0
      const height = this.photo.height || this.photo.metadata?.height || 0
      return `${width} × ${height}`
    },
    formatDate() {
      const dateStr = this.photo.createdAt || this.photo.takenAt || this.photo.date
      if (!dateStr) return '未知日期'
      
      const date = new Date(dateStr)
      return date.toLocaleDateString('zh-CN')
    }
  },
  methods: {
    handleImageError() {
      this.imageError = true
    },
    previewPhoto() {
      // 实现预览功能
      console.log('预览图片:', this.photoId)
    },
    downloadPhoto() {
      // 实现下载功能
      console.log('下载图片:', this.photoId)
    }
  }
}
</script>

<style scoped>
.duplicate-item {
  background: var(--bg-primary);
  border-radius: var(--radius-medium);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-base);
  border: 2px solid transparent;
}

.duplicate-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.duplicate-item.selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-subtle);
}

.photo-container {
  position: relative;
  width: 100%;
  height: 150px;
  overflow: hidden;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-base);
}

.duplicate-item:hover .photo-image {
  transform: scale(1.05);
}

.selection-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 122, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkmark {
  background: var(--color-primary);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-medium);
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1), transparent, rgba(0,0,0,0.3));
  opacity: 0;
  transition: opacity var(--transition-base);
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: var(--spacing-sm);
}

.duplicate-item:hover .photo-overlay {
  opacity: 1;
}

.photo-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.action-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: var(--radius-small);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-base);
  color: var(--text-primary);
}

.action-btn:hover {
  background: white;
  transform: scale(1.1);
}

.photo-info {
  padding: var(--spacing-md);
}

.photo-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-2xs);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.photo-details {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-2xs);
}

.separator {
  margin: 0 var(--spacing-2xs);
}

.photo-date {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

@media (max-width: 768px) {
  .photo-container {
    height: 120px;
  }
  
  .photo-info {
    padding: var(--spacing-sm);
  }
  
  .action-btn {
    width: 28px;
    height: 28px;
  }
}
</style>
