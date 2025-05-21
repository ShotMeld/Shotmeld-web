<!--
  PhotoWallAlbumModal.vue - 照片添加到相册的选择弹窗组件
-->

<template>
  <SfModal v-model="visible" title="选择相册" size="default">
    <div class="album-selection">
      <div v-if="albums.length === 0" class="no-albums">
        <p>暂无相册，请先创建相册</p>
        <SfButton type="primary" @click="handleCreateAlbum">创建新相册</SfButton>
      </div>
      <div v-else class="album-list">
        <div 
          v-for="album in albums" 
          :key="album.id" 
          class="album-card-wrapper"
          :class="{ 'selected': selectedAlbumId === album.id }"
        >
          <AlbumCard 
            :album="album" 
            @click="selectAlbum(album.id)"
          />
          <div v-if="selectedAlbumId === album.id" class="selection-indicator">
            <i class="fas fa-check"></i>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <SfButton type="secondary" @click="handleCancel">取消</SfButton>
        <SfButton type="primary" @click="handleConfirm" :disabled="!selectedAlbumId">确认</SfButton>
      </div>
    </div>
  </SfModal>
  <SfButton 
  type="primary" 
  rounded
  @click="$emit('showUploadModal')"
>
  <template #prefix>
    <i class="fas fa-cloud-upload-alt"></i>
  </template>
  上传照片
  <!-- 隐藏的 input 用于上传 -->
  <input 
    type="file" 
    ref="fileInput" 
    style="display: none" 
    accept="image/jpeg, image/png, image/gif, image/webp"
    @change="handleFileUpload"
    multiple
  />
</SfButton>

   <!-- 错误提示 -->
   <div v-if="uploadError" class="upload-error-message">
    <i class="fas fa-exclamation-circle"></i>
    {{ uploadError }}
  </div>
</template>

<script>
import { SfButton, SfModal } from '../../components/ui';
import AlbumCard from '../../components/album/AlbumCard.vue';

