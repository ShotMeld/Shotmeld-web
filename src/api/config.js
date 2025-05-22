// API配置文件
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.shotmeld.seeridia.top';

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
    TIMELINE: '/timeline',
    SEARCH: '/photos/search'
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
