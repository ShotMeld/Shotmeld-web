<template>
  <button
    :class="[
      'sf-button',
      `sf-button--${type}`,
      `sf-button--${size}`,
      { 'sf-button--rounded': rounded },
      { 'sf-button--full-width': fullWidth },
      { 'sf-button--icon-only': iconOnly },
      { 'sf-button--loading': loading }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
    type="button"
  >
    <span v-if="loading" class="sf-button__loader"></span>
    <slot v-else-if="iconOnly"></slot>
    <template v-else>
      <slot name="prefix"></slot>
      <span class="sf-button__text"><slot></slot></span>
      <slot name="suffix"></slot>
    </template>
  </button>
</template>

<script>
export default {
  name: 'SfButton',
  props: {
    type: {
      type: String,
      default: 'primary',
      validator: value => ['primary', 'secondary', 'tertiary', 'danger', 'success', 'warning', 'info', 'text'].includes(value)
    },
    size: {
      type: String,
      default: 'default',
      validator: value => ['small', 'default', 'large'].includes(value)
    },
    rounded: {
      type: Boolean,
      default: false
    },
    fullWidth: {
      type: Boolean,
      default: false
    },
    iconOnly: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click']
}
</script>

<style scoped>
.sf-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-family);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  border: none;
  transition: all var(--transition-base);
  white-space: nowrap;
  overflow: hidden;
  user-select: none;
  outline: none;
}

.sf-button:focus {
  box-shadow: 0 0 0 2px var(--color-primary), 0 0 0 4px rgba(0, 122, 255, 0.3);
}

.sf-button:active {
  transform: scale(0.98);
}

.sf-button--small {
  padding: var(--spacing-2xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
  border-radius: var(--radius-small);
  min-height: 32px;
}

.sf-button--default {
  padding: var(--spacing-xs) var(--spacing-lg);
  font-size: var(--font-size-base);
  border-radius: var(--radius-medium);
  min-height: 40px;
}

.sf-button--large {
  padding: var(--spacing-sm) var(--spacing-xl);
  font-size: var(--font-size-lg);
  border-radius: var(--radius-large);
  min-height: 48px;
}

.sf-button--rounded {
  border-radius: var(--radius-round);
}

.sf-button--full-width {
  width: 100%;
}

.sf-button--icon-only {
  padding: var(--spacing-xs);
  aspect-ratio: 1 / 1;
}

.sf-button--icon-only.sf-button--small {
  padding: var(--spacing-2xs);
}

.sf-button--icon-only.sf-button--large {
  padding: var(--spacing-sm);
}

/* Button styles by type */
.sf-button--primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.sf-button--primary:hover:not(:disabled) {
  background-color: rgba(0, 122, 255, 0.9);
}

.sf-button--secondary {
  background-color: rgba(0, 122, 255, 0.1);
  color: var(--color-primary);
}

.sf-button--secondary:hover:not(:disabled) {
  background-color: rgba(0, 122, 255, 0.2);
}

.sf-button--tertiary {
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
}

.sf-button--tertiary:hover:not(:disabled) {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.sf-button--danger {
  background-color: var(--color-danger);
  color: var(--color-white);
}

.sf-button--danger:hover:not(:disabled) {
  background-color: rgba(255, 59, 48, 0.9);
}

.sf-button--success {
  background-color: var(--color-success);
  color: var(--color-white);
}

.sf-button--success:hover:not(:disabled) {
  background-color: rgba(52, 199, 89, 0.9);
}

.sf-button--warning {
  background-color: var(--color-warning);
  color: var(--color-white);
}

.sf-button--warning:hover:not(:disabled) {
  background-color: rgba(255, 149, 0, 0.9);
}

.sf-button--info {
  background-color: var(--color-info);
  color: var(--color-white);
}

.sf-button--info:hover:not(:disabled) {
  background-color: rgba(88, 86, 214, 0.9);
}

.sf-button--text {
  background-color: transparent;
  color: var(--color-primary);
  padding-left: var(--spacing-xs);
  padding-right: var(--spacing-xs);
}

.sf-button--text:hover:not(:disabled) {
  color: rgba(0, 122, 255, 0.8);
  background-color: rgba(0, 122, 255, 0.05);
}

.sf-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.sf-button--loading {
  cursor: default;
  transform: none;
}

.sf-button__loader {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: var(--color-white);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.sf-button--secondary .sf-button__loader,
.sf-button--tertiary .sf-button__loader,
.sf-button--text .sf-button__loader {
  border: 2px solid rgba(0, 122, 255, 0.3);
  border-top-color: var(--color-primary);
}

.sf-button__text {
  position: relative;
  z-index: 1;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
