<!--
  PhotoWall.vue - 照片墙主页面，负责整体布局和数据流转
-->

<template>
  <!-- 批量管理工具栏 -->
  <PhotoWallManageToolbar
    v-if="isManageMode"
    :class="toolbarAnimationClass"
    :selectedPhotos="selectedPhotos"
    @select-all="selectAll"
    @deselect-all="deselectAll"
    @show-add-to-album="showAddToAlbumModal"
    @show-delete-selected="showDeleteSelectedModal"
    @exit-manage-mode="exitManageMode"
  />

  <div
    class="photo-wall-container"
    :class="{ 'page-entering': isPageEntering }"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <main :class="mainContentClass">
      <PhotoWallFilters
        v-if="!isManageMode"
        :class="[filtersAnimationClass, { 'content-entering': isPageEntering }]"
        :searchQuery="searchQuery"
        :filters="filters"
        :dateRange="dateRange"
        :albums="albums"
        @update:searchQuery="handleSearchQueryUpdate"
        @update:filters="filters = $event"
        @update:dateRange="dateRange = $event"
        @fetchPhotos="fetchPhotos"
        @update:searchResults="handleSearchResultsUpdate"
      />

      <PhotoWallGrid
        v-if="!loading"
        :class="{ 'content-entering': isPageEntering }"
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
        @photo-updated="handlePhotoUpdated"
        @photo-replaced="handlePhotoReplaced"
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
import PhotoDetail from '../../components/PhotoDetail/PhotoDetail.vue'
import PhotoUpload from '../../components/PhotoUpload.vue'
import AlbumForm from '../../components/album/AlbumForm.vue'
import { SfModal, SfDeleteConfirmModal } from '../../components/ui'
import { photoService, albumService } from '../../api'
import { eventBus, EventTypes } from '../../utils/eventBus'
import { useUserStore } from '../../store/user'

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
    SfModal,
    SfDeleteConfirmModal,
  },
  setup() {
    const userStore = useUserStore()
    return { userStore }
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
      // 动画控制状态
      filtersExiting: false,
      toolbarEntering: false,
      isPageEntering: true, // 页面进入动画状态
      // 自动刷新相关状态
      autoRefreshTimer: null,
      autoRefreshInterval: 5000, // 5秒刷新一次
      // 拖拽相关状态
      isDragOver: false,
      dragCounter: 0, // 用于跟踪拖拽事件的计数器
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
    // 筛选框动画类
    filtersAnimationClass() {
      if (this.filtersExiting) {
        return 'filters-slide-out'
      }
      if (!this.isManageMode) {
        return 'filters-slide-in'
      }
      return ''
    },
    // 工具栏动画类
    toolbarAnimationClass() {
      if (this.toolbarEntering) {
        return 'toolbar-slide-in'
      }
      return ''
    },
  },
  mounted() {
    // 页面进入动画 - 只有在用户已登录时才显示进入动画
    if (this.userStore.token) {
      setTimeout(() => {
        this.isPageEntering = false
      }, 50) // 让路由过渡先完成
    } else {
      // 如果用户未登录，立即显示内容
      this.isPageEntering = false
    }
  },
  created() {
    this.fetchPhotos()
    this.fetchAlbums()
    // 启动自动刷新
    this.startAutoRefresh()

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
    // 清理自动刷新定时器
    this.stopAutoRefresh()

    eventBus.off(EventTypes.SHOW_UPLOAD_MODAL)
    eventBus.off(EventTypes.SHOW_ALBUM_FORM)
    eventBus.off('toggle-manage')
  },
  methods: {
    // 拖拽处理方法
    handleDragOver(e) {
      e.preventDefault()
      e.stopPropagation()

      // 检查是否包含文件
      if (e.dataTransfer.types.includes('Files')) {
        this.dragCounter++
        this.isDragOver = true

        // 一旦检测到拖拽文件，立即打开上传模态框
        if (!this.isUploadModalVisible) {
          this.isUploadModalVisible = true
        }
      }
    },

    handleDragLeave(e) {
      e.preventDefault()
      e.stopPropagation()

      this.dragCounter--
      if (this.dragCounter <= 0) {
        this.dragCounter = 0
        this.isDragOver = false
      }
    },

    handleDrop(e) {
      e.preventDefault()
      e.stopPropagation()

      this.isDragOver = false
      this.dragCounter = 0
    },

    // 自动刷新相关方法
    startAutoRefresh() {
      this.stopAutoRefresh() // 确保没有重复的定时器
      this.autoRefreshTimer = setInterval(() => {
        // 只有在非管理模式且非搜索模式下才自动刷新，避免影响用户选择操作和搜索结果
        if (!this.isManageMode && !this.loading && !this.searchQuery.trim()) {
          this.silentRefreshPhotos()
        }
      }, this.autoRefreshInterval)
    },

    stopAutoRefresh() {
      if (this.autoRefreshTimer) {
        clearInterval(this.autoRefreshTimer)
        this.autoRefreshTimer = null
      }
    },

    // 静默刷新照片数据，不显示加载状态
    async silentRefreshPhotos() {
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
        const newPhotos = response.data.data || []
        const newTotal = response.data.total || 0

        // 只有当数据真正发生变化时才更新
        if (
          JSON.stringify(newPhotos) !== JSON.stringify(this.photos) ||
          newTotal !== this.totalPhotos
        ) {
          this.photos = newPhotos
          this.totalPhotos = newTotal
        }
      } catch (error) {
        // 静默刷新失败时不显示错误通知，避免干扰用户
        console.warn('自动刷新照片数据失败:', error)
      }
    },

    // 批量管理相关方法
    toggleManageMode() {
      if (this.isManageMode) {
        // 退出管理模式：先播放工具栏退出动画，然后显示筛选框
        this.exitManageMode()
      } else {
        // 进入管理模式：先播放筛选框退出动画，然后显示工具栏
        this.filtersExiting = true
        // 进入管理模式时停止自动刷新
        this.stopAutoRefresh()
        setTimeout(() => {
          this.isManageMode = true
          this.toolbarEntering = true
          this.filtersExiting = false
          // 重置工具栏动画状态
          setTimeout(() => {
            this.toolbarEntering = false
          }, 500)
        }, 300)
      }
    },
    exitManageMode() {
      this.isManageMode = false
      this.selectedPhotos = []
      this.toolbarEntering = false
      this.filtersExiting = false
      // 退出管理模式时重新启动自动刷新（如果不在搜索模式下）
      if (!this.searchQuery.trim()) {
        this.startAutoRefresh()
      }
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

    // 处理搜索查询更新，控制自动刷新
    handleSearchQueryUpdate(newQuery) {
      const oldQuery = this.searchQuery
      this.searchQuery = newQuery

      // 如果从无搜索变为有搜索，停止自动刷新
      if (!oldQuery.trim() && newQuery.trim()) {
        this.stopAutoRefresh()
      }
      // 如果从有搜索变为无搜索，且不在管理模式下，启动自动刷新
      else if (oldQuery.trim() && !newQuery.trim() && !this.isManageMode) {
        this.startAutoRefresh()
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

        // 手动刷新后重启自动刷新定时器（非管理模式且非搜索模式）
        if (!this.isManageMode && !this.searchQuery.trim()) {
          this.startAutoRefresh()
        }
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
      // 上传成功后重启自动刷新，确保能及时获取处理状态更新（非管理模式且非搜索模式）
      if (!this.isManageMode && !this.searchQuery.trim()) {
        this.startAutoRefresh()
      }
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

    handlePhotoUpdated(newPhoto) {
      // 照片编辑完成，更新照片列表并关闭详情页
      this.closePhotoDetail()
      this.fetchPhotos()
    },

    handlePhotoReplaced(photoId) {
      // 照片被编辑器替换，只需关闭详情页和刷新数据，不调用删除API
      this.closePhotoDetail()
      this.fetchPhotos()
    },
  },
}
</script>

<style scoped>
.photo-wall-container {
  min-height: 100vh;
  opacity: 1;
  filter: blur(0px);
  transform: scale(1);
  transition: all 1.5s cubic-bezier(0.23, 1, 0.32, 1);
  will-change: opacity, filter, transform;
}

.photo-wall-container.page-entering {
  opacity: 0;
  filter: blur(15px);
  transform: scale(0.92);
}

/* 内容元素渐入动画 */
.content-entering {
  opacity: 0 !important;
  transform: translateY(20px) !important;
  transition: all 1.8s cubic-bezier(0.23, 1, 0.32, 1) !important;
  transition-delay: 0.3s !important;
}

.photo-wall-main {
  min-height: calc(100vh - 64px);
  max-width: var(--container-xl);
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  padding: var(--spacing-xl);
  position: relative;
}

.with-toolbar-space {
  padding-top: var(--spacing-xl);
  margin-top: 80px;
  transition: margin-top 0.3s ease;
  position: relative;
}

@media (max-width: 768px) {
  .with-toolbar-space {
    padding-top: var(--spacing-md);
    margin-top: 130px;
  }
}

.manage-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  background-color: var(--bg-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-large);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  animation: toolbar-appear 0.4s cubic-bezier(0.33, 1, 0.68, 1) forwards;
  position: sticky;
  top: 0;
  z-index: 10;
}

