<template>
  <div class="photo-wall-container">
    <!-- 顶部导航栏 -->
    <SfNavbar title="ShotMeld" transparent>
      <template #actions>
        <SfNavLink to="/timeline">
          <template #icon>
            <i class="fas fa-calendar-alt"></i>
          </template>
          时间轴
        </SfNavLink>
        
        <SfButton 
          type="secondary" 
          @click="showUploadModal = true"
          size="small"
        >
          <template #prefix>
            <i class="fas fa-cloud-upload-alt"></i>
          </template>
          上传照片
        </SfButton>
        
        <SfButton 
          type="secondary" 
          @click="showAlbumForm = true"
          size="small"
        >
          <template #prefix>
            <i class="fas fa-folder-plus"></i>
          </template>
          新建相册
        </SfButton>
        
        <div class="user-dropdown">
          <SfAvatar 
            :text="userName" 
            size="small" 
            class="user-avatar"
          />
          <div class="dropdown-menu">
            <SfNavLink to="/profile">
              <template #icon>
                <i class="fas fa-user"></i>
              </template>
              个人资料
            </SfNavLink>
            <SfNavLink href="#" @click="handleLogout">
              <template #icon>
                <i class="fas fa-sign-out-alt"></i>
              </template>
              退出登录
            </SfNavLink>
          </div>
        </div>
      </template>
    </SfNavbar>

    <!-- 主内容区 -->
    <main class="photo-wall-main">
      <!-- 过滤和搜索区 -->
      <div class="filters-section">
        <SfCard class="search-card" shadow="medium">
          <div class="search-container">
            <SfInput
              v-model="searchQuery"
              placeholder="搜索照片..."
              @input="debouncedSearch"
              class="search-input"
            >
              <template #prefix>
                <i class="fas fa-search"></i>
              </template>
            </SfInput>
          </div>
          
          <div class="filter-controls">
            <div class="filter-item">
              <label class="filter-label">相册</label>
              <div class="apple-select-wrapper">
                <el-select v-model="filters.albumId" placeholder="全部相册" clearable @change="fetchPhotos" class="apple-select">
                  <el-option
                    v-for="album in albums"
                    :key="album.id"
                    :label="album.name"
                    :value="album.id">
                  </el-option>
                </el-select>
              </div>
            </div>
            
            <div class="filter-item">
              <label class="filter-label">标签</label>
              <div class="apple-select-wrapper">
                <el-select 
                  v-model="filters.tags" 
                  multiple 
                  collapse-tags 
                  placeholder="选择标签" 
                  @change="fetchPhotos"
                  class="apple-select">
                  <el-option
                    v-for="tag in tags"
                    :key="tag.id"
                    :label="tag.name"
                    :value="tag.id">
                  </el-option>
                </el-select>
              </div>
            </div>
            
            <div class="filter-item">
              <label class="filter-label">日期范围</label>
              <div class="apple-datepicker-wrapper">
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  @change="handleDateRangeChange"
                  class="apple-datepicker">
                </el-date-picker>
              </div>
            </div>
            
            <div class="filter-item">
              <label class="filter-label">排序</label>
              <div class="sort-controls">
                <div class="apple-select-wrapper sort-field">
                  <el-select v-model="filters.sort" @change="fetchPhotos" class="apple-select">
                    <el-option label="拍摄时间" value="takenAt"></el-option>
                    <el-option label="上传时间" value="createdAt"></el-option>
                    <el-option label="标题" value="title"></el-option>
                  </el-select>
                </div>
                <div class="apple-select-wrapper sort-order">
                  <el-select v-model="filters.order" @change="fetchPhotos" class="apple-select">
                    <el-option label="降序" value="desc"></el-option>
                    <el-option label="升序" value="asc"></el-option>
                  </el-select>
                </div>
              </div>
            </div>
          </div>
        </SfCard>
      </div>

      <!-- 照片网格 -->
      <div v-if="!loading" class="photos-grid">
        <div v-if="photos.length === 0" class="no-photos">
          <i class="fas fa-image no-photos-icon"></i>
          <p>没有照片。上传一些照片开始使用吧！</p>
          <SfButton 
            @click="showUploadModal = true" 
            type="primary"
            rounded
          >
            <template #prefix>
              <i class="fas fa-cloud-upload-alt"></i>
            </template>
            上传照片
          </SfButton>
        </div>
        
        <SfCard 
          v-for="photo in photos" 
          :key="photo.id" 
          class="photo-card" 
          hoverable 
          shadow="small"
          @click="openPhotoDetail(photo)"
        >
          <div class="photo-thumbnail">
            <img :src="photo.thumbnailUrl || photo.url" :alt="photo.title" loading="lazy" />
          </div>
          <div class="photo-info">
            <h3 class="photo-title">{{ photo.title || '无标题' }}</h3>
            <p class="photo-date">{{ formatDate(photo.takenAt) }}</p>
            <div class="photo-tags-container" v-if="photo.tags && photo.tags.length > 0">
              <SfBadge 
                v-for="tag in photo.tags.slice(0, 2)" 
                :key="tag.id"
                type="secondary"
                size="small"
                class="photo-tag-badge"
              >
                {{ tag.name }}
              </SfBadge>
              <SfBadge 
                v-if="photo.tags.length > 2" 
                type="neutral"
                size="small"
              >
                +{{ photo.tags.length - 2 }}
              </SfBadge>
            </div>
          </div>
        </SfCard>
      </div>
      
      <div v-else class="loading-container">
        <div class="spinner"></div>
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
      <SfModal
        v-model="showPhotoDetail"
        :title="currentPhoto?.title || '无标题照片'"
        size="large"
      >
        <div class="photo-detail-content">
          <div class="photo-detail-image">
            <img 
              v-if="currentPhoto" 
              :src="currentPhoto.url" 
              :alt="currentPhoto.title" 
              @load="imageLoaded = true" 
            />
            <div v-if="!imageLoaded" class="image-loading">
              <div class="spinner"></div>
            </div>
          </div>
          <div class="photo-detail-info">
            <div class="info-group">
              <h3 class="info-group-title">照片信息</h3>
              <div class="info-item">
                <span class="info-label">标题:</span>
                <span class="info-value">{{ currentPhoto?.title || '无标题' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">拍摄时间:</span>
                <span class="info-value">{{ formatDate(currentPhoto?.takenAt) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">文件大小:</span>
                <span class="info-value">{{ formatFileSize(currentPhoto?.fileSize) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">尺寸:</span>
                <span class="info-value">{{ currentPhoto?.width || 0 }}×{{ currentPhoto?.height || 0 }}</span>
              </div>
            </div>
            
            <div class="info-group" v-if="currentPhoto?.tags && currentPhoto.tags.length > 0">
              <h3 class="info-group-title">标签</h3>
              <div class="photo-tags">
                <SfBadge
                  v-for="tag in currentPhoto.tags"
                  :key="tag.id"
                  type="secondary"
                  class="detail-tag"
                >
                  {{ tag.name }}
                </SfBadge>
              </div>
            </div>
            
            <div class="info-group" v-if="currentPhoto?.albums && currentPhoto.albums.length > 0">
              <h3 class="info-group-title">所属相册</h3>
              <div class="photo-albums">
                <SfBadge
                  v-for="album in currentPhoto.albums"
                  :key="album.id"
                  type="success"
                  class="detail-album"
                >
                  {{ album.name }}
                </SfBadge>
              </div>
            </div>
            
            <div class="photo-actions">
              <SfButton 
                type="primary" 
                @click="downloadPhoto(currentPhoto)"
              >
                <template #prefix>
                  <i class="fas fa-download"></i>
                </template>
                下载
              </SfButton>
              
              <SfButton 
                type="danger" 
                @click="confirmDeletePhoto"
              >
                <template #prefix>
                  <i class="fas fa-trash"></i>
                </template>
                删除
              </SfButton>
            </div>
          </div>
        </div>
      </SfModal>

      <!-- 上传照片模态框 -->
      <SfModal
        v-model="showUploadModal"
        title="上传照片"
        size="default"
      >
        <PhotoUpload @upload-success="handlePhotoUploaded" />
      </SfModal>

      <!-- 相册表单模态框 -->
      <SfModal
        v-model="showAlbumForm"
        title="新建相册"
        size="default"
      >
        <AlbumForm @album-created="handleAlbumCreated" />
      </SfModal>

      <!-- 删除确认对话框 -->
      <el-dialog
        v-model="showDeleteConfirm"
        title="确认删除"
        width="30%"
        :show-close="false">
        <p>确定要删除这张照片吗？此操作无法撤销。</p>
        <template #footer>
          <span class="dialog-footer">
            <SfButton type="tertiary" @click="showDeleteConfirm = false">取消</SfButton>
            <SfButton type="danger" @click="deletePhoto">确认删除</SfButton>
          </span>
        </template>
      </el-dialog>
    </main>
  </div>
</template>

<script>
// 保持原有的导入项
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import AlbumForm from './AlbumForm.vue';
import PhotoUpload from './PhotoUpload.vue';
import PhotoDetail from './PhotoDetail.vue';
import { photoService, albumService, tagService } from '../api';

export default {
  name: 'PhotoWall',
  components: {
    AlbumForm,
    PhotoUpload,
    PhotoDetail
  },
  data() {
    return {
      photos: [],
      albums: [],
      tags: [],
      loading: true,
      currentPhoto: null,
      showPhotoDetail: false,
      showUploadModal: false,
      showAlbumForm: false,
      showDeleteConfirm: false,
      imageLoaded: false,
      totalPhotos: 0,
      dateRange: null,
      searchQuery: '',
      pagination: {
        page: 1,
        limit: 20
      },
      filters: {
        albumId: null,
        tags: [],
        startDate: null,
        endDate: null,
        sort: 'takenAt',
        order: 'desc'
      }
    }
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
    this.fetchTags();
  },
  methods: {
    // 保持原有方法，确保它们正常工作
    // 添加必要的方法调整
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
    
    debouncedSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.pagination.page = 1;
        this.fetchPhotos();
      }, 500);
    },
    
    handlePhotoUploaded() {
      this.showUploadModal = false;
      this.fetchPhotos();
    },
    
    handleAlbumCreated() {
      this.showAlbumForm = false;
      this.fetchAlbums();
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
      if (!bytes || bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    
    handleLogout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
/* 基础布局 */
.photo-wall-container {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.photo-wall-main {
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: var(--spacing-xl);
}

/* 用户下拉菜单 */
.user-dropdown {
  position: relative;
  margin-left: var(--spacing-sm);
}

.user-avatar {
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background-color: var(--bg-primary);
  border-radius: var(--radius-large);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06), 0 16px 32px rgba(0, 0, 0, 0.06);
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(var(--spacing-xs));
  transition: all var(--transition-fast);
  overflow: hidden;
  z-index: 10;
}

.user-dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(var(--spacing-2xs));
}

/* 搜索和过滤区 */
.filters-section {
  margin-bottom: var(--spacing-xl);
}

.search-card {
  padding: var(--spacing-lg);
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.search-container {
  margin-bottom: var(--spacing-lg);
}

.search-input {
  width: 100%;
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.filter-item {
  flex: 1 1 240px;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.filter-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  letter-spacing: 0.01em;
}

.sort-controls {
  display: flex;
  gap: var(--spacing-sm);
}

.sort-field {
  flex: 2;
}

.sort-order {
  flex: 1;
}

/* Apple 风格的 Select 组件 */
.apple-select-wrapper {
  position: relative;
}

:deep(.apple-select) {
  width: 100%;
}

:deep(.apple-select .el-input__wrapper) {
  background-color: var(--bg-secondary);
  border-radius: var(--radius-round);
  padding: var(--spacing-xs) var(--spacing-sm);
  box-shadow: none;
  border: 2px solid transparent;
  transition: all var(--transition-base);
}

:deep(.apple-select .el-input__wrapper:hover) {
  background-color: var(--bg-tertiary);
}

:deep(.apple-select .el-input__wrapper.is-focus) {
  background-color: var(--color-white);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.15);
}

:deep(.apple-select .el-input__inner) {
  color: var(--text-primary);
  font-family: var(--font-family);
  font-size: var(--font-size-base);
}

:deep(.apple-datepicker) {
  width: 100%;
}

:deep(.apple-datepicker .el-input__wrapper) {
  background-color: var(--bg-secondary);
  border-radius: var(--radius-round);
  padding: var(--spacing-xs) var(--spacing-sm);
  box-shadow: none;
  border: 2px solid transparent;
  transition: all var(--transition-base);
}

:deep(.apple-datepicker .el-input__wrapper:hover) {
  background-color: var(--bg-tertiary);
}

:deep(.apple-datepicker .el-input__wrapper.is-focus) {
  background-color: var(--color-white);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.15);
}

/* 照片网格 */
.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.photo-card {
  overflow: hidden;
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.8);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), 
              box-shadow 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.photo-card:hover {
  transform: scale(1.02) translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.07), 0 20px 48px rgba(0, 0, 0, 0.06);
}

.photo-thumbnail {
  height: 220px;
  overflow: hidden;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-medium) var(--radius-medium) 0 0;
}

.photo-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.33, 1, 0.68, 1);
}

.photo-card:hover .photo-thumbnail img {
  transform: scale(1.05);
}

.photo-info {
  padding: var(--spacing-md) var(--spacing-lg);
}

.photo-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-2xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-primary);
}

