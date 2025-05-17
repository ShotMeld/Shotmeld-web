<template>
  <div class="album-form-container">

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="album-name">相册名称*</label>
        <input id="album-name" v-model="formData.name" type="text" required placeholder="输入相册名称" class="form-input">
      </div>

      <div class="form-group">
        <label for="album-description">相册描述</label>
        <textarea id="album-description" v-model="formData.description" placeholder="输入相册描述" class="form-textarea"
          rows="3"></textarea>
      </div>

      <div class="form-actions">
        <button type="button" @click="$emit('cancel'); $emit('close')" class="cancel-button">
          取消
        </button>
        <button type="submit" :disabled="submitting" class="submit-button">
          <span v-if="submitting" class="button-loader"></span>
          {{ submitting ? '提交中...' : '确认' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'AlbumForm',
  props: {
    editingAlbum: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      formData: {
        name: '',
        description: '',
        coverPhotoId: ''
      },
      submitting: false
    }
  },
  created() {
    if (this.editingAlbum) {
      this.formData = {
        name: this.editingAlbum.name,
        description: this.editingAlbum.description,
        coverPhotoId: this.editingAlbum.coverPhotoId
      }
    }
  },
  methods: {
    async handleSubmit() {
      this.submitting = true

      try {
        const payload = {
          name: this.formData.name,
          description: this.formData.description,
          coverPhotoId: this.formData.coverPhotoId || null
        }

        if (this.editingAlbum) {
          // 编辑相册逻辑
          await this.$http.put(`/albums/${this.editingAlbum.id}`, payload)
          this.$emit('success', { ...this.editingAlbum, ...payload })
          this.$notify({
            title: '成功',
            message: '相册已更新',
            type: 'success'
          })
        } else {
          // 创建相册逻辑
          const response = await this.$http.post('/albums', payload)
          this.$emit('success', response.data)
          this.$notify({
            title: '成功',
            message: '相册已创建',
            type: 'success'
          })
        }

        this.$emit('close')
        this.$emit('album-created')
        this.$emit('update:modelValue', false)
      } catch (error) {
        console.error('操作失败:', error)
        this.$notify.error({
          title: '错误',
          message: error.response?.data?.message || '操作失败，请重试'
        })
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.album-form-container {
  padding: 8px;
  max-width: 500px;
  margin: 0 auto;
}

.form-title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 24px;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #4361ee;
  outline: none;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-hint {
  font-size: 0.85rem;
  color: #666;
  margin-top: 6px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-button,
.submit-button {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-button {
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
}

.cancel-button:hover {
  background-color: #e9ecef;
}

.submit-button {
  background-color: #4361ee;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
}

.submit-button:hover {
  background-color: #3a56d4;
}

.submit-button:disabled {
  background-color: #a8b1ff;
  cursor: not-allowed;
}

.button-loader {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>