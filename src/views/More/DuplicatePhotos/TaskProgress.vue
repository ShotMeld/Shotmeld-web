<template>
  <div class="task-progress">
    <div class="progress-content">
      <div class="progress-status">{{ $t(`duplicatePhotos.progress.status.${status}`) }}</div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: displayProgress + '%' }"></div>
      </div>
      <div class="progress-percent">
        {{ $t('duplicatePhotos.progress.progress', { percent: Math.round(displayProgress) }) }}
      </div>
      <button class="cancel-button" @click="$emit('cancel')">
        {{ $t('duplicatePhotos.progress.cancel') }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskProgress',
  props: {
    progress: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      validator: value =>
        ['pending', 'preparing', 'scanning', 'analyzing', 'completed'].includes(value),
    },
  },
  emits: ['cancel'],
  data() {
    return {
      fakeProgress: 0,
      fakeProgressTimer: null,
    }
  },
  computed: {
    displayProgress() {
      // 如果实际进度大于0，使用实际进度
      if (this.progress > 0) {
        return this.progress
      }
      // 否则使用假进度
      return this.fakeProgress
    },
    shouldUseFakeProgress() {
      return this.progress === 0 && this.status !== 'completed'
    },
  },
  watch: {
    shouldUseFakeProgress: {
      immediate: true,
      handler(shouldUse) {
        if (shouldUse) {
          this.startFakeProgress()
        } else {
          this.stopFakeProgress()
        }
      },
    },
  },
  beforeUnmount() {
    this.stopFakeProgress()
  },
  methods: {
    startFakeProgress() {
      this.fakeProgress = 1 // 从1%开始，确保有可见的进度
      this.scheduleNextUpdate()
    },
    stopFakeProgress() {
      if (this.fakeProgressTimer) {
        clearTimeout(this.fakeProgressTimer)
        this.fakeProgressTimer = null
      }
    },
    scheduleNextUpdate() {
      if (!this.shouldUseFakeProgress) {
        return
      }

      // 计算下次增长的时间间隔 (500ms-1.5秒之间随机)
      const nextInterval = Math.random() * 1000 + 500

      this.fakeProgressTimer = setTimeout(() => {
        this.updateFakeProgress()
      }, nextInterval)
    },
    updateFakeProgress() {
      if (!this.shouldUseFakeProgress) {
        return
      }

      // 计算增长幅度 (1% - 3% 之间随机，但总进度不超过90%)
      const increment = Math.random() * 2 + 1
      const newProgress = Math.min(this.fakeProgress + increment, 90)

      this.fakeProgress = Number(newProgress.toFixed(1))

      // 调度下次更新
      this.scheduleNextUpdate()
    },
  },
}
</script>

<style scoped>
.task-progress {
  padding: 40px 32px;
  background: var(--blur-bg);
  backdrop-filter: var(--blur-strong);
  border-radius: var(--radius-large);
  text-align: center;
  max-width: 480px;
  margin: 0 auto;
}

.progress-content {
  max-width: 360px;
  margin: 0 auto;
}

.progress-status {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-regular);
  color: var(--text-secondary);
  margin-bottom: 32px;
  line-height: 1.4;
}

.progress-bar {
  position: relative;
  width: 100%;
  height: 6px;
  background-color: var(--bg-hover);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 24px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-dark));
  border-radius: 3px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-percent {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: 40px;
  font-variant-numeric: tabular-nums;
}

.cancel-button {
  padding: 12px 24px;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-danger);
  background: var(--color-danger-subtle);
  border: 1px solid rgba(var(--color-danger-rgb), 0.2);
  border-radius: var(--radius-medium);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  min-width: 120px;
}

.cancel-button:hover {
  background: rgba(var(--color-danger-rgb), 0.15);
  border-color: rgba(var(--color-danger-rgb), 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(var(--color-danger-rgb), 0.2);
}

.cancel-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(var(--color-danger-rgb), 0.2);
}

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .task-progress {
    background: var(--blur-bg);
    border-color: var(--border-color);
  }

  .progress-title {
    color: var(--text-primary);
  }

  .progress-status {
    color: var(--text-secondary);
  }

  .progress-bar {
    background-color: var(--bg-hover);
  }

  .progress-percent {
    color: var(--text-primary);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .task-progress {
    padding: 32px 24px;
    margin: 16px;
    border-radius: var(--radius-medium);
  }

  .progress-title {
    font-size: var(--font-size-3xl);
  }
}
</style>
