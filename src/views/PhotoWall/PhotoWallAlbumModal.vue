<!--
  PhotoWallAlbumModal.vue - 照片添加到相册的选择弹窗组件
-->

<template>
  <SfModal v-model="visible" title="选择相册" size="default">
    <div class="album-selection">
      <div v-if="albums.length === 0" class="no-albums">
        <p>暂无相册，请先创建相册</p>
        <SfButton type="primary" @click="handleCreateAlbum">创建新相册</SfButton>
      </div>
      <div v-else class="album-list">
        <div 
          v-for="album in albums" 
          :key="album.id" 
          class="album-card-wrapper"
          :class="{ 'selected': selectedAlbumId === album.id }"
        >
          <AlbumCard 
            :album="album" 
            @click="selectAlbum(album.id)"
          />
          <div v-if="selectedAlbumId === album.id" class="selection-indicator">
            <i class="fas fa-check"></i>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <SfButton type="secondary" @click="handleCancel">取消</SfButton>
        <SfButton type="primary" @click="handleConfirm" :disabled="!selectedAlbumId">确认</SfButton>
      </div>
    </div>
  </SfModal>
</template>

<script>
import { SfButton, SfModal } from '../../components/ui';
import AlbumCard from '../../components/album/AlbumCard.vue';

export default {
  name: 'PhotoWallAlbumModal',
  components: {
    SfButton,
    SfModal,
    AlbumCard
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    albums: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'create-album', 'add-to-album'],
  data() {
    return {
      selectedAlbumId: null,
    };
  },
  computed: {
    visible: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    }
  },
  watch: {
    modelValue(newValue) {
      if (newValue) {
        // 每次打开弹窗时重置选择的相册ID
        this.selectedAlbumId = null;
      }
    }
  },
  methods: {
    selectAlbum(albumId) {
      this.selectedAlbumId = albumId;
    },
    handleCreateAlbum() {
      this.$emit('create-album');
    },
    handleCancel() {
      this.visible = false;
    },
    handleConfirm() {
      if (!this.selectedAlbumId) return;
      this.$emit('add-to-album', this.selectedAlbumId);
      this.visible = false;
    }
  }
};
</script>

<style scoped>
.album-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 100%;
  overflow: hidden;
}

.no-albums {
  text-align: center;
  padding: var(--spacing-lg);
}

.album-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--spacing-md);
  width: 100%;
  padding: var(--spacing-md);
  max-height: 60vh;
  overflow-y: auto;
}

.album-card-wrapper {
  position: relative;
  transition: transform 0.2s ease;
}

.album-card-wrapper.selected {
  transform: scale(0.98);
}

.album-card-wrapper.selected :deep(.album-card) {
  background-color: var(--bg-hover);
  box-shadow: 0 0 0 2px var(--primary);
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

.modal-footer {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  margin-top: var(--spacing-md);
  gap: var(--spacing-md);
}
</style>