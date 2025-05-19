<!--
  PhotoWallManageToolbar.vue - 照片墙批量管理工具栏组件
-->

<template>
  <ManageToolbar
    :selectedItems="selectedPhotos"
    itemUnit="张照片"
    :actions="toolbarActions"
    @select-all="$emit('select-all')"
    @deselect-all="$emit('deselect-all')"
    @show-add-to-album="$emit('show-add-to-album')"
    @show-delete-selected="$emit('show-delete-selected')"
    @exit-manage-mode="$emit('exit-manage-mode')"
  />
</template>

<script>
import { ManageToolbar } from '../../components/toolbar';

export default {
  name: 'PhotoWallManageToolbar',
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
          label: '删除',
          event: 'show-delete-selected',
          icon: 'fas fa-trash',
          type: 'danger',
          requireSelection: true
        },
        {
          label: '加入相册',
          event: 'show-add-to-album',
          icon: 'fas fa-folder-plus',
          type: 'primary',
          requireSelection: true
        }
      ];
    }
  },
  emits: ['select-all', 'deselect-all', 'show-add-to-album', 'show-delete-selected', 'exit-manage-mode']
};
</script>
