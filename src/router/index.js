import { createRouter, createWebHistory } from 'vue-router'
// 将非首屏必需的组件改为懒加载
const AuthPage = () => import('../views/auth/AuthPage.vue')
const ProfilePage = () => import('../views/ProfilePage.vue')
const SettingsPage = () => import('../views/SettingsPage.vue')
const MorePage = () => import('../views/MorePage.vue')
const DuplicatePhotosPage = () => import('../views/More/DuplicatePhotosPage.vue')
const BaseLayout = () => import('../layout/BaseLayout.vue')

const routes = [
  {
    path: '/',
    redirect: '/photowall',
  },
  {
    path: '/register',
    name: 'Register',
    component: AuthPage,
  },
  {
    path: '/login',
    name: 'Login',
    component: AuthPage,
  },
  {
    path: '/share/:id',
    name: 'SharePhoto',
    component: () => import('../views/SharePhotoView.vue'),
    // 共享页面无需认证
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: BaseLayout,
    children: [
      {
        path: 'photowall',
        name: 'PhotoWall',
        component: () => import('../views/PhotoWall/PhotoWall.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: ProfilePage,
        meta: { requiresAuth: true },
      },
      {
        path: 'timeline',
        name: 'Timeline',
        component: () => import('../views/TimelineView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'albums',
        name: 'Albums',
        component: () => import('../views/AlbumView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'album/:id',
        name: 'AlbumDetail',
        component: () => import('../views/AlbumDetailView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: SettingsPage,
        meta: { requiresAuth: true },
      },
      {
        path: 'more',
        name: 'More',
        component: MorePage,
        meta: { requiresAuth: true },
      },
      {
        path: 'duplicate-photos',
        name: 'DuplicatePhotos',
        component: DuplicatePhotosPage,
        meta: { requiresAuth: true },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 添加导航守卫，保护需要登录的页面
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')

  // 如果页面明确设置了 requiresAuth: false，则不需要验证
  if (to.meta.requiresAuth === false) {
    next()
    return
  }

  // 检查是否有任何匹配的路由需要认证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth === true)

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
