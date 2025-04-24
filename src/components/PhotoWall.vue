<template>
    <div class="photo-wall-container">
        <header class="app-header">
            <div class="user-info">
                <span>欢迎, {{ userName }}</span>
                <button @click="handleLogout" class="logout-button">登出</button>
            </div>
        </header>

        <div class="photo-wall-content">
            <h1>照片墙</h1>
             <PhotoDetail 
                v-if="currentPhoto" 
                :photo="currentPhoto" 
                @photo-deleted="handlePhotoDeleted"
                />
            <div class="photo-input">
                <input v-model="photoId" type="number" placeholder="输入照片ID" min="1">
                <button @click="fetchPhoto" :disabled="loading">
                    {{ loading ? '加载中...' : '获取照片' }}
                </button>
            </div>

            <PhotoDetail v-if="currentPhoto" :photo="currentPhoto" />

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
            userName: ''
        }
    },
    created() {
        // 从本地存储获取用户信息
        const user = JSON.parse(localStorage.getItem('user'))
        if (user) {
            this.userName = user.name || user.email
        }
    },
    methods: {
         handlePhotoDeleted(deletedPhotoId) {
            if (this.currentPhoto && this.currentPhoto.id === deletedPhotoId) {
                this.currentPhoto = null
                this.photoId = ''
            } 
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
                    this.error = '获取照片失败，请检查ID是否正确'
                }
            } finally {
                this.loading = false
            }
      
    },
         
        },
        handleLogout() {
            // 清除本地存储
            localStorage.removeItem('token')
            localStorage.removeItem('user')

            // 清除axios默认请求头
            delete axios.defaults.headers.common['Authorization']

            // 跳转到登录页
            this.$router.push('/login')
        }
    }

</script>

<style scoped>
.photo-wall-container {
    min-height: 100vh;
    background-color: #f8f9fa;
}

.app-header {
    background-color: #6750a4;
    padding: 16px 32px;
    display: flex;
    justify-content: flex-end;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-info {
    color: white;
    display: flex;
    align-items: center;
    gap: 16px;
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
    max-width: 800px;
    margin: 0 auto;
    padding: 32px 20px;
}

.photo-input {
    margin: 20px 0;
    display: flex;
    gap: 10px;
}

input {
    padding: 8px;
    width: 200px;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    outline: none;
}

input:focus {
    border-color: #6750a4;
}

button {
    padding: 8px 16px;
    background-color: #6750a4;
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
}

button:hover {
    background-color: #7c63b9;
}

button:disabled {
    background-color: #e0e0e0;
    cursor: not-allowed;
}

.error-message {
    color: #ff5252;
    margin-top: 20px;
}
</style>