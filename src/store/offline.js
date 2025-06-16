/* global navigator */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { offlineManager } from '../utils/offlineManager'

export const useOfflineStore = defineStore('offline', () => {
  // 状态
  const isOnline = ref(navigator.onLine)
  const cachedPhotosCount = ref(0)
  const cachedAlbumsCount = ref(0)
  const pendingActionsCount = ref(0)
  const lastSyncTime = ref(null)

  // 计算属性
  const hasOfflineData = computed(() => {
    return cachedPhotosCount.value > 0 || cachedAlbumsCount.value > 0
  })

  const hasPendingActions = computed(() => {
    return pendingActionsCount.value > 0
  })

  const offlineStatus = computed(() => {
    if (isOnline.value) {
      return hasPendingActions.value ? 'syncing' : 'online'
    }
    return hasOfflineData.value ? 'offline-with-data' : 'offline-no-data'
  })

  // 方法
  const updateOnlineStatus = status => {
    isOnline.value = status
  }

  const updateCachedCounts = async () => {
    try {
      const cachedPhotos = await offlineManager.getCachedPhotos()
      const cachedAlbums = await offlineManager.getCachedAlbums()

      cachedPhotosCount.value = cachedPhotos ? cachedPhotos.length : 0
      cachedAlbumsCount.value = cachedAlbums ? cachedAlbums.length : 0
    } catch (error) {
      console.error('更新缓存计数失败:', error)
    }
  }

  const updatePendingActionsCount = async () => {
    try {
      // 这里需要实现获取待同步操作数量的方法
      // 暂时设为0
      pendingActionsCount.value = 0
    } catch (error) {
      console.error('更新待同步操作计数失败:', error)
    }
  }

  const updateLastSyncTime = () => {
    lastSyncTime.value = new Date()
  }

  const clearOfflineData = async () => {
    try {
      await offlineManager.cleanupCache()
      await updateCachedCounts()
      await updatePendingActionsCount()
    } catch (error) {
      console.error('清理离线数据失败:', error)
    }
  }

  // 初始化
  const initialize = async () => {
    // 设置网络状态监听
    window.addEventListener('online', () => {
      updateOnlineStatus(true)
    })

    window.addEventListener('offline', () => {
      updateOnlineStatus(false)
    })

    // 更新计数
    await updateCachedCounts()
    await updatePendingActionsCount()
  }

  return {
    // 状态
    isOnline,
    cachedPhotosCount,
    cachedAlbumsCount,
    pendingActionsCount,
    lastSyncTime,

    // 计算属性
    hasOfflineData,
    hasPendingActions,
    offlineStatus,

    // 方法
    updateOnlineStatus,
    updateCachedCounts,
    updatePendingActionsCount,
    updateLastSyncTime,
    clearOfflineData,
    initialize,
  }
})
