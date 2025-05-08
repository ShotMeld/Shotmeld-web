<template>
  <div class="tag-management">
    <div class="tag-header">
      <h2>标签管理</h2>
      <button class="add-tag-button" @click="showAddForm = true">
        <i class="fas fa-plus"></i> 添加标签
      </button>
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-spinner></el-spinner>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="error" class="error-message">
      {{ error }}
      <button @click="fetchTags" class="retry-button">重试</button>
    </div>
    
    <div v-else-if="tags.length === 0" class="empty-message">
      <i class="fas fa-tags"></i>
      <p>暂无标签</p>
      <p class="empty-hint">点击右上方"添加标签"按钮创建第一个标签</p>
    </div>
    
    <div v-else class="tags-list">
      <div v-for="tag in tags" :key="tag.id" class="tag-item">
        <div class="tag-color" :style="{ backgroundColor: tag.color || '#4361ee' }"></div>
        <div class="tag-content">
          <h3>{{ tag.name }}</h3>
          <p v-if="tag.description">{{ tag.description }}</p>
          <p v-else class="no-description">暂无描述</p>
        </div>
        <div class="tag-actions">
          <button class="edit-button" @click="editTag(tag)">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-button" @click="confirmDeleteTag(tag)">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 添加/编辑标签表单 -->
    <transition name="slide">
      <div v-if="showAddForm || editingTag" class="tag-form-overlay">
        <div class="tag-form">
          <h3>{{ editingTag ? '编辑标签' : '添加标签' }}</h3>
          
          <div class="form-group">
            <label for="tag-name">标签名称</label>
            <input 
              type="text" 
              id="tag-name" 
              v-model="formData.name" 
              placeholder="输入标签名称"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="tag-description">描述</label>
            <textarea 
              id="tag-description" 
              v-model="formData.description" 
              placeholder="输入标签描述（可选）"
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="tag-color">标签颜色</label>
            <input 
              type="color" 
              id="tag-color" 
              v-model="formData.color"
            />
          </div>
          
          <div class="form-actions">
            <button 
              type="button" 
              class="cancel-button" 
              @click="cancelForm"
            >
              取消
            </button>
            <button 
              type="button" 
              class="save-button" 
              @click="saveTag"
              :disabled="submitting"
            >
              {{ submitting ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="showDeleteConfirm"
      title="确认删除"
      width="30%"
      :before-close="cancelDelete">
      <span>确定要删除标签"{{ tagToDelete?.name || '' }}"吗？此操作不可恢复。</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelDelete">取消</el-button>
          <el-button type="danger" @click="deleteTag" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { tagService } from '../api';

export default {
  name: 'TagManagement',
  props: {
    showHeader: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      tags: [],
      loading: false,
      error: null,
      showAddForm: false,
      editingTag: null,
      tagToDelete: null,
      showDeleteConfirm: false,
      submitting: false,
      formData: {
        name: '',
        description: '',
        color: '#4361ee'
      }
    };
  },
  created() {
    this.fetchTags();
  },
  methods: {
    async fetchTags() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await tagService.getTags();
        this.tags = response.data || [];
      } catch (error) {
        console.error('获取标签失败:', error);
        this.error = error.response?.data?.message || '无法获取标签，请重试';
      } finally {
        this.loading = false;
      }
    },
    
    editTag(tag) {
      this.editingTag = tag;
      this.formData = {
        name: tag.name,
        description: tag.description || '',
        color: tag.color || '#4361ee'
      };
    },
    
    confirmDeleteTag(tag) {
      this.tagToDelete = tag;
      this.showDeleteConfirm = true;
    },
    
    cancelForm() {
      this.showAddForm = false;
      this.editingTag = null;
      this.resetForm();
    },
    
    cancelDelete() {
      this.showDeleteConfirm = false;
      this.tagToDelete = null;
    },
    
    resetForm() {
      this.formData = {
        name: '',
        description: '',
        color: '#4361ee'
      };
    },
    
    async saveTag() {
      if (!this.formData.name.trim()) {
        this.$notify.warning({
          title: '输入不完整',
          message: '请输入标签名称'
        });
        return;
      }
      
      this.submitting = true;
      
      try {
        if (this.editingTag) {
          // 更新标签
          const response = await tagService.updateTag(this.editingTag.id, this.formData);
          
          // 更新本地列表
          const index = this.tags.findIndex(t => t.id === this.editingTag.id);
          if (index !== -1) {
            this.tags[index] = response.data;
          }
          
          this.$notify({
            title: '成功',
            message: '标签已更新',
            type: 'success'
          });
        } else {
          // 创建新标签
          const response = await tagService.createTag(this.formData);
          this.tags.push(response.data);
          
          this.$notify({
            title: '成功',
            message: '标签已创建',
            type: 'success'
          });
        }
        
        // 通知父组件更新
        this.$emit('tag-updated');
        
        // 关闭表单
        this.cancelForm();
      } catch (error) {
        console.error('保存标签失败:', error);
        this.$notify.error({
          title: '保存失败',
          message: error.response?.data?.message || '无法保存标签，请重试'
        });
      } finally {
        this.submitting = false;
      }
    },
    
    async deleteTag() {
      if (!this.tagToDelete) return;
      
      this.submitting = true;
      
      try {
        await tagService.deleteTag(this.tagToDelete.id);
        
        // 从列表中移除
        this.tags = this.tags.filter(t => t.id !== this.tagToDelete.id);
        
        // 通知父组件更新
        this.$emit('tag-updated');
        
        this.$notify({
          title: '成功',
          message: '标签已删除',
          type: 'success'
        });
        
        this.cancelDelete();
      } catch (error) {
        console.error('删除标签失败:', error);
        this.$notify.error({
          title: '删除失败',
          message: error.response?.data?.message || '无法删除标签，请重试'
        });
      } finally {
        this.submitting = false;
      }
    }
  }
};
</script>

