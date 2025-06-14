<!--
  ManageToolbar.vue - 通用管理工具栏组件
  可用于照片墙、相册管理、相册内照片管理等场景
-->

<template>
  <div class="manage-toolbar" :class="{ 'immediate-hide': shouldHideImmediately }">
    <div class="manage-toolbar-left">
      <SfButton type="primary" size="small" @click="selectAll" class="toolbar-btn">
        {{ $t('manageToolbar.selectAll') }}
      </SfButton>
      <SfButton
        type="primary"
        size="small"
        @click="deselectAll"
        class="toolbar-btn"
        :disabled="selectedItems.length === 0"
      >
        {{ $t('manageToolbar.deselectAll') }}
      </SfButton>
      <span class="selected-count" v-if="selectedItems.length > 0">
        {{ $t('manageToolbar.selectedCount', { count: selectedItems.length, unit: itemUnit }) }}
      </span>
    </div>
    <div class="manage-toolbar-right">
      <template v-for="(action, index) in visibleActions" :key="index">
        <SfButton
          :type="action.type || 'secondary'"
          size="small"
          @click="handleAction(action.event)"
          class="toolbar-btn"
          :disabled="action.requireSelection && selectedItems.length === 0"
        >
          <i v-if="action.icon" :class="action.icon"></i>
          {{ action.label }}
        </SfButton>
      </template>
      <SfButton type="secondary" size="small" @click="exitManageMode" class="toolbar-btn close-btn">
        <i class="fas fa-times"></i>
        {{ $t('manageToolbar.close') }}
      </SfButton>
    </div>
  </div>
</template>

<script>
import { SfButton } from '../ui'

export default {
  name: 'ManageToolbar',
  components: {
    SfButton,
  },
  props: {
    // 已选择的项目列表
    selectedItems: {
      type: Array,
      required: true,
    },
    // 项目单位名称，如"张照片"、"个相册"等
    itemUnit: {
      type: String,
      default() {
        return this.$t('manageToolbar.defaultUnit')
      },
    },
    // 操作按钮配置
    actions: {
      type: Array,
      default: () => [],
      /* 
      actions的格式示例:
      [
        {
          label: '加入相册', // 按钮文本
          event: 'show-add-to-album', // 触发的事件名
          icon: 'fas fa-folder-plus', // 图标类名 (可选)
          type: 'secondary', // 按钮类型 (可选，默认为secondary)
          requireSelection: true, // 是否需要选择项目才可用 (可选，默认为true)
        }
      ]
      */
    },
    // 是否使用立即隐藏效果 (用于PhotoAlbumManage)
    useImmediateHide: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      shouldHideImmediately: false,
    }
  },
  computed: {
    // 过滤出需要展示的操作按钮
    visibleActions() {
      return this.actions.filter(action => action.visible !== false)
    },
  },
  emits: {
    'select-all': true,
    'deselect-all': true,
    'exit-manage-mode': true,
    'show-add-to-album': true,
    'show-move-to-album': true,
    'show-remove-from-album': true,
    'show-delete-selected': true,
    'show-change-cover': true,
  },
  methods: {
    selectAll() {
      this.$emit('select-all')
    },
    deselectAll() {
      this.$emit('deselect-all')
    },
    handleAction(eventName) {
      this.$emit(eventName)
    },
    exitManageMode() {
      // 立即触发退出事件，不再使用延迟
      this.$emit('exit-manage-mode')
    },
  },
}
</script>

<style scoped>
.manage-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--blur-bg-strong);
  padding: 14px 18px;
  border-radius: 12px;
  box-shadow: var(--blur-shadow-strong);
  animation: toolbar-appear 0.35s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
  backdrop-filter: var(--blur-strong);
  -webkit-backdrop-filter: var(--blur-strong);
  border: 1px solid var(--blur-border-strong);
}

.manage-toolbar-left,
.manage-toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar-btn {
  font-weight: 500;
  padding: 6px 14px;
  border-radius: 8px;
  transition: all 0.2s ease;
  border: none;
}

.toolbar-btn:hover {
  transform: translateY(-1px);
}

.toolbar-btn:active {
  transform: translateY(1px);
}

.close-btn {
  margin-left: 6px;
}

.selected-count {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  font-weight: 500;
  margin-left: 8px;
}

.immediate-hide {
  opacity: 0 !important;
  visibility: hidden !important;
  transition: none !important;
  pointer-events: none !important;
}

@keyframes toolbar-appear {
  from {
    transform: translateY(-8px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .manage-toolbar {
    flex-direction: column;
    gap: 12px;
    padding: 14px 16px;
  }

  .manage-toolbar-left,
  .manage-toolbar-right {
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }

  .toolbar-btn {
    flex-grow: 1;
    min-width: 80px;
    max-width: 160px;
    text-align: center;
    margin-right: 0;
  }

  .selected-count {
    width: 100%;
    text-align: center;
    margin: 6px 0;
  }
}
</style>
