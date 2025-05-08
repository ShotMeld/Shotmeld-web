<template>
  <div class="photo-wall-container">
    <!-- 顶部导航栏 -->
    <nav class="app-navbar">
      <div class="navbar-brand">
        <router-link to="/photowall" class="logo-link">
          <span class="logo-text">ShotMeld</span>
        </router-link>
      </div>
      <div class="navbar-actions">
        <router-link to="/timeline" class="nav-button">
          <i class="fas fa-calendar-alt"></i>
          <span>时间轴</span>
        </router-link>
        <button @click="showUploadModal = true" class="nav-button">
          <i class="fas fa-cloud-upload-alt"></i>
          <span>上传照片</span>
        </button>
        <button @click="showAlbumForm = true" class="nav-button">
          <i class="fas fa-folder-plus"></i>
          <span>新建相册</span>
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

    <!-- 主内容区 -->
    <main class="photo-wall-main">
      <!-- 过滤和搜索区 -->
      <div class="filters-section">
        <div class="search-container">
          <i class="fas fa-search search-icon"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索照片..." 
            class="search-input"
            @input="debouncedSearch"
          >
        </div>
        <div class="filter-controls">
          <div class="filter-item">
            <label>相册:</label>
            <el-select v-model="filters.albumId" placeholder="全部相册" clearable @change="fetchPhotos">
              <el-option
                v-for="album in albums"
                :key="album.id"
                :label="album.name"
                :value="album.id">
              </el-option>
            </el-select>
          </div>
          <div class="filter-item">
            <label>标签:</label>
            <el-select 
              v-model="filters.tags" 
              multiple 
              collapse-tags 
              placeholder="选择标签" 
              @change="fetchPhotos">
              <el-option
                v-for="tag in tags"
                :key="tag.id"
                :label="tag.name"
                :value="tag.id">
              </el-option>
            </el-select>
          </div>
          <div class="filter-item">
            <label>日期范围:</label>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleDateRangeChange">
            </el-date-picker>
          </div>
          <div class="filter-item">
            <label>排序:</label>
            <el-select v-model="filters.sort" @change="fetchPhotos">
              <el-option label="拍摄时间" value="takenAt"></el-option>
              <el-option label="上传时间" value="createdAt"></el-option>
              <el-option label="标题" value="title"></el-option>
            </el-select>
            <el-select v-model="filters.order" style="margin-left: 5px;" @change="fetchPhotos">
              <el-option label="降序" value="desc"></el-option>
              <el-option label="升序" value="asc"></el-option>
            </el-select>
          </div>
        </div>
      </div>

      <!-- 照片网格 -->
      <div v-if="!loading" class="photos-grid">
        <div v-if="photos.length === 0" class="no-photos">
          <i class="fas fa-image no-photos-icon"></i>
          <p>没有照片。上传一些照片开始使用吧！</p>
          <button @click="showUploadModal = true" class="upload-btn">上传照片</button>
        </div>
        <div v-for="photo in photos" :key="photo.id" class="photo-item" @click="openPhotoDetail(photo)">
          <div class="photo-thumbnail">
            <img :src="photo.thumbnailUrl || photo.url" :alt="photo.title" />
          </div>
          <div class="photo-info">
            <h3>{{ photo.title || '无标题' }}</h3>
            <p class="photo-date">{{ formatDate(photo.takenAt) }}</p>
          </div>
        </div>
      </div>
      <div v-else class="loading-container">
        <el-spinner></el-spinner>
        <p>正在加载照片...</p>
      </div>
      
      <!-- 分页 -->
      <div class="pagination-container" v-if="totalPhotos > 0">
        <el-pagination
          v-model:currentPage="pagination.page"
          v-model:pageSize="pagination.limit"
          :page-sizes="[20, 50, 100]"
          :total="totalPhotos"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handlePageChange">
        </el-pagination>
      </div>

      <!-- 照片详情模态框 -->
      <transition name="modal">
        <div v-if="currentPhoto" class="modal-overlay" @click.self="closePhotoDetail">
          <div class="photo-detail-modal">
            <div class="photo-detail-header">
              <h2>{{ currentPhoto.title || '无标题照片' }}</h2>
              <button @click="closePhotoDetail" class="close-button">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="photo-detail-content">
              <div class="photo-detail-image">
                <img :src="currentPhoto.url" :alt="currentPhoto.title" @load="imageLoaded = true" />
                <div v-if="!imageLoaded" class="image-loading">
                  <el-spinner></el-spinner>
                </div>
              </div>
              <div class="photo-detail-info">
                <div class="info-group">
                  <h3>照片信息</h3>
                  <div class="info-item">
                    <span class="info-label">标题:</span>
                    <span class="info-value">{{ currentPhoto.title || '无标题' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">拍摄时间:</span>
                    <span class="info-value">{{ formatDate(currentPhoto.takenAt) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">文件大小:</span>
                    <span class="info-value">{{ formatFileSize(currentPhoto.fileSize) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">尺寸:</span>
                    <span class="info-value">{{ currentPhoto.width || 0 }}×{{ currentPhoto.height || 0 }}</span>
                  </div>
                </div>

                <div class="info-group">
                  <h3>标签</h3>
                  <div class="photo-tags">
                    <div v-if="currentPhoto.tags && currentPhoto.tags.length > 0" class="tags-container">
                      <span class="photo-tag" v-for="tag in currentPhoto.tags" :key="tag.id">
                        {{ tag.name }}
                      </span>
                    </div>
                    <div v-else class="no-tags">没有标签</div>
                  </div>
                </div>

                <div class="info-group">
                  <h3>相册</h3>
                  <div class="photo-albums">
                    <div v-if="currentPhoto.albums && currentPhoto.albums.length > 0" class="albums-container">
                      <span class="photo-album" v-for="album in currentPhoto.albums" :key="album.id">
                        {{ album.name }}
                      </span>
                    </div>
                    <div v-else class="no-albums">不在任何相册中</div>
                  </div>
                </div>

                <div class="photo-actions">
                  <el-button type="primary" @click="downloadPhoto(currentPhoto)">
                    <i class="fas fa-download"></i> 下载
                  </el-button>
                  <el-button type="danger" @click="confirmDeletePhoto">
                    <i class="fas fa-trash"></i> 删除
                  </el-button>
                </div>
              </div>
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

      <!-- 相册表单模态框 -->
      <transition name="modal">
        <div v-if="showAlbumForm" class="modal-overlay">
          <div class="modal-container">
            <div class="modal-header">
              <h2>创建相册</h2>
              <button @click="showAlbumForm = false" class="close-button">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <AlbumForm 
                @success="handleAlbumCreated"
                @cancel="showAlbumForm = false"
                @close="showAlbumForm = false"
              />
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
import AlbumForm from './AlbumForm.vue';
import PhotoUpload from './PhotoUpload.vue';
import { photoService, albumService, tagService } from '../api';
import debounce from 'lodash/debounce';

export default {
  name: 'PhotoWall',
  components: {
    AlbumForm,
    PhotoUpload
  },
  data() {
    return {
      photos: [],
      totalPhotos: 0,
      loading: true,
      searchQuery: '',
      currentPhoto: null,
      imageLoaded: false,
      showUploadModal: false,
      showAlbumForm: false,
      showDeleteConfirm: false,
      userName: '',
      albums: [],
      tags: [],
      dateRange: [],
      filters: {
        albumId: null,
        tags: [],
        sort: 'takenAt',
        order: 'desc',
        q: '',
        startDate: null,
        endDate: null
      },
      pagination: {
        page: 1,
        limit: 50
      }
    }
  },
  created() {
    this.debouncedSearch = debounce(() => {
      this.filters.q = this.searchQuery;
      this.fetchPhotos();
    }, 500);

    // 获取用户信息
    const user = JSON.parse(localStorage.getItem('user'))
    if (user) {
      this.userName = user.username || user.email
    }
    
    // 初始化数据
    this.fetchPhotos();
    this.fetchAlbums();
    this.fetchTags();
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
        if (this.filters.tags.length > 0) params.tags = this.filters.tags;
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
        this.albums = response.data || [];
      } catch (error) {
        console.error('获取相册列表失败:', error);
      }
    },
    
    async fetchTags() {
      try {
        const response = await tagService.getTags();
        this.tags = response.data || [];
      } catch (error) {
        console.error('获取标签列表失败:', error);
      }
    },
    
    openPhotoDetail(photo) {
      this.currentPhoto = photo;
      this.imageLoaded = false;
    },
    
    closePhotoDetail() {
      this.currentPhoto = null;
    },
    
    handlePhotoUploaded(uploadedPhotos) {
      this.showUploadModal = false;
      this.fetchPhotos();
      
      this.$notify({
        title: '上传成功',
        message: `已成功上传 ${uploadedPhotos.length || 1} 张照片`,
        type: 'success'
      });
    },
    
    handleAlbumCreated(newAlbum) {
      this.showAlbumForm = false;
      this.fetchAlbums();
      
      this.$notify({
        title: '成功',
        message: `相册"${newAlbum.name}"已创建`,
        type: 'success'
      });
    },
    
    handleDateRangeChange(dates) {
      if (dates && dates.length === 2) {
        this.filters.startDate = dates[0];
        this.filters.endDate = dates[1];
      } else {
        this.filters.startDate = null;
        this.filters.endDate = null;
      }
      
      this.fetchPhotos();
    },
    
    handlePageChange(page) {
      this.pagination.page = page;
      this.fetchPhotos();
    },
    
    handleSizeChange(size) {
      this.pagination.limit = size;
      this.pagination.page = 1;
      this.fetchPhotos();
    },
    
    downloadPhoto(photo) {
      const link = document.createElement('a');
      link.href = photo.url;
      link.download = photo.filename || 'photo.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    
    confirmDeletePhoto() {
      this.showDeleteConfirm = true;
    },
    
    async deletePhoto() {
      try {
        await photoService.deletePhoto(this.currentPhoto.id);
        
        this.$notify({
          title: '成功',
          message: '照片已删除',
          type: 'success'
        });
        
        // 移除已删除的照片
        this.photos = this.photos.filter(p => p.id !== this.currentPhoto.id);
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
    
    formatDate(dateString) {
      if (!dateString) return '未知日期'
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    
    handleLogout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete axios.defaults.headers.common['Authorization']
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
/* 基础样式 */
:root {
  --primary-color: #4361ee;
  --secondary-color: #3f37c9;
  --accent-color: #4895ef;
  --danger-color: #f72585;
  --light-color: #f8f9fa;
  --dark-color: #212529;
  --gray-color: #6c757d;
  --border-radius: 12px;
  --box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: var(--dark-color);
  background-color: #f5f7fa;
}

/* 导航栏样式 */
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

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--primary-color);
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
  border-radius: var(--border-radius);
  color: var(--gray-color);
  text-decoration: none;
  transition: var(--transition);
}

.nav-button:hover {
  color: var(--primary-color);
  background-color: rgba(67, 97, 238, 0.1);
}

.nav-button i {
  font-size: 1.1rem;
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
  color: var(--dark-color);
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  transition: var(--transition);
}

.user-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 0.5rem 0;
  min-width: 180px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: var(--transition);
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
  color: var(--dark-color);
  cursor: pointer;
  transition: var (--transition);
}

.dropdown-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--primary-color);
}

.dropdown-item i {
  width: 1.25rem;
  text-align: center;
}

/* 主内容区样式 */
.photo-wall-main {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
}

.search-section {
  margin-bottom: 2rem;
}

.search-container {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 0.5rem;
  transition: var(--transition);
}

.search-container:focus-within {
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
}

.search-icon {
  padding: 0 1rem;
  color: var(--gray-color);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 0.75rem 0;
  font-size: 1rem;
}

.search-button {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: calc(var(--border-radius) - 2px);
  cursor: pointer;
  font-weight: 600;
  transition: var(--transition);
}

.search-button:hover {
  background-color: var(--secondary-color);
}

.search-button:disabled {
  background-color: var(--gray-color);
  cursor: not-allowed;
}

.button-loader {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 照片卡片样式 */
.photo-card-container {
  margin-top: 2rem;
}

.photo-card {
  display: flex;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
}

.photo-image-container {
  flex: 1;
  min-height: 400px;
  position: relative;
  background-color: #f8f9fa;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.image-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-color);
  font-size: 2rem;
}

.photo-details {
  flex: 0 0 350px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.photo-header {
  margin-bottom: 1.5rem;
}

.photo-title {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--dark-color);
}

.photo-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.9rem;
  color: var(--gray-color);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.photo-description {
  margin-bottom: 1.5rem;
  color: var(--dark-color);
  line-height: 1.7;
}

.photo-stats {
  margin-bottom: 1.5rem;
}

.stat-item {
  margin-bottom: 1rem;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: var(--gray-color);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-weight: 500;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag {
  background-color: rgba(67, 97, 238, 0.1);
  color: var(--primary-color);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
}

.photo-actions {
  margin-top: auto;
  display: flex;
  gap: 1rem;
}

.action-button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 600;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.edit-button {
  background-color: var(--primary-color);
  color: white;
}

.edit-button:hover {
  background-color: var(--secondary-color);
}

.delete-button {
  background-color: white;
  color: var(--danger-color);
  border: 1px solid var(--danger-color);
}

.delete-button:hover {
  background-color: var(--danger-color);
  color: white;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 4rem 0;
}

.empty-icon {
  font-size: 3rem;
  color: var(--gray-color);
  margin-bottom: 1.5rem;
}

.empty-title {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--dark-color);
}

.empty-message {
  color: var(--gray-color);
}

/* 加载状态样式 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  color: var(--gray-color);
}

.loading-state i {
  font-size: 1.5rem;
}

/* 错误提示样式 */
.error-alert {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background-color: #fff3f3;
  color: var(--danger-color);
  padding: 1rem 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 1000;
}

.error-alert i {
  font-size: 1.2rem;
}

.close-button {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  margin-left: 1rem;
  opacity: 0.7;
  transition: var(--transition);
}

.close-button:hover {
  opacity: 1;
}

/* 过渡动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter, .slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 响应式设计 */
@media (max-width: 992px) {
  .photo-card {
    flex-direction: column;
  }
  
  .photo-details {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .app-navbar {
    padding: 1rem;
  }
  
  .photo-wall-main {
    padding: 0 1rem;
  }
  
  .search-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    padding: 0.75rem;
  }
  
  .search-button {
    width: 100%;
    margin-top: 0.5rem;
  }
  
  .photo-actions {
    flex-direction: column;
  }
}
.action-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.create-album-button {
  background-color: #4361ee;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s;
}

.create-album-button:hover {
  background-color: #3a56d4;
}

.create-album-button i {
  font-size: 0.9rem;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 12px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

/* 模态框过渡动画 */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s;
}
.modal-enter, .modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s;
}
.modal-enter .modal-container,
.modal-leave-to .modal-container {
  transform: translateY(-20px);
}

/* 添加新样式 */
.filters-section {
  margin-bottom: 20px;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 16px;
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-item label {
  font-weight: 500;
  color: var(--gray-color);
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.photo-item {
  background-color: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--box-shadow);
  cursor: pointer;
  transition: transform 0.3s ease;
}

.photo-item:hover {
  transform: translateY(-5px);
}

.photo-thumbnail {
  height: 180px;
  overflow: hidden;
}

.photo-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-info {
  padding: 12px;
}

.photo-info h3 {
  margin: 0;
  font-size: 14px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.photo-date {
  color: var(--gray-color);
  font-size: 12px;
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
  backdrop-filter: blur(5px);
}

.modal-container {
  background-color: white;
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 20px;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--gray-color);
}

.photo-detail-modal {
  background-color: white;
  border-radius: var(--border-radius);
  width: 95%;
  max-width: 1200px;
  max-height: 95vh;
  overflow-y: auto;
}

.photo-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
}

.photo-detail-content {
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .photo-detail-content {
    flex-direction: row;
    height: calc(95vh - 60px);
  }

  .photo-detail-image {
    flex: 2;
    border-right: 1px solid #ebeef5;
  }

  .photo-detail-info {
    flex: 1;
    overflow-y: auto;
  }
}

.photo-detail-image {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  position: relative;
  height: 100%;
  min-height: 300px;
}

.photo-detail-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.image-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-detail-info {
  padding: 16px;
}

.info-group {
  margin-bottom: 24px;
}

.info-group h3 {
  font-size: 16px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
}

.info-label {
  font-weight: 500;
  width: 100px;
  color: var(--gray-color);
}

.photo-tags, .photo-albums {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.photo-tag, .photo-album {
  background-color: rgba(64, 158, 255, 0.1);
  color: #409eff;
  border-radius: 16px;
  padding: 4px 12px;
  font-size: 12px;
}

.photo-album {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.no-tags, .no-albums {
  color: var (--gray-color);
  font-style: italic;
}

.photo-actions {
  margin-top: 24px;
  display: flex;
  gap: 12px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.no-photos {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
}

.no-photos-icon {
  font-size: 64px;
  color: var(--gray-color);
  margin-bottom: 16px;
}

.upload-btn {
  margin-top: 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
}

.loading-container {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
}

/* 动画效果 */
.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-enter-from .photo-detail-modal,
.modal-leave-to .modal-container,
.modal-leave-to .photo-detail-modal {
  transform: scale(0.9);
}
</style>