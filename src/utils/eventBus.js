import mitt from 'mitt'

// 创建事件总线实例
export const eventBus = mitt()

// 导出常用的事件名称常量
export const EventTypes = {
  SHOW_UPLOAD_MODAL: 'show-upload-modal',
  SHOW_ALBUM_FORM: 'show-album-form',
}
