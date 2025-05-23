<!--
  PhotoDetail.vue - 照片详情页
-->

<template>
  <SfModal :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)"
    :title="photo?.title || '无标题照片'" size="large">
    <div class="photo-detail-content">
      <!-- 左侧照片显示组件 -->
      <div class="photo-detail-left">
        <PhotoImage :photo="photo" :imageLoaded="imageLoaded" @image-loaded="imageLoaded = true" />
        <!-- 操作按钮组件 -->
        <PhotoActions :photo="photo" @delete-click="confirmDelete" />
      </div>

      <!-- 右侧信息组件 -->
      <div class="photo-detail-info">
        <!-- 基本信息组件 -->
        <PhotoInfo :photo="photo" />

        <!-- 位置信息组件 -->
        <PhotoLocation v-if="photo?.location?.latitude && photo?.location?.longitude" :photo="photo" />

        <!-- 相机参数组件 -->
        <PhotoExif v-if="hasExifData" :photo="photo" />

        <!-- 标签组件 -->
        <PhotoTags v-if="photo?.tags && photo.tags.length > 0" :photo="photo" @tag-clicked="handleTagClick" />

        <!-- 相册组件 -->
        <PhotoAlbums v-if="photo?.albums && photo.albums.length > 0" :photo="photo" :albumsMap="albumsMap" />
      </div>
    </div>
  </SfModal>

  <!-- 删除确认对话框 -->
  <DeleteConfirmModal 
    v-model="showDeleteConfirm" 
    @confirm="deletePhoto"
    title="确认删除"
    itemName="照片"
    :count="1"
    confirmMessage="确定要删除这张照片吗？"
    warningText="此操作无法撤销。" 
  />
</template>

<script>
import { SfModal } from '../ui';
import { albumService } from '../../api';
import {
  PhotoImage,
  PhotoInfo,
  PhotoLocation,
  PhotoExif,
  PhotoTags,
  PhotoAlbums,
  PhotoActions,
  DeleteConfirmModal
} from './index';

export default {
  name: 'PhotoDetail',
  components: {
    SfModal,
    PhotoImage,
    PhotoInfo,
    PhotoLocation,
    PhotoExif,
    PhotoTags,
    PhotoAlbums,
    PhotoActions,
    DeleteConfirmModal
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    photo: {
      type: Object,
      default: null
    }
  },
  emits: ['update:modelValue', 'photo-deleted', 'tag-clicked'],
  data() {
    return {
      imageLoaded: false,
      showDeleteConfirm: false,
      albumsMap: {} // 用于存储相册ID到相册名称的映射
    }
  },
  computed: {
    hasExifData() {
      return !!(this.photo?.metadata?.exif)
    }
  },
  watch: {
    modelValue(newVal) {
      if (newVal) {
        this.imageLoaded = false;
      }
    },
    'photo.albums': {
      immediate: true,
      handler(albumIds) {
        if (albumIds && albumIds.length > 0) {
          this.fetchAlbumsInfo(albumIds);
        }
      }
    }
  },
  methods: {
    confirmDelete() {
      this.showDeleteConfirm = true;
    },

    deletePhoto() {
      this.$emit('photo-deleted', this.photo.id);
      this.showDeleteConfirm = false;
    },
    
    handleTagClick(tag) {
      this.$emit('tag-clicked', tag);
    },

    fetchAlbumsInfo(albumIds) {
      // 过滤掉已经获取过的相册ID
      const idsToFetch = albumIds.filter(id => !this.albumsMap[id]);
      
      if (idsToFetch.length === 0) return;
      
      // 为每个相册ID发起请求
      const promises = idsToFetch.map(id => 
        albumService.getAlbum(id)
          .then(response => {
            this.albumsMap[id] = response.data.name;
          })
          .catch(err => {
            console.error(`获取相册信息失败: ${id}`, err);
            this.albumsMap[id] = '未知相册';
          })
      );
      
      // 等待所有请求完成
      Promise.all(promises).catch(err => {
        console.error('获取相册信息时出错:', err);
      });
    },
  }
}
</script>

<style scoped>
/* 照片详情模态框 */
.photo-detail-content {
  display: flex;
  flex-direction: column;
  /* 设定一个最大高度，例如视窗高度的90%，减去模态框可能的边距 */
  max-height: calc(90vh - 100px); /* 100px 是模态框上下padding和title的预估值 */
}

.photo-detail-left {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  align-items: center;
}

.photo-detail-info {
  -ms-overflow-style: none;
  /* 桌面端信息区域允许滚动 */
  overflow-y: auto; 
}

/* 标题自动换行样式 */
:deep(.sf-modal-title) {
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  max-width: calc(100% - 40px); /* 留出关闭按钮空间 */
  line-height: 1.3;
  padding-right: 8px;
}

.photo-detail-info {
  padding: 0 var(--spacing-lg) var(--spacing-lg) var(--spacing-lg);
  font-family: -apple-system, BlinkMacSystemFont, 'San Francisco', 'Helvetica Neue', sans-serif;
}

/* 响应式设计 */
@media (min-width: 992px) {
  .photo-detail-content {
    flex-direction: row;
    gap: var(--spacing-xl);
    align-items: flex-start; /* 顶部对齐 */
  }

  .photo-detail-left {
    flex: 1.5; /* 恢复flex比例，使其比信息区宽 */
    flex-shrink: 0; /* 防止图片区域被压缩 */
    /* max-width: 70%; */ /* 移除这个，让flex布局决定宽度 */
    /* 图片容器本身不需要滚动条，由内部图片处理 */
  }

  .photo-detail-info {
    flex: 1; /* 信息区占据相应比例空间 */
    /* 确保信息区域可以滚动 */
    overflow-y: auto;
    /* 设置一个最大高度，以适应图片的高度，同时自身可滚动 */
    max-height: calc(85vh - 120px); /* 这里的计算需要根据实际模态框标题和padding调整 */
    padding-right: var(--spacing-sm); /* 为滚动条留出空间，防止内容遮挡 */
  }
}
</style>
