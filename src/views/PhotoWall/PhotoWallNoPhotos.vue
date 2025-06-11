<!--
  PhotoWallNoPhotos.vue - 照片墙/无照片时的提示
-->

<template>
  <div class="no-photos">
    <i class="fas fa-image no-photos-icon"></i>
    <p>{{ $t('photoWall.noPhotos.message') }}</p>
    <SfButton @click="$emit('showUploadModal')" type="primary" rounded>
      <template #prefix>
        <i class="fas fa-cloud-upload-alt"></i>
      </template>
      {{ $t('photoWall.noPhotos.uploadButton') }}
    </SfButton>
  </div>
</template>

<script>
import { SfButton } from '../../components/ui'

export default {
  name: 'PhotoWallNoPhotos',
  components: {
    SfButton,
  },
}
</script>

<style scoped>
.no-photos {
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--spacing-3xl);
  background: var(--blur-bg-strong);
  backdrop-filter: var(--blur-strong);
  -webkit-backdrop-filter: var(--blur-strong);
  border-radius: var(--radius-large);
  box-shadow: var(--shadow-small);
  border: var(--border-width) solid var(--blur-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}
.no-photos-icon {
  font-size: 64px;
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-md);
  opacity: 0.7;
}
.no-photos p {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-lg);
}
</style>
