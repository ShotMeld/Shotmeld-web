<template>
  <div class="photo-wall-container">
    <!-- 顶部导航栏 -->
    <nav class="app-navbar">
      <div class="navbar-brand">
        <router-link to="/" class="logo-link">
          <i class="logo-icon">📷</i>
          <span class="logo-text">PhotoWall</span>
        </router-link>
      </div>
      <div class="navbar-actions">
        <router-link to="/timeline" class="nav-button">
          <i class="fas fa-calendar-alt"></i>
          <span>时间轴</span>
        </router-link>
        <div class="user-dropdown">
          <button class="user-button">
            <i class="fas fa-user-circle"></i>
            <span>{{ userName }}</span>
          </button>
          <div class="dropdown-menu">
            <button @click="handleLogout" class="dropdown-item">
              <i class="fas fa-sign-out-alt"></i> 登出
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容区 -->
    <main class="photo-wall-main">
      <div class="search-section">
        <div class="search-container">
          <i class="fas fa-search search-icon"></i>
          <input 
            v-model="photoId" 
            type="text" 
            placeholder="输入照片ID..." 
            class="search-input"
            @keyup.enter="fetchPhoto"
          >
          <button 
            @click="fetchPhoto" 
            :disabled="loading" 
            class="search-button"
          >
            <span v-if="loading" class="button-loader"></span>
            <span v-else>搜索</span>
          </button>
            <div class="action-bar">
        <button @click="showAlbumForm = true" class="create-album-button">
          <i class="fas fa-plus"></i> 创建相册
        </button>
      </div>
        </div>
      </div>

      <!-- 照片详情卡片 -->
      <transition name="fade">
        <div v-if="currentPhoto" class="photo-card-container">
          <div class="photo-card">
            <div class="photo-image-container">
              <img 
                :src="currentPhoto.url" 
                :alt="currentPhoto.title" 
                class="photo-image"
                @load="imageLoaded = true"
              >
              <div v-if="!imageLoaded" class="image-loading">
                <i class="fas fa-spinner fa-spin"></i>
              </div>
            </div>
            
            <div class="photo-details">
              <div class="photo-header">
                <h2 class="photo-title">{{ currentPhoto.title || '未命名照片' }}</h2>
                <div class="photo-meta">
                  <span class="meta-item">
                    <i class="fas fa-calendar"></i>
                    {{ formatDate(currentPhoto.takenAt || currentPhoto.createdAt) }}
                  </span>
                  <span v-if="currentPhoto.location" class="meta-item">
                    <i class="fas fa-map-marker-alt"></i>
                    {{ currentPhoto.location.name || '未知位置' }}
                  </span>
                </div>
              </div>
              
              <p v-if="currentPhoto.description" class="photo-description">
                {{ currentPhoto.description }}
              </p>
              
              <div class="photo-stats">
                <div class="stat-item">
                  <span class="stat-label">尺寸</span>
                  <span class="stat-value">{{ currentPhoto.width }} × {{ currentPhoto.height }} px</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">文件大小</span>
                  <span class="stat-value">{{ formatFileSize(currentPhoto.fileSize) }}</span>
                </div>
                <div v-if="currentPhoto.tags && currentPhoto.tags.length" class="stat-item">
                  <span class="stat-label">标签</span>
                  <div class="tags">
                    <span v-for="tag in currentPhoto.tags" :key="tag" class="tag">
                      #{{ tag }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="photo-actions">
                <button class="action-button edit-button">
                  <i class="fas fa-edit"></i> 编辑
                </button>
                <button 
                  @click="handleDelete(currentPhoto.id)" 
                  class="action-button delete-button"
                >
                  <i class="fas fa-trash-alt"></i> 删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- 空状态 -->
      <div v-if="!currentPhoto && !loading" class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-camera"></i>
        </div>
        <h3 class="empty-title">没有找到照片</h3>
        <p class="empty-message">请输入照片ID搜索或上传新照片</p>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <span>加载中...</span>
      </div>

      <!-- 错误提示 -->
      <transition name="slide-down">
        <div v-if="error" class="error-alert">
          <i class="fas fa-exclamation-circle"></i>
          <span>{{ error }}</span>
          <button @click="error = ''" class="close-button">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </transition>
<transition name="modal">
        <div v-if="showAlbumForm" class="modal-overlay">
          <div class="modal-container">
            <AlbumForm 
              @success="handleAlbumCreated"
              @cancel="showAlbumForm = false"
              @close="showAlbumForm = false"
            />
          </div>
        </div>
      </transition>
    </main>
  </div>
</template>

<script>
import axios from 'axios'
import AlbumForm from '../components/AlbumForm.vue'

export default {
  name: 'PhotoWall',
  components: {
    AlbumForm,
  },
  data() {
    return {
      photoId: '',
      currentPhoto: null,
      error: '',
      loading: false,
      userName: '',
      imageLoaded: false,
      showAlbumForm: false,
    }
  },
  created() {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user) {
      this.userName = user.name || user.email
    }
  },
  methods: {
     handleAlbumCreated(newAlbum) {
      this.showAlbumForm = false
      this.$notify({
        title: '成功',
        message: `相册"${newAlbum.name}"已创建`,
        type: 'success'
      })
      // 这里可以添加逻辑来更新相册列表
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
    async fetchPhoto() {
      if (!this.photoId) {
        this.error = '请输入照片ID'
        return
      }

      this.error = ''
      this.currentPhoto = null
      this.loading = true
      this.imageLoaded = false

      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`http://120.55.78.33:3000/photos/${this.photoId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        this.currentPhoto = response.data
      } catch (err) {
        console.error('获取照片失败:', err)
        if (err.response && err.response.status === 401) {
          this.error = '认证失效，请重新登录'
          this.handleLogout()
        } else {
          this.error = err.response?.data?.message || '获取照片失败，请检查ID是否正确'
        }
      } finally {
        this.loading = false
      }
    },
    handleDelete(photoId) {
      if (confirm('确定要删除这张照片吗？')) {
        // 这里添加删除逻辑
        this.$notify({
          title: '成功',
          message: '照片已删除',
          type: 'success'
        })
        this.currentPhoto = null
        this.photoId = ''
      }
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
  transition: var(--transition);
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
</style>