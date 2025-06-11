<!--
  ChangeCoverModal.vue - 更改相册封面的模态框组件
  从相册中选择照片作为封面
-->

<template>  <SfModal
    v-model="visible"
    :title="$t('changeCover.title')"
    size="default"
  >
    <AlbumPhotoSelector
      :albumId="albumId"
      :hideActions="true"
      @photo-selected="handlePhotoSelectedInternal"
      ref="photoSelector"
    />

    <!-- 模态框底部操作按钮 -->
    <div class="modal-footer">
      <SfButton type="secondary" @click="handleCancel">
        {{ $t('changeCover.cancel') }}
      </SfButton>
      <SfButton
        type="primary"
        @click="handleConfirmSelection"
        :disabled="!selectedPhotoId || isUpdating"
      >
        {{
          isUpdating
            ? $t('changeCover.updating')
            : $t('changeCover.confirm')
        }}
      </SfButton>
    </div>
  </SfModal>
</template>

<script>
import AlbumPhotoSelector from './AlbumPhotoSelector.vue'
import SfModal from './ui/SfModal.vue'
import SfButton from './ui/SfButton.vue'
import { albumService } from '../api'

export default {
  name: 'ChangeCoverModal',
  components: {
    AlbumPhotoSelector,
    SfModal,
    SfButton,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    albumId: {
      type: String,
      required: true,
    },
  },
  emits: ['update:modelValue', 'cover-updated'],
  data() {
    return {
      selectedPhotoId: null,
      selectedPhoto: null,
      isUpdating: false,
    }
  },
  computed: {
    visible: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      },
    },
  },
  watch: {
    modelValue(newValue) {
      if (newValue) {
        // 每次打开模态框时重置状态
        this.selectedPhotoId = null
        this.selectedPhoto = null
        this.isUpdating = false
      }
    },
  },
  methods: {
    handlePhotoSelectedInternal(result) {
      // 内部处理照片选择，仅更新状态不执行更新操作
      this.selectedPhotoId = result.photoId
      this.selectedPhoto = result.photo
    },

    async handleConfirmSelection() {
      if (!this.selectedPhotoId) return

      try {
        this.isUpdating = true
        
        // 更新相册封面
        await albumService.updateAlbum(this.albumId, {
          coverPhotoId: this.selectedPhotoId
        })

        this.$notify({
          title: this.$t('changeCover.success.title'),
          message: this.$t('changeCover.success.message'),
          type: 'success',
        })

        // 通知父组件封面已更新
        this.$emit('cover-updated', {
          albumId: this.albumId,
          coverPhotoId: this.selectedPhotoId,
          newPhoto: this.selectedPhoto
        })

        // 关闭模态框
        this.visible = false
      } catch (error) {
        console.error('更新相册封面失败:', error)
        this.$notify.error({
          title: this.$t('changeCover.error.title'),
          message: error.response?.data?.message || this.$t('changeCover.error.message'),
        })
      } finally {
        this.isUpdating = false
      }
    },

    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style scoped>
.modal-footer {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  margin-top: var(--spacing-md);
  gap: var(--spacing-md);
}
</style>
