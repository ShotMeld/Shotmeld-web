<!--
  AlbumDetailView.vue - 相册详情页
-->

<template>
  <!-- 在 album-detail__actions 部分添加设置封面按钮 -->
  <div class="album-detail__actions">
    <SfButton v-if="!isManageMode" @click="showSetCoverModal = true" variant="outline" class="action-btn">
      <i class="icon-cover"></i>
      设置封面
    </SfButton>
  </div>
  <div class="album-detail">
    <AppNavbar :userName="userName" currentPage="album-detail" @show-upload="showUploadModal = true"
      @toggle-manage="toggleManageMode" />
    <div :class="albumDetailContainerClass">
      <div class="album-detail__header">
        <div class="album-detail__info">
          <h1 class="album-detail__title">{{ album.name }}</h1>
          <p v-if="album.description" class="album-detail__description">
            {{ album.description }}
          </p>
          <div class="album-detail__meta">
            <span class="album-detail__count">{{ $t('album.photoCount', { count: album.photoCount }) }}</span>
            <span class="album-detail__date">{{ $t('album.createdAt', { date: formatDate(album.createdAt) }) }}</span>
          </div>
        </div>
      </div>

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
        <AlbumPhotosManageToolbar v-if="isManageMode" :selectedPhotos="selectedPhotos" @select-all="selectAll"
          @deselect-all="deselectAll" @show-remove-from-album="showRemoveFromAlbumDialog"
          @show-delete-selected="showDeleteSelectedDialog" @exit-manage-mode="exitManageMode" />

        <PhotoWallGrid :photos="photos" :isManageMode="isManageMode" :selectedPhotos="selectedPhotos"
          @openPhotoDetail="openPhoto" @showUploadModal="showUploadModal = true" @toggleSelect="toggleSelectPhoto" />
      </div>
    </div>

    <PhotoDetail v-if="currentPhoto" v-model="showPhotoDetail" :photo="currentPhoto" @photo-deleted="deletePhoto" />

    <!-- 添加照片模态框 -->
    <AddPhotosModal v-model="showUploadModal" :albumId="album.id" :existingPhotoIds="photos.map(p => p.id)"
      @photos-added="handlePhotosAdded" />

    <!-- 批量删除确认模态框 -->
    <SfDeleteConfirmModal v-model="showDeleteSelectedModal" item-name="照片" :count="selectedPhotos.length"
      @confirm="deleteSelectedPhotos" />

    <!-- 从相册移除照片确认模态框 -->
    <SfModal v-model="showRemoveFromAlbumModal" :title="$t('album.removePhotosTitle')">
      <div class="confirm-modal-content">
        <p>{{ $t('album.confirmRemovePhotos', { count: selectedPhotos.length, albumName: album.name }) }}</p>
        <p class="confirm-note">{{ $t('album.removePhotosNote') }}</p>
        <div class="confirm-actions">
          <SfButton @click="showRemoveFromAlbumModal = false" type="secondary">{{ $t('common.cancel') }}</SfButton>
          <SfButton @click="removeFromAlbum" type="danger">{{ $t('album.confirmRemove') }}</SfButton>
        </div>
      </div>
    </SfModal>
  </div>
  <!-- 修改设置封面模态框部分 -->
  <SfModal v-model="showSetCoverModal" title="设置相册封面">
    <div class="set-cover-modal">
      <p>请选择一张照片作为相册封面：</p>
      <div class="cover-photo-grid">
        <div v-for="photo in photos" :key="photo.id" class="cover-photo-item" :class="{
          selected: selectedCoverPhoto === photo.id,
          'current-cover': album.coverPhotoId === photo.id
        }" @click="selectedCoverPhoto = photo.id">
          <img :src="photo.thumbnailUrl || photo.url" :alt="photo.name" />
          <div v-if="album.coverPhotoId === photo.id" class="current-cover-badge">当前封面</div>
        </div>
      </div>
      <div class="modal-actions">
        <SfButton @click="clearAlbumCover" variant="secondary" :disabled="!album.coverPhotoId">
          清除封面
        </SfButton>
        <div class="action-spacer"></div>
        <SfButton @click="showSetCoverModal = false" variant="secondary">取消</SfButton>
        <SfButton @click="setAlbumCover" :disabled="!selectedCoverPhoto || selectedCoverPhoto === album.coverPhotoId"
          :loading="loading">
          确认设置
        </SfButton>
      </div>
    </div>
  </SfModal>
</template>

<script>
import PhotoWallGrid from './PhotoWall/PhotoWallGrid.vue'
import PhotoDetail from '../components/PhotoDetail.vue'
import AddPhotosModal from '../components/AddPhotosModal.vue'
import SfButton from '../components/ui/SfButton.vue'
import SfModal from '../components/ui/SfModal.vue'
import SfDeleteConfirmModal from '../components/ui/SfDeleteConfirmModal.vue'
import AlbumPhotosManageToolbar from './Albums/AlbumPhotosManageToolbar.vue'
import AppNavbar from '../layout/AppNavbar.vue'
import { albumService, photoService } from '../api'
import { eventBus } from '../utils/eventBus'

