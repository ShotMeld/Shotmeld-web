import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// 获取保存的token并设置axios默认请求头
const token = localStorage.getItem('token')
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

const app = createApp(App)
app.use(router)
app.mount('#app')
