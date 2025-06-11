<template>
  <nav class="sf-navbar" :class="{ 'sf-navbar--transparent': transparent }">
    <div class="sf-navbar-container">
      <div class="sf-navbar-brand">
        <slot name="brand">
          <router-link to="/" class="sf-navbar-logo">{{ title }}</router-link>
        </slot>
      </div>

      <div class="sf-navbar-content">
        <slot></slot>
      </div>

      <div class="sf-navbar-actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'SfNavbar',
  props: {
    title: {
      type: String,
      default: 'ShotMeld',
    },
    transparent: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style scoped>
.sf-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background-color: var(--blur-bg-medium);
  backdrop-filter: var(--blur-medium);
  -webkit-backdrop-filter: var(--blur-medium);
  box-shadow: var(--shadow-small);
  z-index: 1000;
  border-bottom: var(--border-width) solid var(--border-color);
}

.sf-navbar--transparent {
  background-color: var(--blur-bg-light);
  backdrop-filter: var(--blur-light);
  -webkit-backdrop-filter: var(--blur-light);
}

.sf-navbar-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-lg);
  max-width: var(--container-xl);
  margin: 0 auto;
}

.sf-navbar-brand {
  display: flex;
  align-items: center;
}

.sf-navbar-logo {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.sf-navbar-logo:hover {
  color: var(--color-primary-dark);
}

.sf-navbar-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.sf-navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

@media (max-width: 768px) {
  .sf-navbar {
    height: 56px;
  }

  .sf-navbar-container {
    padding: 0 var(--spacing-md);
  }
}
</style>
