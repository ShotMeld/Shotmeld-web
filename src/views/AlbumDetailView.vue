<!--
  AlbumDetailView.vue - 相册详情页
-->

<template>
  <div class="album-detail">
    <!-- 相册封面头部区域 -->
    <div class="album-header" :class="{ 'album-header--empty': !coverPhoto }">
      <div class="album-header__background">
        <div
          v-if="coverPhoto"
          class="album-header__cover"
          :style="{ backgroundImage: `url(${coverPhoto.url || coverPhoto.thumbnailUrl})` }"
        ></div>
        <div v-else class="album-header__placeholder"></div>
      </div>

      <div class="album-header__content">
        <div class="album-header__info">
          <h1 class="album-header__title">{{ album.name }}</h1>
          <p v-if="album.description" class="album-header__description">
            {{ album.description }}
          </p>
          <div class="album-header__meta">
            <span class="album-header__count">
              {{ $t('album.photoCount', { count: album.photoCount }) }}
            </span>
            <span class="album-header__date">
              {{ $t('album.createdAt', { date: formatDate(album.createdAt) }) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div :class="albumDetailContainerClass">
      <div v-if="loading" class="album-detail__loading">
        <div class="album-detail__spinner"></div>
        <p>{{ $t('common.loading') }}</p>
      </div>

      <div v-else-if="error" class="album-detail__error">
        <p>{{ error }}</p>
        <SfButton @click="fetchAlbumDetails" variant="outline">{{ $t('common.retry') }}</SfButton>
      </div>

      <div v-else>
        <!-- 批量管理工具栏 -->
        <AlbumPhotosManageToolbar
          v-if="isManageMode"
          :selectedPhotos="selectedPhotos"
          @select-all="selectAll"
          @deselect-all="deselectAll"
          @show-remove-from-album="showRemoveFromAlbumDialog"
          @show-delete-selected="showDeleteSelectedDialog"
          @show-change-cover="showChangeCoverModal = true"
          @exit-manage-mode="exitManageMode"
        />

        <PhotoWallGrid
          :photos="photos"
          :isManageMode="isManageMode"
          :selectedPhotos="selectedPhotos"
          @openPhotoDetail="openPhoto"
          @showUploadModal="showUploadModal = true"
          @toggleSelect="toggleSelectPhoto"
        />
      </div>
    </div>

    <PhotoDetail
      v-if="currentPhoto"
      v-model="showPhotoDetail"
      :photo="currentPhoto"
      @photo-deleted="deletePhoto"
      @photo-updated="handlePhotoUpdated"
      @photo-replaced="handlePhotoReplaced"
    />

    <!-- 添加照片模态框 -->
    <AddPhotosModal
      v-if="album.id"
      v-model="showUploadModal"
      :albumId="album.id"
      :existingPhotoIds="photos.map(p => p.id)"
      @photos-added="handlePhotosAdded"
    />

    <!-- 更改封面模态框 -->
    <ChangeCoverModal
      v-if="album.id"
      v-model="showChangeCoverModal"
      :albumId="album.id"
      @cover-updated="handleCoverChanged"
    />

    <!-- 批量删除确认模态框 -->
    <SfDeleteConfirmModal
      v-model="showDeleteSelectedModal"
      item-name="照片"
      :count="selectedPhotos.length"
      @confirm="deleteSelectedPhotos"
    />

    <!-- 从相册移除照片确认模态框 -->
    <SfModal v-model="showRemoveFromAlbumModal" :title="$t('album.removePhotosTitle')">
      <div class="confirm-modal-content">
        <p>
          {{
            $t('album.confirmRemovePhotos', { count: selectedPhotos.length, albumName: album.name })
          }}
        </p>
        <p class="confirm-note">{{ $t('album.removePhotosNote') }}</p>
        <div class="confirm-actions">
          <SfButton @click="showRemoveFromAlbumModal = false" type="secondary">
            {{ $t('common.cancel') }}
          </SfButton>
          <SfButton @click="removeFromAlbum" type="danger">
            {{ $t('album.confirmRemove') }}
          </SfButton>
        </div>
      </div>
    </SfModal>
  </div>
</template>

<script>
import PhotoWallGrid from './PhotoWall/PhotoWallGrid.vue'
import PhotoDetail from '../components/PhotoDetail/PhotoDetail.vue'
import AddPhotosModal from '../components/AddPhotosModal.vue'
import ChangeCoverModal from '../components/ChangeCoverModal.vue'
import SfButton from '../components/ui/SfButton.vue'
import SfModal from '../components/ui/SfModal.vue'
import SfDeleteConfirmModal from '../components/ui/SfDeleteConfirmModal.vue'
import AlbumPhotosManageToolbar from './Albums/AlbumPhotosManageToolbar.vue'
import { albumService, photoService } from '../api'
import { eventBus } from '../utils/eventBus'

export default {
  name: 'AlbumDetailView',
  components: {
    PhotoWallGrid,
    PhotoDetail,
    AddPhotosModal,
    ChangeCoverModal,
    SfButton,
    SfModal,
    SfDeleteConfirmModal,
    AlbumPhotosManageToolbar,
  },
  data() {
    return {
      album: {
        id: null,
        name: '',
        description: '',
        photoCount: 0,
        createdAt: null,
      },
      photos: [],
      coverPhoto: null, // 封面照片
      loading: false,
      error: null,
      currentPhoto: null,
      showPhotoDetail: false,
      showUploadModal: false,
      showChangeCoverModal: false,
      // 批量管理相关的状态
      isManageMode: false,
      selectedPhotos: [],
      showDeleteSelectedModal: false,
      showRemoveFromAlbumModal: false,
    }
  },
  computed: {
    albumDetailContainerClass() {
      return {
        'album-detail-container': true,
        'with-toolbar-space': this.isManageMode,
      }
    },
  },
  async created() {
    await this.fetchAlbumDetails()

    // 监听上传照片事件
    eventBus.on('show-upload-modal', () => {
      this.showUploadModal = true
    })

    // 监听管理模式切换事件
    eventBus.on('toggle-manage', () => {
      this.toggleManageMode()
    })
  },
  beforeUnmount() {
    // 清理事件监听
    eventBus.off('show-upload-modal')
    eventBus.off('toggle-manage')
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString(this.$i18n.locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    },
    async fetchAlbumDetails() {
      try {
        this.loading = true
        const albumId = this.$route.params.id
        const [albumResponse, photosResponse] = await Promise.all([
          albumService.getAlbum(albumId),
          albumService.getAlbumPhotos(albumId),
        ])
        this.album = albumResponse.data
        this.photos = photosResponse.data.data

        // 设置封面照片，优先使用相册指定的封面
        this.setCoverPhoto()
      } catch (error) {
        this.error = error.response?.data?.message || this.$t('album.fetchError')
        console.error(this.$t('album.fetchError'), error)
      } finally {
        this.loading = false
      }
    },

    openPhoto(photo) {
      this.currentPhoto = photo
      this.showPhotoDetail = true
    },

    handlePhotosAdded(result) {
      // 处理照片添加成功后的更新
      if (result.type === 'uploaded') {
        // 上传的新照片，直接添加到列表
        this.photos = [...this.photos, ...result.photos]
        this.album.photoCount = this.photos.length

        // 重新设置封面照片
        this.setCoverPhoto()
      } else if (result.type === 'existing') {
        // 现有照片添加到相册，需要重新获取相册照片
        // 这里我们可以优化，不重新获取整个相册详情，只获取照片列表
        this.fetchAlbumPhotos()
      }

      this.showUploadModal = false
    },

    setCoverPhoto() {
      // 优先使用相册指定的封面照片
      if (this.album.coverPhotoId && this.photos.length > 0) {
        const coverPhoto = this.photos.find(photo => photo.id === this.album.coverPhotoId)
        if (coverPhoto) {
          this.coverPhoto = coverPhoto
          return
        }
      }

      // 如果没有指定封面或找不到指定的封面照片，则使用第一张照片
      if (this.photos.length > 0) {
        this.coverPhoto = this.photos[0]
      }
    },

    async fetchAlbumPhotos() {
      try {
        const albumId = this.$route.params.id
        const photosResponse = await albumService.getAlbumPhotos(albumId)
        this.photos = photosResponse.data.data || []
        this.album.photoCount = this.photos.length

        // 重新设置封面照片
        this.setCoverPhoto()
      } catch (error) {
        console.error(this.$t('album.fetchPhotosError'), error)
        // 如果获取失败，回退到获取完整的相册详情
        this.fetchAlbumDetails()
      }
    },

    // 批量管理相关方法
    toggleManageMode() {
      // 立即更新UI状态，提高响应速度
      const willExit = this.isManageMode
      this.isManageMode = !this.isManageMode

      // 如果是退出管理模式，使用nextTick延迟清空选择状态
      // 这样可以先完成UI状态更新，提高响应速度
      if (willExit) {
        this.$nextTick(() => {
          this.selectedPhotos = []
        })
      }
    },

    exitManageMode() {
      // 立即更新所有状态
      this.isManageMode = false
      this.selectedPhotos = []
    },

    toggleSelectPhoto(photoId) {
      const index = this.selectedPhotos.indexOf(photoId)
      if (index === -1) {
        this.selectedPhotos.push(photoId)
      } else {
        this.selectedPhotos.splice(index, 1)
      }
    },

    selectAll() {
      this.selectedPhotos = this.photos.map(photo => photo.id)
    },

    deselectAll() {
      this.selectedPhotos = []
    },

    showRemoveFromAlbumDialog() {
      if (this.selectedPhotos.length === 0) return
      this.showRemoveFromAlbumModal = true
    },

    showDeleteSelectedDialog() {
      if (this.selectedPhotos.length === 0) return
      this.showDeleteSelectedModal = true
    },

    async removeFromAlbum() {
      if (this.selectedPhotos.length === 0) return

      try {
        await albumService.removePhotosFromAlbum(this.album.id, this.selectedPhotos)

        this.$notify({
          title: this.$t('common.success'),
          message: this.$t('album.removedPhotos', { count: this.selectedPhotos.length }),
          type: 'success',
        })

        // 从当前页面移除照片
        this.photos = this.photos.filter(photo => !this.selectedPhotos.includes(photo.id))
        this.album.photoCount = this.photos.length
        this.selectedPhotos = []
        this.showRemoveFromAlbumModal = false
      } catch (error) {
        console.error(this.$t('album.removeError'), error)
        this.$notify.error({
          title: this.$t('common.operationFailed'),
          message: error.response?.data?.message || this.$t('album.removeErrorMessage'),
        })
      }
    },

    async deleteSelectedPhotos() {
      if (this.selectedPhotos.length === 0) return

      try {
        await photoService.deletePhotos(this.selectedPhotos)

        this.$notify({
          title: this.$t('common.success'),
          message: this.$t('photo.deletedCount', { count: this.selectedPhotos.length }),
          type: 'success',
        })

        // 从当前页面移除照片
        this.photos = this.photos.filter(photo => !this.selectedPhotos.includes(photo.id))
        this.album.photoCount = this.photos.length
        this.selectedPhotos = []
        this.showDeleteSelectedModal = false
      } catch (error) {
        console.error(this.$t('photo.batchDeleteError'), error)
        this.$notify.error({
          title: this.$t('common.deleteError'),
          message: error.response?.data?.message || this.$t('photo.deleteErrorMessage'),
        })
      }
    },

    handleCoverChanged(result) {
      // 更新相册的封面照片ID
      this.album.coverPhotoId = result.coverPhotoId

      // 重新设置封面照片显示
      this.setCoverPhoto()

      // 关闭模态框
      this.showChangeCoverModal = false

      // 显示成功提示（ChangeCoverModal 组件内部已经显示了，这里可以不重复显示）
    },

    deletePhoto(deletedPhotoId) {
      // 单张照片删除后的处理
      this.photos = this.photos.filter(photo => photo.id !== deletedPhotoId)
      this.album.photoCount = this.photos.length
    },

    handlePhotoUpdated(newPhoto) {
      // 照片编辑完成，更新照片列表并关闭详情页
      this.showPhotoDetail = false
      // 重新获取相册照片以确保数据同步
      this.getAlbumPhotos()
    },

    handlePhotoReplaced(photoId) {
      // 照片被编辑器替换，只需关闭详情页和刷新数据，不调用删除API
      this.showPhotoDetail = false
      this.getAlbumPhotos()
    },
  },
}
</script>

<style scoped>
.album-detail {
  min-height: 100vh;
}

/* 相册封面头部区域 */
.album-header {
  position: relative;
  height: 70vh;
  min-height: 500px;
  max-height: 700px;
  overflow: hidden;
  margin-bottom: var(--spacing-lg);
  margin-top: -60px;
}

/* 空相册的头部样式 */
.album-header--empty {
  height: auto;
  min-height: 200px;
  max-height: 300px;
  /* 空相册不应用位移，保持正常位置 */
  transform: none;
  margin-top: 0;
}

.album-header__background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  mask: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 1) 60%,
    rgba(0, 0, 0, 0.8) 70%,
    rgba(0, 0, 0, 0.5) 80%,
    rgba(0, 0, 0, 0.2) 90%,
    rgba(0, 0, 0, 0) 100%
  );
  -webkit-mask: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 1) 60%,
    rgba(0, 0, 0, 0.8) 70%,
    rgba(0, 0, 0, 0.5) 80%,
    rgba(0, 0, 0, 0.2) 90%,
    rgba(0, 0, 0, 0) 100%
  );
}

