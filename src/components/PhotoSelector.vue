<!--
  PhotoSelector.vue - 照片选择器组件
  用于从所有照片中选择要添加到相册的照片
-->

<template>
    <div class="photo-selector">
        <div class="photo-grid-container" v-if="!loading">
            <div v-if="photos.length === 0" class="no-photos">
                <div class="no-photos-icon">
                    <i class="fas fa-images"></i>
                </div>
                <p class="no-photos-text">{{ $t('photoSelector.noPhotos.title') }}</p>
                <p class="no-photos-hint">{{ $t('photoSelector.noPhotos.hint') }}</p>
            </div>
            <div v-else class="photo-grid">
                <div v-for="photo in photos" :key="photo.id" class="photo-item" :class="{
                    'selected': isSelected(photo.id),
                    'in-album': isPhotoInAlbum(photo.id),
                    'selectable': !isPhotoInAlbum(photo.id)
                }" @click="toggleSelection(photo.id)">
                    <div class="photo-thumbnail">
                        <img :src="photo.thumbnailUrl || photo.url" :alt="photo.title || $t('photoSelector.photo.unknownDate')" loading="lazy" />
                        <div v-if="isSelected(photo.id)" class="selection-indicator selected">
                            <i class="fas fa-check"></i>
                        </div>
                        <div v-if="isPhotoInAlbum(photo.id)" class="in-album-badge">
                            <i class="fas fa-folder"></i>
                            <span>{{ $t('photoSelector.photo.inAlbum') }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="loading" class="loading-container">
            <div class="loading-spinner">
                <div class="spinner"></div>
            </div>
            <p class="loading-text">{{ $t('photoSelector.loading') }}</p>
        </div>

        <div class="selector-footer" v-if="totalPages > 1">
            <div class="pagination">
                <button @click="goToPage(currentPage - 1)" :disabled="currentPage <= 1" class="page-btn prev-btn">
                    <i class="fas fa-chevron-left"></i>
                    {{ $t('photoSelector.pagination.prev') }}
                </button>
                <div class="page-info">
                    {{ $t('photoSelector.pagination.pageInfo', { current: currentPage, total: totalPages }) }}
                </div>
                <button @click="goToPage(currentPage + 1)" :disabled="currentPage >= totalPages"
                    class="page-btn next-btn">
                    {{ $t('photoSelector.pagination.next') }}
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { photoService } from '../api'

export default {
    name: 'PhotoSelector',
    props: {
        albumId: {
            type: String,
            required: true
        },
        existingPhotoIds: {
            type: Array,
            default: () => []
        }
    },
    emits: ['update:selectedPhotos'],
    data() {
        return {
            photos: [],
            selectedPhotos: [],
            loading: false,
            currentPage: 1,
            pageSize: 20,
            total: 0
        }
    },
    computed: {
        totalPages() {
            return Math.ceil(this.total / this.pageSize)
        }
    },
    async created() {
        await this.fetchPhotos()
    },
    methods: {
        async fetchPhotos() {
            try {
                this.loading = true
                const response = await photoService.getPhotos({
                    page: this.currentPage,
                    limit: this.pageSize,
                    sortBy: 'takenAt',
                    sortOrder: 'desc'
                })

                this.photos = response.data.data || []
                this.total = response.data.total || 0

            } catch (error) {
                console.error('获取照片列表失败:', error)
                this.$notify?.error({
                    title: this.$t('photoSelector.error.loadFailed'),
                    message: this.$t('photoSelector.error.loadFailedMessage')
                })
            } finally {
                this.loading = false
            }
        },

        async goToPage(page) {
            if (page < 1 || page > this.totalPages) return
            this.currentPage = page
            await this.fetchPhotos()
        },

        isSelected(photoId) {
            // 确保类型一致性进行比较
            const result = this.selectedPhotos.some(id => String(id) === String(photoId))
            return result
        },

        isPhotoInAlbum(photoId) {
            // 确保类型一致性进行比较
            const result = this.existingPhotoIds.some(id => String(id) === String(photoId))
            return result
        },

        toggleSelection(photoId) {
            // 如果照片已经在相册中，不允许选择
            if (this.isPhotoInAlbum(photoId)) return

            // 确保类型一致性
            const photoIdStr = String(photoId)
            const index = this.selectedPhotos.findIndex(id => String(id) === photoIdStr)

            if (index === -1) {
                this.selectedPhotos.push(photoId)
            } else {
                this.selectedPhotos.splice(index, 1)
            }

            this.$emit('update:selectedPhotos', this.selectedPhotos)
        },

        formatDate(dateString) {
            if (!dateString) return this.$t('photoSelector.photo.unknownDate')
            const date = new Date(dateString)
            return date.toLocaleDateString(this.$i18n.locale, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            })
        }
    }
}
</script>

