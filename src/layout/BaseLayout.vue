<!--
  BaseLayout.vue - 基础布局组件
-->

<template>
  <div class="base-layout">
    <AppNavbar :userName="userName" :currentPage="currentPage" @show-upload="handleShowUpload" @show-album-form="handleShowAlbumForm" />
    <main class="base-layout__content">
      <router-view ref="routerView"></router-view>
    </main>
    <IcpFooter />
  </div>
</template>

<script>
import AppNavbar from './AppNavbar.vue'
import IcpFooter from './IcpFooter.vue'
import { eventBus } from '../utils/eventBus'

export default {
  name: 'BaseLayout',
  components: {
    AppNavbar,
    IcpFooter
  },
  computed: {
    currentPage() {
      const routeName = this.$route.name?.toLowerCase() || 'photowall'
      // 特殊处理 AlbumDetail 路由
      if (routeName === 'albumdetail') {
        return 'album-detail'
      }
      return routeName
    },
    userName() {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user.username || '用户'
    }
  },
  methods: {
    handleShowUpload() {
      eventBus.emit('show-upload-modal')
    },
    handleShowAlbumForm() {
      eventBus.emit('show-album-form')
    }
  }
}
</script>

<style scoped>
.base-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.base-layout__content {
  margin-top: 64px;
  flex: 1;
  width: 100%;
}
</style> 