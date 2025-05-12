<template>
  <div 
    class="link-button" 
    :class="{ 'danger': type === 'danger' }"
    @click="onClick"
  >
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
      validator: value => ['primary', 'danger'].includes(value)
    },
    icon: {
      type: String,
      default: ''
    }
  },
  methods: {
    onClick(event) {
      this.$emit('click', event);
    }
  }
}
</script>

<style scoped>
.link-button {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-primary-subtle);
  color: var(--color-primary);
  border-radius: 20px;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s ease;
}

.link-button i {
  margin-right: 6px;
}

.link-button:hover {
  background-color: var(--color-primary-light);
  transform: translateY(-1px);
}

.link-button.danger {
  background-color: var(--color-danger-subtle);
  color: var(--color-danger);
}

.link-button.danger:hover {
  background-color: var(--color-danger-light);
}
</style>
