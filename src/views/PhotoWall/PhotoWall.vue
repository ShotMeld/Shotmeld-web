<!--
  PhotoWall.vue - 照片墙主页面，负责整体布局和数据流转
-->

<template>
  <div class="photo-wall-container">
    <AppNavbar :userName="userName" currentPage="photowall" @show-upload="isUploadModalVisible = true" @show-album-form="isAlbumFormVisible = true" @toggle-manage="toggleManageMode" />
    <main class="photo-wall-main">
        <transition name="slide-fade">
          <PhotoWallFilters v-if="!isManageMode" :searchQuery="searchQuery" :filters="filters" :dateRange="dateRange" :albums="albums"
            @update:searchQuery="searchQuery = $event" @update:filters="filters = $event"
            @update:dateRange="dateRange = $event" @fetchPhotos="fetchPhotos" />
        </transition>
        
        <!-- 批量管理工具栏 -->
        <transition name="slide-fade">
          <PhotoWallManageToolbar 
            v-if="isManageMode" 
            :selectedPhotos="selectedPhotos"
            @select-all="selectAll"
            @deselect-all="deselectAll"
            @show-add-to-album="showAddToAlbumModal"
            @show-delete-selected="showDeleteSelectedModal"
            @exit-manage-mode="exitManageMode"
          />
        </transition>
        
        <PhotoWallGrid v-if="!loading" :photos="photos" :isManageMode="isManageMode" :selectedPhotos="selectedPhotos"
          @openPhotoDetail="openPhotoDetail" @toggleSelect="toggleSelectPhoto"
          @showUploadModal="isUploadModalVisible = true" />
        <PhotoWallLoading v-else />
        <PhotoWallPagination v-if="totalPhotos > 0" :currentPage="pagination.page" :pageSize="pagination.limit"
          :total="totalPhotos" @sizeChange="handleSizeChange" @currentChange="handlePageChange" />
        <PhotoDetail v-if="currentPhoto" v-model="showPhotoDetail" :photo="currentPhoto" @photo-deleted="deletePhoto" />
        <SfModal v-model="isUploadModalVisible" title="上传照片" size="default">
          <PhotoUpload @upload-success="handlePhotoUploaded" />
        </SfModal>
        <SfModal v-model="isAlbumFormVisible" title="创建相册" size="default">
          <AlbumForm @album-created="handleAlbumCreated" />
        </SfModal>
        
        <!-- 添加到相册的弹窗 -->
        <SfModal v-model="isAddToAlbumModalVisible" title="选择相册" size="default">
          <div class="album-selection">
            <div v-if="albums.length === 0" class="no-albums">
              <p>暂无相册，请先创建相册</p>
              <SfButton type="primary" @click="showCreateAlbumModal">创建新相册</SfButton>
            </div>
            <div v-else class="album-list">
              <div v-for="album in albums" :key="album.id" 
                class="album-item" :class="{ 'selected': selectedAlbumId === album.id }"
                @click="selectAlbum(album.id)">
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
              <SfButton type="secondary" @click="isAddToAlbumModalVisible = false">取消</SfButton>
              <SfButton type="primary" @click="addToAlbum" :disabled="!selectedAlbumId">确认</SfButton>
            </div>
          </div>
        </SfModal>
        
        <!-- 批量删除确认弹窗 -->
        <SfDeleteConfirmModal
          v-model="isDeleteSelectedModalVisible"
          item-name="照片"
          :count="selectedPhotos.length"
          @confirm="deleteSelectedPhotos"
        />
      </main>
  </div>
</template>

<script>
import PhotoWallFilters from './PhotoWallFilters.vue';
import PhotoWallGrid from './PhotoWallGrid.vue';
import PhotoWallLoading from './PhotoWallLoading.vue';
import PhotoWallPagination from './PhotoWallPagination.vue';
import PhotoWallManageToolbar from './PhotoWallManageToolbar.vue';
import PhotoDetail from '../../components/PhotoDetail.vue';
import PhotoUpload from '../../components/PhotoUpload.vue';
import AlbumForm from '../../components/album/AlbumForm.vue';
import AppNavbar from '../../layout/AppNavbar.vue';
import { SfButton, SfModal, SfDeleteConfirmModal } from '../../components/ui';
import { photoService, albumService } from '../../api';
import { eventBus, EventTypes } from '../../utils/eventBus';

