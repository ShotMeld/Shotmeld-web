import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import apiClient from './api'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { useThemeStore } from './store/theme'

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

// 导入UI组件库
import SfUI from './components/ui'

// 使用Element Plus (逐步替换为SfUI)
app.use(ElementPlus)
app.use(SfUI)
app.use(router)
app.use(pinia)

// 初始化主题
const themeStore = useThemeStore(pinia)
themeStore.initTheme()

// 修改网站标题
document.title = 'ShotMeld - 照片管理系统'

app.mount('#app')