.album-header__cover {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: blur(0.5px);
  transform: scale(1.05);
}

.album-header__placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    var(--primary) 0%,
    var(--primary-dark) 50%,
    var(--secondary) 100%
  );
  opacity: 0.8;
}

.album-header__content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  align-items: flex-end;
  padding: var(--spacing-3xl) var(--spacing-xl) var(--spacing-2xl);
  max-width: var(--container-xl);
  margin: 0 auto;
}

.album-header__info {
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.album-header__title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  line-height: 1.1;
  margin: 0 0 var(--spacing-sm);
  letter-spacing: -0.02em;
  opacity: 0;
  transform: translateY(20px);
  animation: slideUpFadeIn 0.8s ease-out 0.2s forwards;
}

.album-header__description {
  font-size: var(--font-size-lg);
  font-weight: 400;
  line-height: 1.4;
  margin: 0 0 var(--spacing-lg);
  max-width: 600px;
  opacity: 0.9;
  opacity: 0;
  transform: translateY(20px);
  animation: slideUpFadeIn 0.8s ease-out 0.4s forwards;
}

.album-header__meta {
  display: flex;
  gap: var(--spacing-lg);
  font-size: var(--font-size-sm);
  font-weight: 500;
  opacity: 0.8;
  opacity: 0;
  transform: translateY(20px);
  animation: slideUpFadeIn 0.8s ease-out 0.6s forwards;
}

