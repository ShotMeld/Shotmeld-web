<!--
  OfflineIndicator.vue - 离线状态指示器组件
  显示当前网络状态和缓存数据状态
-->

<template>
  <div v-if="!isOnline" class="offline-indicator">
    <div class="offline-content">
      <i class="fas fa-wifi" :class="{ offline: !isOnline }"></i>
      <span class="offline-text">
        {{ isOnline ? '在线' : '离线模式' }}
      </span>
      <span v-if="!isOnline && hasCachedData" class="cached-info">(使用缓存数据)</span>
    </div>
  </div>
</template>

<script>
import { offlineManager } from '../utils/offlineManager'

export default {
  name: 'OfflineIndicator',
  data() {
    return {
      isOnline: navigator.onLine,
      hasCachedData: false,
    }
  },
  mounted() {
    // 监听网络状态变化
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)

    // 检查是否有缓存数据
    this.checkCachedData()
  },
  beforeUnmount() {
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
  },
  methods: {
    handleOnline() {
      this.isOnline = true
    },
    handleOffline() {
      this.isOnline = false
      this.checkCachedData()
    },
    async checkCachedData() {
      try {
        const cachedPhotos = await offlineManager.getCachedPhotos()
        const cachedAlbums = await offlineManager.getCachedAlbums()
        this.hasCachedData =
          (cachedPhotos && cachedPhotos.length > 0) || (cachedAlbums && cachedAlbums.length > 0)
      } catch (error) {
        console.error('检查缓存数据失败:', error)
        this.hasCachedData = false
      }
    },
  },
}
</script>

<style scoped>
.offline-indicator {
  position: fixed;
  top: 70px;
  right: 20px;
  z-index: 9999;
  background: var(--blur-bg-strong);
  backdrop-filter: var(--blur-strong);
  -webkit-backdrop-filter: var(--blur-strong);
  border: 1px solid var(--blur-border-strong);
  border-radius: var(--radius-medium);
  padding: 12px 16px;
  box-shadow: var(--shadow-medium);
  animation: slide-in 0.3s ease-out;
}

.offline-content {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.fas.fa-wifi {
  color: var(--color-success);
  transition: color 0.3s ease;
}

.fas.fa-wifi.offline {
  color: var(--color-warning);
}

.offline-text {
  color: var(--text-primary);
}

.cached-info {
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 深色主题适配 */
[data-theme='dark'] .offline-indicator {
  background: var(--blur-bg-strong);
  border-color: var(--blur-border-strong);
}

/* 移动设备适配 */
@media (max-width: 768px) {
  .offline-indicator {
    top: 10px;
    right: 10px;
    padding: 8px 12px;
  }

  .offline-content {
    font-size: var(--font-size-xs);
  }

  .cached-info {
    display: none; /* 在小屏幕上隐藏缓存信息 */
  }
}
</style>
