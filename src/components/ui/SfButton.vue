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
    :type="htmlType"
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
    htmlType: {
      type: String,
      default: 'button',
      validator: value => ['button', 'submit', 'reset'].includes(value)
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
  border: 1px solid transparent;
  transition: all var(--transition-fast);
  white-space: nowrap;
  overflow: hidden;
  user-select: none;
  outline: none;
  border-radius: var(--radius-medium);
  padding: var(--spacing-xs) var(--spacing-md);
}

/* Primary Button Style */
.sf-button--primary {
  background-color: var(--color-primary-subtle);
  color: var(--color-primary);
  border-color: var(--color-primary-subtle);
}

.sf-button--primary:hover {
  background-color: var(--color-primary-hover, #e6f0ff);
  border-color: var(--color-primary-hover, #e6f0ff);
}

/* Secondary Button Style */
.sf-button--secondary {
  background-color: var(--bg-secondary, #f2f2f7);
  color: var(--color-primary);
  border: 1px solid var(--border-color, #d1d1d6);
}

.sf-button--secondary:hover {
  background-color: var(--bg-tertiary, #e5e5ea);
}

/* Tertiary/Text Button Style */
.sf-button--tertiary,
.sf-button--text {
  background-color: transparent;
  color: var(--color-primary);
  border-color: transparent;
  padding: var(--spacing-xs) var(--spacing-sm);
}

.sf-button--tertiary:hover,
.sf-button--text:hover {
  background-color: rgba(0, 122, 255, 0.05);
}

/* Danger Button Style */
.sf-button--danger {
  background-color: var(--color-danger, #ff3b30);
  color: var(--color-white);
  border-color: var(--color-danger, #ff3b30);
}

.sf-button--danger:hover {
  background-color: var(--color-danger-dark, #d92c23);
  border-color: var(--color-danger-dark, #d92c23);
}

/* Success Button Style */
.sf-button--success {
  background-color: var(--color-success, #34c759);
  color: var(--color-white);
  border-color: var(--color-success, #34c759);
}

.sf-button--success:hover {
  background-color: var(--color-success-dark, #2ca349);
  border-color: var(--color-success-dark, #2ca349);
}

/* Warning Button Style */
.sf-button--warning {
  background-color: var(--color-warning, #ff9500);
  color: var(--color-white);
  border-color: var(--color-warning, #ff9500);
}

.sf-button--warning:hover {
  background-color: var(--color-warning-dark, #d97f00);
  border-color: var(--color-warning-dark, #d97f00);
}

/* Info Button Style */
.sf-button--info {
  background-color: var(--color-info, #5ac8fa);
  color: var(--color-white);
  border-color: var(--color-info, #5ac8fa);
}

.sf-button--info:hover {
  background-color: var(--color-info-dark, #49a9d1);
  border-color: var(--color-info-dark, #49a9d1);
}

.sf-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Disabled state */
.sf-button:disabled,
.sf-button--loading {
  opacity: 0.5;
  pointer-events: none;
}

.sf-button--loading {
  cursor: wait;
}

/* Size Variants */
.sf-button--small {
  padding: var(--spacing-2xs) var(--spacing-xs);
  font-size: var(--font-size-sm);
}

.sf-button--default {
  font-size: var(--font-size-base);
}

.sf-button--large {
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-lg);
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

.sf-button__loader {
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 0.8s linear infinite;
}

/* Loader for light background buttons */
.sf-button--secondary .sf-button__loader,
.sf-button--tertiary .sf-button__loader,
.sf-button--text .sf-button__loader {
  border: 2px solid rgba(0, 122, 255, 0.2);
  border-top-color: var(--color-primary);
}

.sf-button__text {
  position: relative;
  display: inherit;
  align-items: center;
  gap: var(--spacing-2xs);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .sf-button {
    padding: var(--spacing-2xs) var(--spacing-sm);
  }
  
  .sf-button--large {
    padding: var(--spacing-xs) var(--spacing-md);
  }
}
</style>
