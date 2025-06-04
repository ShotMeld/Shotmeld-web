import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import apiClient from './api'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { useThemeStore } from './store/theme'
import { configureNotification } from './utils/notification'
import { createI18n } from 'vue-i18n'

// apiClient已经在api/index.js中配置完成，这里不需要额外配置

// 创建Vue应用实例
const app = createApp(App)
// 创建 Pinia 实例
const pinia = createPinia()

// 全局挂载apiClient
app.config.globalProperties.$api = apiClient
// 向后兼容：将$http指向apiClient，以便现有组件可以继续使用$http
app.config.globalProperties.$http = apiClient

// token已在apiClient的拦截器中处理

// 导入全局样式
import './styles/variables.css'
import './styles/scrollbar.css'
import './styles/notification.css'

// 导入UI组件库
import SfUI from './components/ui'

// 使用Element Plus (逐步替换为SfUI)
app.use(ElementPlus)
app.use(SfUI)
app.use(router)
app.use(pinia)

// 配置通知组件
configureNotification(app)

// 初始化主题
const themeStore = useThemeStore(pinia)
themeStore.initTheme()

// 修改网站标题
document.title = 'ShotMeld - 照片管理系统'

const messages = {
  'zh-CN': {
    message: {
      hello: '你好',
      welcome: '欢迎使用ShotMeld'
    },
    settings: {
      title: '设置',
      subtitle: '自定义您的 ShotMeld 体验',
      theme: {
        title: '主题',
        description: '选择您喜欢的界面主题',
        light: '浅色模式',
        dark: '深色模式',
        system: '跟随系统'
      },
      language: {
        title: '语言',
        description: '选择您偏好的界面语言',
        zh: '中文',
        en: 'English'
      }
    },
    profile: {
      loading: '正在加载个人信息...',
      email: '邮箱',
      registerDate: '注册时间',
      photos: '照片',
      noPhotos: '无照片',
      albums: '相册',
      noAlbums: '未创建',
      logout: '退出登录',
      fetchError: '获取用户信息失败:'
    },
    sharePhoto: {
      loading: '正在加载照片...',
      error: {
        title: '照片不存在或未分享',
        homeButton: '返回首页',
        invalidId: '照片ID无效',
        loadFailed: '加载共享照片失败:',
        notFound: '照片不存在或未分享',
        imageLoadFailed: '照片加载失败'
      },
      defaultTitle: '共享照片',
      download: '下载',
      imageLoading: '正在加载图片...',
      pageTitle: 'Shotmeld 共享照片',
      timeline: {
        loading: '正在加载时间轴...',
        retry: '重试',
        year: '年',
        month: '月',
        photos: '张照片',
        noTitle: '无标题',
        uploadModal: {
          title: '上传照片'
        },
        error: {
          fetchFailed: '获取照片失败:',
          loadFailed: '加载时间轴失败，请重试',
          deleteFailed: '删除照片失败:',
          deleteFailedTitle: '删除失败',
          deleteFailedMessage: '无法删除照片，请重试'
        },
        editPhoto: '编辑照片:',
        editPhotoComingSoon: '编辑照片功能将在后续版本实现',
        uploadSuccess: {
          title: '上传成功',
          message: '已成功上传 {count} 张照片'
        },
        deleteSuccess: {
          title: '成功',
          message: '照片已删除'
        }
      }
    }
  },
  'en': {
    message: {
      hello: 'Hello',
      welcome: 'Welcome to ShotMeld'
    },
    settings: {
      title: 'Settings',
      subtitle: 'Customize your ShotMeld experience',
      theme: {
        title: 'Theme',
        description: 'Choose your preferred interface theme',
        light: 'Light Mode',
        dark: 'Dark Mode',
        system: 'Follow System'
      },
      language: {
        title: 'Language',
        description: 'Choose your preferred interface language',
        zh: '中文',
        en: 'English'
      }
    },
    profile: {
      loading: 'Loading profile information...',
      email: 'Email',
      registerDate: 'Registration Date',
      photos: 'Photos',
      noPhotos: 'No Photos',
      albums: 'Albums',
      noAlbums: 'No Albums',
      logout: 'Logout',
      fetchError: 'Failed to fetch user information:'
    },
    sharePhoto: {
      loading: 'Loading photo...',
      error: {
        title: 'Photo does not exist or is not shared',
        homeButton: 'Return to Home',
        invalidId: 'Invalid photo ID',
        loadFailed: 'Failed to load shared photo:',
        notFound: 'Photo does not exist or is not shared',
        imageLoadFailed: 'Failed to load photo'
      },
      defaultTitle: 'Shared Photo',
      download: 'Download',
      imageLoading: 'Loading image...',
      pageTitle: 'Shotmeld Shared Photo',
      timeline: {
        loading: 'Loading timeline...',
        retry: 'Retry',
        year: 'Year',
        month: 'Month',
        photos: 'Photos',
        noTitle: 'No Title',
        uploadModal: {
          title: 'Upload Photo'
        },
        error: {
          fetchFailed: 'Failed to fetch photos:',
          loadFailed: 'Failed to load timeline, please try again',
          deleteFailed: 'Failed to delete photo:',
          deleteFailedTitle: 'Delete Failed',
          deleteFailedMessage: 'Unable to delete photo, please try again'
        },
        editPhoto: 'Edit photo:',
        editPhotoComingSoon: 'Photo editing feature will be implemented in future versions',
        uploadSuccess: {
          title: 'Upload Success',
          message: 'Successfully uploaded {count} photos'
        },
        deleteSuccess: {
          title: 'Success',
          message: 'Photo has been deleted'
        }
      }
    }
  }
}

const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages
})

app.use(i18n)

app.mount('#app')