import { defineStore } from 'pinia'
import { ref } from 'vue'
import { photoService } from '@/api'

export const usePhotoStore = defineStore('photo', () => {
  const photos = ref([])
  const currentPhoto = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchPhotos = async (params = {}) => {
    try {
      loading.value = true
      const response = await photoService.getPhotos(params)
      photos.value = response.data.data
      return response
    } catch (error) {
      error.value = error.response?.data?.message || '获取照片列表失败'
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchPhotoById = async id => {
    try {
      loading.value = true
      const response = await photoService.getPhotoById(id)
      currentPhoto.value = response.data.data
      return response
    } catch (error) {
      error.value = error.response?.data?.message || '获取照片详情失败'
      throw error
    } finally {
      loading.value = false
    }
  }

  const uploadPhoto = async photoData => {
    try {
      loading.value = true
      const response = await photoService.uploadPhoto(photoData)
      photos.value.unshift(response.data.data)
      return response
    } catch (error) {
      error.value = error.response?.data?.message || '上传照片失败'
      throw error
    } finally {
      loading.value = false
    }
  }

  const deletePhoto = async id => {
    try {
      loading.value = true
      await photoService.deletePhoto(id)
      photos.value = photos.value.filter(photo => photo.id !== id)
      if (currentPhoto.value?.id === id) {
        currentPhoto.value = null
      }
    } catch (error) {
      error.value = error.response?.data?.message || '删除照片失败'
      throw error
    } finally {
      loading.value = false
    }
  }

  const updatePhoto = async (id, photoData) => {
    try {
      loading.value = true
      const response = await photoService.updatePhoto(id, photoData)
      const index = photos.value.findIndex(photo => photo.id === id)
      if (index !== -1) {
        photos.value[index] = response.data.data
      }
      if (currentPhoto.value?.id === id) {
        currentPhoto.value = response.data.data
      }
      return response
    } catch (error) {
      error.value = error.response?.data?.message || '更新照片失败'
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    photos,
    currentPhoto,
    loading,
    error,
    fetchPhotos,
    fetchPhotoById,
    uploadPhoto,
    deletePhoto,
    updatePhoto,
  }
})
