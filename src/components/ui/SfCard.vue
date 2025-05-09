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
  border-radius: var(--radius-medium);
  overflow: hidden;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.sf-card--none {
  box-shadow: none;
  border: var(--border-width) solid var(--border-color);
}

.sf-card--small {
  box-shadow: var(--shadow-small);
}

.sf-card--medium {
  box-shadow: var(--shadow-medium);
}

.sf-card--large {
  box-shadow: var(--shadow-large);
}

.sf-card--hoverable:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-large);
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
