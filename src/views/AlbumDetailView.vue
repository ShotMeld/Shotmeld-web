<!--
  AlbumDetailView.vue - 相册详情页
-->

<template>
  <div class="album-detail">
    <AppNavbar
      :userName="userName"
      currentPage="album-detail" 
      @show-upload="showUploadModal = true" 
      @toggle-manage="toggleManageMode"
    />
    <div class="album-detail__container">
      <div class="album-detail__header">
        <div class="album-detail__info">
          <h1 class="album-detail__title">{{ album.name }}</h1>
          <p v-if="album.description" class="album-detail__description">
            {{ album.description }}
          </p>
          <div class="album-detail__meta">
            <span class="album-detail__count">{{ album.photoCount }} 张照片</span>
            <span class="album-detail__date">创建于 {{ formatDate(album.createdAt) }}</span>
          </div>
        </div>
      </div>

      <div v-if="loading" class="album-detail__loading">
        <div class="album-detail__spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="error" class="album-detail__error">
        <p>{{ error }}</p>
        <sf-button @click="fetchAlbumDetails" variant="outline">
          重试
        </sf-button>
      </div>

      <div v-else>
        <!-- 批量管理工具栏 -->
        <transition name="slide-fade" :duration="{ enter: 300, leave: 100 }">
          <album-photos-manage-toolbar 
            v-if="isManageMode" 
            :selectedPhotos="selectedPhotos"
            @select-all="selectAll"
            @deselect-all="deselectAll"
            @show-move-to-album="showMoveToAlbumDialog"
            @show-remove-from-album="showRemoveFromAlbumDialog"
            @show-delete-selected="showDeleteSelectedDialog"
            @exit-manage-mode="exitManageMode"
            :key="'manage-toolbar'"
          />
        </transition>

        <photo-wall-grid
          :photos="photos"
          :isManageMode="isManageMode"
          :selectedPhotos="selectedPhotos"
          @openPhotoDetail="openPhoto"
          @showUploadModal="showUploadModal = true"
          @toggleSelect="toggleSelectPhoto"
        />
      </div>
    </div>

    <photo-detail
      v-if="currentPhoto"
      v-model="showPhotoDetail"
      :photo="currentPhoto"
      @photo-deleted="deletePhoto"
    />

    <!-- 上传照片模态框 -->
    <sf-modal v-model="showUploadModal" title="添加照片">
      <photo-upload
        :showAlbumOption="false"
        :albumId="album.id"
        @upload-success="handlePhotoUploaded"
      />
    </sf-modal>

    <!-- 批量删除确认模态框 -->
    <sf-delete-confirm-modal
      v-model="showDeleteSelectedModal"
      item-name="照片"
      :count="selectedPhotos.length"
      @confirm="deleteSelectedPhotos"
    />

    <!-- 从相册移除照片确认模态框 -->
    <sf-modal v-model="showRemoveFromAlbumModal" title="从相册移除照片">
      <div class="confirm-modal-content">
        <p>确定要将选中的 {{ selectedPhotos.length }} 张照片从相册「{{ album.name }}」中移除吗？</p>
        <p class="confirm-note">注意：照片不会被删除，只会从当前相册中移除</p>
        <div class="confirm-actions">
          <sf-button @click="showRemoveFromAlbumModal = false" variant="outline">取消</sf-button>
          <sf-button @click="removeFromAlbum" variant="warning">确认移除</sf-button>
        </div>
      </div>
    </sf-modal>

    <!-- 移动到其他相册模态框 -->
    <sf-modal v-model="showMoveToAlbumModal" title="移动到其他相册">
      <div class="album-selection">
        <div v-if="albums.length === 0" class="no-albums">
          <p>暂无其他相册可供选择</p>
        </div>
        <div v-else class="album-list">
          <div v-for="album in albums" :key="album.id" 
            class="album-item" :class="{ 'selected': targetAlbumId === album.id }"
            @click="selectTargetAlbum(album.id)">
            <div class="album-cover">
              <img v-if="album.coverUrl" :src="album.coverUrl" alt="相册封面" />
              <div v-else class="empty-cover">
                <i class="fas fa-images"></i>
              </div>
            </div>
            <div class="album-name">{{ album.name }}</div>
          </div>
        </div>
        <div class="modal-footer">
          <sf-button @click="showMoveToAlbumModal = false" variant="outline">取消</sf-button>
          <sf-button @click="moveToAlbum" variant="primary" :disabled="!targetAlbumId">确认移动</sf-button>
        </div>
      </div>
    </sf-modal>
  </div>
</template>

