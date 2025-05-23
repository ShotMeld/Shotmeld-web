<!--
  PhotoActions.vue - 照片详情/操作按钮组件（下载、删除照片）
-->

<template>
  <div class="photo-actions">
    <SfLinkButton icon="fas fa-download" @click="downloadPhoto" class="action-button">
      下载
    </SfLinkButton>

    <SfLinkButton icon="fas fa-trash" type="danger" @click="$emit('delete-click')" class="action-button">
      删除
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

.action-button {
  background-color: var(--bg-primary);
  display: flex;
  align-items: center;
  padding: 8px 16px;
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.action-button:hover {
  background-color: var(--bg-secondary);
}

@media (max-width: 768px) {
  .photo-actions {
    flex-direction: column;
    width: 100%;
    gap: var(--spacing-sm);
  }

  .action-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
