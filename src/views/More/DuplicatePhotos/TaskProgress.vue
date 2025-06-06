<template>
  <div class="task-progress">
    <div class="progress-content">
      <div class="progress-status">{{ $t(`duplicatePhotos.progress.status.${status}`) }}</div>
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: displayProgress + '%' }"
        ></div>
      </div>
      <div class="progress-percent">{{ $t('duplicatePhotos.progress.progress', { percent: Math.round(displayProgress) }) }}</div>
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
      required: true
    },
    status: {
      type: String,
      required: true,
      validator: (value) => ['pending', 'preparing', 'scanning', 'analyzing', 'completed'].includes(value)
    }
  },
  emits: ['cancel'],
  data() {
    return {
      fakeProgress: 0,
      fakeProgressTimer: null
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
    }
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
      }
    }
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
    }
  }
}
</script>

<style scoped>
.task-progress {
  padding: 40px 32px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 480px;
  margin: 0 auto;
}

.progress-content {
  max-width: 360px;
  margin: 0 auto;
}

.progress-status {
  font-size: 17px;
  font-weight: 400;
  color: #86868b;
  margin-bottom: 32px;
  line-height: 1.4;
}

.progress-bar {
  position: relative;
  width: 100%;
  height: 6px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 24px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007aff, #0051d5);
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
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
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
  font-size: 15px;
  font-weight: 500;
  color: #1d1d1f;
  margin-bottom: 40px;
  font-variant-numeric: tabular-nums;
}

.cancel-button {
  padding: 12px 24px;
  font-size: 17px;
  font-weight: 500;
  color: #ff3b30;
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  min-width: 120px;
}

.cancel-button:hover {
  background: rgba(255, 59, 48, 0.15);
  border-color: rgba(255, 59, 48, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(255, 59, 48, 0.2);
}

.cancel-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(255, 59, 48, 0.2);
}

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .task-progress {
    background: rgba(28, 28, 30, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .progress-title {
    color: #f2f2f7;
  }
  
  .progress-status {
    color: #98989d;
  }
  
  .progress-bar {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .progress-percent {
    color: #f2f2f7;
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .task-progress {
    padding: 32px 24px;
    margin: 16px;
    border-radius: 16px;
  }
  
  .progress-title {
    font-size: 24px;
  }
}
</style>
