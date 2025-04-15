<template>
  <div class="ai-recognition">
    <div class="page-header">
      <button @click="goBack" class="back-btn">
        <span class="emoji">⬅️</span>
        返回个人中心
      </button>
      <h1>AI 图像识别</h1>
      <p class="subtitle">上传图片，体验智能识别</p>
    </div>
    
    <div class="main-content">
      <div class="upload-section">
        <input 
          type="file" 
          accept="image/*" 
          @change="handleImageUpload" 
          ref="fileInput"
          class="file-input"
        />
        <div 
          class="upload-area"
          :class="{ 'dragover': isDragging }"
          @click="triggerFileInput"
          @dragover.prevent="handleDragOver"
          @dragenter.prevent="handleDragEnter"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
        >
          <div v-if="!previewImage" class="upload-placeholder">
            <span class="emoji">📤</span>
            <p>点击或拖拽图片到此处</p>
            <span class="upload-hint">支持 JPG、PNG 格式，大小不超过 5MB</span>
          </div>
          <img v-else :src="previewImage" class="preview-image" />
        </div>
        <button @click="analyzeImage" :disabled="!previewImage" class="analyze-btn">
          <span class="emoji">✨</span>
          开始分析
        </button>
      </div>

      <div v-if="analysisResult" class="result-section">
        <h2>分析结果</h2>
        <div class="result-grid">
          <div class="result-card">
            <div class="card-icon">
              <span class="emoji">🔍</span>
            </div>
            <div class="card-content">
              <h3>识别结果</h3>
              <div class="tags-container">
                <span v-for="(item, index) in analysisResult.result" :key="index" class="tag">
                  {{ item.keyword }}
                  <span class="tag-score">{{ (item.score * 100).toFixed(1) }}%</span>
                </span>
              </div>
            </div>
          </div>

          <div class="result-card">
            <div class="card-icon">
              <span class="emoji">📊</span>
            </div>
            <div class="card-content">
              <h3>识别数量</h3>
              <p class="card-value">{{ analysisResult.result_num }}个标签</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="error" class="error-message">
        <span class="emoji">⚠️</span>
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'AIRecognitionPage',
  data() {
    return {
      previewImage: null,
      analysisResult: null,
      error: null,
      base64Image: null,
      accessToken: null,
      isDragging: false
    }
  },
  mounted() {
    this.getAccessToken()
  },
  methods: {
    async getAccessToken() {
      try {
        const response = await axios({
          method: 'POST',
          url: '/baidu/oauth/2.0/token?grant_type=client_credentials&client_id=59FbMyjupVi14TInH2djmvgk&client_secret=1rw0NRmN8GOXTY67ncRlqA9iiikBgS9V',
        })
        this.accessToken = response.data.access_token
      } catch (error) {
        console.error('获取访问令牌失败:', error)
        this.error = '获取访问令牌失败，请重试'
      }
    },
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    handleDragEnter() {
      this.isDragging = true
    },
    handleDragLeave() {
      this.isDragging = false
    },
    handleDragOver(event) {
      event.preventDefault()
      this.isDragging = true
    },
    handleDrop(event) {
      this.isDragging = false
      const file = event.dataTransfer.files[0]
      if (file) {
        this.handleFile(file)
      }
    },
    handleFile(file) {
      // 重置之前的结果和错误
      this.analysisResult = null
      this.error = null
      
      // 检查文件类型
      if (!file.type.match('image.*')) {
        this.error = '请上传图片文件'
        return
      }
      
      // 检查文件大小（限制为5MB）
      if (file.size > 5 * 1024 * 1024) {
        this.error = '图片大小应小于5MB'
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        // 存储预览图和base64数据
        this.previewImage = e.target.result
        // 移除数据URL前缀（例如："data:image/jpeg;base64,"）
        this.base64Image = e.target.result.split(',')[1]
      }
      reader.readAsDataURL(file)
    },
    handleImageUpload(event) {
      const file = event.target.files[0]
      if (file) {
        this.handleFile(file)
      }
    },
    async analyzeImage() {
      if (!this.base64Image) {
        this.error = '请先上传图片'
        return
      }

      if (!this.accessToken) {
        this.error = '访问令牌未获取，请重试'
        return
      }

      try {
        this.error = null
        const response = await axios({
          method: 'POST',
          url: '/baidu/rest/2.0/image-classify/v2/advanced_general?access_token=' + this.accessToken,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: {
            image: this.base64Image
          }
        })

        if (response.data.log_id) {
          this.analysisResult = response.data
        } else {
          throw new Error('API返回错误状态')
        }
      } catch (error) {
        console.error('分析图片时出错:', error)
        this.error = '分析图片时出错，请重试'
        this.analysisResult = null
      }
    },
    goBack() {
      this.$router.push('/profile')
    }
  }
}
</script>

