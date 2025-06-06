<!--
  PhotoDetail.vue - 照片详情页
-->

<template>
  <SfModal :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)"
    :title="photo?.title || '无标题照片'" size="large" :customStyles="dynamicModalStyles">
    <div class="photo-detail-content">
      <!-- 左侧照片显示组件 -->
      <div class="photo-detail-left">
        <PhotoImage :photo="photo" :imageLoaded="imageLoaded" :targetHeight="imageHeight" @image-loaded="handleImageLoaded" />
        <!-- 操作按钮组件 -->
        <PhotoActions :photo="photo" @delete-click="confirmDelete" />
      </div>

      <!-- 右侧信息组件 -->
      <div class="photo-detail-info" :style="rightPanelStyles">
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
      albumsMap: {}, // 用于存储相册ID到相册名称的映射
      modalStyles: {}, // 动态模态框样式
      imageHeight: 0, // 图片实际高度
      minModalHeight: 500, // 最低模态框高度
      maxModalWidth: 1400, // 最大模态框宽度
      rightPanelWidth: 350, // 右侧信息面板固定宽度
      buttonsHeight: 60, // 底部按钮区域高度
      headerHeight: 70, // 模态框头部高度
      modalPadding: 48, // 模态框内边距
      resizeTimeout: null // 防抖定时器
    }
  },
  computed: {
    hasExifData() {
      return !!(this.photo?.metadata?.exif)
    },
    dynamicModalStyles() {
      return this.modalStyles;
    },
    rightPanelStyles() {
      // 计算右侧面板的高度，使其与左侧区域保持一致
      if (this.imageHeight > 0) {
        const leftSideHeight = this.imageHeight + this.buttonsHeight;
        return {
          height: `${leftSideHeight}px`,
          maxHeight: `${leftSideHeight}px`
        };
      }
      return {};
    }
  },
  watch: {
    modelValue(newVal) {
      if (newVal) {
        this.imageLoaded = false;
        this.resetModalStyles();
        // 模态框打开时，如果有photo信息，立即计算尺寸
        if (this.photo && this.photo.width && this.photo.height) {
          this.$nextTick(() => {
            this.calculateModalSize();
          });
        }
      }
    },
    'photo.albums': {
      immediate: true,
      handler(albumIds) {
        if (albumIds && albumIds.length > 0) {
          this.fetchAlbumsInfo(albumIds);
        }
      }
    },
    photo: {
      immediate: true,
      handler(newPhoto) {
        this.resetModalStyles();
        // photo变化时，如果有尺寸信息，立即计算模态框尺寸
        if (newPhoto && newPhoto.width && newPhoto.height) {
          this.$nextTick(() => {
            this.calculateModalSize();
          });
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

    handleImageLoaded() {
      this.imageLoaded = true;
      // 图片加载完成后不再需要重新计算尺寸，因为已经在photo数据到达时计算过了
    },

    resetModalStyles() {
      this.modalStyles = {};
      this.imageHeight = 0;
    },

    calculateModalSize() {
      if (!this.photo || !this.photo.width || !this.photo.height) return;
      
      // 获取视口尺寸
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const isMobile = viewportWidth < 992;
      
      if (isMobile) {
        // 移动端保持原有逻辑
        this.modalStyles = {};
        return;
      }

      // 直接使用photo中的尺寸信息，无需等待图片加载
      const imgNaturalWidth = this.photo.width;
      const imgNaturalHeight = this.photo.height;
      const imgAspectRatio = imgNaturalWidth / imgNaturalHeight;
      
      // 计算理想的图片容器宽度（左侧区域宽度）
      // 首先确保右侧面板宽度固定，左侧宽度基于剩余空间计算
      const availableWidth = viewportWidth * 0.9 - this.rightPanelWidth - this.modalPadding;
      let leftPanelWidth = Math.min(
        availableWidth, // 可用宽度
        imgNaturalWidth // 但不超过图片原始宽度
      );
      
      // 确保左侧宽度不会太小
      leftPanelWidth = Math.max(leftPanelWidth, 400);
      
      // 根据宽度计算图片高度
      let calculatedImageHeight = leftPanelWidth / imgAspectRatio;
      
      // 计算模态框需要的总高度
      let totalModalHeight = calculatedImageHeight + this.buttonsHeight + this.headerHeight + this.modalPadding;
      
      // 检查是否低于最小高度
      if (totalModalHeight < this.minModalHeight) {
        // 重新计算尺寸以满足最小高度
        const targetImageHeight = this.minModalHeight - this.buttonsHeight - this.headerHeight - this.modalPadding;
        leftPanelWidth = targetImageHeight * imgAspectRatio;
        calculatedImageHeight = targetImageHeight;
        totalModalHeight = this.minModalHeight;
      }
      
      // 检查模态框宽度是否超过最大限制
      const totalModalWidth = leftPanelWidth + this.rightPanelWidth + this.modalPadding + 32; // 添加间距
      if (totalModalWidth > this.maxModalWidth) {
        // 重新计算，保持右侧面板宽度固定，调整左侧宽度
        leftPanelWidth = this.maxModalWidth - this.rightPanelWidth - this.modalPadding - 32;
        calculatedImageHeight = leftPanelWidth / imgAspectRatio;
        totalModalHeight = calculatedImageHeight + this.buttonsHeight + this.headerHeight + this.modalPadding;
      }
      
      // 确保不超过视口高度的85%
      const maxModalHeight = viewportHeight * 0.85;
      if (totalModalHeight > maxModalHeight) {
        const targetImageHeight = maxModalHeight - this.buttonsHeight - this.headerHeight - this.modalPadding;
        leftPanelWidth = targetImageHeight * imgAspectRatio;
        calculatedImageHeight = targetImageHeight;
        totalModalHeight = maxModalHeight;
      }
      
      // 应用计算出的样式
      this.imageHeight = calculatedImageHeight + 20; // 添加一些额外的间距
      const finalModalWidth = leftPanelWidth + this.rightPanelWidth + this.modalPadding + 32;
      this.modalStyles = {
        width: `${Math.min(finalModalWidth, this.maxModalWidth)}px`,
        height: `${totalModalHeight}px`,
        maxHeight: `${maxModalHeight}px`,
        minWidth: `${this.rightPanelWidth + 400 + this.modalPadding + 32}px` // 确保最小宽度包含固定右侧面板
      };
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

    handleResize() {
      // 防抖处理
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }
      this.resizeTimeout = setTimeout(() => {
        if (this.photo && this.photo.width && this.photo.height) {
          this.calculateModalSize();
        }
      }, 200);
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
  }
}
</script>

<style scoped>
/* 照片详情模态框 */
.photo-detail-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.photo-detail-left {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  align-items: center;
  /* 移动端：限制图片区域的最大高度，避免占据过多空间 */
  flex-shrink: 0;
  /* 桌面端：确保左侧区域能够正确填充 */
  flex: 1;
  min-height: 0;
}

.photo-detail-info {
  -ms-overflow-style: none;
  /* 移动端：不设置overflow，让内容自然排列 */
  flex: 1;
  min-height: 0; /* 确保flex子项可以收缩 */
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
  padding: 0 var(--spacing-lg) 0 var(--spacing-lg);
  font-family: -apple-system, BlinkMacSystemFont, 'San Francisco', 'Helvetica Neue', sans-serif;
  /* 在所有情况下都设置基础样式约束 */
  box-sizing: border-box;
}

/* 移动端优化样式 */
@media (max-width: 991px) {
  .photo-detail-content {
    /* 移动端：允许整个内容区域滚动 */
    max-height: none;
    overflow-y: visible;
  }
  
  .photo-detail-left {
    overflow: hidden;
  }
  
  .photo-detail-info {
    /* 移动端：信息区域不设置滚动，让内容自然展开 */
    overflow-y: visible;
    max-height: none;
    padding: var(--spacing-md) var(--spacing-lg) var(--spacing-sm) var(--spacing-lg);
  }
}

/* 响应式设计 - 桌面端 */
@media (min-width: 992px) {
  .photo-detail-content {
    flex-direction: row;
    gap: var(--spacing-xl);
    align-items: flex-start; /* 顶部对齐 */
    /* 桌面端：设置为填充模态框高度 */
    height: 100%;
  }

  .photo-detail-left {
    /* 桌面端：左侧区域占据剩余空间，减去右侧固定宽度 */
    flex: 1;
    flex-shrink: 0; /* 防止图片区域被压缩 */
    max-height: none; /* 桌面端移除高度限制 */
    overflow: visible; /* 桌面端恢复可见性 */
    /* 确保左侧区域能够正确布局 */
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    min-height: 0;
    /* 确保与右侧区域高度一致 */
    height: 100%;
    align-self: stretch;
  }

  .photo-detail-info {
    /* 桌面端：右侧信息面板固定宽度 - 使用更强的约束 */
    width: 350px !important;
    min-width: 350px !important;
    max-width: 350px !important;
    flex-basis: 350px !important;
    flex-shrink: 0 !important; /* 防止收缩 */
    flex-grow: 0 !important; /* 防止扩展 */
    /* 桌面端：确保信息区域可以滚动 */
    overflow-y: auto;
    /* 设置高度与左侧区域保持一致 */
    height: 100%;
    max-height: 100%;
    padding: 0 var(--spacing-lg) 0 var(--spacing-lg);
    padding-right: var(--spacing-sm); /* 为滚动条留出空间，防止内容遮挡 */
    box-sizing: border-box; /* 确保padding包含在宽度内 */
    /* 确保与左侧区域顶部对齐 */
    align-self: stretch;
  }
}
</style>
