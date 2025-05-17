import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authService } from '@/api'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)

  const setUser = (userData) => {
    user.value = userData
  }

  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials)
      setUser(response.data.user)
      setToken(response.data.token)
      return response
    } catch (error) {
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      setUser(response.data.user)
      setToken(response.data.token)
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.getCurrentUser()
      setUser(response.data.user)
      return response
    } catch (error) {
      throw error
    }
  }

  return {
    user,
    token,
    login,
    register,
    logout,
    updateProfile
  }
}) 