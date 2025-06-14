<!--
  AlbumCard.vue - 相册卡片组件
-->

<template>
  <SfCard
    class="album-card"
    :class="{ 'manage-mode': isManageMode, selected: isSelected }"
    @click="$emit('click')"
  >
    <div class="album-card__cover">
      <div v-if="hasPhoto" class="album-card__image-container">
        <img :src="coverImage" :alt="album.name" class="album-card__image" />
      </div>
      <div v-else class="album-card__empty">
        <div class="album-card__empty-icon">
          <i class="fas fa-images"></i>
        </div>
        <span class="album-card__empty-text">{{ $t('albumCard.noPhotos') }}</span>
      </div>
      <div v-if="hasPhoto" class="album-card__overlay">
        <div class="album-card__info">
          <span class="album-card__count">
            {{ $t('albumCard.photoCount', { count: album.photoCount }) }}
          </span>
        </div>
      </div>
      <!-- 悬停时显示的更改封面按钮 -->
      <div v-if="hasPhoto && !isManageMode" class="album-card__hover-actions">
        <button
          class="change-cover-btn"
          @click.stop="$emit('change-cover', album.id)"
          :title="$t('albumCard.changeCover')"
        >
          <i class="fas fa-image"></i>
          <span>{{ $t('albumCard.changeCover') }}</span>
        </button>
      </div>

      <div
        v-if="isManageMode"
        class="album-card__select-overlay"
        @click.stop="$emit('toggleSelect', album.id)"
      >
        <div class="select-checkbox" :class="{ selected: isSelected }">
          <i v-if="isSelected" class="fas fa-check"></i>
        </div>
      </div>
    </div>
    <div class="album-card__content">
      <h3 class="album-card__title">{{ album.name }}</h3>
      <p v-if="album.description" class="album-card__description">
        {{ album.description }}
      </p>
      <p class="album-card__date">{{ formatDate(album.createdAt) }}</p>
    </div>
  </SfCard>
</template>

<script>
import SfCard from '../ui/SfCard.vue'
import { photoService } from '../../api'

export default {
  name: 'AlbumCard',
  components: {
    SfCard,
  },
  props: {
    album: {
      type: Object,
      required: true,
    },
    isManageMode: {
      type: Boolean,
      default: false,
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      photoDetails: {},
    }
  },
  computed: {
    hasPhoto() {
      // 检查是否有封面照片或相册中的照片
      return (this.album.coverPhotoId && this.photoDetails[this.album.coverPhotoId]?.thumbnailUrl) ||
             (this.album.photos && this.album.photos.length > 0 && this.photoDetails[this.album.photos[0]]?.thumbnailUrl)
    },
    coverImage() {
      // 如果有封面照片ID，使用封面照片的缩略图
      if (this.album.coverPhotoId && this.photoDetails[this.album.coverPhotoId]?.thumbnailUrl) {
        return this.photoDetails[this.album.coverPhotoId].thumbnailUrl
      }
      // 如果有照片列表，使用第一张照片的缩略图
      if (this.album.photos && this.album.photos.length > 0) {
        const firstPhotoId = this.album.photos[0]
        if (this.photoDetails[firstPhotoId]?.thumbnailUrl) {
          return this.photoDetails[firstPhotoId].thumbnailUrl
        }
      }
      return null
    },
  },
  watch: {
    'album.photos': {
      immediate: true,
      handler(newPhotos) {
        if (newPhotos && newPhotos.length > 0) {
          this.fetchPhotoDetails()
        }
      },
    },
    'album.coverPhotoId': {
      immediate: true,
      handler(newCoverPhotoId) {
        if (newCoverPhotoId) {
          this.fetchPhotoDetails()
        }
      },
    },
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString(this.$i18n.locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    },
    async fetchPhotoDetails() {
      try {
        // 获取需要查询的照片ID列表
        const photoIds = new Set()
        if (this.album.coverPhotoId) {
          photoIds.add(this.album.coverPhotoId)
        }
        if (this.album.photos && this.album.photos.length > 0) {
          photoIds.add(this.album.photos[0])
        }

        // 过滤掉已经获取过的照片
        const idsToFetch = Array.from(photoIds).filter(id => !this.photoDetails[id])

        if (idsToFetch.length === 0) return

        // 获取照片详情
        const response = await photoService.getPhotos({ ids: idsToFetch })
        if (response.data.data) {
          response.data.data.forEach(photo => {
            this.photoDetails[photo.id] = photo
          })
        }
      } catch (error) {
        console.error(this.$t('photoWall.error.fetchFailed'), error)
      }
    },
  },
}
</script>

<style scoped>
.album-card {
  cursor: pointer;
  overflow: hidden;
  transition:
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.album-card:not(.manage-mode):hover {
  transform: scale(1.02) translateY(-5px);
  box-shadow:
    0 12px 24px rgba(0, 0, 0, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.07);
}

.album-card.manage-mode {
  transform: scale(0.98);
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
}

.album-card.manage-mode.selected {
  outline: var(--color-primary) solid 2px;
}

.album-card__cover {
  position: relative;
  height: 220px;
  overflow: hidden;
  background-color: var(--bg-hover);
  border-radius: var(--radius-medium);
}

.album-card__image-container {
  width: 100%;
  height: 100%;
}

.album-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.33, 1, 0.68, 1);
}

.album-card:not(.manage-mode):hover .album-card__image {
  transform: scale(1.05);
}

.album-card__empty {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  gap: var(--spacing-sm);
}

.album-card__empty-icon {
  font-size: 3rem;
  opacity: 0.6;
}

.album-card__empty-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  opacity: 0.8;
}

.album-card__overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-md);
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: white;
}

.album-card__info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.album-card__count {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.album-card__hover-actions {
  position: absolute;
  top: var(--spacing-sm);
  left: var(--spacing-sm);
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 2;
}

.album-card:hover .album-card__hover-actions {
  opacity: 1;
  transform: translateY(0);
}

.change-cover-btn {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border: none;
  border-radius: var(--radius-small);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
}

.change-cover-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.05);
}

.change-cover-btn i {
  font-size: var(--font-size-xs);
}

.album-card__select-overlay {
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

.album-card__content {
  padding: var(--spacing-md) var(--spacing-lg);
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.album-card__title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-2xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-primary);
}

.album-card__description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.album-card__date {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin: 0;
  margin-top: auto;
}

@media (max-width: 768px) {
  .album-card__content {
    padding: var(--spacing-sm);
  }

  .album-card__title {
    font-size: var(--font-size-md);
  }
}
</style>
