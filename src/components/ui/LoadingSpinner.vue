<template>
  <div class="loading-container" :class="containerClass">
    <div class="loading-spinner" :class="spinnerClass">
      <div class="spinner" :style="spinnerStyle"></div>
    </div>
    <p v-if="showText" class="loading-text" :class="textClass">
      {{ loadingText }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  // 加载的对象描述，如："照片"、"相册"、"用户信息"等
  target: {
    type: String,
    default: '',
  },
  // 是否显示文本
  showText: {
    type: Boolean,
    default: true,
  },
  // 自定义文本（优先级高于target）
  text: {
    type: String,
    default: '',
  },
  // 尺寸大小：small, medium, large
  size: {
    type: String,
    default: 'medium',
    validator: value => ['small', 'medium', 'large'].includes(value),
  },
  // 容器样式类
  containerClass: {
    type: String,
    default: '',
  },
  // 转圈样式类
  spinnerClass: {
    type: String,
    default: '',
  },
  // 文本样式类
  textClass: {
    type: String,
    default: '',
  },
  // 是否居中显示
  centered: {
    type: Boolean,
    default: true,
  },
  // 内边距大小
  padding: {
    type: String,
    default: 'normal',
    validator: value => ['none', 'small', 'normal', 'large'].includes(value),
  },
})

const { t } = useI18n()

// 根据 target 和 text 生成加载文本
const loadingText = computed(() => {
  if (props.text) {
    return props.text
  }

  if (props.target) {
    return t('loading.target', { target: props.target })
  }

  return t('loading.default')
})

// 根据尺寸计算转圈样式
const spinnerStyle = computed(() => {
  const sizeMap = {
    small: { width: '24px', height: '24px', borderWidth: '2px' },
    medium: { width: '40px', height: '40px', borderWidth: '3px' },
    large: { width: '60px', height: '60px', borderWidth: '4px' },
  }

  return sizeMap[props.size] || sizeMap.medium
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-container.centered {
  text-align: center;
}

.loading-container.padding-none {
  padding: 0;
}

.loading-container.padding-small {
  padding: var(--spacing-md);
}

.loading-container.padding-normal {
  padding: var(--spacing-xl) var(--spacing-lg);
}

.loading-container.padding-large {
  padding: var(--spacing-3xl) var(--spacing-xl);
}

.loading-spinner {
  margin-bottom: var(--spacing-md);
}

.loading-spinner.size-small {
  margin-bottom: var(--spacing-sm);
}

.loading-spinner.size-large {
  margin-bottom: var(--spacing-lg);
}

.spinner {
  border: 3px solid var(--bg-tertiary);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

.loading-text {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.loading-text.size-small {
  font-size: var(--font-size-sm);
}

.loading-text.size-large {
  font-size: var(--font-size-lg);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 适配不同的背景 */
.loading-container.on-dark {
  color: var(--text-primary-dark);
}

.loading-container.on-dark .spinner {
  border-color: rgba(255, 255, 255, 0.2);
  border-top-color: var(--color-primary);
}

.loading-container.on-dark .loading-text {
  color: var(--text-secondary-dark);
}

/* 内联样式，用于不需要大量空间的场景 */
.loading-container.inline {
  flex-direction: row;
  gap: var(--spacing-sm);
}

.loading-container.inline .loading-spinner {
  margin-bottom: 0;
}
</style>
