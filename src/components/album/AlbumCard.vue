<!--
  AlbumCard.vue - 相册卡片组件
-->

<template>
  <sf-card class="album-card" @click="$emit('click')">
    <div class="album-card__cover">
      <img 
        :src="coverImage" 
        :alt="album.name"
        class="album-card__image"
      >
      <div class="album-card__overlay">
        <div class="album-card__info">
          <span class="album-card__count">{{ album.photoCount }} 张照片</span>
        </div>
      </div>
    </div>
    <div class="album-card__content">
      <h3 class="album-card__title">{{ album.name }}</h3>
      <p v-if="album.description" class="album-card__description">
        {{ album.description }}
      </p>
      <p class="album-card__date">{{ formatDate(album.createdAt) }}</p>
    </div>
  </sf-card>
</template>

<script>
import SfCard from '../ui/SfCard.vue'
import { photoService } from '../../api'

export default {
  name: 'AlbumCard',
  components: {
    SfCard
  },
  props: {
    album: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      photoDetails: {}
    }
  },
  computed: {
    coverImage() {
      // 如果有封面照片ID，使用封面照片的缩略图
      if (this.album.coverPhotoId && this.photoDetails[this.album.coverPhotoId]?.thumbnailUrl) {
        return this.photoDetails[this.album.coverPhotoId].thumbnailUrl
      }
      // 如果有照片列表，使用第一张照片的缩略图
      if (this.album.photos && this.album.photos.length > 0) {
        const firstPhotoId = this.album.photos[0]
        if (this.photoDetails[firstPhotoId]?.thumbnailUrl) {
          return this.photoDetails[firstPhotoId].thumbnailUrl
        }
      }
      // 否则创建一个包含"无照片"文字和图标的SVG数据URL
      const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
        <rect width="100%" height="100%" fill="#f5f5f5"/>
        <g transform="translate(125,65)">
          <rect x="0" y="0" width="50" height="40" rx="4" stroke="#999" stroke-width="2" fill="none"/>
          <circle cx="38" cy="12" r="4" fill="#999"/>
          <polyline points="0,28 15,20 50,40" stroke="#999" stroke-width="2" fill="none"/>
        </g>
        <text x="150" y="130" font-family="Arial" font-size="16" fill="#999" text-anchor="middle">No Photos</text>
      </svg>`;
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }
  },
  watch: {
    'album.photos': {
      immediate: true,
      handler(newPhotos) {
        if (newPhotos && newPhotos.length > 0) {
          this.fetchPhotoDetails()
        }
      }
    },
    'album.coverPhotoId': {
      immediate: true,
      handler(newCoverPhotoId) {
        if (newCoverPhotoId) {
          this.fetchPhotoDetails()
        }
      }
    }
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    async fetchPhotoDetails() {
      try {
        // 获取需要查询的照片ID列表
        const photoIds = new Set()
        if (this.album.coverPhotoId) {
          photoIds.add(this.album.coverPhotoId)
        }
        if (this.album.photos && this.album.photos.length > 0) {
          photoIds.add(this.album.photos[0])
        }

        // 过滤掉已经获取过的照片
        const idsToFetch = Array.from(photoIds).filter(id => !this.photoDetails[id])

        if (idsToFetch.length === 0) return

        // 获取照片详情
        const response = await photoService.getPhotos({ ids: idsToFetch })
        if (response.data.data) {
          response.data.data.forEach(photo => {
            this.photoDetails[photo.id] = photo
          })
        }
      } catch (error) {
        console.error('获取照片详情失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.album-card {
  cursor: pointer;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.8);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.album-card:hover {
  transform: scale(1.02) translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.07), 0 20px 48px rgba(0, 0, 0, 0.06);
}

.album-card__cover {
  position: relative;
  height: 220px;
  overflow: hidden;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-medium);
}

.album-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.33, 1, 0.68, 1);
}

.album-card:hover .album-card__image {
  transform: scale(1.05);
}

.album-card__overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-md);
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: white;
}

.album-card__info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.album-card__count {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.album-card__content {
  padding: var(--spacing-md) var(--spacing-lg);
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.album-card__title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-2xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-primary);
}

.album-card__description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.album-card__date {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
  margin-top: auto;
}

@media (max-width: 768px) {
  .album-card__content {
    padding: var(--spacing-sm);
  }
  
  .album-card__title {
    font-size: var(--font-size-md);
  }
}
</style> 