<style scoped>
.tag-management {
  width: 100%;
  position: relative;
}

.tag-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.tag-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.add-tag-button {
  background-color: #4361ee;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-tag-button:hover {
  background-color: #3f37c9;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 1rem;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 1rem;
  color: #dc3545;
  text-align: center;
}

.retry-button {
  background-color: #4361ee;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.5rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #3f37c9;
}

.empty-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 1rem;
  color: #6c757d;
  text-align: center;
}

.empty-message i {
  font-size: 3rem;
  color: #adb5bd;
}

.empty-hint {
  font-size: 0.875rem;
  color: #868e96;
}

.tags-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.tag-item {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.tag-color {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  margin-right: 1rem;
  flex-shrink: 0;
}

.tag-content {
  flex: 1;
}

.tag-content h3 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
}

.tag-content p {
  margin: 0;
  font-size: 0.875rem;
  color: #6c757d;
}

.no-description {
  font-style: italic;
  color: #adb5bd;
}

.tag-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-button,
.delete-button {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.edit-button:hover {
  background-color: #e9ecef;
  color: #4361ee;
}

.delete-button:hover {
  background-color: #ffebee;
  color: #dc3545;
}

.tag-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.tag-form {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.tag-form h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #333;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 1rem;
}

.form-group input[type="color"] {
  width: 100%;
  height: 40px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cancel-button {
  background-color: transparent;
  border: 1px solid #ced4da;
  color: #6c757d;
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-button:hover {
  background-color: #f8f9fa;
}

.save-button {
  background-color: #4361ee;
  color: white;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-button:hover:not(:disabled) {
  background-color: #3f37c9;
}

.save-button:disabled {
  background-color: #a5afd7;
  cursor: not-allowed;
}

/* 动画效果 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}

.slide-enter-from .tag-form,
.slide-leave-to .tag-form {
  transform: translateY(20px);
}
</style>
