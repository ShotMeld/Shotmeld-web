<template>
  <SfModal :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)"
    :title="photo?.title || '无标题照片'" size="large">
    <div class="photo-detail-content">
      <div class="photo-detail-image">
        <img v-if="photo" :src="photo.url" :alt="photo.title" @load="imageLoaded = true" />
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
            <span class="info-value">{{ photo?.width || 0 }}×{{ photo?.height || 0 }} 像素</span>
          </div>
          <div class="info-item" v-if="photo?.metadata?.density">
            <span class="info-label">分辨率:</span>
            <span class="info-value">{{ photo.metadata.density }} dpi</span>
          </div>
        </div>

        <!-- 位置信息 -->
        <div class="info-group" v-if="photo?.location?.latitude && photo?.location?.longitude">
          <h3 class="info-group-title">位置信息</h3>
          <div class="info-item">
            <span class="info-label">经度:</span>
            <span class="info-value">{{ formatCoordinate(photo.location.longitude, 'lng') }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">纬度:</span>
            <span class="info-value">{{ formatCoordinate(photo.location.latitude, 'lat') }}</span>
          </div>
          <div class="location-map" @click="openMap" v-if="photo?.location?.latitude && photo?.location?.longitude">
            <i class="fas fa-map-marker-alt"></i>
            <span>在地图中查看</span>
          </div>
        </div>

        <!-- 相机参数 -->
        <div class="info-group" v-if="hasExifData">
          <h3 class="info-group-title">相机参数</h3>
          <div class="info-item" v-if="photo?.metadata?.exif?.make || photo?.metadata?.exif?.model">
            <span class="info-label">设备:</span>
            <span class="info-value">{{ photo.metadata.exif.model }}</span>
          </div>
          <div class="exif-grid">
            <div class="exif-item" v-if="photo?.metadata?.exif?.exposureTime">
              <div class="exif-value">{{ formatExposureTime(photo.metadata.exif.exposureTime) }}</div>
              <div class="exif-label">曝光时间</div>
            </div>
            <div class="exif-item" v-if="photo?.metadata?.exif?.fNumber">
              <div class="exif-value">f/{{ photo.metadata.exif.fNumber }}</div>
              <div class="exif-label">光圈</div>
            </div>
            <div class="exif-item" v-if="photo?.metadata?.exif?.isoSpeedRatings">
              <div class="exif-value">ISO {{ photo.metadata.exif.isoSpeedRatings }}</div>
              <div class="exif-label">感光度</div>
            </div>
            <div class="exif-item" v-if="photo?.metadata?.exif?.focalLength">
              <div class="exif-value">{{ photo.metadata.exif.focalLength }}mm</div>
              <div class="exif-label">焦距</div>
            </div>
            <div class="exif-item" v-if="photo?.metadata?.depth">
              <div class="exif-value">{{ formatDepth(photo.metadata.depth) }}</div>
              <div class="exif-label">位深度</div>

            </div>
            <div class="exif-item" v-if="photo?.metadata?.channels">
              <div class="exif-value">{{ photo.metadata.channels }}</div>
              <div class="exif-label">通道数</div>
            </div>
          </div>

        </div>

        <div class="info-group" v-if="photo?.tags && photo.tags.length > 0">
          <h3 class="info-group-title">标签</h3>
          <div class="photo-tags">
            <SfBadge v-for="tag in photo.tags" :key="tag.id" type="secondary" class="detail-tag">
              {{ tag.name }}
            </SfBadge>
          </div>
        </div>

        <div class="info-group" v-if="photo?.albums && photo.albums.length > 0">
          <h3 class="info-group-title">所属相册</h3>
          <div class="photo-albums">
            <SfBadge v-for="album in photo.albums" :key="album.id" type="success" class="detail-album">
              {{ album.name }}
            </SfBadge>
          </div>
        </div>

        <div class="photo-actions">
          <SfButton type="primary" @click="downloadPhoto">
            <template #prefix>
              <i class="fas fa-download"></i>
            </template>
            下载
          </SfButton>

          <SfButton type="danger" @click="confirmDelete">
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
  <el-dialog v-model="showDeleteConfirm" title="确认删除" width="30%" :show-close="false">
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
  computed: {
    hasExifData() {
      return !!(this.photo?.metadata?.exif)
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
    },

    formatExposureTime(time) {
      if (!time) return '';
      // 将小数转换为分数表示法
      if (time < 0.1) {
        const denominator = Math.round(1 / time);
        return `1/${denominator}秒`;
      }
      return `${time.toFixed(2)}秒`;
    },
    
    formatCoordinate(coord, type) {
      if (typeof coord !== 'number') return '';
      
      const degrees = Math.floor(coord);
      const minutesValue = (coord - degrees) * 60;
      const minutes = Math.floor(minutesValue);
      const seconds = ((minutesValue - minutes) * 60).toFixed(2);
      
      const direction = type === 'lat' 
        ? (coord >= 0 ? 'N' : 'S') 
        : (coord >= 0 ? 'E' : 'W');
      
      return `${Math.abs(degrees)}° ${minutes}' ${seconds}" ${direction}`;
    },
    
    formatDepth(depth) {
      // 转换位深度表示
      const depthMap = {
        'uchar': '8位',
        'char': '8位',
        'ushort': '16位',
        'short': '16位',
        'uint': '32位',
        'int': '32位',
        'float': '32位浮点',
        'double': '64位浮点'
      };
      
      return depthMap[depth] || depth;
    },
    
    openMap() {
      if (!this.photo?.location?.latitude || !this.photo?.location?.longitude) return;
      
      // 使用系统地图应用打开位置
      const mapUrl = `https://maps.apple.com/?q=${this.photo.location.latitude},${this.photo.location.longitude}`;
      window.open(mapUrl, '_blank');
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
  font-family: -apple-system, BlinkMacSystemFont, 'San Francisco', 'Helvetica Neue', sans-serif;
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
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color-subtle);
}

.info-group:last-of-type {
  border-bottom: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.info-group-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-2xs);
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.info-item {
  display: flex;
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-base);
  line-height: 1.5;
}

.info-label {
  width: 100px;
  color: var(--text-secondary);
  flex-shrink: 0;
  font-weight: var(--font-weight-normal);
}

.info-value {
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

.photo-tags,
.photo-albums {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
}

.detail-tag,
.detail-album {
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
  to {
    transform: rotate(360deg);
  }
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

/* Apple 风格的相机参数网格 */
.exif-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: var(--spacing-md);
  margin: var(--spacing-md) 0;
  padding: var(--spacing-sm) 0;
}

.exif-item {
  text-align: center;
  background-color: var(--bg-secondary);
  border-radius: 12px;
  padding: var(--spacing-sm) var(--spacing-xs);
  transition: transform 0.2s ease;
}

.exif-item:hover {
  transform: scale(1.02);
}

.exif-value {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: 4px;
}

.exif-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: var(--font-weight-normal);
}

/* 位置地图链接 */
.location-map {
  display: inline-flex;
  align-items: center;
  margin-top: var(--spacing-md);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-primary-subtle);
  color: var(--color-primary);
  border-radius: 20px;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s ease;
}

.location-map i {
  margin-right: 6px;
}

.location-map:hover {
  background-color: var(--color-primary-light);
  transform: translateY(-1px);
}
</style>