<!--
  PhotoWallGrid.vue - 照片墙/照片网格展示区
-->

<template>
  <div class="photos-grid">
    <PhotoWallNoPhotos v-if="photos.length === 0" @showUploadModal="$emit('showUploadModal')" />
    <SfCard v-for="photo in photos" :key="photo.id" class="photo-card" hoverable shadow="small" @click="$emit('openPhotoDetail', photo)">
      <div class="photo-thumbnail">
        <img :src="photo.thumbnailUrl || photo.url" :alt="photo.title" loading="lazy" />
      </div>
      <div class="photo-info">
        <h3 class="photo-title">{{ photo.title || '无标题' }}</h3>
        <p class="photo-date">{{ formatDate(photo.takenAt) }}</p>
      </div>
    </SfCard>
  </div>
</template>

<script>
import PhotoWallNoPhotos from './PhotoWallNoPhotos.vue';

export default {
  name: 'PhotoWallGrid',
  components: {
    PhotoWallNoPhotos
  },
  props: {
    photos: {
      type: Array,
      required: true
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '未知日期';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
};
</script>

<style scoped>
.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}
.photo-card {
  overflow: hidden;
  cursor: pointer;
  background-color: var(--bg-primary);
  transition: transform var(--transition-bounce), box-shadow var(--transition-base);
}
.photo-card:hover {
  transform: scale(1.02) translateY(-5px);
  box-shadow: var(--shadow-large);
}
.photo-thumbnail {
  height: 220px;
  overflow: hidden;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-medium);
}
.photo-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-base);
}
.photo-card:hover .photo-thumbnail img {
  transform: scale(1.05);
}
.photo-info {
  padding: var(--spacing-md) var(--spacing-lg);
}
.photo-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-2xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-primary);
}
.photo-date {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}
</style> 