<!--
  AlbumManageToolbar.vue - 相册批量管理工具栏组件
-->

<template>  <div class="album-toolbar-container toolbar-visible">
    <ManageToolbar
      :selectedItems="selectedAlbums"
      itemUnit="个相册"
      :actions="toolbarActions"
      @select-all="$emit('select-all')"
      @deselect-all="$emit('deselect-all')"
      @show-delete-selected="$emit('show-delete-selected')"
      @show-change-cover="$emit('show-change-cover')"
      @exit-manage-mode="$emit('exit-manage-mode')"
    />
  </div>
</template>

<script>
import { ManageToolbar } from '../../components/toolbar'

export default {
  name: 'AlbumManageToolbar',
  components: {
    ManageToolbar,
  },
  props: {
    selectedAlbums: {
      type: Array,
      required: true,
    },
  },  computed: {
    toolbarActions() {
      return [
        {
          label: '更改封面',
          event: 'show-change-cover',
          icon: 'fas fa-image',
          type: 'primary',
          requireSelection: true,
          // 只有选择了一个相册时才可用
          visible: this.selectedAlbums.length === 1,
        },
        {
          label: '删除',
          event: 'show-delete-selected',
          icon: 'fas fa-trash',
          type: 'danger',
          requireSelection: true,
        },
      ]
    },
  },
  emits: ['select-all', 'deselect-all', 'show-delete-selected', 'show-change-cover', 'exit-manage-mode'],
}
</script>

<style scoped>
.album-toolbar-container {
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
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.album-toolbar-container :deep(.manage-toolbar) {
  width: 100%;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.toolbar-visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

@media (max-width: 768px) {
  .album-toolbar-container {
    top: 60px;
    width: calc(100% - (var(--spacing-md) * 2));
  }
}
</style>
