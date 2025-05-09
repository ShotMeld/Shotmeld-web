<template>
  <teleport to="body">
    <transition name="sf-modal">
      <div 
        v-if="modelValue" 
        class="sf-modal-overlay" 
        @click.self="closeOnClickOverlay ? $emit('update:modelValue', false) : null"
      >
        <div 
          class="sf-modal" 
          :class="{ 
            [`sf-modal--${size}`]: true 
          }"
          :style="customStyles"
        >
          <div v-if="!hideHeader" class="sf-modal-header">
            <slot name="header">
              <div class="sf-modal-title">{{ title }}</div>
              <button 
                v-if="showClose" 
                class="sf-modal-close" 
                @click="$emit('update:modelValue', false)"
              >
                <span class="sf-modal-close-icon">×</span>
              </button>
            </slot>
          </div>
          
          <div class="sf-modal-body">
            <slot></slot>
          </div>
          
          <div v-if="$slots.footer" class="sf-modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
export default {
  name: 'SfModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'default',
      validator: value => ['small', 'default', 'large', 'full'].includes(value)
    },
    showClose: {
      type: Boolean,
      default: true
    },
    hideHeader: {
      type: Boolean,
      default: false
    },
    closeOnClickOverlay: {
      type: Boolean,
      default: true
    },
    customStyles: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:modelValue', 'close'],
  watch: {
    modelValue(val) {
      if (val) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
        this.$emit('close');
      }
    }
  },
  mounted() {
    if (this.modelValue) {
      document.body.style.overflow = 'hidden';
    }
  },
  beforeUnmount() {
    document.body.style.overflow = '';
  }
}
</script>

<style scoped>
.sf-modal-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: var(--spacing-md);
}

.sf-modal {
  background-color: var(--bg-primary);
  border-radius: var(--radius-large);
  box-shadow: var(--shadow-large);
  max-height: calc(100vh - var(--spacing-2xl));
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 500px;
  overflow: hidden;
}

.sf-modal--small {
  max-width: 400px;
}

.sf-modal--default {
  max-width: 500px;
}

.sf-modal--large {
  max-width: 800px;
}

.sf-modal--full {
  max-width: 95%;
  height: 95%;
}

.sf-modal-header {
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: var(--border-width) solid var(--border-color);
}

.sf-modal-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.sf-modal-close {
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: var(--text-secondary);
  transition: background-color var(--transition-fast);
}

.sf-modal-close:hover {
  background-color: var(--bg-secondary);
}

.sf-modal-close-icon {
  font-size: 24px;
  line-height: 1;
}

.sf-modal-body {
  padding: var(--spacing-lg);
  flex: 1;
  overflow-y: auto;
}

.sf-modal-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: var(--border-width) solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

/* Modal transitions */
.sf-modal-enter-active,
.sf-modal-leave-active {
  transition: all var(--transition-base);
}

.sf-modal-enter-from,
.sf-modal-leave-to {
  opacity: 0;
}

.sf-modal-enter-from .sf-modal,
.sf-modal-leave-to .sf-modal {
  transform: scale(0.9);
}

@media (max-width: 640px) {
  .sf-modal {
    max-width: 100% !important;
    border-radius: var(--radius-medium);
  }
  
  .sf-modal--full {
    height: 100%;
    max-height: 100%;
    border-radius: 0;
  }
}
</style>
