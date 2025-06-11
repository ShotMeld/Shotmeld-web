<!--
  AlbumForm.vue - 相册创建组件
-->

<template>
  <div class="album-form-container">
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="album-name">{{ $t('albumForm.name.label') }}</label>
        <input
          id="album-name"
          v-model="formData.name"
          type="text"
          required
          :placeholder="$t('albumForm.name.placeholder')"
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="album-description">{{ $t('albumForm.description.label') }}</label>
        <textarea
          id="album-description"
          v-model="formData.description"
          :placeholder="$t('albumForm.description.placeholder')"
          class="form-textarea"
          rows="3"
        ></textarea>
      </div>

      <div class="form-actions">
        <button type="button" @click="handleCancel" class="cancel-button">
          {{ $t('albumForm.actions.cancel') }}
        </button>
        <button type="submit" :disabled="submitting" class="submit-button">
          <span v-if="submitting" class="button-loader"></span>
          {{ submitting ? $t('albumForm.actions.submitting') : $t('albumForm.actions.submit') }}
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
      default: null,
    },
  },
  data() {
    return {
      formData: {
        name: '',
        description: '',
        coverPhotoId: '',
      },
      submitting: false,
    }
  },
  created() {
    if (this.editingAlbum) {
      this.formData = {
        name: this.editingAlbum.name,
        description: this.editingAlbum.description,
        coverPhotoId: this.editingAlbum.coverPhotoId,
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
          coverPhotoId: this.formData.coverPhotoId || null,
        }

        if (this.editingAlbum) {
          // 编辑相册逻辑
          await this.$http.put(`/albums/${this.editingAlbum.id}`, payload)
          this.$emit('success', { ...this.editingAlbum, ...payload })
          this.$notify({
            title: this.$t('albumView.success'),
            message: this.$t('albumForm.success.update'),
            type: 'success',
          })
        } else {
          // 创建相册逻辑
          const response = await this.$http.post('/albums', payload)
          this.$emit('success', response.data)
          this.$notify({
            title: this.$t('albumView.success'),
            message: this.$t('albumForm.success.create'),
            type: 'success',
          })
        }

        this.$emit('close')
        this.$emit('album-created')
        this.$emit('update:modelValue', false)
      } catch (error) {
        console.error(this.$t('albumForm.error.message'), error)
        this.$notify.error({
          title: this.$t('albumForm.error.title'),
          message: error.response?.data?.message || this.$t('albumForm.error.message'),
        })
      } finally {
        this.submitting = false
      }
    },
    handleCancel() {
      this.$emit('cancel')
      this.$emit('close')
    },
  },
}
</script>

<style scoped>
.album-form-container {
  padding: var(--spacing-xs);
  max-width: var(--container-sm);
  margin: 0 auto;
  font-family: var(--font-family);
}

.form-title {
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xl);
  text-align: center;
  font-weight: var(--font-weight-semibold);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  font-size: var(--font-size-base);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--radius-medium);
  font-size: var(--font-size-base);
  font-family: var(--font-family);
  color: var(--text-primary);
  background-color: var(--bg-primary);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.2);
}

.form-input:hover,
.form-textarea:hover {
  border-color: var(--border-color-hover);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-hint {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-2xs);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xl);
}

.cancel-button,
.submit-button {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-medium);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: var(--border-width) solid transparent;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-button {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.cancel-button:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-color-hover);
}

.submit-button {
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
  min-width: 100px;
}

.submit-button:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
}

.submit-button:active {
  transform: translateY(0);
  box-shadow: var(--shadow-small);
}

.submit-button:disabled {
  background-color: var(--color-gray);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.button-loader {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-round);
  border-top-color: var(--color-white);
  animation: spin 1s linear infinite;
  margin-right: var(--spacing-xs);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .form-input:focus,
  .form-textarea:focus {
    box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.3);
  }
}
</style>
