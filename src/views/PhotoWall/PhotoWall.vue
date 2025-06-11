<!--
  PhotoWall.vue - 照片墙主页面，负责整体布局和数据流转
-->

<template>
  <div class="photo-wall-container">
    <main :class="mainContentClass">
      <transition name="slide-fade">
        <PhotoWallFilters
          v-if="!isManageMode"
          :searchQuery="searchQuery"
          :filters="filters"
          :dateRange="dateRange"
          :albums="albums"
          @update:searchQuery="searchQuery = $event"
          @update:filters="filters = $event"
          @update:dateRange="dateRange = $event"
          @fetchPhotos="fetchPhotos"
          @update:searchResults="handleSearchResultsUpdate"
        />
      </transition>

      <!-- 批量管理工具栏 -->
      <PhotoWallManageToolbar
        v-if="isManageMode"
        :selectedPhotos="selectedPhotos"
        @select-all="selectAll"
        @deselect-all="deselectAll"
        @show-add-to-album="showAddToAlbumModal"
        @show-delete-selected="showDeleteSelectedModal"
        @exit-manage-mode="exitManageMode"
      />

      <PhotoWallGrid
        v-if="!loading"
        :photos="photos"
        :isManageMode="isManageMode"
        :selectedPhotos="selectedPhotos"
        @openPhotoDetail="openPhotoDetail"
        @toggleSelect="toggleSelectPhoto"
        @showUploadModal="isUploadModalVisible = true"
      />
      <PhotoWallLoading v-else />
      <PhotoWallPagination
        v-if="totalPhotos > 0"
        :currentPage="pagination.page"
        :pageSize="pagination.limit"
        :total="totalPhotos"
        @sizeChange="handleSizeChange"
        @currentChange="handlePageChange"
      />
      <PhotoDetail
        v-if="currentPhoto"
        v-model="showPhotoDetail"
        :photo="currentPhoto"
        @photo-deleted="deletePhoto"
      />
      <SfModal
        v-model="isUploadModalVisible"
        :title="$t('photoWall.uploadModal.title')"
        size="default"
      >
        <PhotoUpload @upload-success="handlePhotoUploaded" />
      </SfModal>
      <SfModal
        v-model="isAlbumFormVisible"
        :title="$t('photoWall.createAlbum.title')"
        size="default"
      >
        <AlbumForm @album-created="handleAlbumCreated" />
      </SfModal>

      <!-- 添加到相册的弹窗 -->
      <PhotoWallAlbumModal
        v-model="isAddToAlbumModalVisible"
        :albums="albums"
        @create-album="showCreateAlbumModal"
        @add-to-album="handleAddToAlbum"
      />

      <!-- 批量删除确认弹窗 -->
      <SfDeleteConfirmModal
        v-model="isDeleteSelectedModalVisible"
        :item-name="$t('photoWall.deleteConfirm.itemName')"
        :count="selectedPhotos.length"
        @confirm="deleteSelectedPhotos"
      />
    </main>
  </div>
</template>

<script>
import PhotoWallFilters from './PhotoWallFilters.vue'
import PhotoWallGrid from './PhotoWallGrid.vue'
import PhotoWallLoading from './PhotoWallLoading.vue'
import PhotoWallPagination from './PhotoWallPagination.vue'
import PhotoWallManageToolbar from './PhotoWallManageToolbar.vue'
import PhotoWallAlbumModal from './PhotoWallAlbumModal.vue'
import PhotoDetail from '../../components/PhotoDetail.vue'
import PhotoUpload from '../../components/PhotoUpload.vue'
import AlbumForm from '../../components/album/AlbumForm.vue'
import { SfButton, SfModal, SfDeleteConfirmModal } from '../../components/ui'
import { photoService, albumService } from '../../api'
import { eventBus, EventTypes } from '../../utils/eventBus'

