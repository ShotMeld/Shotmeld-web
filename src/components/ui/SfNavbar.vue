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
      default: 'ShotMeld'
    },
    transparent: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.sf-navbar {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background-color: var(--bg-primary);
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-small);
  z-index: 100;
}

.sf-navbar--transparent {
  background-color: rgba(255, 255, 255, 0.8);
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
