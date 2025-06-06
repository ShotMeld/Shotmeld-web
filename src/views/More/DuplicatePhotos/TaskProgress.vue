<template>
  <sf-card class="task-progress" shadow="medium">
    <template #header>
      <div class="progress-header">
        <h3>正在检测重复图片</h3>
        <sf-button
          type="text"
          size="small"
          @click="$emit('cancel')"
          class="cancel-btn"
        >
          取消
        </sf-button>
      </div>
    </template>
    
    <div class="progress-content">
      <div class="progress-circle">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="var(--border-color)"
            stroke-width="4"
            fill="none"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="var(--color-primary)"
            stroke-width="4"
            fill="none"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
            class="progress-circle-fill"
          />
        </svg>
        <div class="progress-text">
          {{ Math.round(displayProgress) }}%
        </div>
      </div>

      <div class="progress-info">
        <div class="status-text">
          {{ statusText }}
        </div>
        <div class="progress-bar">
          <div 
            class="progress-bar-fill"
            :style="{ width: `${displayProgress}%` }"
          ></div>
        </div>
      </div>
    </div>
  </sf-card>
</template>

<script>
import SfButton from '@/components/ui/SfButton.vue'
import SfCard from '@/components/ui/SfCard.vue'

export default {
  name: 'TaskProgress',
  components: {
    SfButton,
    SfCard
  },
  props: {
    progress: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      default: 'pending'
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
    circumference() {
      return 2 * Math.PI * 36
    },
    displayProgress() {
      // 如果有真实进度数据，使用真实进度；否则使用假进度
      if (this.progress > 0 || this.status === 'completed') {
        return this.progress
      }
      return this.fakeProgress
    },
    dashOffset() {
      return this.circumference - (this.displayProgress / 100) * this.circumference
    },
    statusText() {
      const statusMap = {
        pending: '准备中...',
        processing: '正在扫描图片库...',
        completed: '检测完成',
        failed: '检测失败'
      }
      return statusMap[this.status] || '处理中...'
    }
  },
  mounted() {
    this.startFakeProgress()
  },
  beforeUnmount() {
    this.stopFakeProgress()
  },
  watch: {
    progress(newVal) {
      // 当有真实进度时，停止假进度
      if (newVal > 0) {
        this.stopFakeProgress()
      }
    },
    status(newVal) {
      if (newVal === 'completed' || newVal === 'failed') {
        this.stopFakeProgress()
      } else if ((newVal === 'pending' || newVal === 'processing') && this.progress === 0) {
        this.startFakeProgress()
      }
    }
  },
  methods: {
    startFakeProgress() {
      if (this.fakeProgressTimer) return
      
      this.fakeProgressTimer = setInterval(() => {
        if (this.progress > 0) {
          // 有真实进度时停止假进度
          this.stopFakeProgress()
          return
        }
        
        // 随机增长，但速度较慢，最多到85%
        const increment = Math.random() * 0.5 + 0.1 // 0.1-0.6%的随机增长
        this.fakeProgress = Math.min(this.fakeProgress + increment, 85)
      }, 200) // 每200ms更新一次
    },
    stopFakeProgress() {
      if (this.fakeProgressTimer) {
        clearInterval(this.fakeProgressTimer)
        this.fakeProgressTimer = null
      }
    }
  }
}
</script>

<style scoped>
.task-progress {
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-header h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin: 0;
}

.cancel-btn {
  color: var(--color-danger);
}

.progress-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xl);
}

.progress-circle {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.progress-circle svg {
  display: block;
}

.progress-circle-fill {
  transform: rotate(-90deg);
  transform-origin: center;
  transition: stroke-dashoffset 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  text-align: center;
}

.progress-info {
  width: 100%;
  max-width: 300px;
}

.status-text {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: var(--border-color);
  border-radius: var(--radius-small);
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
  border-radius: var(--radius-small);
  transition: width 0.3s ease;
}

@media (max-width: 768px) {
  .progress-content {
    gap: var(--spacing-lg);
  }
  
  .progress-circle svg {
    width: 60px;
    height: 60px;
  }
  
  .progress-text {
    font-size: var(--font-size-lg);
  }
}
</style>
