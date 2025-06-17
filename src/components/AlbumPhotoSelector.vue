<!--
  AlbumPhotoSelector.vue - 相册照片选择器组件
  专门用于从指定相册中选择照片作为封面
-->

<template>
  <div class="album-photo-selector">
    <PhotoSelector
      ref="photoSelector"
      :albumId="albumId"
      :existingPhotoIds="[]"
      isAlbumMode
      singleSelect
      @update:selectedPhotos="handlePhotoSelection"
    />

    <!-- 底部操作按钮 -->
    <div class="selector-actions" v-if="!hideActions">
      <SfButton type="secondary" @click="$emit('cancel')">
        {{ $t('changeCover.cancel') }}
      </SfButton>
      <SfButton type="primary" @click="confirmSelection" :disabled="!selectedPhotoId">
        {{ $t('changeCover.confirm') }}
      </SfButton>
    </div>
  </div>
</template>

<script>
import PhotoSelector from './PhotoSelector.vue'
import SfButton from './ui/SfButton.vue'

export default {
  name: 'AlbumPhotoSelector',
  components: {
    PhotoSelector,
    SfButton,
  },
  props: {
    albumId: {
      type: String,
      required: true,
    },
    hideActions: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['photo-selected', 'cancel'],
  data() {
    return {
      selectedPhotoId: null,
      selectedPhoto: null,
    }
  },
  methods: {
    handlePhotoSelection(selectedPhotos) {
      // 封面选择器只允许选择一张照片
      if (selectedPhotos.length > 0) {
        this.selectedPhotoId = selectedPhotos[0]
        // 从PhotoSelector组件中获取照片信息
        this.selectedPhoto = this.$refs.photoSelector?.photos?.find(
          photo => photo.id === this.selectedPhotoId
        )
      } else {
        this.selectedPhotoId = null
        this.selectedPhoto = null
      }

      // 如果隐藏操作按钮，直接触发选择事件
      if (this.hideActions && this.selectedPhotoId) {
        this.$emit('photo-selected', {
          photoId: this.selectedPhotoId,
          photo: this.selectedPhoto,
        })
      }
    },

    confirmSelection() {
      if (!this.selectedPhotoId) return

      this.$emit('photo-selected', {
        photoId: this.selectedPhotoId,
        photo: this.selectedPhoto,
      })
    },
  },
}
</script>

<style scoped>
.album-photo-selector {
  display: flex;
  flex-direction: column;
}

.selector-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  background: var(--bg-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .selector-actions {
    padding: var(--spacing-sm);
  }
}
</style>
