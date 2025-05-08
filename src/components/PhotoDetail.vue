<template>
  <div class="photo-detail">
    <div class="photo-view">
      <img :src="photo.url" :alt="photo.title" class="main-photo">
      <img v-if="photo.thumbnailUrl" :src="photo.thumbnailUrl" alt="缩略图" class="thumbnail">
    </div>
    
    <div class="photo-meta">
      <h2>{{ photo.title || '未命名照片' }}</h2>
      <p class="description">{{ photo.description }}</p>
      
      <div class="meta-grid">
        <div class="meta-item">
          <span class="meta-label">文件信息:</span>
          <span>{{ photo.filename }} ({{ formatFileSize(photo.fileSize) }})</span>
        </div>
        
        <div class="meta-item">
          <span class="meta-label">尺寸:</span>
          <span>{{ photo.width }} × {{ photo.height }} 像素</span>
        </div>
        
        <div class="meta-item">
          <span class="meta-label">拍摄时间:</span>
          <span>{{ formatDate(photo.takenAt) }}</span>
        </div>
        
        <div class="meta-item" v-if="photo.location && photo.location.name">
          <span class="meta-label">位置:</span>
          <span>{{ photo.location.name }}</span>
        </div>
        
        <div class="meta-item" v-if="photo.tags && photo.tags.length">
          <span class="meta-label">标签:</span>
          <div class="tags">
            <span v-for="tag in photo.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </div>
      
      <div class="action-buttons">
        <button @click="startEditing" class="edit-button">编辑信息</button>
        <button @click="handleDelete" class="delete-button">删除照片</button>
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
  methods: {
    formatDate(dateString) {
      if (!dateString) return '未知'
      const date = new Date(dateString)
      return date.toLocaleString()
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
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
  }
}
</script>

<style scoped>
.photo-detail {
  margin-top: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  background: white;
}

.photo-view {
  position: relative;
  background: #f5f5f5;
  text-align: center;
  padding: 20px;
}

.main-photo {
  max-width: 100%;
  max-height: 500px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.thumbnail {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 80px;
  height: 80px;
  border: 2px solid white;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.photo-meta {
  padding: 20px;
}

h2 {
  margin: 0 0 10px 0;
  color: #333;
}

.description {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  flex-direction: column;
}

.meta-label {
  font-weight: bold;
  color: #555;
  margin-bottom: 4px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  background: #e0e0e0;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8em;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.edit-button, .delete-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
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

@media (max-width: 600px) {
  .meta-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .edit-button, .delete-button {
    width: 100%;
  }
}
</style>