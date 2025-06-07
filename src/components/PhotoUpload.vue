<!--
  PhotoUpload.vue - 照片上传组件
-->

<template>
  <div class="upload-component">
    <div
      class="upload-container"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      :class="{ 'is-dragging': isDragging }"
    >
      <div class="upload-inner" v-if="!loading">
        <i class="el-icon-upload-fill"></i>
        <el-upload
          class="upload-area"
          :action="actionUrl"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileChange"
          :multiple="multiple"
          :accept="acceptTypes"
        >
          <div class="upload-content">
            <div class="upload-icon">
              <i class="el-icon-upload"></i>
            </div>
            <div class="upload-text">
              <div class="upload-title">{{ displayTitle }}</div>
              <div class="upload-subtitle">
                {{ $t('photoUpload.dragText') }}
                <span class="browse-text">{{ $t('photoUpload.clickToUpload') }}</span>
              </div>
            </div>
          </div>
        </el-upload>
      </div>
      <div class="loading-container" v-else>
        <el-progress
          :percentage="uploadProgress"
          :format="percent => `${percent}%`"
          type="circle"
          :stroke-width="6"
          :status="uploadProgress === 100 ? 'success' : ''"
        ></el-progress>
        <div class="upload-status">{{ uploadStatus }}</div>
      </div>
    </div>

    <div class="selected-files" v-if="selectedFiles.length > 0">
      <div class="selected-files-header">
        <div class="selected-count">
          {{ $t('photoUpload.selectedFiles', { count: selectedFiles.length }) }}
        </div>
        <button class="clear-button" @click="clearFiles">{{ $t('photoUpload.clear') }}</button>
      </div>
      <div class="file-list">
        <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
          <div class="file-preview">
            <img
              v-if="isImageFile(file)"
              :src="getFilePreview(file)"
              :alt="$t('photoUpload.preview')"
            />
            <div v-else class="file-icon">{{ file.name.slice(-3) }}</div>
          </div>
          <div class="file-info">
            <div class="file-name">{{ truncateFilename(file.name) }}</div>
            <div class="file-size">{{ formatFileSize(file.size) }}</div>
          </div>
          <button class="remove-file" @click="removeFile(index)">×</button>
        </div>
      </div>
      <div class="upload-options" v-if="showAlbumOption">
        <div class="option-item">
          <label>{{ $t('photoUpload.addToAlbum') }}</label>
          <el-select
            v-model="selectedAlbumId"
            :placeholder="$t('photoUpload.selectAlbum')"
            clearable
            popper-class="album-select-dropdown"
            teleported
            popper-append-to-body
          >
            <el-option
              v-for="album in albums"
              :key="album.id"
              :label="album.name"
              :value="album.id"
            ></el-option>
          </el-select>
        </div>
      </div>
      <el-button type="primary" class="upload-button" @click="uploadFiles" :loading="loading">
        {{ loading ? $t('photoUpload.uploading') : $t('photoUpload.startUpload') }}
      </el-button>
    </div>
  </div>
</template>

<script>
import { photoService, albumService } from '../api'

