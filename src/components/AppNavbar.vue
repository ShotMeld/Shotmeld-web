<template>
  <SfNavbar title="ShotMeld" transparent>
    <template #brand>
      <!-- 移动端菜单按钮和标题 -->
      <div class="navbar-brand">
        <button class="mobile-menu-button" @click="isMobileMenuOpen = !isMobileMenuOpen">
          <i class="fas fa-bars"></i>
        </button>
        <router-link to="/" class="navbar-title">ShotMeld</router-link>
      </div>
    </template>
    
    <template #actions>
      <!-- 导航菜单容器 -->
      <div class="nav-actions" :class="{ 'is-mobile-open': isMobileMenuOpen }">
        <SfNavLink :to="currentPage === 'timeline' ? '/photowall' : '/timeline'" class="nav-item">
          <template #icon>
            <i :class="currentPage === 'timeline' ? 'fas fa-th' : 'fas fa-calendar-alt'"></i>
          </template>
          {{ currentPage === 'timeline' ? '照片墙' : '时间轴' }}
        </SfNavLink>
        
        <SfButton 
          type="secondary" 
          @click="$emit('show-upload')"
          class="navbar-button nav-item"
        >
          <template #prefix>
            <i class="fas fa-cloud-upload-alt"></i>
          </template>
          上传照片
        </SfButton>
        
        <SfButton 
          type="secondary" 
          @click="$emit('show-album-form')"
          class="navbar-button nav-item"
        >
          <template #prefix>
            <i class="fas fa-folder-plus"></i>
          </template>
          新建相册
        </SfButton>
        
        <div class="user-dropdown nav-item">
          <SfAvatar 
            :text="userName" 
            size="small" 
            class="user-avatar"
          />
          <div class="dropdown-menu">
            <SfNavLink to="/profile">
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
</template>

<script>
export default {
  name: 'AppNavbar',
  props: {
    userName: {
      type: String,
      default: '用户'
    },
    currentPage: {
      type: String,
      default: 'photowall',
      validator: (value) => ['photowall', 'timeline'].includes(value)
    }
  },
  data() {
    return {
      isMobileMenuOpen: false
    }
  },
  emits: ['show-upload', 'show-album-form'],
  methods: {
    handleLogout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>

/* 导航栏标题和品牌区域 */
.navbar-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.navbar-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  text-decoration: none;
}

/* 导航栏按钮样式 */
.navbar-button {
  display: flex;
  align-items: center;
}

.navbar-button :deep(.sf-button__text) {
  margin-left: var(--spacing-sm);
}

/* 移动端菜单按钮 */
.mobile-menu-button {
  display: none;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 1.5rem;
  cursor: pointer;
  padding: var(--spacing-xs);
}

/* 导航项容器 */
.nav-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

/* 用户下拉菜单 */
.user-dropdown {
  position: relative;
  margin-left: var(--spacing-sm);
}

.user-avatar {
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background-color: var(--bg-primary);
  border-radius: var(--radius-large);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06), 0 16px 32px rgba(0, 0, 0, 0.06);
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(var(--spacing-xs));
  transition: all var(--transition-fast);
  overflow: hidden;
  z-index: 10;
}

.user-dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(var(--spacing-2xs));
}

/* 移动端适配 */
@media (max-width: 768px) {
  .mobile-menu-button {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-actions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    background-color: var(--bg-primary);
    padding: var(--spacing-sm);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: none;
  }

  .nav-actions.is-mobile-open {
    display: flex;
  }

  .nav-item {
    width: 100%;
  }

  .user-dropdown {
    margin: 0;
  }

  .dropdown-menu {
    position: static;
    box-shadow: none;
    opacity: 1;
    visibility: visible;
    transform: none;
    margin-top: var(--spacing-xs);
  }
}
</style>