.album-header__count,
.album-header__date {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

/* 动画效果 */
@keyframes slideUpFadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.album-detail-container {
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: 0 var(--spacing-xl) var(--spacing-xl);
}

.with-toolbar-space {
  transition: padding-top 0.3s ease;
  position: relative;
}
@media (max-width: 768px) {
  .album-header {
    height: 60vh;
    min-height: 400px;
    max-height: 500px;
    margin-bottom: var(--spacing-md);
    transform: translateY(-60px);
    margin-top: -60px;
  }

  .album-header--empty {
    min-height: 180px;
    max-height: 250px;
    transform: none;
    margin-top: 0;
  }

  .album-header__content {
    padding: var(--spacing-2xl) var(--spacing-lg) var(--spacing-xl);
  }

  .album-header__title {
    font-size: clamp(1.5rem, 8vw, 2.5rem);
  }

  .album-header__description {
    font-size: var(--font-size-md);
  }

  .album-header__meta {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .album-detail-container {
    padding: 0 var(--spacing-lg) var(--spacing-lg);
  }
}
@media (max-width: 480px) {
  .album-header {
    height: 55vh;
    min-height: 350px;
    transform: translateY(-60px);
    margin-top: -60px;
  }

  .album-header--empty {
    min-height: 160px;
    max-height: 200px;
    transform: none;
    margin-top: 0;
  }

  .album-header__content {
    padding: var(--spacing-xl) var(--spacing-md) var(--spacing-lg);
  }
}

.album-detail__loading,
.album-detail__error {
  text-align: center;
  padding: var(--spacing-3xl) 0;
}

.album-detail__spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto var(--spacing-md);
  border: 3px solid var(--bg-tertiary);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.album-detail__error {
  color: var(--error);
}

/* 确认模态框样式 */
.confirm-modal-content {
  padding: var(--spacing-lg);
}

.confirm-note {
  color: var(--warning);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-md);
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  width: 100%;
  margin-top: var(--spacing-lg);
}

/* 动画 */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.15s ease; /* 退出动画缩短为0.15秒，加快关闭速度 */
}

.slide-fade-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
