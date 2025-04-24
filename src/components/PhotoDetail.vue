<template>
  <div class="photo-detail">
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
      
      <button 
        @click="handleDelete" 
        class="delete-button"
        :disabled="deleting"
      >
        {{ deleting ? '删除中...' : '删除照片' }}
      </button>
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
      deleting: false
    }
  },
  methods: {
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(dateString).toLocaleDateString(undefined, options)
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
</style>