export default {
  name: 'PhotoWall',
  components: {
    PhotoWallFilters,
    PhotoWallGrid,
    PhotoWallLoading,
    PhotoWallPagination,
    PhotoWallManageToolbar,
    PhotoWallAlbumModal,
    PhotoDetail,
    PhotoUpload,
    AlbumForm,
    SfButton,
    SfModal,
    SfDeleteConfirmModal,
  },
  data() {
    return {
      photos: [],
      albums: [],
      loading: true,
      currentPhoto: null,
      showPhotoDetail: false,
      isUploadModalVisible: false,
      isAlbumFormVisible: false,
      totalPhotos: 0,
      dateRange: null,
      searchQuery: '',
      pagination: {
        page: 1,
        limit: 20,
      },
      filters: {
        albumId: null,
        startDate: null,
        endDate: null,
        sort: 'takenAt',
        order: 'desc',
      },
      // 批量管理相关的状态
      isManageMode: false,
      selectedPhotos: [],
      isAddToAlbumModalVisible: false,
      isDeleteSelectedModalVisible: false,
    }
  },
  computed: {
    // 为主内容添加动态类，当管理工具栏显示时提供额外的顶部间距
    mainContentClass() {
      return {
        'photo-wall-main': true,
        'with-toolbar-space': this.isManageMode,
      }
    },
  },
  created() {
    this.fetchPhotos()
    this.fetchAlbums()
    // 监听上传事件
    eventBus.on(EventTypes.SHOW_UPLOAD_MODAL, () => {
      this.isUploadModalVisible = true
    })

    // 监听相册表单事件
    eventBus.on(EventTypes.SHOW_ALBUM_FORM, () => {
      this.isAlbumFormVisible = true
    })

    // 监听管理模式切换事件
    eventBus.on('toggle-manage', () => {
      this.toggleManageMode()
    })
  },
  beforeUnmount() {
    eventBus.off(EventTypes.SHOW_UPLOAD_MODAL)
    eventBus.off(EventTypes.SHOW_ALBUM_FORM)
    eventBus.off('toggle-manage')
  },
  methods: {
    // 批量管理相关方法
    toggleManageMode() {
      this.isManageMode = !this.isManageMode
      // 进入或退出管理模式时清空选中状态
      if (!this.isManageMode) {
        this.selectedPhotos = []
      }
    },
    exitManageMode() {
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
    showAddToAlbumModal() {
      if (this.selectedPhotos.length === 0) return
      this.selectedAlbumId = null
      this.isAddToAlbumModalVisible = true
    },
    showDeleteSelectedModal() {
      if (this.selectedPhotos.length === 0) return
      this.isDeleteSelectedModalVisible = true
    },
    showCreateAlbumModal() {
      this.isAddToAlbumModalVisible = false
      this.isAlbumFormVisible = true
    },
    async handleAddToAlbum(albumId) {
      if (!albumId || this.selectedPhotos.length === 0) return

      try {
        await photoService.addPhotosToAlbum({
          albumId: albumId,
          photoIds: this.selectedPhotos,
        })

        this.$notify({
          title: this.$t('photoWall.success'),
          message: this.$t('photoWall.addToAlbumSuccess', { count: this.selectedPhotos.length }),
          type: 'success',
        })
      } catch (error) {
        console.error(this.$t('photoWall.error.addToAlbumFailed'), error)
        this.$notify.error({
          title: this.$t('photoWall.error.operationFailed'),
          message:
            error.response?.data?.message || this.$t('photoWall.error.addToAlbumFailedMessage'),
        })
      }
    },
    async deleteSelectedPhotos() {
      if (this.selectedPhotos.length === 0) return

      try {
        await photoService.deletePhotos(this.selectedPhotos)

        this.$notify({
          title: this.$t('photoWall.success'),
          message: this.$t('photoWall.deleteSuccess', { count: this.selectedPhotos.length }),
          type: 'success',
        })

        // 从当前页面移除已删除的照片
        this.photos = this.photos.filter(photo => !this.selectedPhotos.includes(photo.id))
        this.selectedPhotos = []
        this.isDeleteSelectedModalVisible = false

        // 如果当前页面没有照片了，尝试加载上一页
        if (this.photos.length === 0 && this.pagination.page > 1) {
          this.pagination.page -= 1
          this.fetchPhotos()
        }
      } catch (error) {
        console.error(this.$t('photoWall.error.deleteFailed'), error)
        this.$notify.error({
          title: this.$t('photoWall.error.deleteFailed'),
          message: error.response?.data?.message || this.$t('photoWall.error.deleteFailedMessage'),
        })
      }
    },

    // 新增方法：处理搜索结果更新
    handleSearchResultsUpdate(results) {
      this.loading = true
      if (results && results.error) {
        this.$notify.error({
          title: this.$t('photoWall.error.searchFailed'),
          message: results.error,
        })
      } else if (results && results.data) {
        this.photos = results.data
        this.totalPhotos = results.total || 0
        // 如果API返回分页信息，也在这里更新
        if (typeof results.page !== 'undefined') this.pagination.page = results.page
        // this.pagination.limit 应该由请求时设置，通常搜索结果会尊重请求的limit
      } else {
        // 兜底处理，或当搜索清除时（尽管PhotoWallFilters会额外触发fetchPhotos）
        this.photos = []
        this.totalPhotos = 0
      }
      this.loading = false
    },

    async fetchPhotos() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          sort: this.filters.sort,
          order: this.filters.order,
        }
        if (this.filters.albumId) params.albumId = this.filters.albumId
        if (this.dateRange && this.dateRange.length === 2) {
          params.startDate = this.dateRange[0]
          params.endDate = this.dateRange[1]
        }
        const response = await photoService.getPhotos(params)
        this.photos = response.data.data || []
        this.totalPhotos = response.data.total || 0
      } catch (error) {
        console.error(this.$t('photoWall.error.fetchFailed'), error)
        this.$notify.error({
          title: this.$t('photoWall.error.fetchFailed'),
          message: this.$t('photoWall.error.fetchFailedMessage'),
        })
      } finally {
        this.loading = false
      }
    },
    async fetchAlbums() {
      try {
        const response = await albumService.getAlbums()
        this.albums = response.data.data || []
      } catch (error) {
        console.error(this.$t('photoWall.error.fetchAlbumsFailed'), error)
      }
    },
    openPhotoDetail(photo) {
      this.currentPhoto = photo
      this.showPhotoDetail = true
    },
    closePhotoDetail() {
      this.showPhotoDetail = false
      setTimeout(() => {
        this.currentPhoto = null
      }, 300)
    },
    handlePageChange(page) {
      this.pagination.page = page
      this.fetchPhotos()
    },
    handleSizeChange(size) {
      this.pagination.limit = size
      this.fetchPhotos()
    },
    handlePhotoUploaded() {
      this.isUploadModalVisible = false
      this.fetchPhotos()
    },
    handleAlbumCreated() {
      this.isAlbumFormVisible = false
      this.fetchAlbums()
    },
    async deletePhoto(photoId) {
      try {
        await photoService.deletePhoto(photoId)
        this.$notify({
          title: this.$t('photoWall.success'),
          message: this.$t('photoWall.deleteSuccess', { count: 1 }),
          type: 'success',
        })
        this.photos = this.photos.filter(p => p.id !== photoId)
        this.closePhotoDetail()
      } catch (error) {
        console.error(this.$t('photoWall.error.deleteFailed'), error)
        this.$notify.error({
          title: this.$t('photoWall.error.deleteFailed'),
          message: error.response?.data?.message || this.$t('photoWall.error.deleteFailedMessage'),
        })
      }
    },
  },
}
</script>

