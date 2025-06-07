<template>
  <div class="link-button" :class="{ danger: type === 'danger' }" @click="onClick">
    <i v-if="icon" :class="icon"></i>
    <span><slot></slot></span>
  </div>
</template>

<script>
export default {
  name: 'SfLinkButton',
  props: {
    type: {
      type: String,
      default: 'primary',
      validator: value => ['primary', 'danger'].includes(value),
    },
    icon: {
      type: String,
      default: '',
    },
  },
  methods: {
    onClick(event) {
      this.$emit('click', event)
    },
  },
}
</script>

<style scoped>
.link-button {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s ease;
}

.link-button i {
  margin-right: 6px;
}

.link-button.danger {
  color: var(--color-danger);
}
</style>
