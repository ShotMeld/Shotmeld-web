<template>
  <div class="duplicate-detector" v-show="!hasResults">
    <div class="detector-header">
      <h1 class="detector-title">{{ $t('duplicatePhotos.detector.title') }}</h1>
      <p class="detector-description">{{ $t('duplicatePhotos.detector.description') }}</p>
    </div>

    <div class="detector-actions">
      <SfButton
        v-if="!isDetecting && !hasResults"
        type="primary"
        size="large"
        @click="startDetection"
        :loading="isStarting"
      >
        <template #icon>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19S2 15.194 2 10.5 5.806 2 10.5 2 19 5.806 19 10.5Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </template>
        {{ $t('duplicatePhotos.detector.startScan') }}
      </SfButton>

      <SfButton
        v-if="hasResults && !isDetecting"
        type="secondary"
        @click="restartDetection"
        :loading="isStarting"
      >
        重新检测
      </SfButton>
    </div>

    <TaskProgress
      v-if="isDetecting"
      :progress="progress"
      :status="taskStatus"
      @cancel="cancelDetection"
    />

    <SfCard v-if="error" class="error-message" shadow="small">
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <div class="error-text">
          <h3>检测失败</h3>
          <p>{{ error }}</p>
        </div>
        <SfButton type="primary" size="small" @click="clearError">重试</SfButton>
      </div>
    </SfCard>
  </div>
</template>

<script>
import SfButton from '@/components/ui/SfButton.vue'
import SfCard from '@/components/ui/SfCard.vue'
import TaskProgress from './TaskProgress.vue'
import { duplicatePhotosAPI } from '@/api'

export default {
  name: 'DuplicateDetector',
  components: {
    SfButton,
    SfCard,
    TaskProgress,
  },
  emits: ['detection-complete', 'detection-start'],
  data() {
    return {
      isDetecting: false,
      isStarting: false,
      hasResults: false,
      progress: 0,
      taskStatus: 'pending',
      taskId: null,
      error: null,
      pollInterval: null,
    }
  },
  methods: {
    async startDetection() {
      try {
        this.isStarting = true
        this.error = null

        const response = await duplicatePhotosAPI.startDetection()
        this.taskId = response.taskId

        this.isDetecting = true
        this.hasResults = false
        this.progress = 0
        this.taskStatus = 'pending'

        this.$emit('detection-start')
        this.startPolling()
      } catch (error) {
        this.error = error.response?.data?.message || '启动检测失败，请重试'
      } finally {
        this.isStarting = false
      }
    },

    async restartDetection() {
      this.hasResults = false
      await this.startDetection()
    },

    startPolling() {
      this.pollInterval = setInterval(async () => {
        try {
          const status = await duplicatePhotosAPI.getTaskStatus(this.taskId)

          this.progress = status.progress
          this.taskStatus = status.status

          if (status.status === 'completed') {
            this.isDetecting = false
            this.hasResults = true
            this.$emit('detection-complete', status.result)
            this.stopPolling()
          } else if (status.status === 'failed') {
            this.isDetecting = false
            this.error = status.error?.message || '检测过程中发生错误'
            this.stopPolling()
          }
        } catch (error) {
          this.error = '获取检测状态失败'
          this.isDetecting = false
          this.stopPolling()
        }
      }, 2000)
    },

    stopPolling() {
      if (this.pollInterval) {
        clearInterval(this.pollInterval)
        this.pollInterval = null
      }
    },

    cancelDetection() {
      this.isDetecting = false
      this.stopPolling()
    },

    clearError() {
      this.error = null
    },
  },

  beforeUnmount() {
    this.stopPolling()
  },
}
</script>

<style scoped>
.duplicate-detector {
  background: var(--bg-primary);
  border-radius: var(--radius-large);
  padding: var(--spacing-2xl);
  margin-bottom: var(--spacing-xl);
  border: var(--border-width) solid var(--border-color);
}

.detector-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.detector-title {
  font-size: 32px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.detector-description {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
}

.detector-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

.error-message {
  margin-top: var(--spacing-lg);
  background: var(--color-danger-subtle);
}

.error-content {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
}

.error-icon {
  font-size: var(--font-size-xl);
  flex-shrink: 0;
}

.error-text {
  flex: 1;
}

.error-text h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-danger);
  margin-bottom: var(--spacing-xs);
}

.error-text p {
  color: var(--text-secondary);
  margin-bottom: 0;
  line-height: 1.4;
}
</style>
