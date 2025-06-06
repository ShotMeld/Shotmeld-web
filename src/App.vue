<template>
  <div id="app">
    <router-view v-slot="{ Component, route }">
      <transition
        :name="getTransitionName(route)"
        mode="out-in"
        appear
      >
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n';

export default {
  name: 'App',
  data() {
    return {
      previousRoute: null
    }
  },
  methods: {
    getTransitionName(route) {
      // 在登录页和主页之间的双向切换都使用过渡动画
      if (
        (this.previousRoute?.path === '/login' && route.path === '/photowall') ||
        (this.previousRoute?.path === '/photowall' && route.path === '/login')
      ) {
        return 'page-fade';
      }
      return ''; // 其他情况不使用过渡动画
    }
  },
  beforeMount() {
    // 监听路由变化，记录前一个路由
    this.$router.beforeEach((to, from) => {
      this.previousRoute = from;
    });
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

/* 页面过渡效果 */
.page-fade-enter-active {
  transition: all 1.0s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-fade-leave-active {
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.96);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(1.04);
}
</style>
