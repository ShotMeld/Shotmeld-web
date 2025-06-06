<template>
  <div class="task-progress">
    <h2 class="progress-title">{{ $t('duplicatePhotos.progress.title') }}</h2>
    <div class="progress-content">
      <div class="progress-status">{{ $t(`duplicatePhotos.progress.status.${status}`) }}</div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
      </div>
      <div class="progress-percent">{{ $t('duplicatePhotos.progress.progress', { percent: progress }) }}</div>
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
      validator: (value) => ['preparing', 'scanning', 'analyzing', 'completed'].includes(value)
    }
  },
  emits: ['cancel']
}
</script>

<style scoped>
.task-progress {
  padding: var(--spacing-3xl);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-extra-large);
  text-align: center;
}

.progress-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xl);
}

.progress-content {
  max-width: 400px;
  margin: 0 auto;
}

.progress-status {
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--spacing-md);
}

.progress-fill {
  height: 100%;
  background-color: var(--primary);
  transition: width var(--transition-fast);
}

.progress-percent {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
}

.cancel-button {
  padding: var(--spacing-sm) var(--spacing-xl);
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--text-on-primary);
  background-color: var(--danger);
  border: none;
  border-radius: var(--radius-large);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.cancel-button:hover {
  background-color: var(--danger-dark);
}
</style>
