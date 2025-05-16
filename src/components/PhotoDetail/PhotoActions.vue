<!--
  PhotoActions.vue - 照片详情/操作按钮组件（下载、删除照片）
-->

<template>
  <div class="photo-actions">
    <SfLinkButton icon="fas fa-download" @click="downloadPhoto">
      下载照片
    </SfLinkButton>

    <SfLinkButton icon="fas fa-trash" type="danger" @click="$emit('delete-click')">
      删除照片
    </SfLinkButton>
  </div>
</template>

<script>
import { SfLinkButton } from '../ui';

export default {
  name: 'PhotoActions',
  components: {
    SfLinkButton
  },
  props: {
    photo: {
      type: Object,
      default: null
    }
  },
  emits: ['delete-click'],
  methods: {
    downloadPhoto() {
      if (!this.photo) return;

      const link = document.createElement('a');
      link.href = this.photo.url;
      link.download = this.photo.filename || 'photo.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
</script>

<style scoped>
.photo-actions {
  display: flex;
  gap: var(--spacing-md);
}

@media (max-width: 768px) {
  .photo-actions {
    flex-direction: column;
    width: 100%;
    gap: var(--spacing-sm);
  }

  :deep(.link-button) {
    width: 100%;
    justify-content: center;
  }
}
</style>
