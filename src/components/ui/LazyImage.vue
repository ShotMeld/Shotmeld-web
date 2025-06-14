<template>
  <div
    ref="imageContainer"
    class="lazy-image-container"
    :class="{ loading: loading, loaded: loaded, error: error }"
  >
    <div v-if="loading" class="image-skeleton">
      <div class="skeleton-shimmer"></div>
    </div>

    <img
      v-show="loaded"
      :src="currentSrc"
      :alt="alt"
      :loading="nativeLazy ? 'lazy' : 'eager'"
      @load="onLoad"
      @error="onError"
      class="lazy-image"
    />

    <div v-if="error" class="error-placeholder">
      <i class="fas fa-image"></i>
      <span>加载失败</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LazyImage',
  props: {
    src: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      default: '',
    },
    alt: {
      type: String,
      default: '',
    },
    threshold: {
      type: Number,
      default: 0.1,
    },
    rootMargin: {
      type: String,
      default: '50px',
    },
    nativeLazy: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      loading: true,
      loaded: false,
      error: false,
      currentSrc: this.placeholder,
      observer: null,
    }
  },

  mounted() {
    this.initLazyLoading()
  },

  beforeUnmount() {
    if (this.observer) {
      this.observer.disconnect()
    }
  },

  methods: {
    initLazyLoading() {
      // 优先使用浏览器原生懒加载
      if (this.nativeLazy && 'loading' in HTMLImageElement.prototype) {
        this.currentSrc = this.src
        return
      }

      // 降级到 Intersection Observer
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver(this.onIntersect, {
          threshold: this.threshold,
          rootMargin: this.rootMargin,
        })
        this.observer.observe(this.$refs.imageContainer)
      } else {
        // 不支持 IntersectionObserver 时直接加载
        this.loadImage()
      }
    },

    onIntersect(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage()
          this.observer.unobserve(entry.target)
        }
      })
    },

    loadImage() {
      this.currentSrc = this.src
    },

    onLoad() {
      this.loading = false
      this.loaded = true
      this.error = false
      this.$emit('load')
    },

    onError() {
      this.loading = false
      this.loaded = false
      this.error = true
      this.$emit('error')
    },
  },
}
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  overflow: hidden;
  background-color: #f5f5f5;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lazy-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.image-skeleton {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
}

.skeleton-shimmer {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.error-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}

.error-placeholder i {
  font-size: 24px;
  margin-bottom: 8px;
}

.loading .lazy-image {
  opacity: 0;
}

.loaded .lazy-image {
  opacity: 1;
}

.error .lazy-image {
  display: none;
}
</style>
