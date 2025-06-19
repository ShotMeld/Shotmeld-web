<!--
  TimelineView.vue - 时间线页/记忆
-->

<template>
  <div class="timeline-container">
    <main class="timeline-content">
      <div v-if="loading" class="loading-container">
        <LoadingSpinner target="时间线" size="large" padding="large" />
      </div>

      <div v-else-if="error" class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button @click="fetchTimeline" class="retry-button">{{ $t('timeline.retry') }}</button>
      </div>

      <template v-else>
        <PhotoWallNoPhotos v-if="photos.length === 0" @showUploadModal="$emit('showUploadModal')" />

        <div v-else class="timeline">
          <div
            v-for="(yearGroup, yearIndex) in timelineGroups"
            :key="yearIndex"
            class="timeline-year"
          >
            <h2 class="year-header">
              {{ formatYearDisplay(yearGroup.year) }}
              <span class="year-photo-count">
                {{ formatPhotoCount(getYearPhotoCount(yearGroup)) }}
              </span>
            </h2>

            <div
              v-for="(monthGroup, monthIndex) in yearGroup.months"
              :key="`${yearIndex}-${monthIndex}`"
              class="timeline-month"
            >
              <h3 class="month-header">
                {{ formatMonthDisplay(monthGroup.month) }}
                <span class="month-photo-count">
                  {{ formatPhotoCount(monthGroup.photos.length) }}
                </span>
              </h3>

              <div class="photos-grid">
                <div
                  v-for="photo in getOptimizedPhotoLayout(monthGroup.photos)"
                  :key="photo.id"
                  class="photo-card"
                  :class="photo.gridSize"
                  @click="showPhotoDetail(photo)"
                >
                  <div class="photo-thumbnail">
                    <img
                      :src="photo.thumbnailUrl || photo.url"
                      :alt="photo.title ?? $t('timeline.noTitle')"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 照片详情模态框 -->
      <PhotoDetail
        v-if="currentPhoto"
        v-model="showPhotoDetailModal"
        :photo="currentPhoto"
        @photo-deleted="handlePhotoDeleted"
        @photo-updated="handlePhotoUpdated"
        @photo-replaced="handlePhotoReplaced"
      />

      <!-- 上传照片模态框 -->
      <SfModal v-model="showUploadModal" :title="$t('timeline.uploadModal.title')">
        <PhotoUpload showAlbumOption @upload-success="handlePhotoUploaded" />
      </SfModal>
    </main>
  </div>
</template>

<script>
import { photoService } from '../api'
import apiClient from '../api'
import PhotoUpload from '../components/PhotoUpload.vue'
import PhotoDetail from '../components/PhotoDetail/PhotoDetail.vue'
import { SfModal } from '../components/ui'
import PhotoWallNoPhotos from './PhotoWall/PhotoWallNoPhotos.vue'
import LoadingSpinner from '../components/ui/LoadingSpinner.vue'
import { eventBus } from '../utils/eventBus'

