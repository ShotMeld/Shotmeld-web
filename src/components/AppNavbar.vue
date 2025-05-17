<template>
  <div class="navbar-container">
    <SfNavbar title="ShotMeld" transparent>
      <template #brand>
        <!-- 移动端菜单按钮和标题 -->
        <div class="navbar-brand">
          <button class="mobile-menu-button" @click="toggleMobileMenu" aria-label="菜单">
            <span class="menu-icon" :class="{ 'is-active': isMobileMenuOpen }">
              <span></span>
              <span></span>
            </span>
          </button>
          <router-link to="/photowall" class="navbar-title">ShotMeld</router-link>
        </div>
      </template>

      <template #default>
        <!-- 主导航链接容器 -->
        <div class="main-nav">
          <SfNavLink to="/photowall" class="nav-item" :class="{ active: currentPage === 'photowall' }">
            照片墙
          </SfNavLink>

          <SfNavLink to="/timeline" class="nav-item" :class="{ active: currentPage === 'timeline' }">
            时间线
          </SfNavLink>

          <SfNavLink to="/albums" class="nav-item" :class="{ active: currentPage === 'albums' || currentPage === 'album-detail' }">
            相册
          </SfNavLink>
        </div>
      </template>

      <template #actions>
        <div class="nav-actions">
          <!-- 照片墙页面按钮 -->
          <template v-if="currentPage === 'photowall' && !isMobile">
            <SfButton type="secondary" @click="$emit('show-upload')" class="navbar-button nav-item">
              上传照片
            </SfButton>
          </template>

          <!-- 相册列表页面按钮 -->
          <template v-if="currentPage === 'albums' && !isMobile">
            <SfButton type="secondary" @click="$emit('show-album-form')" class="navbar-button nav-item">
              新建相册
            </SfButton>
          </template>

          <!-- 相册详情页面按钮 -->
          <template v-if="currentPage === 'album-detail' && !isMobile">
            <SfButton type="secondary" @click="$emit('show-upload')" class="navbar-button nav-item">
              添加照片
            </SfButton>
          </template>

          <div class="user-profile" @click="toggleUserMenu">
            <SfAvatar :text="userName" size="small" class="user-avatar" />
            <div class="user-dropdown" v-show="isUserMenuOpen" @click.stop>
              <SfNavLink to="/profile" @click="closeAllMenus">
                <template #icon>
                  <i class="fas fa-user"></i>
                </template>
                个人资料
              </SfNavLink>
              <SfNavLink href="#" @click="handleLogout">
                <template #icon>
                  <i class="fas fa-sign-out-alt"></i>
                </template>
                退出登录
              </SfNavLink>
            </div>
          </div>
        </div>
      </template>
    </SfNavbar>

    <!-- 移动端侧边抽屉菜单 -->
    <div class="mobile-drawer" :class="{ active: isMobileMenuOpen }">
      <div class="drawer-content">
        <div class="drawer-header">
          <SfAvatar :text="userName" size="medium" class="drawer-avatar" />
          <p class="drawer-username">{{ userName }}</p>
        </div>
        
        <div class="drawer-nav">
          <SfNavLink to="/photowall" class="drawer-nav-item" :class="{ active: currentPage === 'photowall' }" @click="closeMobileMenu">
            <template #icon>
              <i class="fas fa-th"></i>
            </template>
            照片墙
          </SfNavLink>
          
          <SfNavLink to="/timeline" class="drawer-nav-item" :class="{ active: currentPage === 'timeline' }" @click="closeMobileMenu">
            <template #icon>
              <i class="fas fa-calendar-alt"></i>
            </template>
            时间线
          </SfNavLink>
          
          <SfNavLink to="/albums" class="drawer-nav-item" :class="{ active: currentPage === 'albums' || currentPage === 'album-detail' }" @click="closeMobileMenu">
            <template #icon>
              <i class="fas fa-book-open"></i>
            </template>
            相册
          </SfNavLink>
          
          <SfNavLink to="/profile" class="drawer-nav-item" @click="closeMobileMenu">
            <template #icon>
              <i class="fas fa-user"></i>
            </template>
            个人资料
          </SfNavLink>
        </div>
        
        <div class="drawer-actions">
          <!-- 照片墙页面按钮 -->
          <template v-if="currentPage === 'photowall'">
            <SfButton type="primary" @click="showUploadAndCloseMenu" class="drawer-button">
              <i class="fas fa-upload"></i> 上传照片
            </SfButton>
          </template>

          <!-- 相册列表页面按钮 -->
          <template v-if="currentPage === 'albums'">
            <SfButton type="primary" @click="showAlbumFormAndCloseMenu" class="drawer-button">
              <i class="fas fa-plus"></i> 新建相册
            </SfButton>
          </template>

          <!-- 相册详情页面按钮 -->
          <template v-if="currentPage === 'album-detail'">
            <SfButton type="primary" @click="showUploadAndCloseMenu" class="drawer-button">
              <i class="fas fa-upload"></i> 添加照片
            </SfButton>
          </template>
          
          <SfButton type="secondary" @click="handleLogout" class="drawer-button logout-button">
            退出登录
          </SfButton>
        </div>
      </div>
    </div>
    
    <!-- 背景遮罩 -->
    <div class="drawer-backdrop" v-show="isMobileMenuOpen" @click="closeMobileMenu"></div>
  </div>
