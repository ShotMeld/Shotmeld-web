<!--
  PhotoImage.vue - 照片详情/照片图片组件
-->

<template>
  <div class="photo-detail-image">
    <img v-if="photo" :src="photo.url" :alt="photo.title" @load="$emit('image-loaded')" />
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
  emits: ['image-loaded']
}
</script>

<style scoped>
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
  object-fit: contain;
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
