<template>
  <div class="task-progress">
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
          {{ progress }}%
        </div>
      </div>

      <div class="progress-info">
        <div class="status-text">
          {{ statusText }}
        </div>
        <div class="progress-bar">
          <div 
            class="progress-bar-fill"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SfButton from '@/components/ui/SfButton.vue'

export default {
  name: 'TaskProgress',
  components: {
    SfButton
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
  computed: {
    circumference() {
      return 2 * Math.PI * 36
    },
    dashOffset() {
      return this.circumference - (this.progress / 100) * this.circumference
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
  }
}
</script>

<style scoped>
.task-progress {
  background: var(--bg-secondary);
  border-radius: var(--radius-large);
  padding: var(--spacing-2xl);
  text-align: center;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.progress-header h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
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
  display: inline-block;
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
