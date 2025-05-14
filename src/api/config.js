// API配置文件
// 确保总是使用HTTPS地址，防止混合内容错误
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.shotmeld.seeridia.top';
// 如果API地址是HTTP，转换为HTTPS
export const API_BASE_URL = apiBaseUrl.replace('http://', 'https://');

// API端点
export const API_ENDPOINTS = {
  // 用户认证
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ME: '/auth/me'
  },
  
  // 照片管理
  PHOTOS: {
    BASE: '/photos',
    DETAIL: (id) => `/photos/${id}`,
    BATCH: '/photos/batch',
    TIMELINE: '/timeline'
  },
  
  // 标签管理
  TAGS: {
    BASE: '/tags',
    DETAIL: (id) => `/tags/${id}`,
    PHOTOS: (id) => `/tags/${id}`
  },
  
  // 相册管理
  ALBUMS: {
    BASE: '/albums',
    DETAIL: (id) => `/albums/${id}`,
    PHOTOS: (id) => `/albums/${id}/photos`
  }
};
