/* global navigator, indexedDB, IDBKeyRange, setInterval */
import { registerSW } from 'virtual:pwa-register'
import { ElNotification } from 'element-plus'

// 离线状态管理
class OfflineManager {
  constructor() {
    this.isOnline = navigator.onLine
    this.offlineData = new Map()
    this.setupEventListeners()
    this.initIndexedDB()
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.handleOnline()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.handleOffline()
    })
  }

  handleOnline() {
    ElNotification({
      title: '网络已连接',
      message: '网络连接已恢复，数据将自动同步',
      type: 'success',
      duration: 3000,
    })

    // 同步离线期间的数据
    this.syncOfflineData()
  }

  handleOffline() {
    ElNotification({
      title: '网络已断开',
      message: '您现在处于离线状态，可以继续浏览已缓存的内容',
      type: 'warning',
      duration: 4000,
    })
  }

  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ShotMeldOfflineDB', 1)

      request.onerror = () => reject(request.error)

      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = event => {
        const db = event.target.result

        // 创建存储照片数据的对象存储
        if (!db.objectStoreNames.contains('photos')) {
          const photosStore = db.createObjectStore('photos', { keyPath: 'id' })
          photosStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        // 创建存储相册数据的对象存储
        if (!db.objectStoreNames.contains('albums')) {
          const albumsStore = db.createObjectStore('albums', { keyPath: 'id' })
          albumsStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        // 创建存储离线操作的对象存储
        if (!db.objectStoreNames.contains('offlineActions')) {
          const actionsStore = db.createObjectStore('offlineActions', {
            keyPath: 'id',
            autoIncrement: true,
          })
          actionsStore.createIndex('timestamp', 'timestamp', { unique: false })
          actionsStore.createIndex('type', 'type', { unique: false })
        }
      }
    })
  }

  // 缓存照片数据
  async cachePhotos(photos) {
    if (!this.db) return

    const transaction = this.db.transaction(['photos'], 'readwrite')
    const store = transaction.objectStore('photos')

    for (const photo of photos) {
      await store.put({
        ...photo,
        timestamp: Date.now(),
        cached: true,
      })
    }
  }

  // 获取缓存的照片数据
  async getCachedPhotos() {
    if (!this.db) return []

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['photos'], 'readonly')
      const store = transaction.objectStore('photos')
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  // 缓存相册数据
  async cacheAlbums(albums) {
    if (!this.db) return

    const transaction = this.db.transaction(['albums'], 'readwrite')
    const store = transaction.objectStore('albums')

    for (const album of albums) {
      await store.put({
        ...album,
        timestamp: Date.now(),
        cached: true,
      })
    }
  }

  // 获取缓存的相册数据
  async getCachedAlbums() {
    if (!this.db) return []

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['albums'], 'readonly')
      const store = transaction.objectStore('albums')
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  // 存储离线操作
  async storeOfflineAction(action) {
    if (!this.db) return

    const transaction = this.db.transaction(['offlineActions'], 'readwrite')
    const store = transaction.objectStore('offlineActions')

    await store.add({
      ...action,
      timestamp: Date.now(),
      synced: false,
    })
  }

  // 同步离线数据
  async syncOfflineData() {
    if (!this.db) return

    const transaction = this.db.transaction(['offlineActions'], 'readonly')
    const store = transaction.objectStore('offlineActions')
    const request = store.getAll()

    request.onsuccess = async () => {
      const actions = request.result || []
      const unsyncedActions = actions.filter(action => !action.synced)

      for (const action of unsyncedActions) {
        try {
          console.log('Syncing offline action:', action)
          await this.markActionAsSynced(action.id)
        } catch (error) {
          console.error('Failed to sync action:', action, error)
        }
      }
    }
  }

  async markActionAsSynced(actionId) {
    if (!this.db) return

    const transaction = this.db.transaction(['offlineActions'], 'readwrite')
    const store = transaction.objectStore('offlineActions')
    const request = store.get(actionId)

    request.onsuccess = () => {
      const action = request.result
      if (action) {
        action.synced = true
        store.put(action)
      }
    }
  }

  // 清理过期的缓存数据
  async cleanupCache() {
    if (!this.db) return

    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

    // 清理照片缓存
    const photosTransaction = this.db.transaction(['photos'], 'readwrite')
    const photosStore = photosTransaction.objectStore('photos')
    const photosIndex = photosStore.index('timestamp')
    const photosRequest = photosIndex.openCursor(IDBKeyRange.upperBound(oneWeekAgo))

    photosRequest.onsuccess = event => {
      const cursor = event.target.result
      if (cursor) {
        cursor.delete()
        cursor.continue()
      }
    }

    // 清理相册缓存
    const albumsTransaction = this.db.transaction(['albums'], 'readwrite')
    const albumsStore = albumsTransaction.objectStore('albums')
    const albumsIndex = albumsStore.index('timestamp')
    const albumsRequest = albumsIndex.openCursor(IDBKeyRange.upperBound(oneWeekAgo))

    albumsRequest.onsuccess = event => {
      const cursor = event.target.result
      if (cursor) {
        cursor.delete()
        cursor.continue()
      }
    }
  }
}

// 创建全局离线管理器实例
export const offlineManager = new OfflineManager()

// PWA 更新处理
export function initPWA() {
  const updateSW = registerSW({
    onNeedRefresh() {
      ElNotification({
        title: '发现新版本',
        message: '检测到应用有新版本，点击确定更新',
        type: 'info',
        duration: 0,
        showClose: true,
        onClick: () => {
          updateSW(true)
        },
      })
    },
    onOfflineReady() {
      ElNotification({
        title: '应用已准备就绪',
        message: '应用已可离线使用',
        type: 'success',
        duration: 3000,
      })
    },
    onRegistered(registration) {
      console.log('SW Registered: ', registration)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  // 定期清理缓存
  setInterval(
    () => {
      offlineManager.cleanupCache()
    },
    24 * 60 * 60 * 1000
  )
}

export { OfflineManager }
