<template>
  <div class="album-detail">
    <AppNavbar :userName="userName" currentPage="album-detail" @show-upload="showUploadModal = true" @show-album-form="showCreateModal = true" />
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
        <photo-wall-grid
          :photos="photos"
          @openPhotoDetail="openPhoto"
          @showUploadModal="showUploadModal = true"
        />
      </div>
    </div>

    <photo-detail
      v-if="currentPhoto"
      v-model="showPhotoDetail"
      :photo="currentPhoto"
      @photo-deleted="deletePhoto"
    />

    <sf-modal v-model="showUploadModal" title="添加照片">
      <photo-upload
        :showAlbumOption="false"
        @upload-success="handlePhotoUploaded"
      />
    </sf-modal>
  </div>
</template>

<script>
import PhotoWallGrid from '../components/PhotoWall/PhotoWallGrid.vue'
import PhotoDetail from '../components/PhotoDetail.vue'
import PhotoUpload from '../components/PhotoUpload.vue'
import AppNavbar from '../components/AppNavbar.vue'
import SfButton from '../components/ui/SfButton.vue'
import SfModal from '../components/ui/SfModal.vue'
import { albumService } from '../api'

export default {
  name: 'AlbumDetailView',
  components: {
    PhotoWallGrid,
    PhotoDetail,
    PhotoUpload,
    AppNavbar,
    SfButton,
    SfModal
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
      userName: ''
    }
  },
  async created() {
    // 获取用户信息
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    this.userName = user.username || '用户'
    await this.fetchAlbumDetails()
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
    openPhoto(photo) {
      this.currentPhoto = photo
      this.showPhotoDetail = true
    },
    handlePhotoUploaded(uploadedPhotos) {
      // 更新照片列表
      this.photos = [...this.photos, ...uploadedPhotos]
      this.album.photoCount = this.photos.length
      this.showUploadModal = false
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .album-detail__container {
    padding: var(--spacing-lg);
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