<!--
  PhotoActions.vue - 照片详情/操作按钮组件（下载、删除照片）
-->

<template>
  <div class="photo-actions">
    <SfLinkButton icon="fas fa-download" @click="downloadPhoto" class="action-button">
      {{ $t('photoDetail.actions.download') }}
    </SfLinkButton>

    <SfLinkButton icon="fas fa-share-alt" @click="sharePhoto" class="action-button">
      {{ $t('photoDetail.actions.share') }}
    </SfLinkButton>

    <SfLinkButton 
      v-if="isPhotoEditEnabled"
      icon="fas fa-edit" 
      @click="editPhoto" 
      class="action-button"
    >
      {{ $t('photoDetail.actions.edit') }}
    </SfLinkButton>

    <SfLinkButton
      icon="fas fa-trash"
      type="danger"
      @click="$emit('delete-click')"
      class="action-button"
    >
      {{ $t('photoDetail.actions.delete') }}
    </SfLinkButton>
  </div>

  <!-- Photopea编辑器模态框 -->
  <PhotopeaEditor
    v-model="showPhotoEditor"
    :photo="photo"
    @photo-updated="handlePhotoUpdated"
    @photo-deleted="handlePhotoDeleted"
  />
</template>

<script>
import { SfLinkButton } from '../ui'
import { PhotopeaEditor } from '../PhotoEditor'
import { photoService } from '../../api'

export default {
  name: 'PhotoActions',
  components: {
    SfLinkButton,
    PhotopeaEditor,
  },
  props: {
    photo: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      isNotifying: false,
      isSharing: false,
      showPhotoEditor: false,
    }
  },
  computed: {
    isPhotoEditEnabled() {
      return localStorage.getItem('photoEditEnabled') === 'true'
    },
  },
  emits: ['delete-click', 'photo-updated', 'photo-replaced'],
  methods: {
    downloadPhoto() {
      if (!this.photo) return

      const link = document.createElement('a')
      link.href = this.photo.url
      link.download = this.photo.filename || 'photo.jpg'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    async sharePhoto() {
      if (!this.photo || this.isNotifying || this.isSharing) return

      // 设置标志，防止重复操作
      this.isSharing = true
      this.isNotifying = true

      try {
        // 调用API设置照片为可分享状态
        const response = await photoService.sharePhoto(this.photo.id)

        // 生成分享链接
        const shareUrl = `${window.location.origin}/share/${this.photo.id}`

        // 复制分享链接到剪贴板
        await navigator.clipboard.writeText(shareUrl)

        // 使用消息提示
        this.$notify({
          title: this.$t('photoDetail.actions.shareSuccess.title'),
          message: this.$t('photoDetail.actions.shareSuccess.message'),
          type: 'success',
        })
      } catch (error) {
        console.error('分享失败: ', error)
        this.$notify({
          title: this.$t('photoDetail.actions.shareError.title'),
          message:
            error.response?.data?.message || this.$t('photoDetail.actions.shareError.message'),
          type: 'error',
        })
      } finally {
        // 重置标志状态
        setTimeout(() => {
          this.isNotifying = false
          this.isSharing = false
        }, 100)
      }
    },

    editPhoto() {
      this.showPhotoEditor = true
    },

    handlePhotoUpdated(newPhoto) {
      this.$emit('photo-updated', newPhoto)
      this.showPhotoEditor = false
    },

    handlePhotoDeleted(photoId) {
      // 照片在编辑器中被删除并替换，通知父组件照片已被替换（不需要删除API调用）
      this.$emit('photo-replaced', photoId)
      this.showPhotoEditor = false
    },
  },
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
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
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
