<!--
  AlbumManageToolbar.vue - 相册批量管理工具栏组件
-->

<template>
  <ManageToolbar
    :selectedItems="selectedAlbums"
    itemUnit="个相册"
    :actions="toolbarActions"
    @select-all="$emit('select-all')"
    @deselect-all="$emit('deselect-all')"
    @show-delete-selected="$emit('show-delete-selected')"
    @exit-manage-mode="$emit('exit-manage-mode')"
  />
</template>

<script>
import { ManageToolbar } from '../../components/toolbar';

export default {
  name: 'AlbumManageToolbar',
  components: {
    ManageToolbar
  },
  props: {
    selectedAlbums: {
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
        }
      ];
    }
  },
  emits: ['select-all', 'deselect-all', 'show-delete-selected', 'exit-manage-mode']
};
</script> 