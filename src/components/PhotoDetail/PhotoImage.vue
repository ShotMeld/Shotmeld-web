<!--
  PhotoImage.vue - 照片详情/照片图片组件
-->

<template>
  <div class="photo-detail-image" :style="{ height: imageHeight }">
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
    }
  },
  emits: ['image-loaded'],
  data() {
    return {
      imageHeight: 'auto' // 初始高度或最小高度
    };
  },
  watch: {
    photo(newPhoto, oldPhoto) {
      // 如果照片更换，重置高度
      if (newPhoto && oldPhoto && newPhoto.url !== oldPhoto.url) {
        this.imageHeight = 'auto'; // 或者一个合适的初始值，比如 min-height
      }
    }
  },
  methods: {
    handleImageLoad(event) {
      this.$emit('image-loaded');
      const img = event.target;
      const container = this.$refs.imageElement.parentElement;
      if (img && container) {
        const containerWidth = container.offsetWidth;
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        
        // 计算在 contain 模式下的实际渲染尺寸
        let renderedWidth = containerWidth;
        let renderedHeight = containerWidth / aspectRatio;

        if (renderedHeight > window.innerHeight * 0.8) { // 限制最大高度为视窗的80%
            renderedHeight = window.innerHeight * 0.8;
            renderedWidth = renderedHeight * aspectRatio;
        }
        
        // 如果图片原始宽度小于容器宽度，则以图片原始宽度为准
        if (img.naturalWidth < containerWidth) {
          renderedWidth = img.naturalWidth;
          renderedHeight = img.naturalHeight;
        }


        this.imageHeight = `${renderedHeight}px`;
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
  /* min-height: 300px; */ /* 移除最小高度，由图片实际高度决定 */
  border-radius: var(--radius-medium);
  overflow: hidden;
  width: 100%; /* 确保容器宽度占满可用空间 */
  transition: height 0.3s ease; /* 添加高度过渡动画 */
}

.photo-detail-image img {
  max-width: 100%;
  max-height: 100%; /* 确保图片高度也不会超出容器 */
  object-fit: contain; /* 保持 contain 以完整显示图片 */
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
