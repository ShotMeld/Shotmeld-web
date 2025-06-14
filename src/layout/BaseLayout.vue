<!--
  BaseLayout.vue - 基础布局组件
-->

<template>
  <div class="base-layout">
    <AppNavbar
      :userName="userName"
      :currentPage="currentPage"
      @show-upload="handleShowUpload"
      @show-album-form="handleShowAlbumForm"
      @toggle-manage="handleToggleManage"
      @toggle-album-manage="handleToggleAlbumManage"
    />
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
    IcpFooter,
  },
  computed: {
    currentPage() {
      const routeName = this.$route.name
      if (routeName) {
        const lowerRouteName = routeName.toLowerCase()
        // Handle AlbumDetail: expects 'album-detail'
        if (lowerRouteName === 'albumdetail') {
          return 'album-detail'
        }
        // Handle DuplicatePhotos: expects 'DuplicatePhotos' (case-sensitive for AppNavbar prop)
        if (lowerRouteName === 'duplicatephotos') {
          return 'DuplicatePhotos'
        }
        // Handle other standard pages that AppNavbar expects in lowercase
        const validLowercasePages = [
          'photowall',
          'timeline',
          'albums',
          'settings',
          'profile',
          'more',
        ]
        if (validLowercasePages.includes(lowerRouteName)) {
          return lowerRouteName
        }
      }
      return 'photowall' // Default page
    },
    userName() {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user.username || '用户'
    },
  },
  methods: {
    handleShowUpload() {
      eventBus.emit('show-upload-modal')
    },
    handleShowAlbumForm() {
      eventBus.emit('show-album-form')
    },
    handleToggleManage() {
      eventBus.emit('toggle-manage')
    },
    handleToggleAlbumManage() {
      eventBus.emit('toggle-album-manage')
    },
  },
}
</script>

<style scoped>
.base-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-gradient);
  position: relative;
}

.base-layout__content {
  margin-top: 64px;
  flex: 1;
  width: 100%;
  position: relative;
  z-index: 10;
}
</style>
