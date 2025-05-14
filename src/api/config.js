// API配置文件
// 判断当前环境
const isDevelopment = import.meta.env.DEV;

// 在开发环境中使用相对路径，这样会走Vite的代理
// 在生产环境中使用完整URL
const apiBaseUrl = isDevelopment 
  ? '/api' 
  : (import.meta.env.VITE_API_BASE_URL || 'https://api.shotmeld.seeridia.top');

// 只有在生产环境中才需要确保使用HTTPS
export const API_BASE_URL = isDevelopment 
  ? apiBaseUrl 
  : apiBaseUrl.replace('http://', 'https://');

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
