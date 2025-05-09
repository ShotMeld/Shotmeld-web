<template>
  <div 
    class="sf-input-wrapper"
    :class="{ 
      'sf-input-wrapper--focused': isFocused,
      'sf-input-wrapper--disabled': disabled,
      'sf-input-wrapper--error': error,
      'sf-input-wrapper--with-prefix': $slots.prefix,
      'sf-input-wrapper--with-suffix': $slots.suffix
    }"
  >
    <label v-if="label" :for="id" class="sf-input-label">{{ label }}</label>
    
    <div class="sf-input-container">
      <div v-if="$slots.prefix" class="sf-input-prefix">
        <slot name="prefix"></slot>
      </div>
      
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        class="sf-input"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      
      <div v-if="$slots.suffix" class="sf-input-suffix">
        <slot name="suffix"></slot>
      </div>
      
      <div v-else-if="clearable && modelValue" class="sf-input-clear" @click="clear">
        <span class="sf-input-clear-icon">×</span>
      </div>
    </div>
    
    <span v-if="error" class="sf-input-error">{{ error }}</span>
    <span v-else-if="hint" class="sf-input-hint">{{ hint }}</span>
  </div>
</template>

<script>
export default {
  name: 'SfInput',
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    placeholder: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    },
    autocomplete: {
      type: String,
      default: 'off'
    },
    error: {
      type: String,
      default: ''
    },
    hint: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      default() {
        return `sf-input-${Math.random().toString(36).substring(2, 9)}`;
      }
    }
  },
  emits: ['update:modelValue', 'focus', 'blur', 'clear'],
  data() {
    return {
      isFocused: false
    };
  },
  methods: {
    handleFocus(event) {
      this.isFocused = true;
      this.$emit('focus', event);
    },
    handleBlur(event) {
      this.isFocused = false;
      this.$emit('blur', event);
    },
    clear() {
      this.$emit('update:modelValue', '');
      this.$emit('clear');
    }
  }
};
</script>

<style scoped>
.sf-input-wrapper {
  display: flex;
  flex-direction: column;
  margin-bottom: var(--spacing-md);
}

.sf-input-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.sf-input-container {
  display: flex;
  align-items: center;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-round);
  border: 2px solid transparent;
  transition: all var(--transition-base);
  overflow: hidden;
}

.sf-input-wrapper--focused .sf-input-container {
  border-color: var(--color-primary);
  background-color: var(--color-white);
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.15);
}

.sf-input-wrapper--error .sf-input-container {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 2px rgba(255, 59, 48, 0.15);
}

.sf-input {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-primary);
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  background-color: transparent;
  border: none;
  outline: none;
  width: 100%;
}

.sf-input-wrapper--with-prefix .sf-input {
  padding-left: 0;
}

.sf-input-wrapper--with-suffix .sf-input {
  padding-right: 0;
}

.sf-input-prefix,
.sf-input-suffix {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--spacing-md);
  color: var(--text-secondary);
}

.sf-input-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--spacing-xs);
  cursor: pointer;
  color: var(--text-tertiary);
  transition: color var(--transition-fast);
}

.sf-input-clear:hover {
  color: var(--text-primary);
}

.sf-input-clear-icon {
  font-size: 18px;
  line-height: 1;
}

.sf-input-error {
  display: block;
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--color-danger);
}

.sf-input-hint {
  display: block;
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

/* Focus state */
.sf-input-wrapper--focused .sf-input-container {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
}

.sf-input-wrapper--focused .sf-input-label {
  color: var(--color-primary);
}

/* Error state */
.sf-input-wrapper--error .sf-input-container {
  border-color: var(--color-danger);
}

.sf-input-wrapper--error.sf-input-wrapper--focused .sf-input-container {
  box-shadow: 0 0 0 2px rgba(255, 59, 48, 0.2);
}

.sf-input-wrapper--error .sf-input-label {
  color: var(--color-danger);
}

/* Disabled state */
.sf-input-wrapper--disabled .sf-input-container {
  background-color: var(--bg-secondary);
  opacity: 0.6;
}

.sf-input-wrapper--disabled .sf-input {
  cursor: not-allowed;
  color: var(--text-disabled);
}

/* Placeholder styling */
.sf-input::placeholder {
  color: var(--text-tertiary);
}
</style>