export default {
  name: 'PhotoUpload',
  props: {
    title: {
      type: String,
      default: '',
    },
    multiple: {
      type: Boolean,
      default: true,
    },
    acceptTypes: {
      type: String,
      default: 'image/*',
    },
    showAlbumOption: {
      type: Boolean,
      default: true,
    },
    albumId: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      isDragging: false,
      selectedFiles: [],
      loading: false,
      uploadProgress: 0,
      uploadStatus: '',
      selectedAlbumId: null,
      albums: [],
      actionUrl: '', // 不使用el-upload的自动上传功能
    }
  },
  computed: {
    displayTitle() {
      return this.title || this.$t('photoUpload.title')
    },
  },
  watch: {
    albumId: {
      immediate: true,
      handler(newVal) {
        this.selectedAlbumId = newVal
      },
    },
  },
  async created() {
    if (this.showAlbumOption) {
      try {
        // 获取相册列表
        const albumsResponse = await albumService.getAlbums()
        this.albums = albumsResponse.data.data || []
      } catch (error) {
        console.error(this.$t('photoUpload.error.fetchAlbumsFailed'), error)
      }
    }
  },
  methods: {
    handleDragOver(event) {
      this.isDragging = true
    },
    handleDrop(event) {
      this.isDragging = false
      const files = event.dataTransfer.files
      if (!files || files.length === 0) return

      if (this.multiple) {
        for (let i = 0; i < files.length; i++) {
          if (this.isValidFile(files[i])) {
            this.selectedFiles.push(files[i])
          }
        }
      } else if (files.length > 0 && this.isValidFile(files[0])) {
        this.selectedFiles = [files[0]]
      }
    },
    handleFileChange(file) {
      if (!file || !this.isValidFile(file.raw)) return

      if (this.multiple) {
        this.selectedFiles.push(file.raw)
      } else {
        this.selectedFiles = [file.raw]
      }
    },
    isValidFile(file) {
      if (!file) return false

      // 检查文件类型
      if (this.acceptTypes && this.acceptTypes !== '*') {
        const fileType = file.type
        const acceptedTypes = this.acceptTypes.split(',')

        let isValid = false
        for (const type of acceptedTypes) {
          if (type.endsWith('/*')) {
            const baseType = type.slice(0, -1)
            if (fileType.startsWith(baseType)) {
              isValid = true
              break
            }
          } else if (fileType === type) {
            isValid = true
            break
          }
        }

        if (!isValid) return false
      }

      return true
    },
    isImageFile(file) {
      return file.type.startsWith('image/')
    },

    getFilePreview(file) {
      if (!this.isImageFile(file)) return ''

      return URL.createObjectURL(file)
    },
    truncateFilename(filename) {
      if (filename.length > 20) {
        return filename.substring(0, 10) + '...' + filename.substring(filename.length - 7)
      }
      return filename
    },
    formatFileSize(size) {
      if (size < 1024) {
        return this.$t('photoUpload.fileSize.b', { size })
      } else if (size < 1024 * 1024) {
        return this.$t('photoUpload.fileSize.kb', { size: (size / 1024).toFixed(1) })
      } else {
        return this.$t('photoUpload.fileSize.mb', { size: (size / (1024 * 1024)).toFixed(1) })
      }
    },
    removeFile(index) {
      this.selectedFiles.splice(index, 1)
    },
    clearFiles() {
      this.selectedFiles = []
      this.uploadProgress = 0
    },
    async uploadFiles() {
      if (this.selectedFiles.length === 0) {
        this.$notify.warning({
          title: this.$t('navbar.actions.upload'),
          message: this.$t('photoUpload.uploadWarning'),
        })
        return
      }

      this.loading = true
      this.uploadProgress = 0
      this.uploadStatus = this.$t('photoUpload.uploading')

      // 定义进度更新回调函数
      const updateProgress = percent => {
        this.uploadProgress = percent
        this.uploadStatus = this.$t('photoUpload.uploadingWithProgress', { percent })
      }

      try {
        if (this.multiple && this.selectedFiles.length > 1) {
          // 批量上传
          const response = await photoService.batchUploadPhotos(
            this.selectedFiles,
            this.selectedAlbumId,
            null,
            updateProgress // 传入进度更新回调
          )

          this.$emit('upload-success', response.data)
          this.uploadProgress = 100
          this.uploadStatus = this.$t('photoUpload.uploadComplete')
          this.$notify({
            title: this.$t('photoWall.success'),
            message: this.$t('photoUpload.uploadSuccess', { count: response.data.uploadedCount }),
            type: 'success',
          })
        } else {
          // 单张上传
          const metadata = {
            title: this.selectedFiles[0].name.split('.')[0],
            description: '',
            albumIds: this.selectedAlbumId ? [this.selectedAlbumId] : [],
          }

          const response = await photoService.uploadPhoto(
            this.selectedFiles[0],
            metadata,
            updateProgress // 传入进度更新回调
          )

          this.uploadProgress = 100
          this.uploadStatus = this.$t('photoUpload.uploadComplete')
          this.$emit('upload-success', [response.data])
          this.$notify({
            title: this.$t('photoWall.success'),
            message: this.$t('photoUpload.uploadSuccess', { count: 1 }),
            type: 'success',
          })
        }

        this.clearFiles()
      } catch (error) {
        console.error(this.$t('photoUpload.error.uploadFailed'), error)
        this.$notify.error({
          title: this.$t('photoUpload.error.uploadFailed'),
          message:
            error.response?.data?.message || this.$t('photoUpload.error.uploadFailedMessage'),
        })
      } finally {
        // 短暂延迟后重置状态，让用户有时间看到100%的进度
        setTimeout(() => {
          this.loading = false
          // 如果上传成功，uploadProgress会被设置为100
          // 如果上传失败，重置进度
          if (this.uploadProgress !== 100) {
            this.uploadProgress = 0
            this.uploadStatus = this.$t('photoUpload.uploading')
          }
        }, 500)
      }
    },
  },
}
</script>

