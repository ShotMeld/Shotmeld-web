<!--
  PhotopeaEditor.vue - Photopea编辑器组件
  使用Photopea在线编辑器对照片进行编辑
-->

<template>
  <SfModal
    v-model="isVisible"
    :title="$t('photoEditor.title')"
    size="large"
    :close-on-click-overlay="false"
    @close="handleClose"
  >
    <div class="photopea-editor">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>{{ $t('photoEditor.loading') }}</p>
      </div>
      
      <div v-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <SfButton @click="retry">{{ $t('common.retry') }}</SfButton>
      </div>

      <iframe
        v-show="!loading && !error"
        ref="photopeaFrame"
        class="photopea-frame"
        :src="photopeaUrlWithImage"
        @load="handleFrameLoad"
      ></iframe>
    </div>

    <template #footer>
      <div class="editor-actions">
        <SfButton variant="secondary" @click="handleClose">
          {{ $t('common.cancel') }}
        </SfButton>
        <SfButton 
          variant="primary" 
          :loading="saving"
          @click="saveImage"
        >
          {{ $t('photoEditor.done') }}
        </SfButton>
      </div>
    </template>
  </SfModal>
</template>

<script>
import { SfModal, SfButton } from '../ui'

export default {
  name: 'PhotopeaEditor',
  components: {
    SfModal,
    SfButton,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    photo: {
      type: Object,
      default: null,
    },
  },
  emits: ['update:modelValue', 'photo-updated', 'photo-deleted'],
  data() {
    return {
      loading: true,
      error: null,
      saving: false,
      photopeaUrl: 'https://www.photopea.com/',
      isFrameLoaded: false,
    }
  },
  computed: {
    isVisible: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      },
    },
    photopeaUrlWithImage() {
      if (this.photo && this.photo.url) {
        // 构建包含图片URL的Photopea链接
        return `https://www.photopea.com/#%7B%22files%22:%5B%22${encodeURIComponent(this.photo.url)}%22%5D%7D`
      }
      return this.photopeaUrl
    },
  },
  watch: {
    modelValue(newVal) {
      if (newVal && this.photo) {
        this.initializeEditor()
      }
    },
  },
  methods: {
    async initializeEditor() {
      try {
        this.loading = true
        this.error = null
        
        // 等待iframe加载完成
        if (!this.isFrameLoaded) {
          await this.waitForFrameLoad()
        }
        
        // 给Photopea一些时间来加载图片
        setTimeout(() => {
          this.loading = false
        }, 3000)
        
      } catch (error) {
        console.error('初始化编辑器失败:', error)
        this.error = this.$t('photoEditor.loadError')
        this.loading = false
      }
    },

    waitForFrameLoad() {
      return new Promise((resolve, reject) => {
        const frame = this.$refs.photopeaFrame
        if (!frame) {
          reject(new Error('Frame not found'))
          return
        }

        const timeout = setTimeout(() => {
          reject(new Error('Frame load timeout'))
        }, 30000)

        const handleLoad = () => {
          clearTimeout(timeout)
          this.isFrameLoaded = true
          resolve()
        }

        if (frame.contentDocument && frame.contentDocument.readyState === 'complete') {
          handleLoad()
        } else {
          frame.addEventListener('load', handleLoad)
        }
      })
    },

    async saveImage() {
      // 提示用户使用Photopea的导出功能
      this.$notify({
        title: this.$t('photoEditor.exportInstructions.title'),
        message: this.$t('photoEditor.exportInstructions.message'),
        type: 'info',
        duration: 10000,
      })

      // 关闭编辑器
      this.handleClose()
    },

    handleFrameLoad() {
      this.isFrameLoaded = true
    },

    handleClose() {
      this.isVisible = false
      this.loading = true
      this.error = null
      this.isFrameLoaded = false
    },

    retry() {
      this.error = null
      this.initializeEditor()
    },
  },
}
</script>

<style scoped>
.photopea-editor {
  width: 100%;
  height: 80vh;
  position: relative;
}

.photopea-frame {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: var(--radius-medium);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: var(--spacing-md);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: var(--spacing-md);
}

.error-message {
  color: var(--color-error);
  font-size: var(--font-size-md);
  margin: 0;
}

.editor-actions {
  display: flex;
  gap: var(--spacing-sm);
}

@media (max-width: 768px) {
  .photopea-editor {
    height: 70vh;
  }
  
  .editor-actions {
    flex-direction: column-reverse;
  }
}
</style>
