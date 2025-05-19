<!--
  AlbumPhotosManageToolbar.vue - 相册照片批量管理工具栏组件
-->

<template>
  <ManageToolbar
    :selectedItems="selectedPhotos"
    itemUnit="张照片"
    :actions="toolbarActions"
    :useImmediateHide="true"
    @select-all="$emit('select-all')"
    @deselect-all="$emit('deselect-all')"
    @show-move-to-album="$emit('show-move-to-album')"
    @show-remove-from-album="$emit('show-remove-from-album')"
    @show-delete-selected="$emit('show-delete-selected')"
    @exit-manage-mode="$emit('exit-manage-mode')"
  />
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
          label: '移动到其他相册',
          event: 'show-move-to-album',
          icon: 'fas fa-exchange-alt',
          type: 'secondary',
          requireSelection: true
        },
        {
          label: '从相册移除',
          event: 'show-remove-from-album',
          icon: 'fas fa-folder-minus',
          type: 'warning',
          requireSelection: true
        },
        {
          label: '删除照片',
          event: 'show-delete-selected',
          icon: 'fas fa-trash',
          type: 'danger',
          requireSelection: true
        }
      ];
    }
  },
  emits: ['select-all', 'deselect-all', 'show-move-to-album', 'show-remove-from-album', 'show-delete-selected', 'exit-manage-mode']
};
</script>
