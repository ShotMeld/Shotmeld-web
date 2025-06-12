import { defineStore } from 'pinia'

/**
 * 背景动画状态管理
 * 确保背景小球在页面切换时保持一致
 */
export const useBackgroundStore = defineStore('background', {
  state: () => ({
    orbs: [], // 小球配置数组
    initialized: false // 是否已初始化
  }),
  
  actions: {
    initializeOrbs() {
      // 如果已经初始化过，直接返回
      if (this.initialized) {
        return this.orbs
      }

      const orbCount = 2 + Math.floor(Math.random() * 6) // 2-7个小球
      const orbs = []
      
      const colors = [
        'linear-gradient(45deg, rgba(0, 122, 255, 0.3), rgba(88, 86, 214, 0.3))',
        'linear-gradient(45deg, rgba(255, 45, 85, 0.2), rgba(255, 149, 0, 0.2))',
        'linear-gradient(45deg, rgba(50, 215, 75, 0.2), rgba(0, 199, 190, 0.2))',
        'linear-gradient(45deg, rgba(175, 82, 222, 0.25), rgba(255, 45, 85, 0.25))',
        'linear-gradient(45deg, rgba(255, 204, 0, 0.2), rgba(255, 149, 0, 0.3))',
        'linear-gradient(45deg, rgba(48, 209, 88, 0.2), rgba(0, 122, 255, 0.2))'
      ]
      
      for (let i = 0; i < orbCount; i++) {
        orbs.push({
          id: i,
          size: 580 + Math.random() * 520, // 580-1100px 随机尺寸
          x: Math.random() * 100, // 0-100% 随机位置
          y: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          duration: 20 + Math.random() * 15, // 20-35秒动画时长
          delay: Math.random() * -15, // 随机延迟
          direction: Math.random() > 0.5 ? 1 : -1, // 随机移动方向
          moveX: (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 20), // 预计算移动距离
          moveY: (Math.random() > 0.5 ? 1 : -1) * (8 + Math.random() * 15)
        })
      }
      
      this.orbs = orbs
      this.initialized = true
      return orbs
    },
    
    resetOrbs() {
      this.orbs = []
      this.initialized = false
    }
  },
  
  getters: {
    getOrbs: (state) => state.orbs,
    isInitialized: (state) => state.initialized
  }
})
