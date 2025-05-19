<!--
  ManageToolbar.vue - 通用管理工具栏组件
  可用于照片墙、相册管理、相册内照片管理等场景
-->

<template>
  <div class="manage-toolbar" :class="{ 'immediate-hide': shouldHideImmediately }">
    <div class="manage-toolbar-left">
      <SfButton type="primary" size="small" @click="selectAll" class="toolbar-btn">
        全选
      </SfButton>
      <SfButton type="secondary" size="small" @click="deselectAll" class="toolbar-btn" :disabled="selectedItems.length === 0">
        取消全选
      </SfButton>
      <span class="selected-count" v-if="selectedItems.length > 0">
        已选择 {{ selectedItems.length }} {{ itemUnit }}
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
        <i class="fas fa-times"></i> 关闭
      </SfButton>
    </div>
  </div>
</template>

<script>
import { SfButton } from '../ui';

export default {
  name: 'ManageToolbar',
  components: {
    SfButton
  },
  props: {
    // 已选择的项目列表
    selectedItems: {
      type: Array,
      required: true
    },
    // 项目单位名称，如"张照片"、"个相册"等
    itemUnit: {
      type: String,
      default: '项'
    },
    // 操作按钮配置
    actions: {
      type: Array,
      default: () => []
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
      default: false
    }
  },
  data() {
    return {
      shouldHideImmediately: false
    };
  },
  computed: {
    // 过滤出需要展示的操作按钮
    visibleActions() {
      return this.actions.filter(action => action.visible !== false);
    }
  },
  emits: ['select-all', 'deselect-all', 'exit-manage-mode'],
  methods: {
    selectAll() {
      this.$emit('select-all');
    },
    deselectAll() {
      this.$emit('deselect-all');
    },
    handleAction(eventName) {
      this.$emit(eventName);
    },
    exitManageMode() {
      if (this.useImmediateHide) {
        this.shouldHideImmediately = true;
        
        // 添加一个很短的延迟后再触发实际的退出事件
        setTimeout(() => {
          this.$emit('exit-manage-mode');
        }, 10); // 10毫秒足够DOM更新但用户不会感知
      } else {
        this.$emit('exit-manage-mode');
      }
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
  background-color: rgba(250, 250, 250, 0.95);
  padding: 14px 18px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  animation: toolbar-appear 0.35s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.06);
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
