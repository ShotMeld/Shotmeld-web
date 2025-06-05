<!--
  AddPhotosModal.vue - 添加照片到相册的模态框
  专注于从图库选择现有照片进行添加
-->

<template>
  <sf-modal v-model="visible" title="添加照片" size="default" class="add-photos-modal">
    <photo-selector 
      :albumId="albumId"
      :existingPhotoIds="existingPhotoIds"
      @update:selectedPhotos="handleSelectedPhotosChange"
    />
    
    <!-- 模态框底部操作按钮 -->
    <div class="modal-footer">
      <sf-button type="secondary" @click="handleCancel">取消</sf-button>
      <sf-button 
        type="primary" 
        @click="handleAddSelectedPhotos" 
        :disabled="selectedPhotoIds.length === 0 || isAdding">
        {{ isAdding ? '添加中...' : (selectedPhotoIds.length > 0 ? `添加 ${selectedPhotoIds.length} 张照片` : '添加到相册') }}
      </sf-button>
    </div>
  </sf-modal>
</template>

<script>
import PhotoSelector from './PhotoSelector.vue'
import SfModal from './ui/SfModal.vue'
import SfButton from './ui/SfButton.vue'
import { albumService } from '../api'

export default {
  name: 'AddPhotosModal',
  components: {
    PhotoSelector,
    SfModal,
    SfButton
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    albumId: {
      type: String,
      required: true
    },
    existingPhotoIds: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'photos-added'],
  data() {
    return {
      selectedPhotoIds: [],
      isAdding: false
    }
  },
  computed: {
    visible: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  },
  watch: {
    modelValue(newValue) {
      if (newValue) {
        // 每次打开模态框时重置状态
        this.selectedPhotoIds = []
        this.isAdding = false
      }
    }
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
          title: '成功',
          message: `已将 ${this.selectedPhotoIds.length} 张照片添加到相册`,
          type: 'success'
        })
        
        // 通知父组件照片已添加
        this.$emit('photos-added', {
          type: 'existing',
          photoIds: this.selectedPhotoIds,
          count: this.selectedPhotoIds.length
        })
        
        // 关闭模态框
        this.visible = false
        
      } catch (error) {
        console.error('添加照片到相册失败:', error)
        this.$notify.error({
          title: '添加失败',
          message: error.response?.data?.message || '无法添加照片到相册，请重试'
        })
      } finally {
        this.isAdding = false
      }
    },
    
    handleCancel() {
      this.visible = false
    }
  }
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
