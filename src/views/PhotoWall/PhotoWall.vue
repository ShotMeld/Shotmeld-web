<!--
  PhotoWall.vue - 照片墙主页面，负责整体布局和数据流转
-->

<template>
  <div class="photo-wall-container">
    <main class="photo-wall-main">
      <PhotoWallFilters :searchQuery="searchQuery" :filters="filters" :dateRange="dateRange" :albums="albums"
        @update:searchQuery="searchQuery = $event" @update:filters="filters = $event"
        @update:dateRange="dateRange = $event" @fetchPhotos="fetchPhotos" />
      <PhotoWallGrid v-if="!loading" :photos="photos" @openPhotoDetail="openPhotoDetail"
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
    </main>
  </div>
</template>

<script>
import PhotoWallFilters from './PhotoWallFilters.vue';
import PhotoWallGrid from './PhotoWallGrid.vue';
import PhotoWallLoading from './PhotoWallLoading.vue';
import PhotoWallPagination from './PhotoWallPagination.vue';
import PhotoDetail from '../../components/PhotoDetail.vue';
import PhotoUpload from '../../components/PhotoUpload.vue';
import AlbumForm from '../../components/album/AlbumForm.vue';
import { photoService, albumService } from '../../api';
import { eventBus, EventTypes } from '../../utils/eventBus';

export default {
  name: 'PhotoWall',
  components: {
    PhotoWallFilters,
    PhotoWallGrid,
    PhotoWallLoading,
    PhotoWallPagination,
    PhotoDetail,
    PhotoUpload,
    AlbumForm
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
      }
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
</style>