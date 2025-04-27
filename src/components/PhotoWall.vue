<template>
  <div class="photo-wall-container" :class="{ 'logged-in': isLoggedIn }">
    <header class="app-header">
      <div class="user-info">
        <span>欢迎, {{ userName }}</span>
        <button @click="handleLogout" class="logout-button">登出</button>
      </div>
      <router-link to="/timeline" class="nav-link">时间轴</router-link>
    </header>

    <div class="photo-wall-content">
      <h1>照片墙</h1>
      
      <div class="photo-input">
        <input 
          v-model="photoId" 
          type="text" 
          placeholder="输入照片ID" 
          class="search-input"
        >
        <button @click="fetchPhoto" :disabled="loading" class="search-button">
          {{ loading ? '加载中...' : '获取照片' }}
        </button>
      </div>

      <PhotoDetail 
        v-if="currentPhoto" 
        :photo="currentPhoto" 
        @photo-deleted="handlePhotoDeleted"
        @photo-updated="handlePhotoUpdated"
      />

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import PhotoDetail from '../components/PhotoDetail.vue'
import axios from 'axios'

export default {
  name: 'PhotoWall',
  components: {
    PhotoDetail
  },
  data() {
    return {
      photoId: '',
      currentPhoto: null,
      error: '',
      loading: false,
      userName: '',
      timelineData: [],
      isLoggedIn: false
    }
  },
  created() {
    this.checkLoginStatus()
    const user = JSON.parse(localStorage.getItem('user'))
    if (user) {
      this.userName = user.name || user.email
      this.isLoggedIn = true
    }
  },
  methods: {
    checkLoginStatus() {
      this.isLoggedIn = !!localStorage.getItem('token')
    },
    handlePhotoDeleted(deletedPhotoId) {
      if (this.currentPhoto && this.currentPhoto.id === deletedPhotoId) {
        this.currentPhoto = null
        this.photoId = ''
      }
    },
    handlePhotoUpdated(updatedPhoto) {
      if (this.currentPhoto && this.currentPhoto.id === updatedPhoto.id) {
        this.currentPhoto = updatedPhoto
      }
      
      this.timelineData = this.timelineData.map(yearGroup => ({
        ...yearGroup,
        months: yearGroup.months.map(monthGroup => ({
          ...monthGroup,
          photos: monthGroup.photos.map(photo => 
            photo.id === updatedPhoto.id ? updatedPhoto : photo
          )
        }))
      }))
      
      this.$notify({
        title: '成功',
        message: '照片信息已更新',
        type: 'success'
      })
    },
    async fetchPhoto() {
      if (!this.photoId) {
        this.error = '请输入照片ID'
        return
      }

      this.error = ''
      this.currentPhoto = null
      this.loading = true

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
    handleLogout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.isLoggedIn = false
      delete axios.defaults.headers.common['Authorization']
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.photo-wall-container {
  min-height: 100vh;
  background-color: #f8f9fa; /* 默认背景色 */
  transition: background-color 0.5s ease;
}

.photo-wall-container.logged-in {
  background-color: #e1f5fe; /* 天蓝色背景 */
}

.app-header {
  background-color: #6750a4;
  padding: 16px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-info {
  color: white;
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.logout-button {
  background: transparent;
  color: white;
  border: 1px solid white;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.photo-wall-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 20px;
}

.photo-input {
  margin: 20px 0;
  display: flex;
  gap: 10px;
  max-width: 600px;
}

.search-input {
  padding: 12px 16px;
  flex-grow: 1;
  border: 2px solid #b3e5fc;
  border-radius: 12px;
  outline: none;
  transition: border-color 0.2s;
  background-color: rgba(255, 255, 255, 0.8);
}

.search-input:focus {
  border-color: #4fc3f7;
  box-shadow: 0 0 0 3px rgba(79, 195, 247, 0.2);
}

.search-button {
  padding: 12px 24px;
  background-color: #4fc3f7;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-weight: 500;
}

.search-button:hover {
  background-color: #29b6f6;
}

.search-button:disabled {
  background-color: #b3e5fc;
  cursor: not-allowed;
}

.error-message {
  color: #ff4444;
  margin-top: 20px;
  padding: 12px;
  background-color: rgba(255, 235, 238, 0.8);
  border-radius: 8px;
  text-align: center;
  border: 1px solid #ffcdd2;
}

h1 {
  color: #0277bd;
  text-align: center;
  margin-bottom: 24px;
  font-size: 2.2rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .photo-wall-content {
    padding: 24px 16px;
  }
  
  .photo-input {
    flex-direction: column;
  }
  
  .search-button {
    width: 100%;
  }
  
  h1 {
    font-size: 1.8rem;
  }
  
  .app-header {
    padding: 12px 16px;
    flex-direction: column;
    gap: 12px;
  }
  
  .user-info {
    width: 100%;
    justify-content: space-between;
  }
}
</style>