export default {
  name: 'PhotoWall',
  components: {
    PhotoWallFilters,
    PhotoWallGrid,
    PhotoWallLoading,
    PhotoWallPagination,
    PhotoWallManageToolbar,
    PhotoDetail,
    PhotoUpload,
    AlbumForm,
    AppNavbar,
    SfButton,
    SfModal
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
        limit: 20
      },
      filters: {
        albumId: null,
        startDate: null,
        endDate: null,
        sort: 'takenAt',
        order: 'desc'
      },
      // 批量管理相关的状态
      isManageMode: false,
      selectedPhotos: [],
      isAddToAlbumModalVisible: false,
      isDeleteSelectedModalVisible: false,
      selectedAlbumId: null
    };
  },
  computed: {
    userName() {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.username || '用户';
    }
  },
  created() {
    this.fetchPhotos();
    this.fetchAlbums();
    // 监听上传事件
    eventBus.on(EventTypes.SHOW_UPLOAD_MODAL, () => {
      this.isUploadModalVisible = true;
    });
    
    // 监听相册表单事件
    eventBus.on(EventTypes.SHOW_ALBUM_FORM, () => {
      this.isAlbumFormVisible = true;
    });
  },
  beforeUnmount() {
    eventBus.off(EventTypes.SHOW_UPLOAD_MODAL);
    eventBus.off(EventTypes.SHOW_ALBUM_FORM);
  },
  methods: {
    // 批量管理相关方法
    toggleManageMode() {
      this.isManageMode = !this.isManageMode;
      // 进入或退出管理模式时清空选中状态
      if (!this.isManageMode) {
        this.selectedPhotos = [];
      }
    },
    exitManageMode() {
      this.isManageMode = false;
      this.selectedPhotos = [];
    },
    toggleSelectPhoto(photoId) {
      const index = this.selectedPhotos.indexOf(photoId);
      if (index === -1) {
        this.selectedPhotos.push(photoId);
      } else {
        this.selectedPhotos.splice(index, 1);
      }
    },
    selectAll() {
      this.selectedPhotos = this.photos.map(photo => photo.id);
    },
    deselectAll() {
      this.selectedPhotos = [];
    },
    showAddToAlbumModal() {
      if (this.selectedPhotos.length === 0) return;
      this.selectedAlbumId = null;
      this.isAddToAlbumModalVisible = true;
    },
    showDeleteSelectedModal() {
      if (this.selectedPhotos.length === 0) return;
      this.isDeleteSelectedModalVisible = true;
    },
    selectAlbum(albumId) {
      this.selectedAlbumId = albumId;
    },
    showCreateAlbumModal() {
      this.isAddToAlbumModalVisible = false;
      this.isAlbumFormVisible = true;
    },
    async addToAlbum() {
      if (!this.selectedAlbumId || this.selectedPhotos.length === 0) return;
      
      try {
        await photoService.addPhotosToAlbum({
          albumId: this.selectedAlbumId,
          photoIds: this.selectedPhotos
        });
        
        this.$notify({
          title: '成功',
          message: `已将${this.selectedPhotos.length}张照片添加到相册`,
          type: 'success'
        });
        
        this.isAddToAlbumModalVisible = false;
        this.selectedAlbumId = null;
      } catch (error) {
        console.error('添加照片到相册失败:', error);
        this.$notify.error({
          title: '操作失败',
          message: error.response?.data?.message || '无法添加照片到相册，请重试'
        });
      }
    },
    async deleteSelectedPhotos() {
      if (this.selectedPhotos.length === 0) return;
      
      try {
        await photoService.deletePhotos(this.selectedPhotos);
        
        this.$notify({
          title: '成功',
          message: `已删除${this.selectedPhotos.length}张照片`,
          type: 'success'
        });
        
        // 从当前页面移除已删除的照片
        this.photos = this.photos.filter(photo => !this.selectedPhotos.includes(photo.id));
        this.selectedPhotos = [];
        this.isDeleteSelectedModalVisible = false;
        
        // 如果当前页面没有照片了，尝试加载上一页
        if (this.photos.length === 0 && this.pagination.page > 1) {
          this.pagination.page -= 1;
          this.fetchPhotos();
        }
      } catch (error) {
        console.error('批量删除照片失败:', error);
        this.$notify.error({
          title: '删除失败',
          message: error.response?.data?.message || '无法删除照片，请重试'
        });
      }
    },
    
    // 原有方法
    async fetchPhotos() {
      this.loading = true;
      try {
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          sort: this.filters.sort,
          order: this.filters.order
        };
        if (this.filters.q) params.q = this.filters.q;
        if (this.filters.albumId) params.albumId = this.filters.albumId;
        if (this.filters.startDate) params.startDate = this.filters.startDate;
        if (this.filters.endDate) params.endDate = this.filters.endDate;
        const response = await photoService.getPhotos(params);
        this.photos = response.data.data || [];
        this.totalPhotos = response.data.total || 0;
      } catch (error) {
        console.error('获取照片列表失败:', error);
        this.$notify.error({
          title: '获取照片失败',
          message: '无法加载照片列表，请重试'
        });
      } finally {
        this.loading = false;
      }
    },
    async fetchAlbums() {
      try {
        const response = await albumService.getAlbums();
        this.albums = response.data.data || [];
      } catch (error) {
        console.error('获取相册列表失败:', error);
      }
    },
    openPhotoDetail(photo) {
      this.currentPhoto = photo;
      this.showPhotoDetail = true;
    },
    closePhotoDetail() {
      this.showPhotoDetail = false;
      setTimeout(() => {
        this.currentPhoto = null;
      }, 300);
    },
    handlePageChange(page) {
      this.pagination.page = page;
      this.fetchPhotos();
    },
    handleSizeChange(size) {
      this.pagination.limit = size;
      this.fetchPhotos();
    },
    handlePhotoUploaded() {
      this.isUploadModalVisible = false;
      this.fetchPhotos();
    },
    handleAlbumCreated() {
      this.isAlbumFormVisible = false;
      this.fetchAlbums();
    },
    async deletePhoto(photoId) {
      try {
        await photoService.deletePhoto(photoId);
        this.$notify({
          title: '成功',
          message: '照片已删除',
          type: 'success'
        });
        this.photos = this.photos.filter(p => p.id !== photoId);
        this.closePhotoDetail();
      } catch (error) {
        console.error('删除照片失败:', error);
        this.$notify.error({
          title: '删除失败',
          message: error.response?.data?.message || '无法删除照片，请重试'
        });
      }
    }
  }
};
</script>

<style scoped>
.photo-wall-container {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.photo-wall-main {
  min-height: calc(100vh - 64px);
  max-width: var(--container-xl);
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  padding: var(--spacing-xl);
}

.manage-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.manage-toolbar-left,
.manage-toolbar-right {
  display: flex;
  align-items: center;
}

.toolbar-btn {
  margin-right: var(--spacing-md);
}

.selected-count {
  font-size: var(--font-size-md);
  color: var(--text-primary);
}

.album-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.no-albums {
  text-align: center;
}

.album-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.album-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: var(--spacing-md);
  cursor: pointer;
}

.album-item.selected {
  border: 2px solid var(--primary);
}

.album-cover {
  width: 100px;
  height: 100px;
  overflow: hidden;
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-sm);
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.empty-cover {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
}

.album-name {
  font-size: var(--font-size-md);
  color: var(--text-primary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-top: var(--spacing-lg);
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