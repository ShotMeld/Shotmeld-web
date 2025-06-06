<!--
  SharePhotoView.vue - 共享照片页面（无需登录）
-->

<template>
  <div class="share-photo-view">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>{{ $t('sharePhoto.loading') }}</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h2>{{ $t('sharePhoto.error.title') }}</h2>
      <p>{{ error }}</p>
      <SfButton @click="goHome" class="home-button">
        {{ $t('sharePhoto.error.homeButton') }}
      </SfButton>
    </div>

    <div v-else-if="photo" class="photo-detail-fullscreen">
      <!-- 顶部工具栏 -->
      <div class="toolbar">
        <div class="toolbar-center">
          <h1 class="photo-title">{{ photo.title || $t('sharePhoto.defaultTitle') }}</h1>
        </div>

        <div class="toolbar-right">
          <SfButton @click="downloadPhoto" variant="ghost" class="action-button">
            <i class="fas fa-download"></i>
            {{ $t('sharePhoto.download') }}
          </SfButton>
        </div>
      </div>

      <!-- 照片内容区域 -->
      <div class="photo-content">
        <!-- 左侧照片显示组件 -->
        <div class="photo-detail-left">
          <div class="photo-image-container">
            <img v-if="photo?.url" :src="photo.url" :alt="photo.title || $t('sharePhoto.defaultTitle')" class="photo-image"
              @load="handleImageLoaded" @error="handleImageError" />
            <div v-if="!imageLoaded && photo?.url" class="image-loading">
              <div class="image-loading-spinner"></div>
              <p>{{ $t('sharePhoto.imageLoading') }}</p>
            </div>
          </div>
        </div>

        <!-- 右侧信息组件 -->
        <div class="photo-detail-info">
          <!-- 基本信息组件 -->
          <PhotoInfo :photo="photo" />

          <!-- 位置信息组件 -->
          <PhotoLocation v-if="photo?.location?.latitude && photo?.location?.longitude" :photo="photo" />

          <!-- 相机参数组件 -->
          <PhotoExif v-if="hasExifData" :photo="photo" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { photoService } from '../api';
import { SfButton } from '../components/ui';
import {
  PhotoInfo,
  PhotoLocation,
  PhotoExif,
  PhotoTags
} from '../components/PhotoDetail';

export default {
  name: 'SharePhotoView',
  components: {
    SfButton,
    PhotoInfo,
    PhotoLocation,
    PhotoExif,
    PhotoTags
  },
  data() {
    return {
      photo: null,
      loading: true,
      error: null,
      imageLoaded: false
    };
  },
  computed: {
    hasExifData() {
      return !!(this.photo?.metadata?.exif);
    }
  },
  async mounted() {
    // 设置深色模式
    this.setDarkMode();
    await this.loadPhoto();
  },

  beforeDestroy() {
    // 组件销毁时清理深色模式设置
    this.cleanupDarkMode();
  },
  methods: {
    setDarkMode() {
      // 强制设置深色模式
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');

      // 设置深色模式的CSS变量
      const root = document.documentElement;
      root.style.setProperty('--bg-primary', '#000000');
      root.style.setProperty('--bg-secondary', '#2d2d2d');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#b3b3b3');
      root.style.setProperty('--border-color', '#404040');
      root.style.setProperty('--border-color-hover', '#606060');
      root.style.setProperty('--primary-color', '#3b82f6');
      root.style.setProperty('--primary-color-hover', '#2563eb');
    },

    cleanupDarkMode() {
      // 移除深色模式类和属性
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');

      // 清除我们设置的CSS变量，恢复默认值
      const root = document.documentElement;
      const variablesToClear = [
        '--bg-primary',
        '--bg-secondary',
        '--text-primary',
        '--text-secondary',
        '--border-color',
        '--border-color-hover',
        '--primary-color',
        '--primary-color-hover'
      ];

      variablesToClear.forEach(variable => {
        root.style.removeProperty(variable);
      });
    },

    goHome() {
      window.location.href = '/';
    },

    async loadPhoto() {
      try {
        this.loading = true;
        this.error = null;

        const photoId = this.$route.params.id;
        if (!photoId) {
          throw new Error(this.$t('sharePhoto.error.invalidId'));
        }

        const response = await photoService.getSharedPhoto(photoId);
        this.photo = response.data;

        // 设置页面标题
        document.title = this.photo.title ? `${this.photo.title} - Shotmeld` : this.$t('sharePhoto.pageTitle');

      } catch (error) {
        console.error(this.$t('sharePhoto.error.loadFailed'), error);
        this.error = error.response?.data?.message || this.$t('sharePhoto.error.notFound');
      } finally {
        this.loading = false;
      }
    },

    downloadPhoto() {
      if (!this.photo) return;

      const link = document.createElement('a');
      link.href = this.photo.url;
      link.download = this.photo.filename || 'photo.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    handleImageLoaded() {
      this.imageLoaded = true;
    },

    handleImageError() {
      this.error = this.$t('sharePhoto.error.imageLoadFailed');
    }
  }
};
</script>