.photo-date {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.photo-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2xs);
  margin-top: var(--spacing-xs);
}

.photo-tag-badge {
  margin-right: var(--spacing-2xs);
}

/* 无照片状态 */
.no-photos {
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--spacing-3xl);
  background: var(--bg-primary);
  border-radius: var(--radius-large);
  box-shadow: var(--shadow-small);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.no-photos-icon {
  font-size: 64px;
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-md);
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl);
  color: var(--text-secondary);
  gap: var(--spacing-md);
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: var(--radius-large);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 122, 255, 0.1);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
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
  background-color: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

/* 照片详情模态框 */
.photo-detail-content {
  display: flex;
  flex-direction: column;
}

.photo-detail-image {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-tertiary);
  position: relative;
  min-height: 300px;
  border-radius: var(--radius-medium);
  overflow: hidden;
}

.photo-detail-image img {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
}

.photo-detail-info {
  padding: var(--spacing-lg);
}

.info-group {
  margin-bottom: var(--spacing-lg);
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.info-group-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-2xs);
  border-bottom: var(--border-width) solid var(--border-color);
  color: var(--text-primary);
}

.info-item {
  display: flex;
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-base);
}

.info-label {
  width: 100px;
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.info-value {
  flex: 1;
  color: var(--text-primary);
}

.photo-tags, .photo-albums {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.detail-tag, .detail-album {
  margin-bottom: var(--spacing-xs);
  transition: transform var(--transition-base);
}

.detail-tag:hover, .detail-album:hover {
  transform: translateY(-2px);
}

.photo-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}

/* 确认对话框 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin: var(--spacing-xl) 0;
  padding: var(--spacing-md);
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: var(--radius-large);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: var(--shadow-small);
}

:deep(.el-pagination) {
  --el-pagination-font-size: var(--font-size-base);
  --el-pagination-button-color: var(--text-primary);
  --el-pagination-button-bg-color: transparent;
  --el-pagination-button-disabled-color: var(--text-disabled);
  --el-pagination-button-disabled-bg-color: transparent;
  --el-pagination-hover-color: var(--color-primary);
}

:deep(.el-pagination .el-pager li) {
  border-radius: var(--radius-round);
  min-width: 32px;
  height: 32px;
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
}

:deep(.el-pagination .el-pager li.is-active) {
  background-color: var(--color-primary);
  color: var(--color-white);
}

/* 响应式设计 */
@media (min-width: 768px) {
  .photo-detail-content {
    flex-direction: row;
    min-height: 500px;
  }
  
  .photo-detail-image {
    flex: 2;
    border-right: var(--border-width) solid var(--border-color);
    border-radius: var(--radius-medium) 0 0 var(--radius-medium);
  }
  
  .photo-detail-info {
    flex: 1;
    overflow-y: auto;
    max-height: 600px;
  }
}

@media (max-width: 768px) {
  .photo-wall-main {
    padding: var(--spacing-md);
  }
  
  .filter-controls {
    flex-direction: column;
  }
  
  .photo-actions {
    flex-direction: column;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>