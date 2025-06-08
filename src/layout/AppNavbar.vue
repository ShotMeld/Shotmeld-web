<!--
  AppNavbar.vue - 导航栏
-->

<template>
  <div class="navbar-container">
    <SfNavbar title="ShotMeld" transparent>
      <template #brand>
        <!-- 移动端菜单按钮和标题 -->
        <div class="navbar-brand">
          <button
            class="mobile-menu-button"
            @click="toggleMobileMenu"
            :aria-label="$t('navbar.mobile.menuAriaLabel')"
          >
            <span class="menu-icon" :class="{ 'is-active': isMobileMenuOpen }">
              <span></span>
              <span></span>
            </span>
          </button>
          <router-link to="/photowall" class="navbar-title">
            <img src="@/assets/LOGO/LOGO.svg" alt="ShotMeld Logo" class="navbar-logo" />
            ShotMeld
          </router-link>
        </div>
      </template>

      <template #default>
        <!-- 主导航链接容器 -->
        <div class="main-nav">
          <SfNavLink
            to="/photowall"
            class="nav-item"
            :class="{ active: currentPage === 'photowall' }"
          >
            {{ $t('navbar.menu.photos') }}
          </SfNavLink>

          <SfNavLink
            to="/timeline"
            class="nav-item"
            :class="{ active: currentPage === 'timeline' }"
          >
            {{ $t('navbar.menu.memories') }}
          </SfNavLink>

          <SfNavLink
            to="/albums"
            class="nav-item"
            :class="{ active: currentPage === 'albums' || currentPage === 'album-detail' }"
          >
            {{ $t('navbar.menu.albums') }}
          </SfNavLink>

          <SfNavLink to="/more" class="nav-item" :class="{ active: currentPage === 'more' }">
            {{ $t('navbar.menu.more') }}
          </SfNavLink>
        </div>
      </template>

      <!-- 页面左侧按钮和部分页面导览 -->
      <template #actions>
        <div class="nav-actions">
          <!-- 设置页面导航项 -->
          <SfNavLink
            v-if="currentPage === 'settings' && !isMobile"
            to="/settings"
            class="nav-item"
            :class="{ active: currentPage === 'settings' }"
          >
            {{ $t('navbar.menu.settings') }}
          </SfNavLink>

          <!-- 个人页面导航项 -->
          <SfNavLink
            v-if="currentPage === 'profile' && !isMobile"
            to="/profile"
            class="nav-item"
            :class="{ active: currentPage === 'profile' }"
          >
            {{ $t('navbar.menu.profile') }}
          </SfNavLink>
          <!-- 更多页面各个工具的导航页 -->
          <SfNavLink
            v-if="currentPage === 'DuplicatePhotos' && !isMobile"
            to="/duplicate-photos"
            class="nav-item"
            :class="{ active: currentPage === 'DuplicatePhotos' }"
          >
            {{ $t('navbar.menu.duplicatePhotos') }}
          </SfNavLink>

          <!-- 时间线页面按钮 -->
          <template v-if="currentPage === 'timeline' && !isMobile">
            <SfButton type="secondary" @click="$emit('show-upload')" class="navbar-button nav-item">
              {{ $t('navbar.actions.upload') }}
            </SfButton>
          </template>

          <!-- 照片墙页面按钮 -->
          <template v-if="currentPage === 'photowall' && !isMobile">
            <SfButton type="secondary" @click="$emit('show-upload')" class="navbar-button nav-item">
              {{ $t('navbar.actions.upload') }}
            </SfButton>
            <SfButton
              type="secondary"
              @click="$emit('toggle-manage')"
              class="navbar-button nav-item"
            >
              {{ $t('navbar.actions.manage') }}
            </SfButton>
          </template>

          <!-- 相册列表页面按钮 -->
          <template v-if="currentPage === 'albums' && !isMobile">
            <SfButton
              type="secondary"
              @click="$emit('show-album-form')"
              class="navbar-button nav-item"
            >
              {{ $t('navbar.actions.createAlbum') }}
            </SfButton>
            <SfButton
              type="secondary"
              @click="$emit('toggle-album-manage')"
              class="navbar-button nav-item"
            >
              {{ $t('navbar.actions.manage') }}
            </SfButton>
          </template>

          <!-- 相册详情页面按钮 -->
          <template v-if="currentPage === 'album-detail' && !isMobile">
            <SfButton type="secondary" @click="$emit('show-upload')" class="navbar-button nav-item">
              {{ $t('navbar.actions.addPhotos') }}
            </SfButton>
            <SfButton
              type="secondary"
              @click="$emit('toggle-manage')"
              class="navbar-button nav-item"
            >
              {{ $t('navbar.actions.manage') }}
            </SfButton>
          </template>

          <div class="user-profile" @click="toggleUserMenu">
            <SfAvatar :text="userName" size="small" class="user-avatar" />
            <transition name="dropdown">
              <div class="user-dropdown" v-if="isUserMenuOpen" @click.stop>
                <div class="dropdown-header">
                  <span class="dropdown-title">{{ userName }}</span>
                </div>
                <div class="dropdown-links">
                  <SfNavLink to="/profile" @click="closeAllMenus" class="dropdown-link">
                    <template #icon>
                      <i class="fas fa-user"></i>
                    </template>
                    {{ $t('navbar.menu.profile') }}
                  </SfNavLink>
                  <SfNavLink to="/settings" @click="closeAllMenus" class="dropdown-link">
                    <template #icon>
                      <i class="fas fa-gear"></i>
                    </template>
                    {{ $t('navbar.menu.settings') }}
                  </SfNavLink>
                  <SfNavLink href="#" @click="handleLogout" class="dropdown-link logout-link">
                    <template #icon>
                      <i class="fas fa-sign-out-alt"></i>
                    </template>
                    {{ $t('navbar.actions.logout') }}
                  </SfNavLink>
                </div>
              </div>
            </transition>
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
          <SfNavLink
            to="/photowall"
            class="drawer-nav-item"
            :class="{ active: currentPage === 'photowall' }"
            @click="closeMobileMenu"
          >
            <template #icon>
              <i class="fas fa-th"></i>
            </template>
            {{ $t('navbar.menu.photos') }}
          </SfNavLink>

          <SfNavLink
            to="/timeline"
            class="drawer-nav-item"
            :class="{ active: currentPage === 'timeline' }"
            @click="closeMobileMenu"
          >
            <template #icon>
              <i class="fas fa-calendar-alt"></i>
            </template>
            {{ $t('navbar.menu.memories') }}
          </SfNavLink>

          <SfNavLink
            to="/albums"
            class="drawer-nav-item"
            :class="{ active: currentPage === 'albums' || currentPage === 'album-detail' }"
            @click="closeMobileMenu"
          >
            <template #icon>
              <i class="fas fa-book-open"></i>
            </template>
            {{ $t('navbar.menu.albums') }}
          </SfNavLink>

          <SfNavLink
            to="/more"
            class="drawer-nav-item"
            :class="{ active: currentPage === 'more' }"
            @click="closeMobileMenu"
          >
            <template #icon>
              <i class="fas fa-ellipsis-h"></i>
            </template>
            {{ $t('navbar.menu.more') }}
          </SfNavLink>

          <SfNavLink to="/profile" class="drawer-nav-item" @click="closeMobileMenu">
            <template #icon>
              <i class="fas fa-user"></i>
            </template>
            {{ $t('navbar.menu.profile') }}
          </SfNavLink>

          <SfNavLink to="/settings" class="drawer-nav-item" @click="closeMobileMenu">
            <template #icon>
              <i class="fas fa-gear"></i>
            </template>
            {{ $t('navbar.menu.settings') }}
          </SfNavLink>
        </div>

        <div class="drawer-actions">
          <!-- 照片墙页面按钮 -->
          <template v-if="currentPage === 'photowall'">
            <SfButton type="primary" @click="showUploadAndCloseMenu" class="drawer-button">
              <i class="fas fa-upload"></i>
              {{ $t('navbar.actions.upload') }}
            </SfButton>
            <SfButton type="primary" @click="toggleManageAndCloseMenu" class="drawer-button">
              <i class="fas fa-tasks"></i>
              {{ $t('navbar.actions.manage') }}
            </SfButton>
          </template>

          <!-- 相册列表页面按钮 -->
          <template v-if="currentPage === 'albums'">
            <SfButton type="primary" @click="showAlbumFormAndCloseMenu" class="drawer-button">
              <i class="fas fa-plus"></i>
              {{ $t('navbar.actions.createAlbum') }}
            </SfButton>
            <SfButton type="primary" @click="toggleAlbumManageAndCloseMenu" class="drawer-button">
              <i class="fas fa-tasks"></i>
              {{ $t('navbar.actions.manage') }}
            </SfButton>
          </template>

          <!-- 相册详情页面按钮 -->
          <template v-if="currentPage === 'album-detail'">
            <SfButton type="primary" @click="showUploadAndCloseMenu" class="drawer-button">
              <i class="fas fa-upload"></i>
              {{ $t('navbar.actions.addPhotos') }}
            </SfButton>
            <SfButton type="primary" @click="toggleManageAndCloseMenu" class="drawer-button">
              <i class="fas fa-tasks"></i>
              {{ $t('navbar.actions.manage') }}
            </SfButton>
          </template>

          <SfButton type="secondary" @click="handleLogout" class="drawer-button logout-button">
            {{ $t('navbar.actions.logout') }}
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
    SfAvatar,
  },
  props: {
    userName: {
      type: String,
      default() {
        return this.$t('navbar.defaultUser')
      },
    },
    currentPage: {
      type: String,
      default: 'photowall',
      validator: value =>
        [
          'photowall',
          'timeline',
          'albums',
          'album-detail',
          'settings',
          'profile',
          'more',
          'DuplicatePhotos',
        ].includes(value),
    },
  },
  data() {
    return {
      isMobileMenuOpen: false,
      isUserMenuOpen: false,
      windowWidth: window.innerWidth,
    }
  },
  computed: {
    isMobile() {
      return this.windowWidth <= 768
    },
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
    document.addEventListener('click', this.handleDocumentClick)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
    document.removeEventListener('click', this.handleDocumentClick)
  },
  emits: ['show-upload', 'show-album-form', 'toggle-manage', 'toggle-album-manage'],
  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth
      if (this.windowWidth > 768) {
        this.closeMobileMenu()
      }
    },
    handleDocumentClick(event) {
      // 如果点击的不是用户菜单区域，关闭用户菜单
      const userProfile = this.$el.querySelector('.user-profile')
      if (userProfile && !userProfile.contains(event.target)) {
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
    toggleManageAndCloseMenu() {
      this.$emit('toggle-manage')
      this.closeMobileMenu()
    },
    toggleAlbumManageAndCloseMenu() {
      this.$emit('toggle-album-manage')
      this.closeMobileMenu()
    },
    handleLogout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.closeAllMenus()
      this.$router.push('/login')
    },
  },
}
</script>

