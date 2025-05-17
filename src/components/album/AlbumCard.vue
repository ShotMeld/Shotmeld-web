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
  computed: {
    coverImage() {
      // 如果有封面照片，使用封面照片的缩略图
      if (this.album.coverPhotoId && this.album.coverPhoto?.thumbnailUrl) {
        return this.album.coverPhoto.thumbnailUrl
      }
      // 否则使用默认图片
      return '/images/default-album.jpg'
    }
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.album-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.album-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.album-card__cover {
  position: relative;
  padding-top: 75%;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  overflow: hidden;
  background-color: var(--bg-tertiary);
}

.album-card__image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  padding: var(--spacing-md);
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.album-card__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
}

.album-card__description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.album-card__date {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
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