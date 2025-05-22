<!--
  TimelineView.vue - 时间线页
-->

<template>
  <div class="timeline-container">
    <main class="timeline-content">
      <div v-if="loading" class="loading-container" v-loading="true">
        <p>正在加载时间轴...</p>
      </div>

      <div v-else-if="error" class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button @click="fetchTimeline" class="retry-button">重试</button>
      </div>

      <template v-else>
        <PhotoWallNoPhotos v-if="photos.length === 0" @showUploadModal="$emit('showUploadModal')" />

        <div v-else class="timeline">
          <div v-for="(yearGroup, yearIndex) in timelineGroups" :key="yearIndex" class="timeline-year">
            <h2 class="year-header">
              {{ yearGroup.year }}年
              <span class="year-photo-count">{{ getYearPhotoCount(yearGroup) }}张照片</span>
            </h2>

            <div v-for="(monthGroup, monthIndex) in yearGroup.months" :key="`${yearIndex}-${monthIndex}`"
              class="timeline-month">
              <h3 class="month-header">
                {{ monthGroup.month }}月
                <span class="month-photo-count">{{ monthGroup.photos.length }}张照片</span>
              </h3>

              <div class="photos-grid">
                <div v-for="photo in monthGroup.photos" :key="photo.id" class="photo-card"
                  :class="getAspectRatioClass(photo)"
                  @click="showPhotoDetail(photo)">
                  <div class="photo-thumbnail">
                    <img :src="photo.thumbnailUrl || photo.url" 
                         :alt="photo.title"
                         @load="onImageLoad($event, photo)"
                         :style="{ opacity: photo.aspectRatio ? 1 : 0 }">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 照片详情模态框 -->
      <PhotoDetail v-if="currentPhoto" v-model="showPhotoDetailModal" :photo="currentPhoto"
        @photo-deleted="handlePhotoDeleted" />

      <!-- 上传照片模态框 -->
      <sf-modal v-model="showUploadModal" title="上传照片">
        <photo-upload :showAlbumOption="true" @upload-success="handlePhotoUploaded" />
      </sf-modal>
    </main>
  </div>
</template>

<script>
import { photoService } from '../api';
import apiClient from '../api';
import PhotoUpload from '../components/PhotoUpload.vue';
import PhotoDetail from '../components/PhotoDetail.vue';
import { SfModal } from '../components/ui';
import PhotoWallNoPhotos from './PhotoWall/PhotoWallNoPhotos.vue';
import { eventBus } from '../utils/eventBus';

