<!--
  PhotoWallGrid.vue - 照片墙/照片网格展示区
-->

<template>
  <div class="photos-grid">
    <PhotoWallNoPhotos v-if="photos.length === 0" @showUploadModal="$emit('showUploadModal')" />
    <transition-group name="photo-grid" tag="div" class="photo-grid-container">
      <div v-for="photo in photos" :key="photo.id" class="photo-card-wrapper">
        <SfCard
          class="photo-card"
          :class="{ 'manage-mode': isManageMode, selected: isSelected(photo.id) }"
          hoverable
          shadow="small"
          @click="handleCardClick(photo)"
        >
          <div class="photo-thumbnail">
            <img
              :src="photo.thumbnailUrl || photo.url"
              :alt="photo.title || $t('photoWall.noTitle')"
              loading="lazy"
            />
            <div
              v-if="isManageMode"
              class="photo-select-overlay"
              @click.stop="toggleSelect(photo.id)"
            >
              <div class="select-checkbox" :class="{ selected: isSelected(photo.id) }">
                <i v-if="isSelected(photo.id)" class="fas fa-check"></i>
              </div>
            </div>
          </div>
          <div class="photo-info">
            <h3 class="photo-title">{{ photo.title || $t('photoWall.noTitle') }}</h3>
            <p class="photo-date">{{ formatDate(photo.takenAt) }}</p>
          </div>
        </SfCard>
      </div>
    </transition-group>
  </div>
</template>

<script>
import PhotoWallNoPhotos from './PhotoWallNoPhotos.vue'
import { SfCard } from '../../components/ui'

export default {
  name: 'PhotoWallGrid',
  components: {
    PhotoWallNoPhotos,
  },
  props: {
    photos: {
      type: Array,
      required: true,
    },
    isManageMode: {
      type: Boolean,
      default: false,
    },
    selectedPhotos: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['openPhotoDetail', 'showUploadModal', 'toggleSelect'],
  methods: {
    formatDate(dateString) {
      if (!dateString) return this.$t('photoWall.unknownDate')
      const date = new Date(dateString)
      return date.toLocaleDateString(this.$i18n.locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
    handleCardClick(photo) {
      // 在管理模式下点击卡片切换选择状态，非管理模式下打开照片详情
      if (this.isManageMode) {
        this.toggleSelect(photo.id)
      } else {
        this.$emit('openPhotoDetail', photo)
      }
    },
    toggleSelect(photoId) {
      this.$emit('toggleSelect', photoId)
    },
    isSelected(photoId) {
      return this.selectedPhotos.includes(photoId)
    },
  },
}
</script>

<style scoped>
.photos-grid {
  margin-bottom: var(--spacing-xl);
  position: relative;
}

.photo-grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

/* Photo Grid Animation */
.photo-grid-enter-active,
.photo-grid-leave-active {
  transition:
    opacity 0.4s ease,
    transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.photo-grid-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.photo-grid-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.9);
}

.photo-grid-move {
  /* Simplify and try to make more robust */
  transition: transform 0.6s ease; /* Using simple 'ease' for now */
}

.photo-card-wrapper {
  position: relative;
  will-change: transform;
  padding: 5px;
  margin-bottom: 10px;
  /* Promote to its own layer and try to prevent flickering */
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

.photo-card {
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 0.3s cubic-bezier(0.25, 1, 0.5, 1),
    box-shadow 0.3s cubic-bezier(0.25, 1, 0.5, 1),
    background-color 0.3s ease;
}

.photo-card:not(.manage-mode):hover {
  transform: scale(1.02) translateY(-5px);
  box-shadow:
    0 12px 24px rgba(0, 0, 0, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.07);
  z-index: 1;
}

.photo-card.manage-mode {
  transform: scale(0.98);
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
}

.photo-card.manage-mode.selected {
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

.photo-card:not(.manage-mode):hover .photo-thumbnail img {
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

.photo-date {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}
</style>