<style scoped>
.photo-selector {
    display: flex;
    flex-direction: column;
    height: 500px;
    overflow: hidden;
    background: var(--bg-primary);
}

.photo-grid-container {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-xl) var(--spacing-lg);
}

.no-photos {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    padding: var(--spacing-2xl);
}

.no-photos-icon {
    width: 64px;
    height: 64px;
    border-radius: var(--radius-large);
    background: linear-gradient(135deg, var(--text-disabled) 0%, var(--text-tertiary) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: var(--font-size-xl);
    margin-bottom: var(--spacing-lg);
    opacity: 0.8;
}

.no-photos-text {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    color: var(--text-secondary);
    margin: 0 0 var(--spacing-xs);
}

.no-photos-hint {
    font-size: var(--font-size-sm);
    color: var(--text-tertiary);
    margin: 0;
    line-height: 1.5;
}

.photo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: var(--spacing-md);
}

.photo-item {
    position: relative;
    cursor: pointer;
    border-radius: var(--radius-medium);
    overflow: hidden;
    transition: transform 0.2s ease;
    background: var(--bg-primary);
    box-shadow: var(--shadow-small);
}

.photo-item.selectable:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-medium);
}

.photo-item.selected {
    transform: scale(0.98);
}

.photo-item.selected .photo-thumbnail {
    outline: var(--color-primary) solid 2px;
}

.photo-item.in-album {
    opacity: 0.7;
    cursor: not-allowed;
}

.photo-item.in-album:hover {
    transform: none;
    box-shadow: var(--shadow-small);
}

.photo-thumbnail {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    background: var(--bg-tertiary);
}

.photo-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.2s ease;
}

.photo-item.selectable:hover .photo-thumbnail img {
    transform: scale(1.05);
}

.selection-indicator {
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background-color: var(--color-primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
    transform: scale(1.1);
}

.in-album-badge {
    position: absolute;
    top: var(--spacing-xs);
    right: var(--spacing-xs);
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: white;
    padding: var(--spacing-2xs) var(--spacing-xs);
    border-radius: var(--radius-medium);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    display: flex;
    align-items: center;
    gap: var(--spacing-2xs);
    border: var(--border-width) solid rgba(255, 255, 255, 0.2);
}

.in-album-badge i {
    font-size: 10px;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: var(--spacing-2xl);
    color: var(--text-secondary);
}

.loading-spinner {
    margin-bottom: var(--spacing-lg);
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--bg-tertiary);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.loading-text {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    color: var(--text-secondary);
    margin: 0;
}

.selector-footer {
    border-top: var(--border-width) solid var(--border-color);
    padding: var(--spacing-lg);
    background: var(--bg-primary);
    flex-shrink: 0;
}

.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-lg);
}

.page-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-md);
    border: var(--border-width) solid var(--border-color);
    background: var(--bg-primary);
    color: var(--text-secondary);
    border-radius: var(--radius-medium);
    cursor: pointer;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
    background: var(--bg-hover);
    border-color: var(--color-primary);
    color: var(--color-primary);
    transform: translateY(-1px);
}

.page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

.page-btn i {
    font-size: var(--font-size-xs);
}

.page-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    background: var(--bg-tertiary);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-medium);
    border: var(--border-width) solid var(--border-color);
}

.current-page {
    font-weight: var(--font-weight-semibold);
    color: var(--color-primary);
}

.separator {
    color: var(--text-tertiary);
    margin: 0 var(--spacing-2xs);
}

.total-pages {
    color: var(--text-secondary);
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
