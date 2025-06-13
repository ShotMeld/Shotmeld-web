<!--
  SfDeleteConfirmModal.vue - 通用的删除确认对话框
  用于各种资源（照片、相册等）的批量删除确认
-->

<template>
  <SfModal
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :title="modalTitle"
    size="small"
  >
    <div class="delete-confirm">
      <p>{{ confirmMessage || $t('sfDeleteConfirmModal.confirmMessage', { count, itemName }) }}</p>
      <p class="warning-text">{{ warningText || $t('sfDeleteConfirmModal.warningText') }}</p>
      <div class="modal-footer">
        <SfButton type="secondary" @click="cancel">{{ modalCancelText }}</SfButton>
        <SfButton type="danger" @click="confirm">{{ modalConfirmText }}</SfButton>
      </div>
    </div>
  </SfModal>
</template>

<script>
import SfModal from './SfModal.vue'
import SfButton from './SfButton.vue'

export default {
  name: 'SfDeleteConfirmModal',
  components: {
    SfModal,
    SfButton,
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    itemName: {
      type: String,
      default: 'items',
    },
    count: {
      type: Number,
      default: 0,
    },
    title: {
      type: String,
      default: '',
    },
    confirmMessage: {
      type: String,
      default: '',
    },
    warningText: {
      type: String,
      default: '',
    },
    cancelText: {
      type: String,
      default: '',
    },
    confirmText: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue', 'cancel', 'confirm'],
  computed: {
    // 提供国际化的默认值
    modalTitle() {
      return this.title || this.$t('sfDeleteConfirmModal.title')
    },
    modalCancelText() {
      return this.cancelText || this.$t('sfDeleteConfirmModal.cancelText')
    },
    modalConfirmText() {
      return this.confirmText || this.$t('sfDeleteConfirmModal.confirmText')
    },
  },
  methods: {
    cancel() {
      this.$emit('update:modelValue', false)
      this.$emit('cancel')
    },
    confirm() {
      this.$emit('confirm')
      this.$emit('update:modelValue', false)
    },
  },
}
</script>

<style scoped>
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
