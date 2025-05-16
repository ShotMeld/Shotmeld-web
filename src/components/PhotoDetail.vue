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
            <span class="info-label">标题</span>
            <span class="info-value title-value">{{ photo?.title || '无标题' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">拍摄时间</span>
            <span class="info-value">{{ formatDate(photo?.takenAt) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">文件大小</span>
            <span class="info-value">{{ formatFileSize(photo?.fileSize) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">尺寸</span>
            <span class="info-value">{{ photo?.width || 0 }}×{{ photo?.height || 0 }} 像素</span>
          </div>
          <div class="info-item" v-if="photo?.metadata?.density">
            <span class="info-label">分辨率</span>
            <span class="info-value">{{ photo.metadata.density }} dpi</span>
          </div>
        </div>

        <!-- 位置信息 -->
        <div class="info-group" v-if="photo?.location?.latitude && photo?.location?.longitude">
          <h3 class="info-group-title">位置信息</h3>
          <div class="info-item">
            <span class="info-label">经度</span>
            <span class="info-value">{{ formatCoordinate(photo.location.longitude, 'lng') }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">纬度</span>
            <span class="info-value">{{ formatCoordinate(photo.location.latitude, 'lat') }}</span>
          </div>
          <SfLinkButton icon="fas fa-map-marker-alt" @click="openMap"
            v-if="photo?.location?.latitude && photo?.location?.longitude">
            在地图中查看
          </SfLinkButton>
        </div>

        <!-- 相机参数 -->
        <div class="info-group" v-if="hasExifData">
          <h3 class="info-group-title">相机参数</h3>
          <div class="info-item" v-if="photo?.metadata?.exif?.make || photo?.metadata?.exif?.model">
            <span class="info-label">设备</span>
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
            <div class="exif-item" v-if="photo?.metadata?.exif?.rawExif?.BrightnessValue">
              <div class="exif-value">{{ photo?.metadata?.exif?.rawExif?.BrightnessValue }}</div>
              <div class="exif-label">EV</div>
            </div>
            <div class="exif-item" v-if="photo?.metadata?.exif?.rawExif?.MeteringMode">
              <div class="exif-value">{{ formatMeteringMode(photo?.metadata?.exif?.rawExif?.MeteringMode) }}</div>
              <div class="exif-label">测光模式</div>
            </div>
          </div>

        </div>

        <div class="info-group" v-if="photo?.tags && photo.tags.length > 0">
          <h3 class="info-group-title">标签</h3>
          <div class="photo-tags">
            <div
              v-for="tag in photo.tags" 
              :key="tag" 
              class="apple-tag"
              @click="handleTagClick(tag)"
            >
              <span class="tag-icon">#</span>
              <span class="tag-name">{{ tag }}</span>
            </div>
          </div>
        </div>

        <div class="info-group" v-if="photo?.albums && photo.albums.length > 0">
          <h3 class="info-group-title">相册</h3>
          <div class="photo-albums">
            <div v-for="album in photo.albums" :key="album" class="apple-album">
              <span class="album-icon">📁</span>
              <span class="album-name">{{ album }}</span>
            </div>
          </div>
        </div>

        <div class="photo-actions">
          <SfLinkButton icon="fas fa-download" @click="downloadPhoto">
            下载照片
          </SfLinkButton>

          <SfLinkButton icon="fas fa-trash" type="danger" @click="confirmDelete">
            删除照片
          </SfLinkButton>
        </div>
      </div>
    </div>
  </SfModal>

  <SfModal :modelValue="showDeleteConfirm" @update:modelValue="showDeleteConfirm = $event" title="确认删除" size="small">
    <div class="delete-confirm-content">
      <p>确定要删除这张照片吗？此操作无法撤销。</p>
      <div class="delete-confirm-actions">
        <SfButton type="tertiary" @click="showDeleteConfirm = false">取消</SfButton>
        <SfButton type="danger" @click="deletePhoto">确认删除</SfButton>
      </div>
    </div>
  </SfModal>
</template>

<script>
import { SfLinkButton } from '../components/ui';
import { albumService } from '../api'; // 导入相册服务

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
  emits: ['update:modelValue', 'photo-deleted', 'tag-clicked'],
  data() {
    return {
      imageLoaded: false,
      showDeleteConfirm: false,
      albumsMap: {} // 用于存储相册ID到相册名称的映射
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
    },
    'photo.albums': {
      immediate: true,
      handler(albumIds) {
        if (albumIds && albumIds.length > 0) {
          this.fetchAlbumsInfo(albumIds);
        }
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
        return `1/${denominator}s`;
      }
      return `${time.toFixed(2)}s`;
    },

    formatMeteringMode(mode) {
      const modes = {
        0: '未知',
        1: '平均',
        2: '中心加权',
        3: '点测光',
        4: '多区域',
        5: '局部',
        6: '矩阵'
      };
      return modes[mode] || '未知';
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

    openMap() {
      if (!this.photo?.location?.latitude || !this.photo?.location?.longitude) return;

      // 使用系统地图应用打开位置
      const mapUrl = `https://maps.apple.com/?q=${this.photo.location.latitude},${this.photo.location.longitude}`;
      window.open(mapUrl, '_blank');
    },

    handleTagClick(tag) {
      // 触发一个事件，允许父组件处理标签点击
      // tag 现在是字符串而不是对象
      this.$emit('tag-clicked', tag);
      
      // 可以添加一些视觉反馈
      const tagElement = event.currentTarget;
      if (tagElement) {
        tagElement.style.transition = 'transform 0.1s ease';
        tagElement.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
          tagElement.style.transform = '';
        }, 150);
      }
    },

    fetchAlbumsInfo(albumIds) {
      // 过滤掉已经获取过的相册ID
      const idsToFetch = albumIds.filter(id => !this.albumsMap[id]);
      
      if (idsToFetch.length === 0) return;
      
      // 为每个相册ID发起请求
      const promises = idsToFetch.map(id => 
        albumService.getAlbum(id)
          .then(response => {
            this.albumsMap[id] = response.data.name;
          })
          .catch(err => {
            console.error(`获取相册信息失败: ${id}`, err);
            this.albumsMap[id] = '未知相册';
          })
      );
      
      // 等待所有请求完成
      Promise.all(promises).catch(err => {
        console.error('获取相册信息时出错:', err);
      });
    },
  }
}
</script>

<style scoped>
/* 照片详情模态框 */
.photo-detail-content {
  display: flex;
  flex-direction: column;
}

.photo-detail-info::-webkit-scrollbar {
  display: none;
}

.photo-detail-info {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 标题自动换行样式 */
.title-value {
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  max-width: 100%;
}

:deep(.sf-modal-title) {
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  max-width: calc(100% - 40px); /* 留出关闭按钮空间 */
  line-height: 1.3;
  padding-right: 8px;
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
    overflow-y: visible;
    max-height: none;
  }
}

@media (max-width: 768px) {
  .photo-actions {
    flex-direction: column;
    width: 100%;
    gap: var(--spacing-sm);
  }

  :deep(.link-button) {
    width: 100%;
    justify-content: center;
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

.photo-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

/* 移除不再使用的类名 */

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

/* 相机参数网格 */
.exif-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: var(--spacing-md);
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

/* 操作按钮布局 */
.photo-actions {
  display: flex;
  gap: var(--spacing-md);
}

/* 删除确认对话框样式 */
.delete-confirm-content {
  padding: var(--spacing-md) 0;
}

.delete-confirm-content p {
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-size-md);
  color: var(--text-primary);
}

.delete-confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}

/* 标题自动换行 */
.title-value {
  word-break: break-word;
}

/* Apple 设计规范标签样式 */
.apple-tag {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: var(--radius-round);
  background-color: rgba(0, 122, 255, 0.08);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  user-select: none;
  -webkit-user-select: none;
  gap: 4px;
  color: var(--text-primary);
}

.apple-tag:hover {
  background-color: rgba(0, 122, 255, 0.12);
  transform: translateY(-1px);
  box-shadow: var(--shadow-small);
}

.apple-tag:active {
  transform: translateY(0);
  background-color: rgba(0, 122, 255, 0.16);
}

.tag-icon {
  color: var(--color-primary);
  opacity: 0.7;
  font-weight: var(--font-weight-semibold);
}

.tag-name {
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}

.apple-album {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: var(--radius-round);
  background-color: rgba(52, 199, 89, 0.08); /* Apple 绿色的淡化版 */
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  user-select: none;
  -webkit-user-select: none;
  gap: 4px;
  color: var(--text-primary);
}

.apple-album:hover {
  background-color: rgba(52, 199, 89, 0.12);
  transform: translateY(-1px);
  box-shadow: var(--shadow-small);
}

.apple-album:active {
  transform: translateY(0);
  background-color: rgba(52, 199, 89, 0.16);
}

.album-icon {
  color: var(--color-success);
  opacity: 0.8;
  font-weight: var(--font-weight-medium);
}

.album-name {
  color: var(--color-success);
  font-weight: var(--font-weight-medium);
}
</style>