export default {
  name: 'AlbumDetailView',
  components: {
    PhotoWallGrid,
    PhotoDetail,
    AddPhotosModal,
    SfButton,
    SfModal,
    SfDeleteConfirmModal,
    AlbumPhotosManageToolbar,
    AppNavbar,
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
      loading: false,
      error: null,
      currentPhoto: null,
      showPhotoDetail: false,
      showUploadModal: false,
      userName: '',
      // 批量管理相关的状态
      isManageMode: false,
      selectedPhotos: [],
      showDeleteSelectedModal: false,
      showRemoveFromAlbumModal: false,
      showSetCoverModal: false,
      selectedCoverPhoto: null,
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
    // 获取用户信息
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    this.userName = user.username || this.$t('common.user')
    await this.fetchAlbumDetails()

    // 监听上传照片事件
    eventBus.on('show-upload-modal', () => {
      this.showUploadModal = true
    })
  },
  beforeUnmount() {
    // 清理事件监听
    eventBus.off('show-upload-modal')
  },
  methods: {
    async setAlbumCover() {
      if (!this.selectedCoverPhoto) return;

      try {
        this.loading = true;
        // 调用API更新相册封面
        await albumService.updateAlbum(this.album.id, {
          coverPhotoId: this.selectedCoverPhoto
        });

        this.$notify({
          title: '成功',
          message: '相册封面已更新',
          type: 'success'
        });

        // 更新本地相册数据
        this.album.coverPhotoId = this.selectedCoverPhoto;
        this.showSetCoverModal = false;

        // 通知相册列表更新封面
        eventBus.emit('album-cover-updated', {
          albumId: this.album.id,
          photoId: this.selectedCoverPhoto
        });
      } catch (error) {
        console.error('设置封面失败:', error);
        this.$notify.error({
          title: '设置失败',
          message: error.response?.data?.message || '无法更新相册封面'
        });
      } finally {
        this.loading = false;
      }
    },
    async clearAlbumCover() {
      try {
        this.loading = true;
        // 调用API清除相册封面
        await albumService.updateAlbum(this.album.id, {
          coverPhotoId: null
        });

        this.$notify({
          title: '成功',
          message: '已清除相册封面',
          type: 'success'
        });

        // 更新本地数据
        this.album.coverPhotoId = null;
        this.selectedCoverPhoto = null;
        this.showSetCoverModal = false;

        // 通知相册列表更新
        eventBus.emit('album-cover-updated', {
          albumId: this.album.id,
          photoId: null
        });
      } catch (error) {
        console.error('清除封面失败:', error);
        this.$notify.error({
          title: '清除失败',
          message: error.response?.data?.message || '无法清除相册封面'
        });
      } finally {
        this.loading = false;
      }
    },
    openSetCoverModal() {
      this.showSetCoverModal = true;
      // 初始化选择当前封面照片
      this.selectedCoverPhoto = this.album.coverPhotoId;
    },
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
      } else if (result.type === 'existing') {
        // 现有照片添加到相册，需要重新获取相册照片
        // 这里我们可以优化，不重新获取整个相册详情，只获取照片列表
        this.fetchAlbumPhotos()
      }

      this.showUploadModal = false
    },

    async fetchAlbumPhotos() {
      try {
        const albumId = this.$route.params.id
        const photosResponse = await albumService.getAlbumPhotos(albumId)
        this.photos = photosResponse.data.data || []
        this.album.photoCount = this.photos.length
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

    deletePhoto(deletedPhotoId) {
      // 单张照片删除后的处理
      this.photos = this.photos.filter(photo => photo.id !== deletedPhotoId)
      this.album.photoCount = this.photos.length
    },
  },
}
</script>

<style scoped>
.album-detail {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.album-detail-container {
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: var(--spacing-xl);
}

/* 为固定工具栏腾出空间 */
.with-toolbar-space {
  padding-top: var(--spacing-xl);
  margin-top: 80px; /* 为固定工具栏添加额外的空间 */
  transition: margin-top 0.3s ease;
  position: relative;
}

@media (max-width: 768px) {
  .with-toolbar-space {
    margin-top: 100px;
  }
}

.album-detail__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-2xl);
}

.album-detail__info {
  flex: 1;
}

.album-detail__actions {
  display: flex;
  gap: var(--spacing-md);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.action-btn.active {
  background-color: var(--primary-dark);
}

.album-detail__title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs);
}

.album-detail__description {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-md);
}

.album-detail__meta {
  display: flex;
  gap: var(--spacing-lg);
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
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

@media (max-width: 768px) {
  .album-detail__container {
    padding: var(--spacing-lg);
    margin-top: 56px; /* 移动端导航栏高度稍小 */
  }

  .album-detail__header {
    flex-direction: column;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
  }

  .album-detail__title {
    font-size: var(--font-size-2xl);
  }

  .album-detail__description {
    font-size: var(--font-size-md);
  }
}
.set-cover-modal {
  padding: var(--spacing-lg);
}

.cover-photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--spacing-md);
  margin: var(--spacing-lg) 0;
  max-height: 400px;
  overflow-y: auto;
}


.cover-photo-item:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cover-photo-item.selected {
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.2);
}

.cover-photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.icon-cover {
  display: inline-block;
  width: 16px;
  height: 16px;
  background-image: url('~@/assets/icons/cover.svg');
  background-repeat: no-repeat;
  background-position: center;
  margin-right: var(--spacing-xs);
}

@media (max-width: 768px) {
  .cover-photo-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
  
  .album-detail__actions {
    flex-wrap: wrap;
  }
  
  .action-btn {
    margin-bottom: var(--spacing-sm);
  }
}
.cover-photo-item.current-cover {
  border-color: var(--success);
}

.current-cover-badge {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(var(--success-rgb), 0.8);
  color: white;
  font-size: var(--font-size-xs);
  text-align: center;
  padding: 2px 0;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-spacer {
  flex-grow: 1;
}

.cover-photo-item {
  position: relative;
  }
</style>
