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
  background-color: var(--color-primary);
  color: var(--color-white);
  border-radius: var(--radius-medium);
  padding: var(--spacing-xs) var(--spacing-lg);
  box-shadow: var(--shadow-small);
}

.sf-button:hover {
  background-color: var(--color-secondary);
  box-shadow: var(--shadow-medium);
}

.sf-button:focus {
  box-shadow: 0 0 0 2px var(--color-primary), 0 0 0 4px rgba(0, 122, 255, 0.3);
}

.sf-button:active {
  transform: scale(0.98);
  box-shadow: var(--shadow-small);
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

.sf-button--loading {
  cursor: wait;
  opacity: 0.7;
}

.sf-button__loader {
  border: 2px solid var(--color-white);
  border-top: 2px solid var(--color-primary);
  border-radius: 50%;
  width: 16px;
  height: 16px;
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
