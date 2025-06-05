<template>
  <div class="duplicate-photos-page">
    <div class="page-header">
      <h1>重复图片管理</h1>
      <p class="page-description">
        智能检测并管理重复的照片，释放存储空间，让您的图库更加整洁有序。
      </p>
    </div>

    <DuplicateDetector
      @detection-start="handleDetectionStart"
      @detection-complete="handleDetectionComplete"
    />

    <DuplicateResults
      v-if="showResults"
      :duplicate-groups="duplicateGroups"
      @restart="handleRestart"
      @delete-photos="handleDeletePhotos"
    />
  </div>
</template>

<script>
import DuplicateDetector from './DuplicatePhotos/DuplicateDetector.vue'
import DuplicateResults from './DuplicatePhotos/DuplicateResults.vue'
import { photoService } from '@/api'

export default {
  name: 'DuplicatePhotosPage',
  components: {
    DuplicateDetector,
    DuplicateResults
  },
  data() {
    return {
      showResults: false,
      duplicateGroups: []
    }
  },
  methods: {
    handleDetectionStart() {
      this.showResults = false
      this.duplicateGroups = []
    },

    handleDetectionComplete(results) {
      this.duplicateGroups = results || []
      this.showResults = true
      
      if (this.duplicateGroups.length > 0) {
        this.$message({
          message: `检测完成！发现 ${this.duplicateGroups.length} 组重复图片`,
          type: 'success'
        })
      }
    },

    handleRestart() {
      this.showResults = false
      this.duplicateGroups = []
    },

    async handleDeletePhotos(photos) {
      try {
        const photoIds = photos.map(photo => photo.id || photo.filename)
        
        await photoService.deletePhotos(photoIds)
        
        this.$message({
          message: `成功删除 ${photos.length} 张图片`,
          type: 'success'
        })
        
        // 从结果中移除已删除的图片
        this.duplicateGroups = this.duplicateGroups
          .map(group => group.filter(photo => {
            const photoId = photo.id || photo.filename
            return !photoIds.includes(photoId)
          }))
          .filter(group => group.length > 1) // 只保留仍有重复的组
          
      } catch (error) {
        console.error('删除图片失败:', error)
        this.$message({
          message: error.response?.data?.message || '删除图片失败，请重试',
          type: 'error'
        })
      }
    }
  }
}
</script>

<style scoped>
.duplicate-photos-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.page-header h1 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.page-description {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .duplicate-photos-page {
    padding: var(--spacing-lg) var(--spacing-md);
  }
  
  .page-header h1 {
    font-size: var(--font-size-2xl);
  }
  
  .page-description {
    font-size: var(--font-size-base);
  }
}
</style>