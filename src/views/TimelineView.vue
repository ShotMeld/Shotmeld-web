<!--
  TimelineView.vue - 时间线页
-->

<template>
  <div class="timeline-container">
    <!-- 顶部导航栏 -->
    <AppNavbar :userName="userName" currentPage="photowall" @show-upload="showUploadModal = true"
      @show-album-form="showAlbumForm = true" />

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
        <div v-if="timelineGroups.length === 0" class="empty-timeline">
          <i class="fas fa-calendar-times"></i>
          <p>暂无照片，请先上传照片</p>
          <div class="empty-actions">
            <button @click="showUploadModal = true" class="upload-btn">上传照片</button>
          </div>
        </div>

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
                  @click="showPhotoDetail(photo)">
                  <div class="photo-thumbnail">
                    <img :src="photo.thumbnailUrl || photo.url" :alt="photo.title">
                  </div>
                  <div class="photo-info">
                    <h4>{{ photo.title || '无标题' }}</h4>
                    <p>{{ formatDate(photo.takenAt || photo.createdAt) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 删除确认对话框 -->
      <el-dialog v-model="showDeleteConfirm" title="确认删除" width="30%" :show-close="false">
        <span>确定要删除这张照片吗？此操作不可恢复。</span>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showDeleteConfirm = false">取消</el-button>
            <el-button type="danger" @click="deletePhoto">确认</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 照片详情模态框 -->
      <PhotoDetail v-if="currentPhoto" v-model="showPhotoDetailModal" :photo="currentPhoto"
        @photo-deleted="handlePhotoDeleted" />

      <!-- 上传照片模态框 -->
      <sf-modal v-model="showUploadModal" title="上传照片">
        <photo-upload :showAlbumOption="true" @upload-success="handlePhotoUploaded" />
      </sf-modal>

      <!-- ICP备案信息 -->
      <IcpFooter />
    </main>
  </div>
</template>

<script>
import { photoService } from '../api';
import apiClient from '../api';
import PhotoUpload from '../components/PhotoUpload.vue';
import PhotoDetail from '../components/PhotoDetail.vue';
import AppNavbar from '../layout/AppNavbar.vue';
import AlbumForm from '../components/album/AlbumForm.vue';
import IcpFooter from '../layout/IcpFooter.vue';
import { SfModal } from '../components/ui';

export default {
  name: 'TimelineView',
  components: {
    PhotoUpload,
    PhotoDetail,
    AppNavbar,
    AlbumForm,
    IcpFooter,
    SfModal
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
      showAlbumForm: false,
      userName: '',
      timelineGroups: [] // 按年月分组后的照片数据
    }
  },
  created() {
    // 获取用户信息
    const user = JSON.parse(localStorage.getItem('user'))
    if (user) {
      this.userName = user.username || user.email
    }

    this.fetchTimeline();
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
      this.showAlbumForm = false;
      // 如果需要，可以刷新某些数据
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
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
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
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.photo-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease;
}

.photo-card:hover {
  transform: translateY(-5px);
}

.photo-thumbnail {
  height: 150px;
  overflow: hidden;
}

.photo-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-info {
  padding: 0.75rem;
}

.photo-info h4 {
  margin: 0;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.photo-info p {
  color: #6c757d;
  font-size: 0.75rem;
  margin: 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 1rem;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 1rem;
  color: #dc3545;
}

.retry-button {
  background-color: #4361ee;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 50px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.retry-button:hover {
  background-color: #3f37c9;
}

.empty-timeline {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 1rem;
  color: #6c757d;
  background-color: white;
  border-radius: 12px;
  padding: 3rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.empty-timeline i {
  font-size: 4rem;
  color: #adb5bd;
}

.empty-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.upload-btn {
  background-color: #4361ee;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 50px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.upload-btn:hover {
  background-color: #3f37c9;
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
}

.modal-container {
  background-color: white;
  border-radius: 12px;
  width: 95%;
  max-width: 1200px;
  max-height: 95vh;
  overflow-y: auto;
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