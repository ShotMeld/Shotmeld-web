<template>
  <div
    class="sf-avatar"
    :class="{
      [`sf-avatar--${size}`]: true,
      [`sf-avatar--${shape}`]: true,
      'sf-avatar--with-border': border,
    }"
    :style="avatarStyle"
  >
    <img v-if="src" :src="src" :alt="alt" class="sf-avatar-image" @error="handleImageError" />
    <span v-else-if="text" class="sf-avatar-text">{{ displayText }}</span>
    <slot v-else></slot>
  </div>
</template>

<script>
export default {
  name: 'SfAvatar',
  props: {
    src: {
      type: String,
      default: '',
    },
    alt: {
      type: String,
      default: 'avatar',
    },
    text: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large', 'xlarge'].includes(value),
    },
    shape: {
      type: String,
      default: 'circle',
      validator: value => ['circle', 'square', 'rounded'].includes(value),
    },
    border: {
      type: Boolean,
      default: false,
    },
    backgroundColor: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      imageError: false,
    }
  },
  computed: {
    displayText() {
      if (!this.text) return ''
      return this.text.charAt(0).toUpperCase()
    },
    avatarStyle() {
      const style = {}

      if (this.backgroundColor) {
        style.backgroundColor = this.backgroundColor
      } else if (!this.src || this.imageError) {
        // Generate color based on text if no src or image error
        const hash = this.text ? this.hashCode(this.text) : 0
        const hue = hash % 360
        style.backgroundColor = `hsl(${hue}, 65%, 50%)`
      }

      if (this.color) {
        style.color = this.color
      }

      return style
    },
  },
  methods: {
    handleImageError() {
      this.imageError = true
      this.$emit('error')
    },
    hashCode(str) {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
      }
      return Math.abs(hash)
    },
  },
}
</script>

<style scoped>
.sf-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary);
  color: var(--color-white);
  font-weight: var(--font-weight-medium);
  overflow: hidden;
  user-select: none;
}

.sf-avatar--small {
  width: 32px;
  height: 32px;
  font-size: var(--font-size-sm);
}

.sf-avatar--medium {
  width: 40px;
  height: 40px;
  font-size: var(--font-size-base);
}

.sf-avatar--large {
  width: 56px;
  height: 56px;
  font-size: var(--font-size-xl);
}

.sf-avatar--xlarge {
  width: 80px;
  height: 80px;
  font-size: var(--font-size-3xl);
}

.sf-avatar--circle {
  border-radius: 50%;
}

.sf-avatar--rounded {
  border-radius: var(--radius-medium);
}

.sf-avatar--square {
  border-radius: 0;
}

.sf-avatar--with-border {
  border: 2px solid var(--color-white);
  box-shadow: var(--shadow-small);
}

.sf-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sf-avatar-text {
  line-height: 1;
}
</style>
