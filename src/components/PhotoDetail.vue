<template>
  <SfModal
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :title="photo?.title || '无标题照片'"
    size="large"
  >
    <div class="photo-detail-content">
      <div class="photo-detail-image">
        <img 
          v-if="photo" 
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
            <span class="info-value">{{ photo?.title || '无标题' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">拍摄时间:</span>
            <span class="info-value">{{ formatDate(photo?.takenAt) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">文件大小:</span>
            <span class="info-value">{{ formatFileSize(photo?.fileSize) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">尺寸:</span>
            <span class="info-value">{{ photo?.width || 0 }}×{{ photo?.height || 0 }}</span>
          </div>
        </div>
        
        <div class="info-group" v-if="photo?.tags && photo.tags.length > 0">
          <h3 class="info-group-title">标签</h3>
          <div class="photo-tags">
            <SfBadge
              v-for="tag in photo.tags"
              :key="tag.id"
              type="secondary"
              class="detail-tag"
            >
              {{ tag.name }}
            </SfBadge>
          </div>
        </div>
        
        <div class="info-group" v-if="photo?.albums && photo.albums.length > 0">
          <h3 class="info-group-title">所属相册</h3>
          <div class="photo-albums">
            <SfBadge
              v-for="album in photo.albums"
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
            @click="downloadPhoto"
          >
            <template #prefix>
              <i class="fas fa-download"></i>
            </template>
            下载
          </SfButton>
          
          <SfButton 
            type="danger" 
            @click="confirmDelete"
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
</template>

<script>
export default {
  name: 'PhotoDetail',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    photo: {
      type: Object,
      default: null
    }
  },
  emits: ['update:modelValue', 'photo-deleted'],
  data() {
    return {
      imageLoaded: false,
      showDeleteConfirm: false
    }
  },
  watch: {
    modelValue(newVal) {
      if (newVal) {
        this.imageLoaded = false;
      }
    }
  },
  methods: {
    downloadPhoto() {
      if (!this.photo) return;
      
      const link = document.createElement('a');
      link.href = this.photo.url;
      link.download = this.photo.filename || 'photo.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    
    confirmDelete() {
      this.showDeleteConfirm = true;
    },
    
    deletePhoto() {
      this.$emit('photo-deleted', this.photo.id);
      this.showDeleteConfirm = false;
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
    }
  }
}
</script>

<style scoped>
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

/* 响应式设计 */
@media (min-width: 992px) {
  .photo-detail-content {
    flex-direction: row;
    gap: var(--spacing-xl);
  }
  
  .photo-detail-image {
    flex: 1.5;
  }
  
  .photo-detail-info {
    flex: 1;
    overflow-y: auto;
    max-height: 600px;
  }
}

@media (max-width: 768px) {
  .photo-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .photo-actions .sf-button {
    width: 100%;
  }
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
  flex-shrink: 0;
}

.info-value {
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

.photo-tags, .photo-albums {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
}

.detail-tag, .detail-album {
  margin-bottom: var(--spacing-xs);
}

.photo-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}

/* 加载状态 */
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 122, 255, 0.1);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
</style>