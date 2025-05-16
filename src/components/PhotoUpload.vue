<template>
  <div class="upload-component">
    <div class="upload-container" @dragover.prevent="handleDragOver" @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop" :class="{ 'is-dragging': isDragging }">
      <div class="upload-inner" v-if="!loading">
        <i class="el-icon-upload-fill"></i>
        <el-upload class="upload-area" :action="actionUrl" :auto-upload="false" :show-file-list="false"
          :on-change="handleFileChange" :multiple="multiple" :accept="acceptTypes">
          <div class="upload-content">
            <div class="upload-icon">
              <i class="el-icon-upload"></i>
            </div>
            <div class="upload-text">
              <div class="upload-title">{{ title }}</div>
              <div class="upload-subtitle">拖拽文件到此处或 <span class="browse-text">点击上传</span></div>
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
        <div class="selected-count">已选择 {{ selectedFiles.length }} 个文件</div>
        <button class="clear-button" @click="clearFiles">清空</button>
      </div>
      <div class="file-list">
        <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
          <div class="file-preview">
            <img v-if="isImageFile(file)" :src="getFilePreview(file)" alt="预览" />
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
          <label>添加到相册:</label>
          <el-select v-model="albumId" placeholder="选择相册" clearable popper-class="album-select-dropdown" teleported
            popper-append-to-body>
            <el-option v-for="album in albums" :key="album.id" :label="album.name" :value="album.id">
            </el-option>
          </el-select>
        </div>
        <div class="option-item">
          <label>添加标签:</label>
          <el-select v-model="selectedTags" multiple collapse-tags placeholder="添加标签" popper-class="tag-select-dropdown"
            teleported popper-append-to-body>
            <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.id">
            </el-option>
          </el-select>
        </div>
      </div>
      <el-button type="primary" class="upload-button" @click="uploadFiles" :loading="loading">
        {{ loading ? '上传中...' : '开始上传' }}
      </el-button>
    </div>
  </div>
</template>

<script>
import { photoService, albumService, tagService } from '../api';

