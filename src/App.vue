<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
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

/* 全局滚动条样式 - 不占用空间且不滑动时隐藏 */
::-webkit-scrollbar {
  width: var(--scrollbar-width);
  height: var(--scrollbar-height);
}

::-webkit-scrollbar-track {
  background: var(--scrollbar-track-color);
}

::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb-color);
  border-radius: var(--scrollbar-thumb-radius);
  transition: all 0.3s;
  opacity: 0;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover-color);
}

/* 使用现代的滚动条样式方案 */
:root {
  scrollbar-width: thin; /* Firefox的滚动条样式 */
  scrollbar-color: var(--scrollbar-thumb-color) transparent; /* Firefox的滚动条颜色 */
}

/* 应用到所有可滚动容器 */
html, body,
.scrollable-container,
.el-scrollbar,
.content-container,
div[class*="scroll"] {
  overflow-y: auto !important; /* 使用标准的auto，不使用已废弃的overlay */
  scrollbar-width: thin !important; /* Firefox */
  scroll-behavior: smooth;
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

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--color-gray);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-tertiary);
}
</style>