<style scoped>
.photo-wall-container {
  min-height: 100vh;
  /* 移除背景颜色，让 BaseLayout 的背景显示 */
}

.photo-wall-main {
  min-height: calc(100vh - 64px);
  max-width: var(--container-xl);
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  padding: var(--spacing-xl);
}

/* 为固定定位的工具栏腾出空间 */
.with-toolbar-space {
  padding-top: var(--spacing-xl); /* 保持原有的顶部间距 */
  margin-top: 80px; /* 为固定工具栏添加额外的空间 */
  transition: margin-top 0.3s ease;
  position: relative; /* 确保正确的堆叠上下文 */
}

@media (max-width: 768px) {
  .with-toolbar-space {
    padding-top: var(--spacing-md); /* 移动端使用较小的间距 */
    margin-top: 130px; /* 移动端工具栏可能更高 */
  }
}

.manage-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  /* 确保管理工具栏有更好的视觉效果 */
  background-color: var(--bg-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-large);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  animation: toolbar-appear 0.4s cubic-bezier(0.33, 1, 0.68, 1) forwards;
  /* Added for sticky behavior */
  position: sticky;
  top: 0; /* Stick to the top of the main scrolling container's content area */
  z-index: 10; /* Ensure it's above other scrolled content */
}

/* 相册模态框的样式已移至 PhotoWallAlbumModal.vue 组件中 */

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

/* 确保管理工具栏有更好的视觉效果 */
.manage-toolbar {
  background-color: var(--bg-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-large);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  animation: toolbar-appear 0.4s cubic-bezier(0.33, 1, 0.68, 1) forwards;
}

@keyframes toolbar-appear {
  from {
    transform: translateY(-10px);
    opacity: 0.7;
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  }
  to {
    transform: translateY(0);
    opacity: 1;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
}
</style>
