<template>
  <div class="album-view">
    <AppNavbar :userName="userName" currentPage="albums" @show-upload="showUploadModal = true" @show-album-form="showCreateModal = true" />
    <div class="album-container">
      <div v-if="loading" class="album-view__loading">
        <div class="album-view__spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="error" class="album-view__error">
        <p>{{ error }}</p>
        <sf-button @click="fetchAlbums" variant="outline">
          重试
        </sf-button>
      </div>

      <div v-else-if="albums.length === 0" class="album-view__empty">
        <p>还没有创建任何相册</p>
      </div>

      <div v-else class="album-view__grid">
        <album-card
          v-for="album in albums"
          :key="album.id"
          :album="album"
          @click="openAlbum(album)"
        />
      </div>
    </div>

    <sf-modal v-model="showCreateModal" title="创建新相册">
      <album-form @success="handleAlbumCreated" @close="showCreateModal = false" @cancel="showCreateModal = false" />
    </sf-modal>
  </div>
</template>

<script>
import AlbumCard from '../components/album/AlbumCard.vue'
import AppNavbar from '../components/AppNavbar.vue'
import SfButton from '../components/ui/SfButton.vue'
import SfModal from '../components/ui/SfModal.vue'
import AlbumForm from '../components/AlbumForm.vue'
import { albumService } from '../api'

export default {
  name: 'AlbumView',
  components: {
    AlbumCard,
    AppNavbar,
    SfButton,
    SfModal,
    AlbumForm
  },
  data() {
    return {
      showCreateModal: false,
      albums: [],
      loading: false,
      error: null,
      userName: ''
    }
  },
  async created() {
    // 获取用户信息
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    this.userName = user.username || '用户'
    await this.fetchAlbums()
  },
  methods: {
    async fetchAlbums() {
      try {
        this.loading = true
        const response = await albumService.getAlbums()
        this.albums = response.data.data
      } catch (error) {
        this.error = error.response?.data?.message || '获取相册列表失败'
        console.error('获取相册列表失败:', error)
      } finally {
        this.loading = false
      }
    },
    openAlbum(album) {
      this.$router.push(`/album/${album.id}`)
    },
    handleAlbumCreated(newAlbum) {
      // 将新创建的相册添加到列表开头
      this.albums.unshift(newAlbum)
      this.showCreateModal = false
    }
  }
}
</script>

<style scoped>
.album-view {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.album-container {
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.album-view__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-2xl);
}

.album-view__title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs);
}

.album-view__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-xl);
}

.album-view__loading,
.album-view__error,
.album-view__empty {
  text-align: center;
  padding: var(--spacing-3xl) 0;
}

.album-view__spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto var(--spacing-md);
  border: 3px solid var(--bg-tertiary);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.album-view__error {
  color: var(--error);
}

.album-view__empty {
  color: var(--text-secondary);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .album-container {
    padding: var(--spacing-lg);
  }
  
  .album-view__header {
    flex-direction: column;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
  }
  
  .album-view__title {
    font-size: var(--font-size-2xl);
  }
  
  .album-view__grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--spacing-lg);
  }
}
</style> 