</template>

<script>
import { SfNavbar, SfNavLink, SfButton, SfAvatar } from '../components/ui'

export default {
  name: 'AppNavbar',
  components: {
    SfNavbar,
    SfNavLink,
    SfButton,
    SfAvatar
  },
  props: {
    userName: {
      type: String,
      default: '用户'
    },
    currentPage: {
      type: String,
      default: 'photowall',
      validator: (value) => ['photowall', 'timeline', 'albums', 'album-detail'].includes(value)
    }
  },
  data() {
    return {
      isMobileMenuOpen: false,
      isUserMenuOpen: false,
      windowWidth: window.innerWidth
    }
  },
  computed: {
    isMobile() {
      return this.windowWidth <= 768
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
    document.addEventListener('click', this.handleDocumentClick)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
    document.removeEventListener('click', this.handleDocumentClick)
  },
  emits: ['show-upload', 'show-album-form'],
  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth
      if (this.windowWidth > 768) {
        this.closeMobileMenu()
      }
    },
    handleDocumentClick(event) {
      // 如果点击的不是用户菜单区域，关闭用户菜单
      const userDropdown = this.$el.querySelector('.user-profile')
      if (userDropdown && !userDropdown.contains(event.target)) {
        this.isUserMenuOpen = false
      }
    },
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen
      if (this.isMobileMenuOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    },
    closeMobileMenu() {
      this.isMobileMenuOpen = false
      document.body.style.overflow = ''
    },
    toggleUserMenu(event) {
      event.stopPropagation()
      this.isUserMenuOpen = !this.isUserMenuOpen
    },
    closeAllMenus() {
      this.isMobileMenuOpen = false
      this.isUserMenuOpen = false
      document.body.style.overflow = ''
    },
    showUploadAndCloseMenu() {
      this.$emit('show-upload')
      this.closeMobileMenu()
    },
    showAlbumFormAndCloseMenu() {
      this.$emit('show-album-form')
      this.closeMobileMenu()
    },
    handleLogout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.closeAllMenus()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
/* 整体容器 */
.navbar-container {
  position: relative;
  z-index: 30; /* 确保导航栏在抽屉菜单之上 */
}

/* 导航栏标题和品牌区域 */
.navbar-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 200px;
}

.navbar-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  text-decoration: none;
  font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Dancing Script", cursive;
  font-weight: 600;
}

/* 主导航链接容器 */
.main-nav {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--spacing-xl);
}

