import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from './config';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 添加请求拦截器
apiClient.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    
    // 如果token存在，添加到header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // 如果是401错误（未授权），可能是token过期
    if (error.response && error.response.status === 401) {
      // 清除本地存储的认证信息
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // 跳转到登录页面
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API服务
export const authService = {
  // 注册
  register(userData) {
    return apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  },
  
  // 登录
  login(credentials) {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  },
  
  // 获取当前用户信息
  getCurrentUser() {
    return apiClient.get(API_ENDPOINTS.AUTH.ME);
  }
};

export const photoService = {
  // 获取照片列表（支持分页、排序和多种过滤条件）
  getPhotos(params = {}) {
    return apiClient.get(API_ENDPOINTS.PHOTOS.BASE, { params });
  },
  
  // 获取单张照片
  getPhoto(id) {
    return apiClient.get(API_ENDPOINTS.PHOTOS.DETAIL(id));
  },
  
  // 上传照片
  uploadPhoto(file, metadata = {}, onProgressUpdate = null) {
    const formData = new FormData();
    formData.append('photo', file);
    
    if (Object.keys(metadata).length > 0) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    
    return apiClient.post(API_ENDPOINTS.PHOTOS.BASE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: progressEvent => {
        if (onProgressUpdate && progressEvent.total) {
          // 计算上传百分比
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgressUpdate(percentCompleted);
        }
      }
    });
  },
  
  // 批量上传照片
  batchUploadPhotos(files, albumId = null, tags = [], onProgressUpdate = null) {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('photos', file);
    });
    
    if (albumId) {
      formData.append('albumId', albumId);
    }
    
    if (tags && tags.length > 0) {
      // 按照API文档，tags应该是一个字符串数组，不需要额外的JSON.stringify
      tags.forEach(tag => {
        formData.append('tags', tag);
      });
    }
    
    return apiClient.post(API_ENDPOINTS.PHOTOS.BATCH, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: progressEvent => {
        if (onProgressUpdate && progressEvent.total) {
          // 计算上传百分比
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgressUpdate(percentCompleted);
        }
      }
    });
  },
  
  // 更新照片信息
  updatePhoto(id, photoData) {
    return apiClient.put(API_ENDPOINTS.PHOTOS.DETAIL(id), photoData);
  },
  
  // 批量删除照片
  deletePhotos(photoIds, dryRun = false) {
    return apiClient.delete(API_ENDPOINTS.PHOTOS.BASE, { 
      data: { 
        photoIds,
        dry_run: dryRun 
      } 
    });
  },
  
  // 单个删除照片（兼容旧代码）
  deletePhoto(id) {
    return this.deletePhotos([id]);
  },
  
  // 获取照片时间轴
  getPhotoTimeline(params = {}) {
    return apiClient.get(API_ENDPOINTS.PHOTOS.TIMELINE, { params });
  },
  
  // 搜索照片 - 统一搜索接口
  searchPhotos(params = {}) {
    return apiClient.get(API_ENDPOINTS.PHOTOS.SEARCH, { params });
  },
  
  // 将多个照片添加到相册
  addPhotosToAlbum(data) {
    return apiClient.post(API_ENDPOINTS.ALBUMS.PHOTOS(data.albumId), { 
      photoIds: data.photoIds 
    });
  }
};

export const tagService = {
  // 获取所有标签
  getTags() {
    return apiClient.get(API_ENDPOINTS.TAGS.BASE);
  },
  
  // 根据标签ID获取对应的照片列表
  getPhotosByTagId(id, params = {}) {
    return apiClient.get(API_ENDPOINTS.TAGS.PHOTOS(id), { params });
  },
  
  // 更新标签
  updateTag(id, tagData) {
    return apiClient.put(API_ENDPOINTS.TAGS.DETAIL(id), tagData);
  },
  
  // 删除标签
  deleteTag(id) {
    return apiClient.delete(API_ENDPOINTS.TAGS.DETAIL(id));
  }
};

export const albumService = {
  // 获取相册列表（支持分页和排序）
  getAlbums(params = {}) {
    return apiClient.get(API_ENDPOINTS.ALBUMS.BASE, { params });
  },
  
  // 获取单个相册
  getAlbum(id) {
    return apiClient.get(API_ENDPOINTS.ALBUMS.DETAIL(id));
  },
  
  // 创建相册
  createAlbum(albumData) {
    return apiClient.post(API_ENDPOINTS.ALBUMS.BASE, albumData);
  },
  
  // 更新相册
  updateAlbum(id, albumData) {
    return apiClient.put(API_ENDPOINTS.ALBUMS.DETAIL(id), albumData);
  },
  
  // 删除相册
  deleteAlbum(id) {
    return apiClient.delete(API_ENDPOINTS.ALBUMS.DETAIL(id));
  },
  
  // 获取相册中的照片（支持分页和排序）
  getAlbumPhotos(id, params = {}) {
    return apiClient.get(API_ENDPOINTS.ALBUMS.PHOTOS(id), { params });
  },
  
  // 批量添加照片到相册
  addPhotosToAlbum(albumId, photoIds) {
    return apiClient.post(API_ENDPOINTS.ALBUMS.PHOTOS(albumId), { photoIds });
  },
  
  // 批量从相册中移除照片
  removePhotosFromAlbum(albumId, photoIds) {
    return apiClient.delete(API_ENDPOINTS.ALBUMS.PHOTOS(albumId), { 
      data: { photoIds } 
    });
  },
  
  // 添加单张照片到相册（兼容旧代码）
  addPhotoToAlbum(albumId, photoId) {
    return this.addPhotosToAlbum(albumId, [photoId]);
  },
  
  // 从相册中移除单张照片（兼容旧代码）
  removePhotoFromAlbum(albumId, photoId) {
    return this.removePhotosFromAlbum(albumId, [photoId]);
  }
};

export default apiClient;