export default {
  name: 'TimelineView',
  components: {
    PhotoUpload,
    PhotoDetail,
    SfModal,
    PhotoWallNoPhotos,
    LoadingSpinner,
  },
  data() {
    return {
      photos: [],
      loading: false,
      error: null,
      currentPhoto: null,
      imageLoaded: false,
      showDeleteConfirm: false,
      showUploadModal: false,
      showPhotoDetailModal: false,
      userName: '',
      timelineGroups: [], // 按年月分组后的照片数据
    }
  },
  created() {
    // 获取用户信息
    const user = JSON.parse(localStorage.getItem('user'))
    if (user) {
      this.userName = user.username || user.email
    }

    this.fetchTimeline()

    // 监听上传照片事件
    eventBus.on('show-upload-modal', () => {
      this.showUploadModal = true
    })
  },

  beforeUnmount() {
    // 清理事件监听
    eventBus.off('show-upload-modal')
  },
  methods: {
    async fetchTimeline() {
      this.loading = true
      this.error = null

      try {
        const params = { groupBy: 'month' }

        const response = await photoService.getPhotoTimeline(params)

        this.photos = []
        const timelineData = response.data || []

        timelineData.forEach(group => {
          if (group.photos && Array.isArray(group.photos)) {
            this.photos = [...this.photos, ...group.photos]
          }
        })

        // 将照片按年月分组
        this.groupPhotosByDate()
      } catch (error) {
        console.error(this.$t('timeline.error.fetchFailed'), error)
        this.error = error.response?.data?.message || this.$t('timeline.error.loadFailed')
      } finally {
        this.loading = false
      }
    },

    groupPhotosByDate() {
      // 按年月对照片进行分组
      const groupedByYear = {}

      this.photos.forEach(photo => {
        const date = new Date(photo.takenAt || photo.createdAt)
        const year = date.getFullYear()
        const month = date.getMonth() + 1 // getMonth返回0-11

        if (!groupedByYear[year]) {
          groupedByYear[year] = {}
        }

        if (!groupedByYear[year][month]) {
          groupedByYear[year][month] = []
        }

        groupedByYear[year][month].push(photo)
      })

      // 转换为组件需要的数据结构
      this.timelineGroups = Object.keys(groupedByYear)
        .sort((a, b) => b - a) // 年份降序
        .map(year => {
          const months = Object.keys(groupedByYear[year])
            .sort((a, b) => b - a) // 月份降序
            .map(month => ({
              month,
              photos: groupedByYear[year][month],
            }))

          return {
            year,
            months,
          }
        })
    },

    showPhotoDetail(photo) {
      this.currentPhoto = photo
      this.imageLoaded = false
      this.showPhotoDetailModal = true
    },

    closePhotoDetail() {
      this.showPhotoDetailModal = false
      setTimeout(() => {
        this.currentPhoto = null
      }, 300)
    },

    handlePhotoDeleted(photoId) {
      this.deletePhoto(photoId)
    },

    handlePhotoUpdated(newPhoto) {
      // 照片编辑完成，刷新时间轴数据
      this.showPhotoDetailModal = false
      this.fetchTimeline()
    },

    handlePhotoReplaced(photoId) {
      this.showPhotoDetailModal = false
      this.fetchTimeline()
    },

    handlePhotoUploaded(uploadedPhotos) {
      this.showUploadModal = false
      this.fetchTimeline()

      this.$notify({
        title: this.$t('timeline.uploadSuccess.title'),
        message: this.$t('timeline.uploadSuccess.message', { count: uploadedPhotos.length || 1 }),
        type: 'success',
      })
    },

    confirmDeletePhoto() {
      this.showDeleteConfirm = true
    },

    async deletePhoto(photoId) {
      try {
        const idToDelete = photoId || (this.currentPhoto && this.currentPhoto.id)
        if (!idToDelete) return

        await photoService.deletePhoto(idToDelete)

        this.$notify({
          title: this.$t('timeline.deleteSuccess.title'),
          message: this.$t('timeline.deleteSuccess.message'),
          type: 'success',
        })

        // 从列表中移除已删除的照片
        this.photos = this.photos.filter(p => p.id !== idToDelete)
        // 重新分组
        this.groupPhotosByDate()

        this.showPhotoDetailModal = false
        this.closePhotoDetail()
        this.showDeleteConfirm = false
      } catch (error) {
        console.error(this.$t('timeline.error.deleteFailed'), error)
        this.$notify.error({
          title: this.$t('timeline.error.deleteFailedTitle'),
          message: error.response?.data?.message || this.$t('timeline.error.deleteFailedMessage'),
        })
      }
    },

    downloadPhoto(photo) {
      const link = document.createElement('a')
      link.href = photo.url
      link.download = photo.filename || 'photo.jpg'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },

    // 计算一个年份分组中的照片总数
    getYearPhotoCount(yearGroup) {
      let count = 0
      if (yearGroup && yearGroup.months) {
        yearGroup.months.forEach(month => {
          if (month.photos) {
            count += month.photos.length
          }
        })
      }
      return count
    },

    formatDate(dateString) {
      if (!dateString) return '未知日期'
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    },

    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    handleLogout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete apiClient.defaults.headers.common['Authorization']
      this.$router.push('/login')
    },

    // 确保每排密铺
    getOptimizedPhotoLayout(photos) {
      if (!photos || photos.length === 0) return []

      const photosWithLayout = photos.map(photo => ({ ...photo }))
      const gridWidth = 6 // 每行6个单位格子

      // 为每张照片生成随机权重（基于ID保证一致性）
      photosWithLayout.forEach((photo, index) => {
        const hash = this.getSimpleHash(photo.id || index.toString())
        photo.randomWeight = (hash % 1000) / 1000 // 0-1之间的随机值
      })

      const result = []
      let photoIndex = 0

      // 逐行处理照片
      while (photoIndex < photosWithLayout.length) {
        const rowPhotos = this.arrangePhotosInRow(
          photosWithLayout.slice(photoIndex),
          gridWidth,
          photoIndex === 0 || photosWithLayout.length - photoIndex > gridWidth
        )

        result.push(...rowPhotos)
        photoIndex += rowPhotos.length
      }

      return result
    },

    // 安排一行中的照片布局
    arrangePhotosInRow(availablePhotos, gridWidth, shouldFillCompletely) {
      if (!availablePhotos || availablePhotos.length === 0) return []

      // 如果只有少量照片且不需要完全填满，直接处理
      if (!shouldFillCompletely) {
        return availablePhotos.map(photo => {
          // 最后一行，更倾向于使用小图避免溢出
          const shouldUseLarge = photo.randomWeight > 0.7 && availablePhotos.length >= 2
          photo.gridSize = shouldUseLarge ? 'size-2x2' : 'size-1x1'
          return photo
        })
      }

      // 寻找最佳组合来填满这一行
      const bestCombination = this.findBestRowCombination(availablePhotos, gridWidth)

      return bestCombination
    },

    // 寻找最佳行组合（动态规划）
    findBestRowCombination(photos, targetWidth) {
      if (!photos || photos.length === 0) return []

      // 对于每个位置，记录[使用的照片数, 总宽度, 布局方案]
      const dp = Array(photos.length + 1)
        .fill(null)
        .map(() => [])
      dp[0] = [{ count: 0, width: 0, layout: [] }]

      for (let i = 0; i < photos.length; i++) {
        for (let state of dp[i]) {
          if (state.width >= targetWidth) continue

          // 尝试放置1x1图片
          if (state.width + 1 <= targetWidth) {
            const newLayout = [...state.layout, { ...photos[i], gridSize: 'size-1x1' }]
            const newState = { count: state.count + 1, width: state.width + 1, layout: newLayout }
            dp[i + 1].push(newState)
          }

          // 尝试放置2x2图片（如果空间够且照片权重支持）
          if (state.width + 2 <= targetWidth && photos[i].randomWeight > 0.3) {
            const newLayout = [...state.layout, { ...photos[i], gridSize: 'size-2x2' }]
            const newState = { count: state.count + 1, width: state.width + 2, layout: newLayout }
            dp[i + 1].push(newState)
          }
        }

        // 保留最优的几个状态，避免状态爆炸
        dp[i + 1] = this.pruneStates(dp[i + 1], targetWidth)
      }

      // 找到最佳解
      let bestSolution = null
      let bestScore = -1

      for (let i = 0; i <= photos.length; i++) {
        for (let state of dp[i]) {
          const score = this.calculateLayoutScore(state, targetWidth, photos.length)
          if (score > bestScore) {
            bestScore = score
            bestSolution = state
          }
        }
      }

      return bestSolution
        ? bestSolution.layout
        : photos.slice(0, Math.min(6, photos.length)).map(photo => ({
            ...photo,
            gridSize: 'size-1x1',
          }))
    },

    // 评估布局方案的得分
    calculateLayoutScore(state, targetWidth, totalPhotos) {
      if (!state || !state.layout) return -1

      const widthScore =
        state.width === targetWidth
          ? 100
          : Math.max(0, 100 - Math.abs(targetWidth - state.width) * 20)
      const countScore = Math.min(state.count, totalPhotos) * 10
      const diversityScore = this.calculateDiversityScore(state.layout)

      return widthScore + countScore + diversityScore
    },

    // 计算布局多样性得分（大小图混合更好）
    calculateDiversityScore(layout) {
      if (!layout || layout.length === 0) return 0

      const largeCount = layout.filter(photo => photo.gridSize === 'size-2x2').length
      const smallCount = layout.length - largeCount

      // 如果有大小图混合，给额外分数
      if (largeCount > 0 && smallCount > 0) return 20
      if (largeCount > 0) return 10
      return 5
    },

    // 剪枝：保留最优的状态
    pruneStates(states, targetWidth) {
      if (!states || states.length <= 10) return states

      // 按得分排序，保留前10个
      const scored = states.map(state => ({
        ...state,
        score: this.calculateLayoutScore(state, targetWidth, 100),
      }))

      scored.sort((a, b) => b.score - a.score)
      return scored.slice(0, 10).map(({ score, ...state }) => state)
    },

    // 简单哈希函数，用于确定性地生成伪随机数
    getSimpleHash(str) {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash // 转换为32位整数
      }
      return Math.abs(hash)
    },

    // 格式化年份显示
    formatYearDisplay(year) {
      if (this.$i18n.locale === 'zh-CN') {
        return `${year}${this.$t('timeline.year')}`
      } else {
        return year.toString()
      }
    },

    // 格式化月份显示
    formatMonthDisplay(month) {
      if (this.$i18n.locale === 'zh-CN') {
        return `${month}${this.$t('timeline.month')}`
      } else {
        // 英文环境下显示月份名称
        const monthNames = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ]
        return monthNames[parseInt(month) - 1] || `Month ${month}`
      }
    },

    // 格式化照片数量显示
    formatPhotoCount(count) {
      if (this.$i18n.locale === 'zh-CN') {
        return `${count}${this.$t('timeline.photos')}`
      } else {
        return `${count} ${this.$t('timeline.photos')}`
      }
    },
  },
}
</script>