export default {

  data() {
    return {
      selectedAlbumId: null,
      uploadError: null // 新增错误状态
    };
  },
  methods: {
    handleFileUpload(event) {
      const files = event.target.files;
      if (!files.length) return;

      // 允许的文件类型
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
      ];
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

      const invalidFiles = [];
      const validFiles = [];

      Array.from(files).forEach(file => {
        // 获取文件扩展名
        const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        
        // 检查类型和扩展名
        const isTypeAllowed = allowedTypes.includes(file.type);
        const isExtAllowed = allowedExtensions.includes(fileExt);
        const isHeic = file.type === 'image/heic' || fileExt === '.heic';
        
        if (!isTypeAllowed || !isExtAllowed || isHeic) {
          invalidFiles.push(file.name);
        } else {
          validFiles.push(file);
        }
      });
      // 显示错误提示
      if (invalidFiles.length) {
        this.uploadError = `以下文件格式不支持: ${invalidFiles.join(', ')}\n请上传 JPEG/PNG/GIF/WEBP 格式`;
        // 5秒后自动清除错误信息
        setTimeout(() => {
          this.uploadError = null;
        }, 5000);
      } else {
        this.uploadError = null;
      }

      // 如果有合法文件，触发上传
      if (validFiles.length) {
        this.$emit('upload-files', validFiles); // 注意这里改为复数形式，传递所有合法文件
      }

      // 重置 input，允许重复选择同一文件
      event.target.value = '';
    },
 // 处理拖放上传
 handleDrop(event) {
      event.preventDefault();
      const files = event.dataTransfer.files;
      if (files.length) {
        // 模拟文件输入变化事件
        const inputEvent = { target: { files } };
        this.handleFileUpload(inputEvent);
      }
    },
    
    // 防止默认拖放行为
    handleDragOver(event) {
      event.preventDefault();
    }
  },
  mounted() {
    // 添加拖放事件监听
    this.$el.addEventListener('drop', this.handleDrop);
    this.$el.addEventListener('dragover', this.handleDragOver);
  },
  beforeUnmount() {
    // 移除事件监听
    this.$el.removeEventListener('drop', this.handleDrop);
    this.$el.removeEventListener('dragover', this.handleDragOver);
  },

    name: 'PhotoWallAlbumModal',
    components: {
      SfButton,
      SfModal,
      AlbumCard
    },
    props: {
      modelValue: {
        type: Boolean,
        default: false
      },
      albums: {
        type: Array,
        default: () => []
      }
    },
    emits: ['update:modelValue', 'create-album', 'add-to-album'],
    data() {
      return {
        selectedAlbumId: null,
      };
    },
    computed: {
      visible: {
        get() {
          return this.modelValue;
        },
        set(value) {
          this.$emit('update:modelValue', value);
        }
      }
    },
    watch: {
      modelValue(newValue) {
        if (newValue) {
          // 每次打开弹窗时重置选择的相册ID
          this.selectedAlbumId = null;
        }
      }
    },
    methods: {
      selectAlbum(albumId) {
        this.selectedAlbumId = albumId;
      },
      handleCreateAlbum() {
        this.$emit('create-album');
      },
      handleCancel() {
        this.visible = false;
      },
      handleConfirm() {
        if (!this.selectedAlbumId) return;
        this.$emit('add-to-album', this.selectedAlbumId);
        this.visible = false;
      },
      handleFileUpload(event) {
        const files = event.target.files;
        if (!files.length) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const invalidFiles = [];

        Array.from(files).forEach(file => {
          // 检测 HEIC 格式（通过文件类型或扩展名）
          const isHeic = file.type === 'image/heic' ||
            file.name.toLowerCase().endsWith('.heic');

          if (isHeic || !allowedTypes.includes(file.type)) {
            invalidFiles.push(file.name);
          } else {
            // 合法文件，触发上传逻辑
            this.$emit('upload-file', file);
          }
        });

        // 显示错误提示
        if (invalidFiles.length) {
          this.$emit('upload-error', `以下文件格式不支持: ${invalidFiles.join(', ')}\n请上传 JPEG/PNG/GIF/WEBP 格式`);
        }

        // 重置 input，允许重复选择同一文件
        event.target.value = '';
      },

      // 手动触发文件选择（替代默认点击上传）
      openFileDialog() {
        this.$refs.fileInput.click();
      }
    }
  }

</script>

<style scoped>
.album-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 100%;
  overflow: hidden;
}

.no-albums {
  text-align: center;
  padding: var(--spacing-lg);
}

.album-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--spacing-md);
  width: 100%;
  padding: var(--spacing-md);
  max-height: 60vh;
  overflow-y: auto;
}

.album-card-wrapper {
  position: relative;
  transition: transform 0.2s ease;
}

.album-card-wrapper.selected {
  transform: scale(0.98);
}

.album-card-wrapper.selected :deep(.album-card) {
  background-color: var(--bg-hover);
  box-shadow: 0 0 0 2px var(--primary);
}

.selection-indicator {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  transform: scale(1.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  margin-top: var(--spacing-md);
  gap: var(--spacing-md);
}

.upload-error {
  color: #ff4d4f;
  margin-top: 8px;
  font-size: 12px;
}

.upload-error {
  color: #ff4d4f;
  margin-top: 8px;
  padding: 8px;
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  font-size: 14px;
  white-space: pre-line; /* 保留换行符 */
}

/* 错误提示样式 */
.upload-error-message {
  color: #ff4d4f;
  margin-top: 12px;
  padding: 10px 15px;
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 6px;
  font-size: 14px;
  white-space: pre-line;
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  word-break: break-word;
}

.upload-error-message i {
  font-size: 16px;
}

/* 添加拖放区域样式 */
.drop-zone {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  margin-top: 16px;
  transition: all 0.3s;
}

.drop-zone.active {
  border-color: var(--primary);
  background-color: rgba(24, 144, 255, 0.1);
}
</style>