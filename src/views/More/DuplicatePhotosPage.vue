<template>
  <div class="duplicate-photos-page">
    <DuplicateDetector
      @detection-start="handleDetectionStart"
      @detection-complete="handleDetectionComplete"
    />

    <DuplicateResults
      v-if="showResults"
      ref="duplicateResults"
      :duplicate-groups="duplicateGroups"
      @restart="handleRestart"
      @delete-photos="handleDeletePhotos"
      @smart-select="handleSmartSelect"
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
    DuplicateResults,
  },
  data() {
    return {
      showResults: false,
      duplicateGroups: [],
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
        this.$notify({
          title: '检测完成',
          message: `发现 ${this.duplicateGroups.length} 组重复图片`,
          type: 'success',
        })
      }
    },

    handleRestart() {
      this.showResults = false
      this.duplicateGroups = []
    },

    handleSmartSelect() {
      // 触发所有重复组的智能选择
      this.$nextTick(() => {
        const duplicateResultsComponent = this.$refs.duplicateResults
        if (duplicateResultsComponent && duplicateResultsComponent.$refs.duplicateGroups) {
          duplicateResultsComponent.$refs.duplicateGroups.forEach(group => {
            if (group.smartSelect) {
              group.smartSelect()
            }
          })
        }
      })
    },

    async handleDeletePhotos(photos) {
      try {
        const photoIds = photos.map(photo => photo.id || photo.filename)

        await photoService.deletePhotos(photoIds)

        this.$notify({
          title: '成功',
          message: `已删除${photos.length}张照片`,
          type: 'success',
        })

        // 从结果中移除已删除的图片
        this.duplicateGroups = this.duplicateGroups
          .map(group =>
            group.filter(photo => {
              const photoId = photo.id || photo.filename
              return !photoIds.includes(photoId)
            })
          )
          .filter(group => group.length > 1) // 只保留仍有重复的组
      } catch (error) {
        console.error('删除图片失败:', error)
        this.$notify({
          title: '错误',
          message: error.response?.data?.message || '删除图片失败，请重试',
          type: 'error',
        })
      }
    },
  },
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
