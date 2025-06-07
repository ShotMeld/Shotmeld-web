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
            [`sf-modal--${size}`]: true,
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
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: 'default',
      validator: value => ['small', 'default', 'large', 'full'].includes(value),
    },
    showClose: {
      type: Boolean,
      default: true,
    },
    hideHeader: {
      type: Boolean,
      default: false,
    },
    closeOnClickOverlay: {
      type: Boolean,
      default: true,
    },
    customStyles: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['update:modelValue', 'close'],
  watch: {
    modelValue(val) {
      if (val) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
        this.$emit('close')
      }
    },
  },
  mounted() {
    if (this.modelValue) {
      document.body.style.overflow = 'hidden'
    }
  },
  beforeUnmount() {
    document.body.style.overflow = ''
  },
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

.sf-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
}

.sf-modal {
  background-color: var(--bg-primary);
  border-radius: var(--radius-large);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
  position: relative;
  width: 100%;
  max-width: 600px;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  animation: modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.sf-modal--small {
  max-width: 400px;
}

.sf-modal--default {
  max-width: 600px;
}

.sf-modal--large {
  max-width: 2000px;
}

.sf-modal--extra-large {
  max-width: 2500px;
}

.sf-modal--full {
  max-width: 95vw;
  height: 95vh;
}

.sf-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.sf-modal-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin: 0;
  padding: 0;
  line-height: 1.4;
}

.sf-modal-close {
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.sf-modal-close:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.sf-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
  -webkit-overflow-scrolling: touch; /* 提升 iOS 滚动体验 */
}

.sf-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  gap: var(--spacing-sm);
}

/* Modal transitions */
.sf-modal-enter-active,
.sf-modal-leave-active {
  transition: opacity var(--transition-base);
}

.sf-modal-enter-from,
.sf-modal-leave-to {
  opacity: 0;
}

.sf-modal-enter-from .sf-modal {
  transform: scale(0.9);
  transition: transform var(--transition-base);
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
