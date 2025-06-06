<template>
  <div class="photo-card-wrapper">
    <sf-card class="photo-card" :class="{ 'selected': selected }" hoverable shadow="small"
      @click="$emit('select', photo)">
      <div class="photo-thumbnail">
        <img :src="photoUrl" :alt="photoName" loading="lazy" @error="handleImageError" />
        <div v-if="selected" class="photo-select-overlay">
          <div class="select-checkbox selected">
            <i class="fas fa-check"></i>
          </div>
        </div>
      </div>
      <div class="photo-info">
        <h3 class="photo-title">{{ photoName }}</h3>
        <div class="photo-details">
          <span class="file-size">{{ fileSize }}</span>
          <span class="separator">•</span>
          <span class="dimensions">{{ dimensions }}</span>
        </div>
        <p class="photo-date">{{ formatDate }}</p>
      </div>
    </sf-card>
  </div>
</template>

<script>
import SfCard from '@/components/ui/SfCard.vue'

export default {
  name: 'DuplicateItem',
  components: {
    SfCard
  },
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
      return this.photo.url || this.photo.thumbnailUrl
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
      return this.photo.filename || this.photo.name || this.photo.title || `图片-${this.photoId}`
    },
    fileSize() {
      const size = this.photo.fileSize || this.photo.size
      if (!size) return '未知大小'

      if (size > 1024 * 1024) {
        return `${(size / (1024 * 1024)).toFixed(1)} MB`
      } else if (size > 1024) {
        return `${(size / 1024).toFixed(1)} KB`
      }
      return `${size} B`
    },
    dimensions() {
      const width = this.photo.width
      const height = this.photo.height

      if (width && height) {
        return `${width} × ${height}`
      }
      return '未知尺寸'
    },
    formatDate() {
      const dateString = this.photo.takenAt || this.photo.createdAt || this.photo.uploadedAt
      if (!dateString) return '未知日期'

      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }
  },
  methods: {
    handleImageError() {
      this.imageError = true
    }
  }
}
</script>

<style scoped>
.photo-card-wrapper {
  position: relative;
  will-change: transform;
  padding: 5px;
  margin-bottom: 10px;
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

.photo-card {
  overflow: hidden;
  cursor: pointer;
  background-color: var(--bg-primary);
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1),
    box-shadow 0.3s cubic-bezier(0.25, 1, 0.5, 1),
    background-color 0.3s ease;
}

.photo-card:hover {
  transform: scale(1.02) translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.07);
  z-index: 1;
}

.photo-card.selected {
  outline: var(--color-primary) solid 2px;
}

.photo-thumbnail {
  position: relative;
  height: 220px;
  overflow: hidden;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-medium);
}

.photo-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
}

.photo-card:hover .photo-thumbnail img {
  transform: scale(1.05);
}

.photo-select-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: var(--spacing-md);
  background: linear-gradient(to bottom, transparent 70%, rgba(0, 0, 0, 0.3));
  z-index: 2;
  transition: background 0.3s ease;
}

.select-checkbox {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid white;
  background-color: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.select-checkbox.selected {
  background-color: var(--color-primary);
  border: none;
  transform: scale(1.1);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.select-checkbox i {
  color: white;
  font-size: 12px;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.select-checkbox.selected i {
  opacity: 1;
  transform: scale(1);
}

.photo-info {
  padding: var(--spacing-md) var(--spacing-lg);
}

.photo-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-2xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-primary);
}

.photo-details {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-2xs);
}

.separator {
  margin: 0 var(--spacing-2xs);
}

.photo-date {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}
</style>