/* 筛选搜索框动画 */
.filters-slide-in {
  animation: filtersSlideIn 0.5s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
}

.filters-slide-out {
  animation: filtersSlideOut 0.3s cubic-bezier(0.4, 0, 1, 1) forwards;
}

@keyframes filtersSlideIn {
  from {
    opacity: 0;
    filter: blur(10px);
    transform: translateY(-40px);
  }
  to {
    opacity: 1;
    filter: blur(0px);
    transform: translateY(0);
  }
}

@keyframes filtersSlideOut {
  from {
    opacity: 1;
    filter: blur(0px);
    transform: translateY(0);
  }
  to {
    opacity: 0;
    filter: blur(8px);
    transform: translateY(-60px);
  }
}

/* 工具箱动画 */
.toolbar-slide-in {
  animation: toolbarSlideIn 0.5s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
}

.toolbar-slide-out {
  animation: toolbarSlideOut 0.3s cubic-bezier(0.4, 0, 1, 1) forwards;
}

@keyframes toolbarSlideIn {
  from {
    opacity: 0;
    filter: blur(10px);
    transform: translateX(-50%) translateY(-50px);
  }
  to {
    opacity: 1;
    filter: blur(0px);
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes toolbarSlideOut {
  from {
    opacity: 1;
    filter: blur(0px);
    transform: translateX(-50%) translateY(0);
  }
  to {
    opacity: 0;
    filter: blur(8px);
    transform: translateX(-50%) translateY(-60px);
  }
}

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