<style scoped>
.upload-component {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  --upload-border-color: var(--el-border-color);
  --upload-bg-color: var(--el-bg-color);
  --upload-text-color: var(--el-text-color-primary);
  --upload-text-color-secondary: var(--el-text-color-secondary);
  --upload-hover-bg-color: var(--el-fill-color-light);
  --upload-icon-color: var(--el-text-color-secondary);
}

/* 全局样式，确保Element Plus的下拉菜单显示在最上层 */
:global(.el-select__popper) {
  z-index: 10002 !important;
}

/* 相册下拉菜单样式 */
:deep(.album-select-dropdown) {
  position: fixed !important;
  margin-top: 5px !important;
  z-index: 10001 !important;
  /* 确保下拉菜单显示在模态框之上(SfModal的z-index为9999) */
  max-width: 100% !important;
  width: auto !important;
  transform-origin: center top !important;
  overflow: visible !important;
}

/* 确保下拉菜单的父容器不会限制其位置 */
.option-item .el-select {
  width: 100%;
}

/* 确保下拉菜单的弹出层不受限制 */
:deep(.el-select-dropdown) {
  overflow: visible !important;
  z-index: 10001 !important;
  /* 确保下拉菜单显示在模态框之上 */
}

/* 使用teleport确保下拉菜单渲染到body */
:deep(.el-select) {
  --el-select-dropdown-border-color: var(--border-color);
}

:deep(.el-popper) {
  z-index: 10001 !important;
  /* 确保所有弹出层都在模态框之上 */
}

.upload-container {
  border: 2px dashed var(--upload-border-color);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  background-color: var(--upload-bg-color);
}

.upload-container.is-dragging {
  border-color: var(--el-color-primary);
  background-color: var(--upload-hover-bg-color);
}

.upload-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-area {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon i {
  font-size: 48px;
  color: var(--upload-icon-color);
}

.upload-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--upload-text-color);
}

.upload-subtitle {
  font-size: 14px;
  color: var(--upload-text-color-secondary);
}

.browse-text {
  color: var(--el-color-primary);
  cursor: pointer;
  text-decoration: underline;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-status {
  font-size: 14px;
  color: var(--upload-text-color-secondary);
}

.selected-files {
  margin-top: 20px;
  border: 1px solid var(--upload-border-color);
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--upload-bg-color);
}

.selected-files-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--upload-hover-bg-color);
  border-bottom: 1px solid var(--upload-border-color);
}

.selected-count {
  font-weight: 600;
  font-size: 14px;
  color: var(--upload-text-color);
}

.clear-button {
  background: none;
  border: none;
  color: #f56c6c;
  cursor: pointer;
  font-size: 14px;
}

.file-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid var(--upload-border-color);
  position: relative;
}

.file-item:last-child {
  border-bottom: none;
}

.file-preview {
  width: 60px;
  height: 60px;
  overflow: hidden;
  border-radius: 4px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--upload-hover-bg-color);
}

.file-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--upload-text-color-secondary);
  color: var(--upload-bg-color);
  font-weight: bold;
  text-transform: uppercase;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 14px;
  margin-bottom: 4px;
  word-break: break-all;
  color: var(--upload-text-color);
}

.file-size {
  font-size: 12px;
  color: var(--upload-text-color-secondary);
}

.remove-file {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #f56c6c;
  cursor: pointer;
  font-size: 18px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.remove-file:hover {
  background-color: #f56c6c1a;
}

.upload-options {
  padding: 16px;
  border-top: 1px solid var(--upload-border-color);
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: var(--upload-bg-color);
}

.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.option-item label {
  width: 100px;
  font-size: 14px;
  text-align: right;
  color: var(--upload-text-color);
}

.upload-button {
  width: 100%;
  padding: 12px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>
