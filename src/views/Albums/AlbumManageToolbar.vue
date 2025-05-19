<!--
  AlbumManageToolbar.vue - 相册批量管理工具栏组件
-->

<template>
  <div class="manage-toolbar">
    <div class="manage-toolbar-left">
      <SfButton type="primary" size="small" @click="selectAll" class="toolbar-btn">
        全选
      </SfButton>
      <SfButton type="secondary" size="small" @click="deselectAll" class="toolbar-btn" :disabled="selectedAlbums.length === 0">
        取消全选
      </SfButton>
      <span class="selected-count" v-if="selectedAlbums.length > 0">
        已选择 {{ selectedAlbums.length }} 个相册
      </span>
    </div>
    <div class="manage-toolbar-right">
      <SfButton type="danger" size="small" @click="$emit('show-delete-selected')" class="toolbar-btn" :disabled="selectedAlbums.length === 0">
        <i class="fas fa-trash"></i> 删除
      </SfButton>
      <SfButton type="secondary" size="small" @click="$emit('exit-manage-mode')" class="toolbar-btn">
        <i class="fas fa-times"></i> 关闭
      </SfButton>
    </div>
  </div>
</template>

<script>
import { SfButton } from '../../components/ui';

export default {
  name: 'AlbumManageToolbar',
  components: {
    SfButton
  },
  props: {
    selectedAlbums: {
      type: Array,
      required: true
    }
  },
  emits: ['select-all', 'deselect-all', 'show-delete-selected', 'exit-manage-mode'],
  methods: {
    selectAll() {
      this.$emit('select-all');
    },
    deselectAll() {
      this.$emit('deselect-all');
    }
  }
};
</script>

<style scoped>
.manage-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  background-color: var(--bg-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-large);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  animation: toolbar-appear 0.4s cubic-bezier(0.33, 1, 0.68, 1) forwards;
}

.manage-toolbar-left,
.manage-toolbar-right {
  display: flex;
  align-items: center;
}

.toolbar-btn {
  margin-right: var(--spacing-md);
}

.selected-count {
  font-size: var(--font-size-md);
  color: var(--text-primary);
}

@keyframes toolbar-appear {
  from {
    transform: translateY(-10px);
    opacity: 0.7;
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  }
  to {
    transform: translateY(0);
    opacity: 1;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
}
</style> 