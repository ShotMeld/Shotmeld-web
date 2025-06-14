<!--
  TimelineView.vue - 时间线页/记忆
-->

<template>
  <div class="timeline-container">
    <main class="timeline-content">
      <div v-if="loading" class="loading-container" v-loading="true">
        <p>{{ $t('timeline.loading') }}</p>
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
                  v-for="(photo, index) in getOptimizedPhotoLayout(monthGroup.photos)"
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
        <PhotoUpload :showAlbumOption="true" @upload-success="handlePhotoUploaded" />
      </SfModal>
    </main>
  </div>
</template>

<script>
import { photoService } from '../api'
import apiClient from '../api'
import PhotoUpload from '../components/PhotoUpload.vue'
import PhotoDetail from '../components/PhotoDetail.vue'
import { SfModal } from '../components/ui'
import PhotoWallNoPhotos from './PhotoWall/PhotoWallNoPhotos.vue'
import { eventBus } from '../utils/eventBus'

export default {
  name: 'TimelineView',
  components: {
    PhotoUpload,
    PhotoDetail,
    SfModal,
    PhotoWallNoPhotos,
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

    startEditingPhoto(photo) {
      console.log(this.$t('timeline.editPhoto'), photo)
      // TODO: 实现编辑照片的功能
      alert(this.$t('timeline.editPhotoComingSoon'))
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
      // 照片被编辑器替换，只需关闭详情页和刷新数据，不调用删除API
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

    // 新增：优化照片布局，确保每排尽可能铺满（使用确定性算法）
    getOptimizedPhotoLayout(photos) {
      const photosWithLayout = photos.map(photo => ({ ...photo }))
      const gridWidth = 6 // 每行6个单位格子
      let currentRowUsed = 0

      photosWithLayout.forEach((photo, index) => {
        const remainingPhotos = photosWithLayout.length - index
        const remainingInRow = gridWidth - currentRowUsed

        // 使用确定性算法决定图片尺寸，基于照片ID和索引
        let shouldUseLarge = false

        // 如果还有足够空间放置2x2图片
        if (remainingInRow >= 2) {
          // 使用照片ID的哈希值来确定性地决定是否使用大图
          const photoHash = this.getSimpleHash(photo.id || index.toString())
          const threshold = currentRowUsed === 0 ? 0.4 : 0.25 // 行首更倾向于大图

          // 如果剩余照片较多，调整阈值
          const adjustedThreshold = remainingPhotos > 3 ? threshold * 1.2 : threshold * 0.8

          shouldUseLarge = (photoHash % 100) / 100 < adjustedThreshold
        }

        if (shouldUseLarge) {
          photo.gridSize = 'size-2x2'
          currentRowUsed += 2
        } else {
          photo.gridSize = 'size-1x1'
          currentRowUsed += 1
        }

        // 如果当前行已满或接近满，换到下一行
        if (currentRowUsed >= gridWidth) {
          currentRowUsed = 0
        }
      })

      return photosWithLayout
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
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: 0.5rem;
  color: var(--color-primary);
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.year-photo-count {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: normal;
}

.timeline-month {
  margin-bottom: 2rem;
}

.month-header {
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: #6c757d;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.month-photo-count {
  font-size: 0.8rem;
  color: #adb5bd;
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
  min-height: 300px;
  gap: var(--spacing-md);
  color: var(--text-secondary);
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