<style scoped>
.ai-recognition {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.page-header {
  position: relative;
  text-align: center;
  margin-bottom: 40px;
  padding-top: 20px;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 600;
}

.subtitle {
  color: #6c757d;
  font-size: 1.1rem;
}

.main-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 40px;
}

.upload-section {
  text-align: center;
  margin-bottom: 40px;
}

.upload-area {
  width: 100%;
  height: 400px;
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 20px 0;
  overflow: hidden;
  transition: all 0.3s ease;
  background-color: #fafafa;
  position: relative;
}

.upload-area:hover {
  border-color: #4CAF50;
  background-color: #f8fff8;
}

.upload-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px dashed transparent;
  border-radius: 12px;
  pointer-events: none;
  transition: all 0.3s ease;
}

.upload-area.dragover {
  border-color: #4CAF50;
  background-color: rgba(76, 175, 80, 0.1);
  transform: scale(1.02);
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.2);
}

.upload-area.dragover::before {
  content: '释放鼠标上传图片';
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
  background-color: rgba(76, 175, 80, 0.9);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 1.2rem;
  z-index: 1;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.05);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
}

.upload-area.dragover .upload-placeholder {
  opacity: 0.5;
}

.upload-placeholder {
  text-align: center;
  color: #6c757d;
}

.upload-placeholder .emoji {
  font-size: 3rem;
  margin-bottom: 20px;
}

.upload-hint {
  display: block;
  margin-top: 10px;
  font-size: 0.9rem;
  color: #adb5bd;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.analyze-btn {
  background-color: #4CAF50;
  color: white;
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.analyze-btn:hover {
  background-color: #45a049;
  transform: translateY(-2px);
}

.analyze-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  transform: none;
}

.analyze-btn .emoji {
  font-size: 1.2rem;
}

.result-section {
  margin-top: 40px;
}

.result-section h2 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 30px;
  text-align: center;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.result-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s ease;
}

.result-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-icon {
  width: 50px;
  height: 50px;
  background-color: #f0f7f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4CAF50;
  font-size: 1.5rem;
}

.card-icon .emoji {
  font-size: 1.8rem;
}

.card-content {
  flex: 1;
}

.card-content h3 {
  font-size: 1rem;
  color: #6c757d;
  margin-bottom: 5px;
}

.card-value {
  font-size: 1.2rem;
  color: #2c3e50;
  font-weight: 500;
  margin: 0;
}

.confidence {
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 5px;
}

.error-message {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.error-message .emoji {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .ai-recognition {
    padding: 20px 10px;
  }
  
  .main-content {
    padding: 20px;
  }
  
  .upload-area {
    height: 300px;
  }
  
  .result-grid {
    grid-template-columns: 1fr;
  }
}

.emoji {
  font-size: 2rem;
  line-height: 1;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.tag {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.tag-score {
  color: #666;
  font-size: 0.8rem;
  opacity: 0.8;
  position: relative;
  top: 1.5px;
}

.back-btn {
  position: absolute;
  left: 20px;
  top: 20px;
  background: none;
  border: none;
  color: #4CAF50;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background-color: rgba(76, 175, 80, 0.1);
}

.back-btn .emoji {
  font-size: 1.2rem;
}

.file-input {
  display: none;
}

/* 添加新的样式来完全隐藏文件输入 */
input[type="file"] {
  display: none;
}

input[type="file"]::-webkit-file-upload-button {
  display: none;
}

input[type="file"]::file-selector-button {
  display: none;
}
</style> 