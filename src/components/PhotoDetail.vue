<template>
  <div class="photo-detail">
    <div class="photo-detail-content">
      <div class="photo-detail-image">
        <img 
          :src="photo.url" 
          :alt="photo.title" 
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
            <span class="info-value">{{ photo.title || '无标题' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">拍摄时间:</span>
            <span class="info-value">{{ formatDate(photo.takenAt) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">文件大小:</span>
            <span class="info-value">{{ formatFileSize(photo.fileSize) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">尺寸:</span>
            <span class="info-value">{{ photo.width || 0 }}×{{ photo.height || 0 }}</span>
          </div>
          <div class="info-item" v-if="photo.description">
            <span class="info-label">描述:</span>
            <span class="info-value">{{ photo.description }}</span>
          </div>
          <div class="info-item" v-if="photo.location && photo.location.name">
            <span class="info-label">位置:</span>
            <span class="info-value">{{ photo.location.name }}</span>
          </div>
        </div>
        
        <div class="info-group" v-if="photo.tags && photo.tags.length > 0">
          <h3 class="info-group-title">标签</h3>
          <div class="photo-tags">
            <span v-for="tag in photo.tags" :key="tag" class="detail-tag">{{ tag }}</span>
          </div>
        </div>
        
        <div class="info-group" v-if="photo.albums && photo.albums.length > 0">
          <h3 class="info-group-title">所属相册</h3>
          <div class="photo-albums">
            <span v-for="album in photo.albums" :key="album.id" class="detail-album">{{ album.name }}</span>
          </div>
        </div>
        
        <div class="photo-actions">
          <button @click="startEditing" class="edit-button">编辑信息</button>
          <button @click="handleDelete" class="delete-button">删除照片</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    photo: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      imageLoaded: false
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '未知'
      const date = new Date(dateString)
      return date.toLocaleString()
    },
    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    startEditing() {
      this.$emit('edit-photo', this.photo)
    },
    handleDelete() {
      if (confirm('确定要删除这张照片吗？')) {
        this.$emit('photo-deleted', this.photo.id)
      }
    }
  },
  watch: {
    photo() {
      // 当照片变更时，重置加载状态
      this.imageLoaded = false;
    }
  }
}
</script>

<style scoped>
.photo-detail {
  width: 100%;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.photo-detail-content {
  display: flex;
  flex-direction: column;
}

.photo-detail-image {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  position: relative;
  min-height: 300px;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
}

.photo-detail-image img {
  max-width: 100%;
  max-height: 500px;
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
  background-color: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 122, 255, 0.1);
  border-top-color: #6750a4;
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
}

.photo-detail-info {
  padding: 20px;
}

.info-group {
  margin-bottom: 20px;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.info-group-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  padding-bottom: 5px;
  border-bottom: 1px solid #e0e0e0;
  color: #333;
}

.info-item {
  display: flex;
  margin-bottom: 10px;
  font-size: 14px;
}

.info-label {
  width: 100px;
  color: #666;
  font-weight: 500;
}

.info-value {
  flex: 1;
  color: #333;
}

.photo-tags, .photo-albums {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-tag, .detail-album {
  background: #e0e0e0;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 0.8em;
  margin-bottom: 8px;
  transition: transform 0.2s;
}

.detail-tag:hover, .detail-album:hover {
  transform: translateY(-2px);
}

.photo-actions {
  display: flex;
  gap: 15px;
  margin-top: 25px;
}

.edit-button, .delete-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
}

.edit-button {
  background-color: #6750a4;
  color: white;
}

.edit-button:hover {
  background-color: #7c63b9;
}

.delete-button {
  background-color: #ff4444;
  color: white;
}

.delete-button:hover {
  background-color: #cc0000;
}

/* 响应式设计 */
@media (min-width: 768px) {
  .photo-detail-content {
    flex-direction: row;
    min-height: 500px;
  }
  
  .photo-detail-image {
    flex: 2;
    border-right: 1px solid #e0e0e0;
    border-radius: 12px 0 0 12px;
  }
  
  .photo-detail-info {
    flex: 1;
    overflow-y: auto;
    max-height: 500px;
  }
}

@media (max-width: 768px) {
  .photo-actions {
    flex-direction: column;
  }
  
  .edit-button, .delete-button {
    width: 100%;
  }
}
</style>