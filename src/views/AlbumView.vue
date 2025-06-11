<!--
  AlbumView.vue - 相册页
-->

<template>
  <div class="album-view">
    <div :class="mainContainerClass">
      <div v-if="loading" class="album-view__loading">
        <div class="album-view__spinner"></div>
        <p>{{ $t('albumView.loading') }}</p>
      </div>

      <div v-else-if="error" class="album-view__error">
        <p>{{ error }}</p>
        <SfButton @click="fetchAlbums" variant="outline">
          {{ $t('albumView.retry') }}
        </SfButton>
      </div>

      <div v-else-if="albums.length === 0" class="album-view__empty">
        <p>{{ $t('albumView.empty') }}</p>
      </div>

      <div v-else>
        <!-- 批量管理工具栏 -->
        <AlbumManageToolbar
          v-if="isManageMode"
          :selectedAlbums="selectedAlbums"
          @select-all="selectAll"
          @deselect-all="deselectAll"
          @show-delete-selected="showDeleteSelectedModal"
          @exit-manage-mode="exitManageMode"
        />

        <div class="album-view__grid">
          <AlbumCard
            v-for="album in albums"
            :key="album.id"
            :album="album"
            :isManageMode="isManageMode"
            :isSelected="isSelected(album.id)"
            @click="handleAlbumClick(album)"
            @toggleSelect="toggleSelectAlbum"
          />
        </div>
      </div>
    </div>

    <SfModal v-model="showCreateModal" :title="$t('albumView.createAlbum.title')">
      <AlbumForm
        @success="handleAlbumCreated"
        @close="showCreateModal = false"
        @cancel="showCreateModal = false"
      />
    </SfModal>

    <!-- 批量删除确认弹窗 -->
    <SfDeleteConfirmModal
      v-model="isDeleteSelectedModalVisible"
      :item-name="$t('albumView.deleteConfirm.itemName')"
      :count="selectedAlbums.length"
      @confirm="deleteSelectedAlbums"
    />
  </div>
</template>

<script>
import AlbumCard from '../components/album/AlbumCard.vue'
import AlbumManageToolbar from './Albums/AlbumManageToolbar.vue'
import SfButton from '../components/ui/SfButton.vue'
import SfModal from '../components/ui/SfModal.vue'
import SfDeleteConfirmModal from '../components/ui/SfDeleteConfirmModal.vue'
import AlbumForm from '../components/album/AlbumForm.vue'
import { albumService } from '../api'
import { eventBus } from '../utils/eventBus'

export default {
  name: 'AlbumView',
  components: {
    AlbumCard,
    AlbumManageToolbar,
    SfButton,
    SfModal,
    SfDeleteConfirmModal,
    AlbumForm,
  },
  data() {
    return {
      showCreateModal: false,
      albums: [],
      loading: false,
      error: null,
      // 批量管理相关的状态
      isManageMode: false,
      selectedAlbums: [],
      isDeleteSelectedModalVisible: false,
    }
  },
  async created() {
    await this.fetchAlbums()

    // 监听新建相册事件
    eventBus.on('show-album-form', () => {
      this.showCreateModal = true
    })

    // 监听管理相册事件
    eventBus.on('toggle-album-manage', () => {
      this.toggleManageMode()
    })
  },
  beforeUnmount() {
    // 清理事件监听
    eventBus.off('show-album-form')
    eventBus.off('toggle-album-manage')
  },
  methods: {
    async fetchAlbums() {
      try {
        this.loading = true
        const response = await albumService.getAlbums()
        this.albums = response.data.data
      } catch (error) {
        this.error = error.response?.data?.message || this.$t('albumView.error.fetchFailed')
        console.error(this.$t('albumView.error.fetchFailed'), error)
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
    },
    // 批量管理相关方法
    toggleManageMode() {
      this.isManageMode = !this.isManageMode
      if (!this.isManageMode) {
        this.selectedAlbums = []
      }
    },
    exitManageMode() {
      this.isManageMode = false
      this.selectedAlbums = []
    },
    handleAlbumClick(album) {
      if (this.isManageMode) {
        this.toggleSelectAlbum(album.id)
      } else {
        this.openAlbum(album)
      }
    },
    toggleSelectAlbum(albumId) {
      const index = this.selectedAlbums.indexOf(albumId)
      if (index === -1) {
        this.selectedAlbums.push(albumId)
      } else {
        this.selectedAlbums.splice(index, 1)
      }
    },
    selectAll() {
      this.selectedAlbums = this.albums.map(album => album.id)
    },
    deselectAll() {
      this.selectedAlbums = []
    },
    isSelected(albumId) {
      return this.selectedAlbums.includes(albumId)
    },
    showDeleteSelectedModal() {
      if (this.selectedAlbums.length === 0) return
      this.isDeleteSelectedModalVisible = true
    },
    async deleteSelectedAlbums() {
      try {
        // 批量删除选中的相册
        await Promise.all(this.selectedAlbums.map(albumId => albumService.deleteAlbum(albumId)))

        this.$notify({
          title: this.$t('albumView.success'),
          message: this.$t('albumView.deleteSuccess', { count: this.selectedAlbums.length }),
          type: 'success',
        })

        // 从列表中移除已删除的相册
        this.albums = this.albums.filter(album => !this.selectedAlbums.includes(album.id))
        this.selectedAlbums = []
        this.isDeleteSelectedModalVisible = false
        this.isManageMode = false
      } catch (error) {
        console.error(this.$t('albumView.error.fetchFailed'), error)
        this.$notify.error({
          title: this.$t('photoWall.error.deleteFailed'),
          message: error.response?.data?.message || this.$t('photoWall.error.deleteFailedMessage'),
        })
      }
    },
  },
  computed: {
    mainContainerClass() {
      return {
        'album-container': true,
        'with-toolbar-space': this.isManageMode,
      }
    },
  },
}
</script>

<style scoped>
.album-view {
  min-height: 100vh;
  /* 移除背景颜色，让 BaseLayout 的背景显示 */
}

.album-container {
  min-height: calc(100vh - 64px);
  max-width: var(--container-xl);
  margin-left: auto;
  margin-right: auto;
  width: 100%;
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

/* 已移到 SfDeleteConfirmModal 组件中 */

/* 过渡动画样式 */
.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.33, 1, 0.68, 1);
  transform-origin: top center;
}

.slide-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.32, 0, 0.67, 0);
  transform-origin: top center;
  position: absolute;
  width: 100%;
  z-index: -1;
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
  filter: blur(1px);
}

.slide-fade-leave-to {
  transform: translateY(-8px);
  opacity: 0;
  filter: blur(0.5px);
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
