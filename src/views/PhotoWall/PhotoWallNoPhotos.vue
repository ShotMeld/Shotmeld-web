<!--
  PhotoWallNoPhotos.vue - 照片墙/无照片时的提示
-->

<template>
  <div class="no-photos">
    <i class="fas fa-image no-photos-icon"></i>
    <p>没有照片。上传一些照片开始使用吧！</p>
    <SfButton @click="$emit('showUploadModal')" type="primary" rounded>
      <template #prefix>
        <i class="fas fa-cloud-upload-alt"></i>
      </template>
      上传照片
    </SfButton>
  </div>
</template>

<script>
export default {
  name: 'PhotoWallNoPhotos'
};
</script>

<style scoped>
.no-photos {
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--spacing-3xl);
  background: var(--bg-primary);
  border-radius: var(--radius-large);
  box-shadow: var(--shadow-small);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}
.no-photos-icon {
  font-size: 64px;
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-md);
}
</style> 