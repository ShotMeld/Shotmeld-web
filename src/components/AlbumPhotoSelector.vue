<!--
  AlbumPhotoSelector.vue - 相册照片选择器组件
  专门用于从指定相册中选择照片作为封面
-->

<template>
  <div class="album-photo-selector">
    <div class="photo-grid-container" v-if="!loading">
      <div v-if="photos.length === 0" class="no-photos">
        <div class="no-photos-icon">
          <i class="fas fa-images"></i>
        </div>
        <p class="no-photos-text">{{ $t('changeCover.noPhotos.title') }}</p>
        <p class="no-photos-hint">{{ $t('changeCover.noPhotos.hint') }}</p>
      </div>
      <div v-else class="photo-grid">
        <div
          v-for="photo in photos"
          :key="photo.id"
          class="photo-item"
          :class="{
            selected: selectedPhotoId === photo.id,
          }"
          @click="selectPhoto(photo.id)"
        >
          <div class="photo-thumbnail">
            <img
              :src="photo.thumbnailUrl || photo.url"
              :alt="photo.title || $t('changeCover.photo.untitled')"
              loading="lazy"
            />
            <div v-if="selectedPhotoId === photo.id" class="selection-indicator">
              <i class="fas fa-check"></i>
            </div>
          </div>
          <div class="photo-info">
            <div class="photo-title">{{ photo.title || $t('changeCover.photo.untitled') }}</div>
            <div class="photo-date">{{ formatDate(photo.takenAt || photo.createdAt) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
      <p class="loading-text">{{ $t('changeCover.loading') }}</p>
    </div>

    <!-- 分页控制 -->
    <div class="selector-footer" v-if="totalPages > 1">
      <div class="pagination">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage <= 1"
          class="page-btn prev-btn"
        >
          <i class="fas fa-chevron-left"></i>
          {{ $t('changeCover.pagination.prev') }}
        </button>
        <div class="page-info">
          {{ $t('changeCover.pagination.pageInfo', { current: currentPage, total: totalPages }) }}
        </div>
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage >= totalPages"
          class="page-btn next-btn"
        >
          {{ $t('changeCover.pagination.next') }}
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>    <!-- 底部操作按钮 -->
    <div class="selector-actions" v-if="!hideActions">
      <SfButton type="secondary" @click="$emit('cancel')">
        {{ $t('changeCover.cancel') }}
      </SfButton>
      <SfButton 
        type="primary" 
        @click="confirmSelection"
        :disabled="!selectedPhotoId"
      >
        {{ $t('changeCover.confirm') }}
      </SfButton>
    </div>
  </div>
</template>

<script>
import { albumService } from '../api'
import SfButton from './ui/SfButton.vue'

export default {
  name: 'AlbumPhotoSelector',
  components: {
    SfButton,
  },
  props: {
    albumId: {
      type: String,
      required: true,
    },
    hideActions: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['photo-selected', 'cancel'],
  data() {
    return {
      photos: [],
      selectedPhotoId: null,
      loading: false,
      currentPage: 1,
      pageSize: 24, // 6x4 网格
      total: 0,
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.pageSize)
    },
  },
  async created() {
    await this.fetchPhotos()
  },
  methods: {
    async fetchPhotos() {
      try {
        this.loading = true
        const response = await albumService.getAlbumPhotos(this.albumId, {
          page: this.currentPage,
          limit: this.pageSize,
          sortBy: 'takenAt',
          sortOrder: 'desc',
        })

        this.photos = response.data.data || []
        this.total = response.data.total || 0
      } catch (error) {
        console.error('获取相册照片失败:', error)
        this.$notify?.error({
          title: this.$t('changeCover.error.loadFailed'),
          message: this.$t('changeCover.error.loadFailedMessage'),
        })
      } finally {
        this.loading = false
      }
    },

    async goToPage(page) {
      if (page < 1 || page > this.totalPages) return
      this.currentPage = page
      await this.fetchPhotos()
    },    selectPhoto(photoId) {
      this.selectedPhotoId = photoId
      
      // 如果隐藏操作按钮，直接触发选择事件
      if (this.hideActions) {
        const selectedPhoto = this.photos.find(photo => photo.id === photoId)
        this.$emit('photo-selected', {
          photoId: photoId,
          photo: selectedPhoto
        })
      }
    },

    confirmSelection() {
      if (!this.selectedPhotoId) return
      
      const selectedPhoto = this.photos.find(photo => photo.id === this.selectedPhotoId)
      this.$emit('photo-selected', {
        photoId: this.selectedPhotoId,
        photo: selectedPhoto
      })
    },

    formatDate(dateString) {
      if (!dateString) return this.$t('changeCover.photo.unknownDate')
      const date = new Date(dateString)
      return date.toLocaleDateString(this.$i18n.locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    },
  },
}
</script>

<style scoped>
.album-photo-selector {
  display: flex;
  flex-direction: column;
  height: 600px;
  background: var(--bg-primary);
}

.photo-grid-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
  /* 使用 variables.css 中的滚动条样式 */
  scrollbar-width: var(--scrollbar-width);
  scrollbar-color: var(--scrollbar-thumb-color) var(--scrollbar-track-color);
}

.photo-grid-container::-webkit-scrollbar {
  width: var(--scrollbar-width);
}

.photo-grid-container::-webkit-scrollbar-track {
  background: var(--scrollbar-track-color);
}

.photo-grid-container::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb-color);
  border-radius: var(--scrollbar-thumb-radius);
}

.photo-grid-container::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover-color);
}

.no-photos {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: var(--spacing-3xl);
}

.no-photos-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-large);
  background: linear-gradient(135deg, var(--text-disabled) 0%, var(--text-tertiary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-lg);
  opacity: 0.8;
}

.no-photos-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-xs);
}

.no-photos-hint {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin: 0;
  line-height: 1.5;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--spacing-md);
}

.photo-item {
  position: relative;
  cursor: pointer;
  border-radius: var(--radius-medium);
  overflow: hidden;
  transition: all var(--transition-fast);
  background: var(--bg-primary);
  box-shadow: var(--shadow-small);
}

.photo-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.photo-item.selected {
  transform: scale(0.98);
  box-shadow: var(--shadow-large);
}

.photo-item.selected .photo-thumbnail {
  outline: var(--color-primary) solid 2px;
}

.photo-thumbnail {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: var(--bg-tertiary);
}

.photo-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-fast);
}

.photo-item:hover .photo-thumbnail img {
  transform: scale(1.05);
}

.selection-indicator {
  position: absolute;
  top: var(--spacing-xs);
  right: var(--spacing-xs);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  box-shadow: var(--shadow-medium);
  animation: scaleIn var(--transition-fast);
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.photo-info {
  padding: var(--spacing-sm);
  background: var(--bg-primary);
}

.photo-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-2xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.photo-date {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: var(--spacing-3xl);
  color: var(--text-secondary);
}

.loading-spinner {
  margin-bottom: var(--spacing-lg);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--bg-tertiary);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  margin: 0;
}

.selector-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.page-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-small);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.page-btn:hover:not(:disabled) {
  background: var(--bg-hover);
  border-color: var(--border-color-hover);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.selector-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  background: var(--bg-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .photo-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: var(--spacing-sm);
  }
  
  .photo-grid-container {
    padding: var(--spacing-md);
  }
  
  .pagination {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .page-btn {
    font-size: var(--font-size-xs);
    padding: var(--spacing-2xs) var(--spacing-xs);
  }
}
</style>
