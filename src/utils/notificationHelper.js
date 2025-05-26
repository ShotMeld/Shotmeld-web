/**
 * NotificationHelper.js - 通知工具类
 * 提供简单的通知包装函数，方便在项目中使用
 */

/**
 * 显示一个成功通知
 * @param {string} message - 通知消息
 * @param {string} title - 通知标题
 * @param {number} duration - 显示持续时间（毫秒）
 */
export const showSuccessNotify = (app, message, title = '成功', duration = 3000) => {
  if (app && app.$notify) {
    app.$notify({
      title,
      message,
      type: 'success',
      duration,
      zIndex: 99999
    });
  } else {
    console.warn('通知系统未初始化');
  }
};

/**
 * 显示一个错误通知
 * @param {string} message - 通知消息
 * @param {string} title - 通知标题
 * @param {number} duration - 显示持续时间（毫秒）
 */
export const showErrorNotify = (app, message, title = '错误', duration = 5000) => {
  if (app && app.$notify) {
    app.$notify({
      title,
      message,
      type: 'error',
      duration,
      zIndex: 99999
    });
  } else {
    console.error('通知系统未初始化');
  }
};

/**
 * 显示一个警告通知
 * @param {string} message - 通知消息
 * @param {string} title - 通知标题
 * @param {number} duration - 显示持续时间（毫秒）
 */
export const showWarningNotify = (app, message, title = '警告', duration = 4000) => {
  if (app && app.$notify) {
    app.$notify({
      title,
      message,
      type: 'warning',
      duration,
      zIndex: 99999
    });
  } else {
    console.warn('通知系统未初始化');
  }
};

/**
 * 显示一个信息通知
 * @param {string} message - 通知消息
 * @param {string} title - 通知标题
 * @param {number} duration - 显示持续时间（毫秒）
 */
export const showInfoNotify = (app, message, title = '提示', duration = 3000) => {
  if (app && app.$notify) {
    app.$notify({
      title,
      message,
      type: 'info',
      duration,
      zIndex: 99999
    });
  } else {
    console.info('通知系统未初始化');
  }
};
