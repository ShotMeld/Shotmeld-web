<!--
  PhotoInfo.vue - 照片详情/照片信息组件
-->

<template>
  <div class="info-group">
    <h3 class="info-group-title">{{ $t('photoDetail.info.title') }}</h3>
    <div class="info-item">
      <span class="info-label">{{ $t('photoDetail.info.photoTitle') }}</span>
      <span class="info-value title-value">{{ photo?.title || $t('photoDetail.info.untitled') }}</span>
    </div>
    <div class="info-item">
      <span class="info-label">{{ photo?.takenAt ? $t('photoDetail.info.takenTime') : $t('photoDetail.info.createdTime') }}</span>
      <span class="info-value">{{ formatDate(photo?.takenAt || photo?.createdAt) }}</span>
    </div>
    <div class="info-item">
      <span class="info-label">{{ $t('photoDetail.info.fileSize') }}</span>
      <span class="info-value">{{ formatFileSize(photo?.fileSize) }}</span>
    </div>
    <div class="info-item">
      <span class="info-label">{{ $t('photoDetail.info.dimensions') }}</span>
      <span class="info-value">{{ photo?.width || 0 }}×{{ photo?.height || 0 }} {{ $t('photoDetail.info.pixels') }}</span>
    </div>
    <div class="info-item" v-if="photo?.metadata?.density">
      <span class="info-label">{{ $t('photoDetail.info.resolution') }}</span>
      <span class="info-value">{{ photo.metadata.density }} dpi</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PhotoInfo',
  props: {
    photo: {
      type: Object,
      default: null
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return this.$t('photoDetail.info.unknownDate')
      const date = new Date(dateString)
      return date.toLocaleDateString(this.$i18n.locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
.info-group {
  margin-bottom: var(--spacing-lg);
  animation: fadeIn 0.5s ease-out;
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color-subtle);
}

.info-group:last-of-type {
  border-bottom: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.info-group-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-2xs);
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.info-item {
  display: flex;
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-base);
  line-height: 1.5;
}

.info-label {
  width: 100px;
  color: var(--text-secondary);
  flex-shrink: 0;
  font-weight: var(--font-weight-normal);
}

.info-value {
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

.title-value {
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  max-width: 100%;
}
</style>
