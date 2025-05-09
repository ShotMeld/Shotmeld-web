<template>
  <router-link
    v-if="to"
    :to="to"
    :class="navLinkClasses"
    :active-class="activeClass"
  >
    <span v-if="$slots.icon" class="sf-navlink-icon">
      <slot name="icon"></slot>
    </span>
    <span class="sf-navlink-label">
      <slot></slot>
    </span>
    <SfBadge
      v-if="badge"
      :type="badgeType"
      size="small"
      class="sf-navlink-badge"
    >
      {{ badge }}
    </SfBadge>
  </router-link>
  
  <a
    v-else
    :href="href || '#'"
    :class="navLinkClasses"
    @click="onClick"
  >
    <span v-if="$slots.icon" class="sf-navlink-icon">
      <slot name="icon"></slot>
    </span>
    <span class="sf-navlink-label">
      <slot></slot>
    </span>
    <SfBadge
      v-if="badge"
      :type="badgeType"
      size="small"
      class="sf-navlink-badge"
    >
      {{ badge }}
    </SfBadge>
  </a>
</template>

<script>
import SfBadge from './SfBadge.vue';

export default {
  name: 'SfNavLink',
  components: {
    SfBadge
  },
  props: {
    to: {
      type: [String, Object],
      default: null
    },
    href: {
      type: String,
      default: ''
    },
    active: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    badge: {
      type: [String, Number],
      default: null
    },
    badgeType: {
      type: String,
      default: 'primary'
    },
    activeClass: {
      type: String,
      default: 'sf-navlink--active'
    }
  },
  computed: {
    navLinkClasses() {
      return [
        'sf-navlink',
        {
          'sf-navlink--active': this.active,
          'sf-navlink--disabled': this.disabled,
          'sf-navlink--with-badge': this.badge
        }
      ];
    }
  },
  methods: {
    onClick(event) {
      if (this.disabled) {
        event.preventDefault();
        return;
      }
      this.$emit('click', event);
    }
  }
}
</script>

<style scoped>
.sf-navlink {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-medium);
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
  font-weight: var(--font-weight-medium);
  position: relative;
}

.sf-navlink:hover {
  color: var(--color-primary);
  background-color: rgba(0, 122, 255, 0.05);
}

.sf-navlink--active {
  color: var(--color-primary);
  background-color: rgba(0, 122, 255, 0.1);
}

.sf-navlink--disabled {
  opacity: 0.5;
  pointer-events: none;
}

.sf-navlink-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
}

.sf-navlink-badge {
  margin-left: var(--spacing-2xs);
}

@media (max-width: 768px) {
  .sf-navlink {
    padding: var(--spacing-2xs) var(--spacing-sm);
  }
}
</style>