<style scoped>
/* 整体容器 */
.navbar-container {
  position: relative;
  z-index: 30;
  /* 确保导航栏在抽屉菜单之上 */
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
  font-family: 'Dancing Script', cursive;
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.navbar-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
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
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
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
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
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
  top: calc(100% + 12px);
  background-color: var(--bg-primary);
  border-radius: 16px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.08),
    0 8px 16px rgba(0, 0, 0, 0.03);
  width: auto;
  z-index: 20;
  overflow: hidden;
  transform-origin: top right;
  transition: all 0.25s cubic-bezier(0.23, 1, 0.32, 1);
  border: 1px solid rgba(0, 0, 0, 0.03);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
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
  border-radius: 3px;
  box-shadow: -2px -2px 5px rgba(0, 0, 0, 0.03);
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

  .navbar-logo {
    width: 28px;
    height: 28px;
  }

  .user-profile {
    position: absolute;
    top: 16px;
    right: 16px;
    transform: translateY(0);
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
  transform: translateX(-100%);
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 20;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding-top: 60px;
}

.mobile-drawer.active {
  transform: translateX(0);
}

.drawer-content {
  display: flex;
  flex-direction: column;
  height: calc(100% - 60px);
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
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
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

/* 用户下拉菜单过渡动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 下拉菜单内部样式 */
.dropdown-header {
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.dropdown-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  display: block;
  text-align: center;
  width: 100%;
}

.dropdown-links {
  padding: 8px 0;
}

.dropdown-link {
  padding: 12px 16px;
  margin: 2px 8px;
  border-radius: 10px;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
}

.dropdown-link :deep(.sf-nav-link__content) {
  display: flex;
  align-items: center;
  width: 100%;
}

.dropdown-link :deep(.sf-nav-link__icon) {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.dropdown-link:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.dropdown-link:hover :deep(.sf-nav-link__icon) {
  color: var(--primary);
}

.logout-link {
  margin-top: 4px;
}

.logout-link:hover {
  color: var(--danger);
}

.logout-link:hover :deep(.sf-nav-link__icon) {
  color: var(--danger);
}
</style>