export default {
  name: 'PhotoUpload',
  props: {
    title: {
      type: String,
      default: '上传照片'
    },
    multiple: {
      type: Boolean,
      default: true
    },
    acceptTypes: {
      type: String,
      default: 'image/*'
    },
    showAlbumOption: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isDragging: false,
      selectedFiles: [],
      loading: false,
      uploadProgress: 0,
      uploadStatus: '正在上传...',
      albumId: null,
      selectedTags: [],
      albums: [],
      tags: [],
      actionUrl: '' // 不使用el-upload的自动上传功能
    }
  },
  async created() {
    if (this.showAlbumOption) {
      try {
        // 获取相册和标签列表
        const [albumsResponse, tagsResponse] = await Promise.all([
          albumService.getAlbums(),
          tagService.getTags()
        ]);

        this.albums = albumsResponse.data.data || [];
        this.tags = tagsResponse.data || [];
      } catch (error) {
        console.error('获取相册或标签列表失败:', error);
      }
    }
  },
  methods: {
    handleDragOver(event) {
      this.isDragging = true;
    },
    handleDrop(event) {
      this.isDragging = false;
      const files = event.dataTransfer.files;
      if (!files || files.length === 0) return;

      if (this.multiple) {
        for (let i = 0; i < files.length; i++) {
          if (this.isValidFile(files[i])) {
            this.selectedFiles.push(files[i]);
          }
        }
      } else if (files.length > 0 && this.isValidFile(files[0])) {
        this.selectedFiles = [files[0]];
      }
    },
    handleFileChange(file) {
      if (!file || !this.isValidFile(file.raw)) return;

      if (this.multiple) {
        this.selectedFiles.push(file.raw);
      } else {
        this.selectedFiles = [file.raw];
      }
    },
    isValidFile(file) {
      if (!file) return false;

      // 检查文件类型
      if (this.acceptTypes && this.acceptTypes !== '*') {
        const fileType = file.type;
        const acceptedTypes = this.acceptTypes.split(',');

        let isValid = false;
        for (const type of acceptedTypes) {
          if (type.endsWith('/*')) {
            const baseType = type.slice(0, -1);
            if (fileType.startsWith(baseType)) {
              isValid = true;
              break;
            }
          } else if (fileType === type) {
            isValid = true;
            break;
          }
        }

        if (!isValid) return false;
      }

      return true;
    },
    isImageFile(file) {
      return file.type.startsWith('image/');
    },
    getFilePreview(file) {
      if (!this.isImageFile(file)) return '';

      return URL.createObjectURL(file);
    },
    truncateFilename(filename) {
      if (filename.length > 20) {
        return filename.substring(0, 10) + '...' + filename.substring(filename.length - 7);
      }
      return filename;
    },
    formatFileSize(size) {
      if (size < 1024) {
        return size + 'B';
      } else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(1) + 'KB';
      } else {
        return (size / (1024 * 1024)).toFixed(1) + 'MB';
      }
    },
    removeFile(index) {
      this.selectedFiles.splice(index, 1);
    },
    clearFiles() {
      this.selectedFiles = [];
      this.uploadProgress = 0;
    },
    async uploadFiles() {
      if (this.selectedFiles.length === 0) {
        this.$notify.warning({
          title: '提示',
          message: '请先选择要上传的文件'
        });
        return;
      }

      this.loading = true;
      this.uploadProgress = 0;
      this.uploadStatus = '正在上传...';

      // 定义进度更新回调函数
      const updateProgress = (percent) => {
        this.uploadProgress = percent;
        this.uploadStatus = `正在上传... ${percent}%`;
      };

      try {
        if (this.multiple && this.selectedFiles.length > 1) {
          // 批量上传
          const response = await photoService.batchUploadPhotos(
            this.selectedFiles,
            this.albumId,
            this.selectedTags,
            updateProgress // 传入进度更新回调
          );

          this.$emit('upload-success', response.data);
          this.uploadProgress = 100;
          this.uploadStatus = '上传完成';
          this.$notify({
            title: '成功',
            message: `已成功上传 ${response.data.uploadedCount} 张照片`,
            type: 'success'
          });
        } else {
          // 单张上传
          const metadata = {
            title: this.selectedFiles[0].name.split('.')[0],
            description: '',
            tags: this.selectedTags,
            albumIds: this.albumId ? [this.albumId] : []
          };

          const response = await photoService.uploadPhoto(
            this.selectedFiles[0], 
            metadata,
            updateProgress // 传入进度更新回调
          );

          this.uploadProgress = 100;
          this.uploadStatus = '上传完成';
          this.$emit('upload-success', [response.data]);
          this.$notify({
            title: '成功',
            message: '照片上传成功',
            type: 'success'
          });
        }

        this.clearFiles();
      } catch (error) {
        console.error('上传失败:', error);
        this.$notify.error({
          title: '上传失败',
          message: error.response?.data?.message || '上传失败，请重试'
        });
      } finally {
        // 短暂延迟后重置状态，让用户有时间看到100%的进度
        setTimeout(() => {
          this.loading = false;
          // 如果上传成功，uploadProgress会被设置为100
          // 如果上传失败，重置进度
          if (this.uploadProgress !== 100) {
            this.uploadProgress = 0;
            this.uploadStatus = '正在上传...';
          }
        }, 500);
      }
    }
  }
}
</script>

<style scoped>
.upload-component {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

/* 全局样式，确保Element Plus的下拉菜单显示在最上层 */
:global(.el-select__popper) {
  z-index: 10002 !important;
}

/* 相册和标签下拉菜单样式 */
:deep(.album-select-dropdown),
:deep(.tag-select-dropdown) {
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
  border: 2px dashed #dcdfe6;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.upload-container.is-dragging {
  border-color: #409eff;
  background-color: rgba(64, 158, 255, 0.05);
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
  color: #909399;
}

.upload-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.upload-subtitle {
  font-size: 14px;
  color: #909399;
}

.browse-text {
  color: #409eff;
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
  color: #606266;
}

.selected-files {
  margin-top: 20px;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  overflow: hidden;
}

.selected-files-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.selected-count {
  font-weight: 600;
  font-size: 14px;
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
  border-bottom: 1px solid #ebeef5;
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
  background-color: #f5f7fa;
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
  background-color: #909399;
  color: white;
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
}

.file-size {
  font-size: 12px;
  color: #909399;
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
  border-top: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  gap: 12px;
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
}

.upload-button {
  width: 100%;
  padding: 12px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>
