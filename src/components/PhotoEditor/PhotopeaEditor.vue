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
        <SfButton variant="primary" :loading="saving" @click="saveImage">
          {{ $t('photoEditor.save') }}
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
  emits: ['update:modelValue', 'photo-updated', 'photo-replaced'],
  data() {
    return {
      loading: true,
      error: null,
      saving: false,
      photopeaUrl: 'https://www.photopea.com/',
      isFrameLoaded: false,
      isPhotopeaReady: false,
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
        const config = {
          files: [this.photo.url],
        }
        return `https://www.photopea.com/#${encodeURIComponent(JSON.stringify(config))}`
      }
      return this.photopeaUrl
    },
  },
  watch: {
    modelValue(newVal) {
      if (newVal && this.photo) {
        // 使用nextTick确保DOM已更新
        this.$nextTick(() => {
          this.initializeEditor()
        })
      }
    },
  },
  mounted() {
    // 监听来自Photopea的消息
    window.addEventListener('message', this.handlePhotopeaMessage)
  },
  beforeUnmount() {
    // 清理事件监听器
    window.removeEventListener('message', this.handlePhotopeaMessage)
  },
  methods: {
    async initializeEditor() {
      try {
        this.loading = true
        this.error = null
        this.isPhotopeaReady = false

        // 等待iframe渲染到DOM中
        await this.waitForFrameRender()

        // 等待iframe加载完成
        if (!this.isFrameLoaded) {
          await this.waitForFrameLoad()
        }

        // 等待Photopea准备就绪
        await this.waitForPhotopeaReady()

        this.loading = false
      } catch (error) {
        console.error('初始化编辑器失败:', error)
        this.error = this.$t('photoEditor.loadError')
        this.loading = false
      }
    },

    waitForFrameRender() {
      return new Promise(resolve => {
        const checkFrame = () => {
          if (this.$refs.photopeaFrame) {
            resolve()
          } else {
            this.$nextTick(checkFrame)
          }
        }
        checkFrame()
      })
    },

    waitForPhotopeaReady() {
      return new Promise(resolve => {
        const checkReady = () => {
          if (this.isPhotopeaReady) {
            resolve()
          } else {
            setTimeout(checkReady, 100)
          }
        }
        checkReady()
      })
    },

    handlePhotopeaMessage(event) {
      // 确保消息来自Photopea
      if (event.origin !== 'https://www.photopea.com') return

      if (event.data === 'done') {
        // Photopea准备就绪或完成操作
        if (!this.isPhotopeaReady) {
          this.isPhotopeaReady = true
          console.log('Photopea已准备就绪')
        }
      } else if (event.data instanceof ArrayBuffer) {
        // 接收到导出的图片数据
        this.handleExportedImage(event.data)
      } else if (typeof event.data === 'string' && event.data.startsWith('data:')) {
        // 接收到base64格式的图片数据
        this.handleExportedImageBase64(event.data)
      }
    },

    waitForFrameLoad() {
      return new Promise((resolve, reject) => {
        const frame = this.$refs.photopeaFrame

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
      if (!this.$refs.photopeaFrame || !this.isPhotopeaReady) return

      try {
        this.saving = true

        // 向Photopea发送导出命令
        const script = 'app.activeDocument.saveToOE("png");'
        this.$refs.photopeaFrame.contentWindow.postMessage(script, '*')

        // saveImage方法不直接等待响应，而是通过handleExportedImage处理
      } catch (error) {
        console.error('保存编辑后的图片失败:', error)
        this.$notify({
          title: this.$t('photoEditor.saveError.title'),
          message: this.$t('photoEditor.saveError.message'),
          type: 'error',
        })
        this.saving = false
      }
    },

    async handleExportedImage(arrayBuffer) {
      try {
        // 将ArrayBuffer转换为File对象
        const blob = new Blob([arrayBuffer], { type: 'image/png' })
        const file = new File([blob], `edited_${this.photo.filename || 'photo.png'}`, {
          type: 'image/png',
        })

        await this.processEditedPhoto(file)
      } catch (error) {
        console.error('处理导出图片失败:', error)
        this.$notify({
          title: this.$t('photoEditor.saveError.title'),
          message: this.$t('photoEditor.saveError.message'),
          type: 'error',
        })
        this.saving = false
      }
    },

    async handleExportedImageBase64(dataUrl) {
      try {
        // 将base64转换为File对象
        const response = await fetch(dataUrl)
        const blob = await response.blob()
        const file = new File([blob], `edited_${this.photo.filename || 'photo.png'}`, {
          type: 'image/png',
        })

        await this.processEditedPhoto(file)
      } catch (error) {
        console.error('处理导出图片失败:', error)
        this.$notify({
          title: this.$t('photoEditor.saveError.title'),
          message: this.$t('photoEditor.saveError.message'),
          type: 'error',
        })
        this.saving = false
      }
    },

    async processEditedPhoto(file) {
      try {
        // 导入photoService
        const { photoService } = await import('../../api')

        // 删除原图片
        await photoService.deletePhoto(this.photo.id)
        this.$emit('photo-replaced', this.photo.id)

        // 上传编辑后的图片
        const uploadResponse = await photoService.batchUploadPhotos([file])

        if (uploadResponse.data && uploadResponse.data.length > 0) {
          const newPhoto = uploadResponse.data[0]

          // 如果原图片有标题，更新新图片的标题
          if (this.photo.title) {
            try {
              await photoService.updatePhoto(newPhoto.id, {
                title: this.photo.title,
              })
              // 更新本地的newPhoto对象
              newPhoto.title = this.photo.title
            } catch (error) {
              console.warn('更新图片标题失败:', error)
            }
          }

          this.$emit('photo-updated', newPhoto)

          this.$notify({
            title: this.$t('photoEditor.saveSuccess.title'),
            message: this.$t('photoEditor.saveSuccess.message'),
            type: 'success',
          })

          this.handleClose()
        }
      } catch (error) {
        console.error('处理编辑后的图片失败:', error)
        this.$notify({
          title: this.$t('photoEditor.saveError.title'),
          message: this.$t('photoEditor.saveError.message'),
          type: 'error',
        })
      } finally {
        this.saving = false
      }
    },

    handleFrameLoad() {
      this.isFrameLoaded = true
    },

    handleClose() {
      this.isVisible = false
      this.loading = true
      this.error = null
      this.isFrameLoaded = false
      this.isPhotopeaReady = false
      this.saving = false
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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
