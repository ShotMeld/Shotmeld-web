<!--
  AlbumPhotosManageToolbar.vue - 相册照片批量管理工具栏组件
-->

<template>
  <div class="album-photos-toolbar-container toolbar-visible">
    <ManageToolbar
      :selectedItems="selectedPhotos"
      itemUnit="张照片"
      :actions="toolbarActions"
      @select-all="$emit('select-all')"
      @deselect-all="$emit('deselect-all')"
      @show-move-to-album="$emit('show-move-to-album')"
      @show-remove-from-album="$emit('show-remove-from-album')"
      @show-delete-selected="$emit('show-delete-selected')"
      @exit-manage-mode="$emit('exit-manage-mode')"
    />
  </div>
</template>

<script>
import { ManageToolbar } from '../../components/toolbar';

export default {
  name: 'AlbumPhotosManageToolbar',
  components: {
    ManageToolbar
  },
  props: {
    selectedPhotos: {
      type: Array,
      required: true
    }
  },
  computed: {
    toolbarActions() {
      return [
        {
          label: '删除照片',
          event: 'show-delete-selected',
          icon: 'fas fa-trash',
          type: 'danger',
          requireSelection: true
        },
        {
          label: '从相册移除',
          event: 'show-remove-from-album',
          icon: 'fas fa-folder-minus',
          type: 'warning',
          requireSelection: true
        }
      ];
    }
  },
  emits: ['select-all', 'deselect-all', 'show-move-to-album', 'show-remove-from-album', 'show-delete-selected', 'exit-manage-mode']
};
</script>

<style scoped>
.album-photos-toolbar-container {
  position: fixed;
  top: 85px;
  left: 50%;
  transform: translateX(-50%) translateY(-20px);
  z-index: 1000;
  width: calc(100% - (var(--spacing-xl) * 2));
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: 0;
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.album-photos-toolbar-container :deep(.manage-toolbar) {
  width: 100%;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.toolbar-visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

@media (max-width: 768px) {
  .album-photos-toolbar-container {
    top: 60px;
    width: calc(100% - (var(--spacing-md) * 2)); /* 移动设备上可能使用更小的间距 */
  }
}
</style>
