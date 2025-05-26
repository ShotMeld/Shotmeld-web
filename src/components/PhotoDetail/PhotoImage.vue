<!--
  PhotoImage.vue - 照片详情/照片图片组件
-->

<template>
  <div class="photo-detail-image" :style="{ height: imageHeight, width: imageWidth }">
    <img v-if="photo" :src="photo.url" :alt="photo.title" @load="handleImageLoad" ref="imageElement" />
    <div v-if="!imageLoaded" class="image-loading">
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
      actualImageDimensions: { width: 0, height: 0 } // 图片实际渲染尺寸
    };
  },
  watch: {
    photo(newPhoto, oldPhoto) {
      // 如果照片更换，重置高度
      if (newPhoto && oldPhoto && newPhoto.url !== oldPhoto.url) {
        this.imageHeight = 'auto'; // 或者一个合适的初始值，比如 min-height
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
    calculateDimensionsFromHeight(targetHeight) {
      if (!this.photo) return;
      
      // 创建临时图片来获取宽高比
      const tempImg = new Image();
      tempImg.onload = () => {
        const aspectRatio = tempImg.naturalWidth / tempImg.naturalHeight;
        const calculatedWidth = targetHeight * aspectRatio;
        
        this.actualImageDimensions = {
          width: calculatedWidth,
          height: targetHeight
        };
        
        this.imageHeight = `${targetHeight}px`;
        this.imageWidth = `${calculatedWidth}px`;
      };
      tempImg.src = this.photo.url;
    },

    handleImageLoad(event) {
      this.$emit('image-loaded');
      
      // 如果有目标高度（来自父组件计算），直接使用
      if (this.targetHeight && this.targetHeight > 0) {
        // 目标高度已经通过 watch 计算过宽度了，直接返回
        return;
      }
      
      // 否则使用原有的自适应逻辑
      const img = event.target;
      const container = this.$refs.imageElement.parentElement;
      if (img && container) {
        const containerWidth = container.offsetWidth;
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        
        // 计算在 contain 模式下的实际渲染尺寸
        let renderedWidth = containerWidth;
        let renderedHeight = containerWidth / aspectRatio;

        // 响应式高度限制
        const isMobile = window.innerWidth < 992;
        const maxHeightRatio = isMobile ? 0.5 : 0.8; // 移动端限制为50%，桌面端80%
        const maxHeight = window.innerHeight * maxHeightRatio;
        
        if (renderedHeight > maxHeight) {
            renderedHeight = maxHeight;
            renderedWidth = renderedHeight * aspectRatio;
        }
        
        // 如果图片原始宽度小于容器宽度，则以图片原始宽度为准
        if (img.naturalWidth < containerWidth) {
          renderedWidth = img.naturalWidth;
          renderedHeight = img.naturalHeight;
          
          // 移动端：即使原始尺寸也要限制最大高度
          if (isMobile && renderedHeight > maxHeight) {
            renderedHeight = maxHeight;
            renderedWidth = renderedHeight * aspectRatio;
          }
        }

        this.actualImageDimensions = {
          width: renderedWidth,
          height: renderedHeight
        };
        
        this.imageHeight = `${renderedHeight}px`;
        this.imageWidth = `${renderedWidth}px`;
      }
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
