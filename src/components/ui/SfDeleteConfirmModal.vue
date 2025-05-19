<!--
  SfDeleteConfirmModal.vue - 通用的删除确认对话框
  用于各种资源（照片、相册等）的批量删除确认
-->

<template>
  <sf-modal :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" :title="title" size="small">
    <div class="delete-confirm">
      <p>{{ confirmMessage || `确定要删除选中的 ${count} 个${itemName}吗？` }}</p>
      <p class="warning-text">{{ warningText || '此操作不可恢复！' }}</p>
      <div class="modal-footer">
        <sf-button type="secondary" @click="cancel">{{ cancelText }}</sf-button>
        <sf-button type="danger" @click="confirm">{{ confirmText }}</sf-button>
      </div>
    </div>
  </sf-modal>
</template>

<script>
import SfModal from './SfModal.vue';
import SfButton from './SfButton.vue';

export default {
  name: 'SfDeleteConfirmModal',
  components: {
    SfModal,
    SfButton
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    itemName: {
      type: String,
      default: '项目'
    },
    count: {
      type: Number,
      default: 0
    },
    title: {
      type: String,
      default: '删除确认'
    },
    confirmMessage: {
      type: String,
      default: ''
    },
    warningText: {
      type: String,
      default: ''
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    confirmText: {
      type: String,
      default: '确认删除'
    }
  },
  emits: ['update:modelValue', 'cancel', 'confirm'],
  methods: {
    cancel() {
      this.$emit('update:modelValue', false);
      this.$emit('cancel');
    },
    confirm() {
      this.$emit('confirm');
      this.$emit('update:modelValue', false);
    }
  }
}
</script>

<style scoped>
.delete-confirm {
  text-align: center;
}

.warning-text {
  color: var(--danger);
  font-weight: bold;
  margin: var(--spacing-md) 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  width: 100%;
  margin-top: var(--spacing-lg);
}
</style>
