<!--
  AddPhotosModal.vue - 添加照片到相册的模态框
  专注于从图库选择现有照片进行添加
-->

<template>
  <SfModal
    v-model="visible"
    :title="$t('addPhotosModal.title')"
    size="default"
    class="add-photos-modal"
  >
    <PhotoSelector
      :albumId="albumId"
      :existingPhotoIds="existingPhotoIds"
      @update:selectedPhotos="handleSelectedPhotosChange"
    />

    <!-- 模态框底部操作按钮 -->
    <div class="modal-footer">
      <SfButton type="secondary" @click="handleCancel">{{ $t('addPhotosModal.cancel') }}</SfButton>
      <SfButton type="primary" icon="fas fa-cloud-upload-alt" @click="handleShowUploadModal">
        {{ $t('addPhotosModal.upload') }}
      </SfButton>
      <SfButton
        type="primary"
        @click="handleAddSelectedPhotos"
        :disabled="selectedPhotoIds.length === 0 || isAdding"
      >
        {{
          isAdding
            ? $t('addPhotosModal.adding')
            : selectedPhotoIds.length > 0
              ? $t('addPhotosModal.addCount', { count: selectedPhotoIds.length })
              : $t('addPhotosModal.addToAlbum')
        }}
      </SfButton>
    </div>
  </SfModal>

  <!-- 上传照片模态框 -->
  <SfModal v-model="showUploadModal" :title="$t('addPhotosModal.uploadTitle')" size="default">
    <PhotoUpload
      :albumId="albumId"
      :showAlbumOption="false"
      @upload-success="handlePhotoUploaded"
    />
  </SfModal>
</template>

<script>
import PhotoSelector from './PhotoSelector.vue'
import PhotoUpload from './PhotoUpload.vue'
import SfModal from './ui/SfModal.vue'
import SfButton from './ui/SfButton.vue'
import { albumService } from '../api'

export default {
  name: 'AddPhotosModal',
  components: {
    PhotoSelector,
    PhotoUpload,
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
    existingPhotoIds: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['update:modelValue', 'photos-added'],
  data() {
    return {
      selectedPhotoIds: [],
      isAdding: false,
      showUploadModal: false,
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
        this.selectedPhotoIds = []
        this.isAdding = false
        this.showUploadModal = false
      }
    },
  },
  methods: {
    handleSelectedPhotosChange(photoIds) {
      this.selectedPhotoIds = photoIds
    },

    async handleAddSelectedPhotos() {
      if (this.selectedPhotoIds.length === 0) return

      try {
        this.isAdding = true

        // 调用API将选中的照片添加到相册
        const result = await albumService.addPhotosToAlbum(this.albumId, this.selectedPhotoIds)

        this.$notify({
          title: this.$t('addPhotosModal.success'),
          message: this.$t('addPhotosModal.addSuccess', { count: this.selectedPhotoIds.length }),
          type: 'success',
        })

        // 通知父组件照片已添加
        this.$emit('photos-added', {
          type: 'existing',
          photoIds: this.selectedPhotoIds,
          count: this.selectedPhotoIds.length,
        })

        // 关闭模态框
        this.visible = false
      } catch (error) {
        console.error('添加照片到相册失败:', error)
        this.$notify.error({
          title: this.$t('addPhotosModal.addFailed'),
          message: error.response?.data?.message || this.$t('addPhotosModal.addFailedMessage'),
        })
      } finally {
        this.isAdding = false
      }
    },

    handleShowUploadModal() {
      this.showUploadModal = true
    },

    handlePhotoUploaded(uploadedPhotos) {
      this.showUploadModal = false

      // 通知父组件照片已上传并添加到相册
      this.$emit('photos-added', {
        type: 'uploaded',
        photos: uploadedPhotos,
        count: uploadedPhotos.length || 1,
      })

      this.$notify({
        title: this.$t('addPhotosModal.success'),
        message: this.$t('addPhotosModal.uploadSuccess', { count: uploadedPhotos.length || 1 }),
        type: 'success',
      })

      // 关闭主模态框
      this.visible = false
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
