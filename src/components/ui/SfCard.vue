<template>
  <div 
    class="sf-card" 
    :class="{
      [`sf-card--${shadow}`]: true,
      'sf-card--hoverable': hoverable
    }"
  >
    <div v-if="$slots.header || title" class="sf-card-header">
      <slot name="header">
        <div class="sf-card-title">{{ title }}</div>
        <div v-if="subtitle" class="sf-card-subtitle">{{ subtitle }}</div>
      </slot>
    </div>
    
    <div class="sf-card-body">
      <slot></slot>
    </div>
    
    <div v-if="$slots.footer" class="sf-card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SfCard',
  props: {
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    shadow: {
      type: String,
      default: 'medium',
      validator: value => ['none', 'small', 'medium', 'large'].includes(value)
    },
    hoverable: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.sf-card {
  background-color: var(--bg-primary);
  border-radius: var(--radius-large);
  overflow: hidden;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  border: 0;
}

.sf-card--none {
  box-shadow: none;
  border: var(--border-width) solid var(--border-color);
}

.sf-card--small {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.04);
}

.sf-card--medium {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), 0 8px 16px rgba(0, 0, 0, 0.05);
}

.sf-card--large {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06), 0 16px 32px rgba(0, 0, 0, 0.06);
}

.sf-card--hoverable:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.07), 0 20px 48px rgba(0, 0, 0, 0.06);
}

.sf-card-header {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: var(--border-width) solid var(--border-color);
}

.sf-card-body {
  padding: var(--spacing-lg);
}

.sf-card-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: var(--border-width) solid var(--border-color);
}

.sf-card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-2xs);
}

.sf-card-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}
</style>