<style scoped>
.share-photo-view {
  height: 100vh;
  background-color: var(--bg-primary, #1a1a1a);
  color: var(--text-primary, #ffffff);
  overflow: hidden;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: var(--bg-primary, #1a1a1a);
  color: var(--text-primary, #ffffff);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color, #404040);
  border-top: 3px solid var(--primary-color, #3b82f6);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 错误状态 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  padding: 32px;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.error-container h2 {
  margin-bottom: 8px;
  font-size: 24px;
  color: var(--text-primary, #ffffff);
}

.error-container p {
  margin-bottom: 24px;
  color: var(--text-secondary, #b3b3b3);
}

.home-button {
  background-color: var(--primary-color, #3b82f6);
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.home-button:hover {
  background-color: var(--primary-color-hover, #2563eb);
}

/* 全屏照片详情 */
.photo-detail-fullscreen {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶部工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background-color: var(--bg-primary, #1a1a1a);
  backdrop-filter: blur(10px);
}

.toolbar-right {
  display: flex;
  justify-content: flex-end;
}

.toolbar-center {
  flex: 1;
  text-align: center;
}

.photo-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary, #ffffff);
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  max-width: calc(100% - 40px);
  line-height: 1.3;
}

.action-button {
  background-color: transparent;
  border: 1px solid var(--border-color, #404040);
  color: var(--text-primary, #ffffff);
  padding: 8px 16px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.action-button:hover {
  background-color: var(--bg-secondary, #2d2d2d);
  border-color: var(--border-color-hover, #606060);
}

.photo-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.photo-detail-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
  flex: 1;
  min-height: 0;
  padding: var(--spacing-lg, 24px);
  height: 100%;
}

.photo-detail-info {
  padding: var(--spacing-md, 16px) var(--spacing-lg, 24px);
  font-family: -apple-system, BlinkMacSystemFont, 'San Francisco', 'Helvetica Neue', sans-serif;
  box-sizing: border-box;
  flex: 1;
  min-height: 0;
  -ms-overflow-style: none;
}

/* 信息组件间距 */
.photo-detail-info>*+* {
  margin-top: var(--spacing-lg, 24px);
}

/* 照片图片组件样式优化 */
.photo-image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
}

.photo-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: opacity 0.3s ease;
  align-self: flex-start;
}

.image-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-secondary, #b3b3b3);
}

.image-loading-spinner {
  width: 32px;
  height: 32px;
  border: 2px solid var(--border-color, #404040);
  border-top: 2px solid var(--primary-color, #3b82f6);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

.photo-detail-left :deep(.photo-image-container) {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-detail-left :deep(.photo-image) {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

/* 移动端照片显示优化 */
@media (max-width: 991px) {
  .photo-image-container {
    width: 100%;
    height: 100%;
    min-height: 0;
    flex: 1;
    align-items: flex-start;
  }

  .photo-image {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 6px;
    align-self: flex-start;
  }
}

/* 桌面端照片显示优化 */
@media (min-width: 992px) {
  .photo-image-container {
    align-items: flex-start;
    padding-top: 0;
  }

  .photo-image {
    align-self: flex-start;
  }
}

/* 移动端优化 */
@media (max-width: 991px) {
  .share-photo-view {
    overflow-y: auto;
    height: 100vh;
  }

  .photo-detail-fullscreen {
    height: auto;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .toolbar {
    padding: 12px 16px;
    position: sticky;
    top: 0;
    flex-shrink: 0;
    z-index: 10;
  }

  .toolbar-center {
    flex: 1;
    text-align: center;
  }

  .toolbar-right {
    min-width: 80px;
  }

  .photo-content {
    max-height: none;
    overflow-y: visible;
    flex-direction: column;
    flex: 1;
    height: auto;
    min-height: calc(100vh - 60px);
    gap: 0;
  }

  .photo-detail-left {
    overflow: hidden;
    justify-content: flex-start;
    align-items: center;
    padding: var(--spacing-md, 16px);
    flex: 0 0 auto;
    min-height: 0;
    display: flex;
    width: 100%;
    height: auto;
    max-height: 60vh;
  }

  .photo-detail-info {
    overflow-y: auto;
    max-height: none;
    padding: var(--spacing-md, 16px) var(--spacing-lg, 24px) var(--spacing-lg, 24px) var(--spacing-lg, 24px);
    width: 100%;
    flex-shrink: 0;
  }

  .photo-title {
    font-size: 16px;
    line-height: 1.2;
  }
}

/* 响应式设计 - 桌面端 */
@media (min-width: 992px) {
  .photo-content {
    flex-direction: row;
    gap: 0;
    align-items: flex-start;
    height: 100%;
  }

  .photo-detail-left {
    flex: 1;
    flex-shrink: 0;
    max-height: none;
    overflow: visible;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    min-height: 0;
    height: 100%;
    align-self: stretch;
    padding: var(--spacing-xl, 32px);
  }

  .photo-detail-info {
    width: 350px !important;
    min-width: 350px !important;
    max-width: 350px !important;
    flex-basis: 350px !important;
    flex-shrink: 0 !important;
    flex-grow: 0 !important;
    overflow-y: auto;
    height: 100%;
    max-height: 100%;
    padding: var(--spacing-lg, 24px);
    padding-right: 40px;
    box-sizing: border-box;
    align-self: stretch;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    padding: 10px 12px;
  }

  .photo-title {
    font-size: 14px;
    line-height: 1.2;
  }

  .toolbar-right {
    min-width: 70px;
  }

  .action-button {
    padding: 6px 12px;
    font-size: 14px;
  }

  .photo-content {
    height: auto;
    min-height: calc(100vh - 50px);
  }

  .photo-detail-left {
    padding: var(--spacing-sm, 12px);
    flex: 0 0 auto;
    min-height: 0;
    max-height: 50vh;
  }

  .photo-detail-info {
    padding: var(--spacing-sm, 12px) var(--spacing-md, 16px) var(--spacing-md, 16px) var(--spacing-md, 16px);
    flex: 1;
    min-height: 0;
  }
}
</style>
