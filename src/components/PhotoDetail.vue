<template>
  <div class="photo-detail">
    <div v-if="editing" class="edit-form">
      <div class="form-group">
        <label for="title">标题</label>
        <input
          type="text"
          id="title"
          v-model="editData.title"
          placeholder="输入照片标题"
        />
      </div>
      <div class="form-group">
        <label for="description">描述</label>
        <textarea
          id="description"
          v-model="editData.description"
          placeholder="输入照片描述"
        ></textarea>
      </div>
      <div class="action-buttons">
        <button @click="saveChanges" :disabled="updating" class="save-btn">
          {{ updating ? '保存中...' : '保存更改' }}
        </button>
        <button @click="cancelEditing" class="cancel-btn">取消</button>
      </div>
    </div>
    
    <div v-else>
      <div v-if="photo.url" class="photo-container">
        <img :src="photo.url" :alt="photo.title || '照片'">
      </div>
      
      <div class="photo-info">
        <h2 v-if="photo.title">{{ photo.title }}</h2>
        <p v-if="photo.description">{{ photo.description }}</p>
        <p v-if="photo.createdAt" class="photo-date">
          上传时间: {{ formatDate(photo.createdAt) }}
        </p>
        <p class="photo-id">照片ID: {{ photo.id }}</p>
        
        <div class="action-buttons">
          <button @click="startEditing" class="edit-button">编辑信息</button>
          <button 
            @click="handleDelete" 
            class="delete-button"
            :disabled="deleting"
          >
            {{ deleting ? '删除中...' : '删除照片' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PhotoDetail',
  props: {
    photo: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      deleting: false,
      editing: false,
      updating: false,
      editData: {
        title: '',
        description: ''
      }
    }
  },
  methods: {
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(dateString).toLocaleDateString(undefined, options)
    },
    startEditing() {
      this.editData = {
        title: this.photo.title || '',
        description: this.photo.description || ''
      }
      this.editing = true
    },
    cancelEditing() {
      this.editing = false
    },
    async saveChanges() {
      this.updating = true
      
      try {
        const response = await this.$http.put(`/photos/${this.photo.id}`, this.editData)
        this.$emit('photo-updated', response.data)
        this.editing = false
        this.$notify({
          title: '成功',
          message: '照片信息已更新',
          type: 'success'
        })
      } catch (error) {
        console.error('更新失败:', error)
        this.$notify.error({
          title: '错误',
          message: error.response?.data?.message || '更新照片信息失败'
        })
      } finally {
        this.updating = false
      }
    },
    async handleDelete() {
      if (!confirm('确定要删除这张照片吗？')) return
      
      this.deleting = true
      
      try {
        await this.$http.delete(`/photos/${this.photo.id}`)
        this.$emit('photo-deleted', this.photo.id)
        this.$notify({
          title: '成功',
          message: '照片已删除',
          type: 'success'
        })
      } catch (error) {
        console.error('删除失败:', error)
        this.$notify.error({
          title: '错误',
          message: error.response?.data?.message || '删除照片失败'
        })
      } finally {
        this.deleting = false
      }
    }
  }
}
</script>

<style scoped>
.photo-detail {
  margin-top: 30px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  background-color: #f9f9f9;
}

.photo-container {
  margin-bottom: 20px;
}

.photo-container img {
  max-width: 100%;
  max-height: 500px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.photo-info {
  text-align: left;
}

.photo-info h2 {
  margin-bottom: 10px;
  color: #2c3e50;
}

.photo-info p {
  color: #666;
  line-height: 1.6;
}

.photo-date {
  font-size: 0.9em;
  color: #888;
  margin-top: 10px;
}

.photo-id {
  font-size: 0.9em;
  color: #888;
  margin: 10px 0;
}

.delete-button {
  padding: 8px 16px;
  background-color: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 15px;
  transition: background-color 0.2s;
}

.delete-button:hover {
  background-color: #cc0000;
}

.delete-button:disabled {
  background-color: #ff9999;
  cursor: not-allowed;
}

.edit-form {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.save-btn {
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn:hover {
  background-color: #369f6b;
}

.save-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.cancel-btn {
  padding: 8px 16px;
  background-color: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

.edit-button {
  padding: 8px 16px;
  background-color: #6750a4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-button:hover {
  background-color: #7c63b9;
}
</style>