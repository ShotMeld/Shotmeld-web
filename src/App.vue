<template>
  <div id="app">
    <div class="language-switcher">
      <select v-model="currentLanguage" @change="changeLanguage">
        <option value="zh-CN">中文</option>
        <option value="en">English</option>
      </select>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n';

export default {
  name: 'App',
  setup() {
    const { locale } = useI18n();
    return { locale };
  },
  data() {
    return {
      currentLanguage: 'zh-CN'
    }
  },
  methods: {
    changeLanguage() {
      this.locale = this.currentLanguage;
    }
  }
}
</script>

<style>
#app {
  font-family: var(--font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-primary);
  margin: 0;
  padding: 0;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  line-height: 1.5;
}

/* 全局链接样式 */
a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: rgba(0, 122, 255, 0.8);
}

/* 全局过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.language-switcher {
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>
