import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// 配置axios基础URL
axios.defaults.baseURL = 'http://120.55.78.33:3000'

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

// 全局挂载axios
const app = createApp(App)
app.config.globalProperties.$http = axios

// 获取保存的token并设置axios默认请求头
const token = localStorage.getItem('token')
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

app.use(router)
app.mount('#app')