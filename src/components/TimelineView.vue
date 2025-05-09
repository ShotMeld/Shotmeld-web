<template>
  <div class="timeline-container">
    <!-- 顶部导航栏 -->
    <nav class="app-navbar">
      <div class="navbar-brand">
        <router-link to="/photowall" class="logo-link">
          <span class="logo-text">ShotMeld</span>
        </router-link>
      </div>
      <div class="navbar-actions">
        <router-link to="/photowall" class="nav-button">
          <i class="fas fa-th"></i>
          <span>照片墙</span>
        </router-link>
        <button @click="showUploadModal = true" class="nav-button">
          <i class="fas fa-cloud-upload-alt"></i>
          <span>上传照片</span>
        </button>
        <div class="user-dropdown">
          <button class="user-button">
            <i class="fas fa-user-circle"></i>
            <span>{{ userName }}</span>
          </button>
          <div class="dropdown-menu">
            <router-link to="/profile" class="dropdown-item">
              <i class="fas fa-user"></i> 个人资料
            </router-link>
            <button @click="handleLogout" class="dropdown-item">
              <i class="fas fa-sign-out-alt"></i> 登出
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="timeline-content">
      <h1 class="timeline-title">照片时间轴</h1>
      
      <div v-if="loading" class="loading-container">
        <el-spinner></el-spinner>
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
          <button @click="showUploadModal = true" class="upload-btn">上传照片</button>
        </div>
        
        <div v-else class="timeline">
          <div v-for="(yearGroup, yearIndex) in timelineGroups" :key="yearIndex" class="timeline-year">
            <h2 class="year-header">{{ yearGroup.year }}年</h2>
            
            <div v-for="(monthGroup, monthIndex) in yearGroup.months" :key="`${yearIndex}-${monthIndex}`" class="timeline-month">
              <h3 class="month-header">{{ monthGroup.month }}月</h3>
              
              <div class="photos-grid">
                <div v-for="photo in monthGroup.photos" :key="photo.id" class="photo-card" @click="showPhotoDetail(photo)">
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

      <!-- 照片详情模态框 -->
      <transition name="modal">
        <div v-if="currentPhoto" class="modal-overlay" @click.self="closePhotoDetail">
          <div class="modal-container">
            <div class="modal-header">
              <h2>{{ currentPhoto.title || '无标题照片' }}</h2>
              <button @click="closePhotoDetail" class="close-button">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <PhotoDetail 
                :photo="currentPhoto"
                @edit-photo="startEditingPhoto"
                @photo-deleted="handlePhotoDeleted"
              />
            </div>
          </div>
        </div>
      </transition>

      <!-- 上传照片模态框 -->
      <transition name="modal">
        <div v-if="showUploadModal" class="modal-overlay">
          <div class="modal-container">
            <div class="modal-header">
              <h2>上传照片</h2>
              <button @click="showUploadModal = false" class="close-button">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <PhotoUpload @upload-success="handlePhotoUploaded" />
            </div>
          </div>
        </div>
      </transition>

      <!-- 删除确认对话框 -->
      <el-dialog
        v-model="showDeleteConfirm"
        title="确认删除"
        width="30%"
        :show-close="false">
        <span>确定要删除这张照片吗？此操作不可恢复。</span>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showDeleteConfirm = false">取消</el-button>
            <el-button type="danger" @click="deletePhoto">确认</el-button>
          </span>
        </template>
      </el-dialog>
    </main>
  </div>
</template>

<script>
import axios from 'axios';
import { photoService } from '../api';
import PhotoUpload from './PhotoUpload.vue';
import PhotoDetail from './PhotoDetail.vue';

export default {
  name: 'TimelineView',
  components: {
    PhotoUpload,
    PhotoDetail
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
        // 获取所有照片
        const response = await photoService.getPhotos({
          limit: 1000, // 尽可能获取所有照片
          sort: 'takenAt',
          order: 'desc'
        });
        
        this.photos = response.data.data || [];
        
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
    },
    
    closePhotoDetail() {
      this.currentPhoto = null;
    },
    
    startEditingPhoto(photo) {
      // 实现编辑照片功能，可以打开一个编辑表单
      console.log('编辑照片:', photo);
      // TODO: 实现编辑照片的功能
      alert('编辑照片功能将在后续版本实现');
    },
    
    handlePhotoDeleted(photoId) {
      // 这个方法会被 PhotoDetail 组件调用
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
      delete axios.defaults.headers.common['Authorization'];
      this.$router.push('/login');
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

.app-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #4361ee;
  font-weight: 700;
  font-size: 1.5rem;
}

.logo-icon {
  font-size: 1.8rem;
  margin-right: 0.5rem;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  color: #6c757d;
  text-decoration: none;
  transition: all 0.3s ease;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.nav-button:hover {
  color: #4361ee;
  background-color: rgba(67, 97, 238, 0.1);
}

.user-dropdown {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #212529;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.user-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  min-width: 180px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.3s ease;
  z-index: 100;
}

.user-dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  text-align: left;
  color: #212529;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  color: #4361ee;
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
  border-bottom: 2px solid #4361ee;
  padding-bottom: 0.5rem;
  color: #4361ee;
}

.timeline-month {
  margin-bottom: 2rem;
}

.month-header {
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: #6c757d;
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
}

.empty-timeline i {
  font-size: 4rem;
  color: #adb5bd;
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

/* 移除这些样式，现在使用 PhotoDetail 组件的样式 */

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
  padding: 0; /* 不需要内边距，因为 PhotoDetail 组件已有内边距 */
}

/* 动画效果 */
.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}
</style>