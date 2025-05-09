import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import apiClient from './api'
import axios from 'axios'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 保留原有axios配置以避免影响现有功能，后续逐步迁移到apiClient
axios.defaults.baseURL = 'http://47.96.227.28:3000'

// 请求拦截器 - 添加token
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

// 响应拦截器 - 处理401未授权
axios.interceptors.response.use(response => {
  return response
}, error => {
  if (error.response && error.response.status === 401) {
    // 清除本地存储
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // 跳转到登录页
    router.push('/login')
  }
  return Promise.reject(error)
})

// 全局挂载axios和apiClient
const app = createApp(App)
app.config.globalProperties.$http = axios // 保留兼容性
app.config.globalProperties.$api = apiClient // 新API客户端

// 获取保存的token并设置axios默认请求头
const token = localStorage.getItem('token')
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// 导入全局样式
import './styles/variables.css'

// 导入UI组件库
import SfUI from './components/ui'

// 使用Element Plus (逐步替换为SfUI)
app.use(ElementPlus)
app.use(SfUI)
app.use(router)

// 修改网站标题
document.title = 'ShotMeld - 照片管理系统'

app.mount('#app')