import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // 将开发环境中的API请求代理到后端
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'https://api.shotmeld.seeridia.top',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false, // 忽略HTTPS证书验证
        headers: {
          // 模拟来自允许的源的请求
          'Origin': 'https://shotmeld.seeridia.top'
        }
      }
    }
  }
})
