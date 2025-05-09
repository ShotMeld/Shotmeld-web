<template>
  <div 
    class="sf-badge" 
    :class="{ 
      [`sf-badge--${type}`]: true,
      [`sf-badge--${size}`]: true,
      'sf-badge--rounded': rounded
    }"
  >
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'SfBadge',
  props: {
    type: {
      type: String,
      default: 'primary',
      validator: value => ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'].includes(value)
    },
    size: {
      type: String,
      default: 'default',
      validator: value => ['small', 'default', 'large'].includes(value)
    },
    rounded: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style scoped>
.sf-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-family);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  white-space: nowrap;
}

.sf-badge--small {
  padding: 2px 8px;
  font-size: var(--font-size-xs);
  border-radius: var(--radius-small);
}

.sf-badge--default {
  padding: 4px 10px;
  font-size: var(--font-size-sm);
  border-radius: var(--radius-small);
}

.sf-badge--large {
  padding: 6px 12px;
  font-size: var(--font-size-base);
  border-radius: var(--radius-medium);
}

.sf-badge--rounded {
  border-radius: 100px;
}

.sf-badge--primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.sf-badge--secondary {
  background-color: rgba(0, 122, 255, 0.1);
  color: var(--color-primary);
}

.sf-badge--success {
  background-color: var(--color-success);
  color: var(--color-white);
}

.sf-badge--warning {
  background-color: var(--color-warning);
  color: var(--color-white);
}

.sf-badge--danger {
  background-color: var(--color-danger);
  color: var(--color-white);
}

.sf-badge--info {
  background-color: var(--color-info);
  color: var(--color-white);
}

.sf-badge--neutral {
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
}
</style>
