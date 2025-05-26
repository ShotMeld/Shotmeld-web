<!--
  PhotoActions.vue - 照片详情/操作按钮组件（下载、删除照片）
-->

<template>
  <div class="photo-actions">
    <SfLinkButton icon="fas fa-download" @click="downloadPhoto" class="action-button">
      下载
    </SfLinkButton>

    <SfLinkButton icon="fas fa-share-alt" @click="sharePhoto" class="action-button">
      分享
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
  data() {
    return {
      isNotifying: false
    };
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
    },
    sharePhoto() {
      if (!this.photo || this.isNotifying) return;
      
      // 设置标志，防止重复通知
      this.isNotifying = true;
      
      // 复制图片URL到剪贴板
      navigator.clipboard.writeText(this.photo.url)
        .then(() => {
          // 使用消息提示
          this.$notify({
            title: '分享成功',
            message: '链接已复制到剪贴板',
            type: 'success'
          });
          
          // 重置标志状态
          setTimeout(() => {
            this.isNotifying = false;
          }, 100);
        })
        .catch(err => {
          console.error('无法复制链接: ', err);
          this.$notify({
            title: '分享失败',
            message: '无法复制链接到剪贴板',
            type: 'error'
          });
          
          // 重置标志状态
          setTimeout(() => {
            this.isNotifying = false;
          }, 100);
        });
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