export default {
  name: 'TimelineView',
  components: {
    PhotoUpload,
    PhotoDetail,
    SfModal,
    PhotoWallNoPhotos
  },
  data() {
    return {
      photos: [],
      loading: false,
      error: null,
      currentPhoto: null,
      imageLoaded: false,
      showDeleteConfirm: false,
      showUploadModal: false,
      showPhotoDetailModal: false,
      userName: '',
      timelineGroups: [], // 按年月分组后的照片数据
      photoAspectRatios: new Map() // 存储照片的宽高比
    }
  },
  created() {
    // 获取用户信息
    const user = JSON.parse(localStorage.getItem('user'))
    if (user) {
      this.userName = user.username || user.email
    }

    this.fetchTimeline();
    
    // 监听上传照片事件
    eventBus.on('show-upload-modal', () => {
      this.showUploadModal = true
    });
  },
  
  beforeUnmount() {
    // 清理事件监听
    eventBus.off('show-upload-modal');
  },
  methods: {
    async fetchTimeline() {
      this.loading = true;
      this.error = null;

      try {
        const params = { groupBy: 'month' };

        const response = await photoService.getPhotoTimeline(params);

        this.photos = [];
        const timelineData = response.data || [];

        timelineData.forEach(group => {
          if (group.photos && Array.isArray(group.photos)) {
            this.photos = [...this.photos, ...group.photos];
          }
        });

        // 将照片按年月分组
        this.groupPhotosByDate();
      } catch (error) {
        console.error('获取照片失败:', error);
        this.error = error.response?.data?.message || '加载时间轴失败，请重试';
      } finally {
        this.loading = false;
      }
    },

    groupPhotosByDate() {
      // 按年月对照片进行分组
      const groupedByYear = {};

      this.photos.forEach(photo => {
        const date = new Date(photo.takenAt || photo.createdAt);
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // getMonth返回0-11

        if (!groupedByYear[year]) {
          groupedByYear[year] = {};
        }

        if (!groupedByYear[year][month]) {
          groupedByYear[year][month] = [];
        }

        groupedByYear[year][month].push(photo);
      });

      // 转换为组件需要的数据结构
      this.timelineGroups = Object.keys(groupedByYear)
        .sort((a, b) => b - a) // 年份降序
        .map(year => {
          const months = Object.keys(groupedByYear[year])
            .sort((a, b) => b - a) // 月份降序
            .map(month => ({
              month,
              photos: groupedByYear[year][month]
            }));

          return {
            year,
            months
          };
        });
    },

    showPhotoDetail(photo) {
      this.currentPhoto = photo;
      this.imageLoaded = false;
      this.showPhotoDetailModal = true;
    },

    closePhotoDetail() {
      this.showPhotoDetailModal = false;
      setTimeout(() => {
        this.currentPhoto = null;
      }, 300);
    },

    startEditingPhoto(photo) {
      console.log('编辑照片:', photo);
      // TODO: 实现编辑照片的功能
      alert('编辑照片功能将在后续版本实现');
    },

    handlePhotoDeleted(photoId) {
      this.deletePhoto(photoId);
    },

    handlePhotoUploaded(uploadedPhotos) {
      this.showUploadModal = false;
      this.fetchTimeline();

      this.$notify({
        title: '上传成功',
        message: `已成功上传 ${uploadedPhotos.length || 1} 张照片`,
        type: 'success'
      });
    },

    confirmDeletePhoto() {
      this.showDeleteConfirm = true;
    },

    async deletePhoto(photoId) {
      try {
        const idToDelete = photoId || (this.currentPhoto && this.currentPhoto.id);
        if (!idToDelete) return;

        await photoService.deletePhoto(idToDelete);

        this.$notify({
          title: '成功',
          message: '照片已删除',
          type: 'success'
        });

        // 从列表中移除已删除的照片
        this.photos = this.photos.filter(p => p.id !== idToDelete);
        // 重新分组
        this.groupPhotosByDate();

        this.showPhotoDetailModal = false;
        this.closePhotoDetail();
        this.showDeleteConfirm = false;
      } catch (error) {
        console.error('删除照片失败:', error);
        this.$notify.error({
          title: '删除失败',
          message: error.response?.data?.message || '无法删除照片，请重试'
        });
      }
    },

    downloadPhoto(photo) {
      const link = document.createElement('a');
      link.href = photo.url;
      link.download = photo.filename || 'photo.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    // 计算一个年份分组中的照片总数
    getYearPhotoCount(yearGroup) {
      let count = 0;
      if (yearGroup && yearGroup.months) {
        yearGroup.months.forEach(month => {
          if (month.photos) {
            count += month.photos.length;
          }
        });
      }
      return count;
    },

    formatDate(dateString) {
      if (!dateString) return '未知日期';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    handleLogout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete apiClient.defaults.headers.common['Authorization'];
      this.$router.push('/login');
    },

    handleAlbumCreated() {
      // 如果需要，可以刷新某些数据
    },

    getAspectRatioClass(photo) {
      const ratio = this.photoAspectRatios.get(photo.id);
      if (!ratio) return '';
      
      if (ratio > 1.2) return 'landscape';
      if (ratio < 0.8) return 'portrait';
      return 'square';
    },
    
    onImageLoad(event, photo) {
      const img = event.target;
      const ratio = img.naturalWidth / img.naturalHeight;
      this.photoAspectRatios.set(photo.id, ratio);
      photo.aspectRatio = ratio;
    }
  }
}
</script>

<style scoped>
.timeline-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.timeline-content {
  min-height: calc(100vh - 64px);
  flex: 1;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  padding: 2rem;
}

.timeline-title {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #212529;
}

.timeline-year {
  margin-bottom: 3rem;
}

.year-header {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: 0.5rem;
  color: var(--color-primary);
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.year-photo-count {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: normal;
}

.timeline-month {
  margin-bottom: 2rem;
}

.month-header {
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: #6c757d;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.month-photo-count {
  font-size: 0.8rem;
  color: #adb5bd;
  font-weight: normal;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 12px;
  padding: 12px 0;
  grid-auto-rows: 180px;
  grid-auto-flow: dense;
}

.photo-card {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background-color: #f5f5f7;
}

.photo-card:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.photo-card.portrait {
  grid-row: span 2;
  grid-column: span 3;
}

.photo-card.landscape {
  grid-row: span 1;
  grid-column: span 4;
}

.photo-card.square {
  grid-row: span 1;
  grid-column: span 3;
}

/* 添加一些随机的尺寸变化 */
.photo-card:nth-child(3n) {
  grid-column: span 4;
}

.photo-card:nth-child(5n) {
  grid-column: span 2;
}

.photo-card:nth-child(7n) {
  grid-row: span 2;
  grid-column: span 2;
}

.photo-card:nth-child(11n) {
  grid-column: span 3;
}

/* 确保大图有足够的空间 */
.photo-card:nth-child(13n) {
  grid-row: span 2;
  grid-column: span 6;
}

.photo-thumbnail {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.photo-thumbnail:hover img {
  transform: scale(1.05);
}

.photo-info {
  display: none;
}

/* 响应式布局调整 */
@media (max-width: 1200px) {
  .photos-grid {
    grid-template-columns: repeat(8, 1fr);
  }
  
  .photo-card.portrait {
    grid-column: span 2;
  }
  
  .photo-card.landscape {
    grid-column: span 3;
  }
  
  .photo-card.square {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .photos-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .photo-card.portrait,
  .photo-card.landscape,
  .photo-card.square {
    grid-column: span 2;
  }
  
  .photo-card:nth-child(3n),
  .photo-card:nth-child(5n),
  .photo-card:nth-child(7n),
  .photo-card:nth-child(11n),
  .photo-card:nth-child(13n) {
    grid-column: span 2;
  }
}

@media (max-width: 480px) {
  .photos-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .photo-card.portrait,
  .photo-card.landscape,
  .photo-card.square {
    grid-column: span 1;
  }
  
  .photo-card:nth-child(3n),
  .photo-card:nth-child(5n),
  .photo-card:nth-child(7n),
  .photo-card:nth-child(11n),
  .photo-card:nth-child(13n) {
    grid-column: span 1;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: var(--spacing-md);
  color: var(--text-secondary);
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: var(--spacing-md);
  color: var(--color-danger);
}

.retry-button {
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
  padding: var(--spacing-sm) var(--spacing-xl);
  border-radius: var(--radius-round);
  cursor: pointer;
  font-size: var(--font-size-base);
  transition: background-color var(--transition-fast);
}

.retry-button:hover {
  background-color: var(--color-primary-dark);
}

.empty-timeline {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: var(--spacing-md);
  color: var(--text-secondary);
  background-color: var(--bg-primary);
  border-radius: var(--radius-large);
  padding: var(--spacing-3xl);
  box-shadow: var(--shadow-medium);
}

.empty-timeline i {
  font-size: var(--font-size-4xl);
  color: var(--text-tertiary);
}

.empty-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.upload-btn {
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
  padding: var(--spacing-sm) var(--spacing-2xl);
  border-radius: var(--radius-round);
  cursor: pointer;
  font-size: var(--font-size-base);
  transition: background-color var(--transition-fast);
}

.upload-btn:hover {
  background-color: var(--color-primary-dark);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.modal-container {
  background-color: var(--bg-primary);
  border-radius: var(--radius-large);
  width: 95%;
  max-width: 1200px;
  max-height: 95vh;
  overflow-y: auto;
  box-shadow: var(--shadow-extra-large);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #6c757d;
}

.modal-container {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-body {
  padding: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}
</style>