.nav-item {
  position: relative;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary);
  border-radius: 1px;
}

/* 导航栏按钮样式 */
.navbar-button {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  height: 36px;
  border-radius: 18px;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.navbar-button:active {
  transform: scale(0.98);
}

.navbar-button :deep(.sf-button__text) {
  margin: 0;
  font-weight: 500;
}

/* 移动端菜单按钮 */
.mobile-menu-button {
  display: none;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: var(--spacing-xs);
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 25;
}

.menu-icon {
  position: relative;
  width: 24px;
  height: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.menu-icon span {
  display: block;
  width: 100%;
  height: 2px;
  background-color: var(--text-primary);
  border-radius: 1px;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.menu-icon.is-active span:nth-child(1) {
  transform: translateY(9px) rotate(45deg);
}

.menu-icon.is-active span:nth-child(2) {
  transform: translateY(-9px) rotate(-45deg);
}

/* 导航项容器 */
.nav-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 200px;
  justify-content: flex-end;
}

/* 用户下拉菜单 */
.user-profile {
  position: relative;
  cursor: pointer;
}

.user-avatar {
  border: 2px solid transparent;
  transition: border-color 0.2s ease;
}

.user-profile:hover .user-avatar {
  border-color: var(--primary-light);
}

.user-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  background-color: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1), 0 8px 20px rgba(0, 0, 0, 0.05);
  min-width: 200px;
  z-index: 20;
  overflow: hidden;
  opacity: 0;
  visibility: hidden;
  transform: scale(0.95) translateY(-8px);
  transform-origin: top right;
  transition: all 0.2s cubic-bezier(0.23, 1, 0.32, 1);
}

.user-dropdown:global(.shown) {
  opacity: 1;
  visibility: visible;
  transform: scale(1) translateY(0);
}

.user-dropdown:before {
  content: '';
  position: absolute;
  top: -6px;
  right: 12px;
  width: 12px;
  height: 12px;
  background-color: var(--bg-primary);
  transform: rotate(45deg);
  border-radius: 2px;
  z-index: -1;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .mobile-menu-button {
    display: flex;
  }

  .main-nav {
    display: none;
  }
}

/* 侧边抽屉菜单样式 */
.mobile-drawer {
  position: fixed;
  top: 0;
  left: 0;
  width: 85%;
  max-width: 320px;
  height: 100%;
  background-color: var(--bg-primary);
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.15);
  transform: translateX(-100%);
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 20;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding-top: 60px; /* 为导航栏留出空间 */
}

.mobile-drawer.active {
  transform: translateX(0);
}

.drawer-content {
  display: flex;
  flex-direction: column;
  height: calc(100% - 60px); /* 减去导航栏高度 */
  padding: var(--spacing-xl);
}

.drawer-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.drawer-avatar {
  width: 50px;
  height: 50px;
}

.drawer-username {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin: 0;
}

.drawer-nav {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.drawer-nav-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-sm);
  color: var(--text-primary);
  text-decoration: none;
  font-size: var(--font-size-md);
  border-radius: 10px;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.drawer-nav-item:active {
  background-color: rgba(0, 0, 0, 0.05);
}

.drawer-nav-item.active {
  color: var(--primary);
  background-color: rgba(var(--primary-rgb), 0.1);
}

.drawer-nav-item :deep(.sf-nav-link__icon) {
  margin-right: var(--spacing-md);
  width: 24px;
  text-align: center;
  font-size: 18px;
}

.drawer-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.drawer-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-md);
  border-radius: 12px;
  height: 48px;
  font-weight: var(--font-weight-medium);
}

.drawer-button i {
  margin-right: var(--spacing-sm);
}

.logout-button {
  background-color: rgba(var(--danger-rgb), 0.1);
  color: var(--danger);
  border: none;
}

/* 背景遮罩 */
.drawer-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(3px);
  z-index: 15;
  transition: opacity 0.35s ease;
}
</style>