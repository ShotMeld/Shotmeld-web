<template>
  <SfNavbar title="ShotMeld" transparent>
    <template #actions>
      <SfNavLink :to="currentPage === 'timeline' ? '/photowall' : '/timeline'">
        <template #icon>
          <i :class="currentPage === 'timeline' ? 'fas fa-th' : 'fas fa-calendar-alt'"></i>
        </template>
        {{ currentPage === 'timeline' ? '照片墙' : '时间轴' }}
      </SfNavLink>
      
      <SfButton 
        type="secondary" 
        @click="$emit('show-upload')"
        class="navbar-button"
      >
        <template #prefix>
          <i class="fas fa-cloud-upload-alt"></i>
        </template>
        上传照片
      </SfButton>
      
      <SfButton 
        type="secondary" 
        @click="$emit('show-album-form')"
        class="navbar-button"
      >
        <template #prefix>
          <i class="fas fa-folder-plus"></i>
        </template>
        新建相册
      </SfButton>
      
      <div class="user-dropdown">
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
/* 导航栏按钮样式 */
.navbar-button {
  display: flex;
  align-items: center;
}

.navbar-button :deep(.sf-button__text) {
  margin-left: var(--spacing-sm);
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
</style>