<script>
import PhotoWallGrid from './PhotoWall/PhotoWallGrid.vue'
import PhotoDetail from '../components/PhotoDetail.vue'
import PhotoUpload from '../components/PhotoUpload.vue'
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
    PhotoUpload,
    SfButton,
    SfModal,
    SfDeleteConfirmModal,
    AlbumPhotosManageToolbar,
    AppNavbar
  },
  data() {
    return {
      album: {
        id: null,
        name: '',
        description: '',
        photoCount: 0,
        createdAt: null
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
      showMoveToAlbumModal: false,
      targetAlbumId: null,
      albums: []
    }
  },
  async created() {
    // 获取用户信息
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    this.userName = user.username || '用户'
    await this.fetchAlbumDetails()
    await this.fetchAlbums() // 获取相册列表
    
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
    formatDate(date) {
      return new Date(date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    async fetchAlbumDetails() {
      try {
        this.loading = true
        const albumId = this.$route.params.id
        const [albumResponse, photosResponse] = await Promise.all([
          albumService.getAlbum(albumId),
          albumService.getAlbumPhotos(albumId)
        ])
        this.album = albumResponse.data
        this.photos = photosResponse.data.data
      } catch (error) {
        this.error = error.response?.data?.message || '获取相册详情失败'
        console.error('获取相册详情失败:', error)
      } finally {
        this.loading = false
      }
    },
    
    async fetchAlbums() {
      try {
        const response = await albumService.getAlbums()
        // 过滤掉当前相册
        this.albums = response.data.data.filter(album => album.id !== this.album.id) || []
      } catch (error) {
        console.error('获取相册列表失败:', error)
      }
    },
    
    openPhoto(photo) {
      this.currentPhoto = photo
      this.showPhotoDetail = true
    },
    
    handlePhotoUploaded(uploadedPhotos) {
      // 更新照片列表
      this.photos = [...this.photos, ...uploadedPhotos]
      this.album.photoCount = this.photos.length
      this.showUploadModal = false
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
      // 立即更新UI状态
      this.isManageMode = false
      
      // 使用nextTick延迟清空选择状态
      this.$nextTick(() => {
        this.selectedPhotos = []
      })
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
    
    showMoveToAlbumDialog() {
      if (this.selectedPhotos.length === 0) return
      this.targetAlbumId = null
      this.showMoveToAlbumModal = true
    },
    
    showRemoveFromAlbumDialog() {
      if (this.selectedPhotos.length === 0) return
      this.showRemoveFromAlbumModal = true
    },
    
    showDeleteSelectedDialog() {
      if (this.selectedPhotos.length === 0) return
      this.showDeleteSelectedModal = true
    },
    
    selectTargetAlbum(albumId) {
      this.targetAlbumId = albumId
    },
    
    async moveToAlbum() {
      if (!this.targetAlbumId || this.selectedPhotos.length === 0) return
      
      try {
        // 先从当前相册移除
        await photoService.removePhotosFromAlbum({
          albumId: this.album.id,
          photoIds: this.selectedPhotos
        })
        
        // 再添加到目标相册
        await photoService.addPhotosToAlbum({
          albumId: this.targetAlbumId,
          photoIds: this.selectedPhotos
        })
        
        this.$notify({
          title: '成功',
          message: `已将${this.selectedPhotos.length}张照片移动到其他相册`,
          type: 'success'
        })
        
        // 从当前页面移除照片
        this.photos = this.photos.filter(photo => !this.selectedPhotos.includes(photo.id))
        this.album.photoCount = this.photos.length
        this.selectedPhotos = []
        this.showMoveToAlbumModal = false
      } catch (error) {
        console.error('移动照片失败:', error)
        this.$notify.error({
          title: '操作失败',
          message: error.response?.data?.message || '无法移动照片，请重试'
        })
      }
    },
    
    async removeFromAlbum() {
      if (this.selectedPhotos.length === 0) return
      
      try {
        await photoService.removePhotosFromAlbum({
          albumId: this.album.id,
          photoIds: this.selectedPhotos
        })
        
        this.$notify({
          title: '成功',
          message: `已从相册中移除${this.selectedPhotos.length}张照片`,
          type: 'success'
        })
        
        // 从当前页面移除照片
        this.photos = this.photos.filter(photo => !this.selectedPhotos.includes(photo.id))
        this.album.photoCount = this.photos.length
        this.selectedPhotos = []
        this.showRemoveFromAlbumModal = false
      } catch (error) {
        console.error('从相册移除照片失败:', error)
        this.$notify.error({
          title: '操作失败',
          message: error.response?.data?.message || '无法从相册移除照片，请重试'
        })
      }
    },
    
    async deleteSelectedPhotos() {
      if (this.selectedPhotos.length === 0) return
      
      try {
        await photoService.deletePhotos(this.selectedPhotos)
        
        this.$notify({
          title: '成功',
          message: `已删除${this.selectedPhotos.length}张照片`,
          type: 'success'
        })
        
        // 从当前页面移除照片
        this.photos = this.photos.filter(photo => !this.selectedPhotos.includes(photo.id))
        this.album.photoCount = this.photos.length
        this.selectedPhotos = []
        this.showDeleteSelectedModal = false
      } catch (error) {
        console.error('批量删除照片失败:', error)
        this.$notify.error({
          title: '删除失败',
          message: error.response?.data?.message || '无法删除照片，请重试'
        })
      }
    },
    
    deletePhoto(deletedPhotoId) {
      // 单张照片删除后的处理
      this.photos = this.photos.filter(photo => photo.id !== deletedPhotoId)
      this.album.photoCount = this.photos.length
    }
  }
}
</script>

<style scoped>
.album-detail {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.album-detail__container {
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: var(--spacing-xl);
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

/* 相册选择模态框样式 */
.album-selection {
  padding: var(--spacing-md);
}

.album-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  max-height: 300px;
  overflow-y: auto;
}

.album-item {
  cursor: pointer;
  border-radius: var(--radius-medium);
  padding: var(--spacing-xs);
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.album-item:hover {
  background-color: var(--bg-hover);
}

.album-item.selected {
  border-color: var(--primary);
  background-color: var(--primary-light);
}

.album-cover {
  width: 100%;
  height: 100px;
  border-radius: var(--radius-small);
  overflow: hidden;
  margin-bottom: var(--spacing-xs);
  background-color: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.empty-cover {
  color: var(--text-tertiary);
  font-size: 2rem;
}

.album-name {
  font-size: var(--font-size-sm);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-albums {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border);
}

/* 确认模态框样式 */
.confirm-modal-content {
  padding: var(--spacing-lg);
  text-align: center;
}

.confirm-note {
  color: var(--warning);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-md);
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-xl);
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
</style>