<!--
  PhotoImage.vue - 照片详情/照片图片组件
-->

<template>
  <div class="photo-detail-image" :style="{ height: imageHeight, width: imageWidth }">
    <!-- 缩略图模糊占位 -->
    <img 
      v-if="photo && photo.thumbnailUrl && !imageLoaded" 
      :src="photo.thumbnailUrl" 
      :alt="photo.title" 
      class="thumbnail-placeholder"
      @load="handleThumbnailLoad"
    />
    
    <!-- 主图片 -->
    <img 
      v-if="photo" 
      :src="photo.url" 
      :alt="photo.title" 
      @load="handleImageLoad" 
      ref="imageElement"
      :class="['main-image', { 'loaded': imageLoaded }]"
    />
    
    <!-- 加载状态（仅在没有缩略图时显示） -->
    <div v-if="!imageLoaded && !thumbnailLoaded && (!photo.thumbnailUrl)" class="image-loading">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PhotoImage',
  props: {
    photo: {
      type: Object,
      default: null
    },
    imageLoaded: {
      type: Boolean,
      default: false
    },
    targetHeight: {
      type: Number,
      default: null
    }
  },
  emits: ['image-loaded'],
  data() {
    return {
      imageHeight: 'auto', // 初始高度或最小高度
      imageWidth: 'auto', // 容器宽度
      actualImageDimensions: { width: 0, height: 0 }, // 图片实际渲染尺寸
      thumbnailLoaded: false, // 缩略图加载状态
      minContainerSize: { width: 300, height: 200 } // 最小容器尺寸
    };
  },
  watch: {
    photo: {
      immediate: true,
      handler(newPhoto, oldPhoto) {
        if (newPhoto) {
          // 如果照片更换，重置加载状态
          if (oldPhoto && newPhoto.url !== oldPhoto.url) {
            this.thumbnailLoaded = false;
          }
          
          // 立即根据照片的原始尺寸计算容器大小
          this.calculateContainerSize();
        }
      }
    },
    targetHeight: {
      immediate: true,
      handler(newHeight) {
        if (newHeight && newHeight > 0) {
          this.calculateDimensionsFromHeight(newHeight);
        }
      }
    }
  },
  methods: {
    calculateContainerSize() {
      if (!this.photo || !this.photo.width || !this.photo.height) return;
      
      // 如果有目标高度，优先使用
      if (this.targetHeight && this.targetHeight > 0) {
        this.calculateDimensionsFromHeight(this.targetHeight);
        return;
      }
      
      // 否则根据照片原始尺寸和视口限制计算
      const originalWidth = this.photo.width;
      const originalHeight = this.photo.height;
      const aspectRatio = originalWidth / originalHeight;
      
      // 获取可用的容器宽度（假设为父容器的80%或最大800px）
      const maxContainerWidth = Math.min(800, window.innerWidth * 0.8);
      
      // 响应式高度限制
      const isMobile = window.innerWidth < 992;
      const maxHeightRatio = isMobile ? 0.5 : 0.8;
      const maxHeight = window.innerHeight * maxHeightRatio;
      
      let renderedWidth = Math.min(originalWidth, maxContainerWidth);
      let renderedHeight = renderedWidth / aspectRatio;
      
      // 如果高度超过限制，重新计算
      if (renderedHeight > maxHeight) {
        renderedHeight = maxHeight;
        renderedWidth = renderedHeight * aspectRatio;
      }
      
      // 确保最小尺寸
      if (renderedWidth < this.minContainerSize.width || renderedHeight < this.minContainerSize.height) {
        const scaleX = this.minContainerSize.width / renderedWidth;
        const scaleY = this.minContainerSize.height / renderedHeight;
        const scale = Math.max(scaleX, scaleY);
        
        renderedWidth *= scale;
        renderedHeight *= scale;
      }
      
      this.actualImageDimensions = {
        width: renderedWidth,
        height: renderedHeight
      };
      
      this.imageHeight = `${renderedHeight}px`;
      this.imageWidth = `${renderedWidth}px`;
    },

    calculateDimensionsFromHeight(targetHeight) {
      if (!this.photo || !this.photo.width || !this.photo.height) return;
      
      // 直接使用photo中的尺寸信息计算宽高比
      const aspectRatio = this.photo.width / this.photo.height;
      const calculatedWidth = targetHeight * aspectRatio;
      
      this.actualImageDimensions = {
        width: calculatedWidth,
        height: targetHeight
      };
      
      this.imageHeight = `${targetHeight}px`;
      this.imageWidth = `${calculatedWidth}px`;
    },

    handleThumbnailLoad() {
      this.thumbnailLoaded = true;
    },

    handleImageLoad() {
      this.$emit('image-loaded');
      // 容器尺寸已经预先计算好了，不需要重新计算
    }
  }
}
</script>

<style scoped>
.photo-detail-image {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-tertiary);
  position: relative;
  border-radius: var(--radius-medium);
  overflow: hidden;
  /* 移除固定宽度设置，使用动态计算的尺寸 */
  transition: all 0.3s ease; /* 添加尺寸过渡动画 */
  /* 确保容器尺寸精确匹配图片 */
  flex-shrink: 0;
  flex-grow: 0;
}

.photo-detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 改为 cover 以完全填充容器 */
  display: block; /* 消除图片下方的空白 */
  position: absolute;
  top: 0;
  left: 0;
}

/* 缩略图模糊占位 */
.thumbnail-placeholder {
  filter: blur(8px);
  transform: scale(1.1); /* 稍微放大来避免边缘模糊效果 */
  opacity: 1;
  z-index: 1;
}

/* 主图片 */
.main-image {
  opacity: 0;
  z-index: 2;
  transition: opacity 0.5s ease-in-out;
}

.main-image.loaded {
  opacity: 1;
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
</style>
