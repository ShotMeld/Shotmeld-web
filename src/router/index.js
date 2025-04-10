import { createRouter, createWebHistory } from 'vue-router'
import Register from '../components/Register.vue'

const routes = [
  {
    path: '/',
    redirect: '/register'
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router