<style scoped>
.timeline-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.timeline-content {
  min-height: calc(100vh - 64px);
  flex: 1;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  padding: 2rem;
}

.timeline-title {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #212529;
}

.timeline-year {
  margin-bottom: 3rem;
}

.year-header {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--color-primary-light);
  padding-bottom: 0.5rem;
  color: var(--color-primary-light);
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.year-photo-count {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: normal;
}

.timeline-month {
  margin-bottom: 2rem;
}

.month-header {
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: var(--text-secondary);
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.month-photo-count {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  font-weight: normal;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  padding: 16px 0;
  grid-auto-rows: minmax(120px, auto);
}

.photo-card {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.photo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* 1*1 小图占用 1 个网格单位 */
.photo-card.size-1x1 {
  grid-column: span 1;
  grid-row: span 1;
}

/* 2*2 大图占用 4 个网格单位 */
.photo-card.size-2x2 {
  grid-column: span 2;
  grid-row: span 2;
}

.photo-thumbnail {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.photo-thumbnail:hover img {
  transform: scale(1.05);
}

.photo-info {
  display: none;
}

/* 响应式布局调整 */
@media (max-width: 1200px) {
  .photos-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .photos-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  /* 在小屏幕上减少大图的使用 */
  .photo-card.size-2x2 {
    grid-column: span 2;
    grid-row: span 2;
  }
}

@media (max-width: 480px) {
  .photos-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  /* 在最小屏幕上所有图片都使用 1*1 */
  .photo-card.size-2x2 {
    grid-column: span 1;
    grid-row: span 1;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: var(--spacing-md);
  color: var(--color-danger);
}

.retry-button {
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
  padding: var(--spacing-sm) var(--spacing-xl);
  border-radius: var(--radius-round);
  cursor: pointer;
  font-size: var(--font-size-base);
  transition: background-color var(--transition-fast);
}

.retry-button:hover {
  background-color: var(--color-primary-dark);
}

.empty-timeline {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: var(--spacing-md);
  color: var(--text-secondary);
  background: var(--blur-bg-strong);
  backdrop-filter: var(--blur-strong);
  -webkit-backdrop-filter: var(--blur-strong);
  border-radius: var(--radius-large);
  padding: var(--spacing-3xl);
  box-shadow: var(--shadow-medium);
  border: 1px solid var(--blur-border);
}

.empty-timeline i {
  font-size: var(--font-size-4xl);
  color: var(--text-tertiary);
}

.empty-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.upload-btn {
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
  padding: var(--spacing-sm) var(--spacing-2xl);
  border-radius: var(--radius-round);
  cursor: pointer;
  font-size: var(--font-size-base);
  transition: background-color var(--transition-fast);
}

.upload-btn:hover {
  background-color: var(--color-primary-dark);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.modal-container {
  background-color: var(--bg-primary);
  border-radius: var(--radius-large);
  width: 95%;
  max-width: 1200px;
  max-height: 95vh;
  overflow-y: auto;
  box-shadow: var(--shadow-extra-large);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #6c757d;
}

.modal-container {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-body {
  padding: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}
</style>
