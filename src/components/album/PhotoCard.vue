<template>
  <sf-card class="photo-card" @click="$emit('click')">
    <div class="photo-card__image">
      <img 
        :src="photo.thumbnailUrl || photo.url" 
        :alt="photo.description || photo.title"
        class="photo-card__img"
      >
      <div class="photo-card__overlay">
        <div class="photo-card__info">
          <span v-if="photo.title" class="photo-card__title">
            {{ photo.title }}
          </span>
          <span v-if="photo.takenAt" class="photo-card__date">
            {{ formatDate(photo.takenAt) }}
          </span>
        </div>
      </div>
    </div>
  </sf-card>
</template>

<script>
import SfCard from '../ui/SfCard.vue'

export default {
  name: 'PhotoCard',
  components: {
    SfCard
  },
  props: {
    photo: {
      type: Object,
      required: true
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
.photo-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  aspect-ratio: 1;
  overflow: hidden;
}

.photo-card:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-lg);
}

.photo-card__image {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--bg-tertiary);
}

.photo-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-card__overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-md);
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: white;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.photo-card:hover .photo-card__overlay {
  opacity: 1;
}

.photo-card__info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.photo-card__title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.photo-card__date {
  font-size: var(--font-size-xs);
  opacity: 0.8;
}
</style> 