<!--
  PhotoAlbums.vue - 照片详情/相册组件
-->

<template>
  <div class="info-group" v-if="photo?.albums && photo.albums.length > 0">
    <h3 class="info-group-title">相册</h3>
    <div class="photo-albums">
      <div v-for="album in photo.albums" :key="album" class="apple-album">
        <span class="album-icon">📁</span>
        <span class="album-name">{{ getAlbumName(album) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PhotoAlbums',
  props: {
    photo: {
      type: Object,
      default: null
    },
    albumsMap: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    getAlbumName(albumId) {
      return this.albumsMap[albumId] || albumId;
    }
  }
}
</script>

<style scoped>
.info-group {
  margin-bottom: var(--spacing-lg);
  animation: fadeIn 0.5s ease-out;
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color-subtle);
}

.info-group:last-of-type {
  border-bottom: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.info-group-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-2xs);
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.photo-albums {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
}

.apple-album {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: var(--radius-round);
  background-color: rgba(52, 199, 89, 0.08);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  user-select: none;
  -webkit-user-select: none;
  gap: 4px;
  color: var(--text-primary);
}

.apple-album:hover {
  background-color: rgba(52, 199, 89, 0.12);
  transform: translateY(-1px);
  box-shadow: var(--shadow-small);
}

.apple-album:active {
  transform: translateY(0);
  background-color: rgba(52, 199, 89, 0.16);
}

.album-icon {
  color: var(--color-success);
  opacity: 0.8;
  font-weight: var(--font-weight-medium);
}

.album-name {
  color: var(--color-success);
  font-weight: var(--font-weight-medium);
}
</style>
