/**
 * notification.js - 全局通知组件配置
 * 为Element Plus的通知组件提供全局配置
 */

import { ElNotification } from 'element-plus'

// 配置通知组件的默认参数
export const configureNotification = app => {
  // 扩展原始通知方法，确保总是显示在最高层
  const originalNotify = ElNotification

  // 自定义通知方法
  const customNotify = options => {
    // 确保通知总是显示在最高层
    const customOptions = {
      ...options,
      zIndex: 99999, // 自定义z-index
      duration: options.duration || 3000, // 默认显示时间
      showClose: options.showClose !== false, // 默认显示关闭按钮
      position: options.position || 'top-right', // 默认显示位置
    }

    return originalNotify(customOptions)
  }

  // 复制原始通知方法的属性
  customNotify.success = options => {
    if (typeof options === 'string') {
      return originalNotify.success({ message: options, zIndex: 99999 })
    }
    return originalNotify.success({ ...options, zIndex: 99999 })
  }

  customNotify.warning = options => {
    if (typeof options === 'string') {
      return originalNotify.warning({ message: options, zIndex: 99999 })
    }
    return originalNotify.warning({ ...options, zIndex: 99999 })
  }

  customNotify.error = options => {
    if (typeof options === 'string') {
      return originalNotify.error({ message: options, zIndex: 99999 })
    }
    return originalNotify.error({ ...options, zIndex: 99999 })
  }

  customNotify.info = options => {
    if (typeof options === 'string') {
      return originalNotify.info({ message: options, zIndex: 99999 })
    }
    return originalNotify.info({ ...options, zIndex: 99999 })
  }

  // 全局挂载自定义通知方法
  app.config.globalProperties.$notify = customNotify

  // 兼容直接访问ElNotification
  app.provide('notify', customNotify)
}
