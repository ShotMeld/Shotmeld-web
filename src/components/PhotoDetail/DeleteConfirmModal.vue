<!--
  DeleteConfirmModal.vue - 照片详情/删除确认弹窗组件
-->

<template>
  <SfModal :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)" title="确认删除" size="small">
    <div class="delete-confirm-content">
      <p>确定要删除这张照片吗？此操作无法撤销。</p>
      <div class="delete-confirm-actions">
        <SfButton type="tertiary" @click="$emit('update:modelValue', false)">取消</SfButton>
        <SfButton type="danger" @click="$emit('confirm')">确认删除</SfButton>
      </div>
    </div>
  </SfModal>
</template>

<script>
import { SfButton, SfModal } from '../ui';

export default {
  name: 'DeleteConfirmModal',
  components: {
    SfButton,
    SfModal
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'confirm']
}
</script>

<style scoped>
.delete-confirm-content {
  padding: var(--spacing-md) 0;
}

.delete-confirm-content p {
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-size-md);
  color: var(--text-primary);
}

.delete-confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}
</style>
