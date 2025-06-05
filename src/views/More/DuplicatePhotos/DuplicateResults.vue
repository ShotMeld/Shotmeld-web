<template>
  <div class="duplicate-results">
    <div class="results-header">
      <div class="results-summary">
        <h2>检测结果</h2>
        <div class="summary-stats">
          <div class="stat-item">
            <span class="stat-value">{{ duplicateGroups.length }}</span>
            <span class="stat-label">个重复组</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ totalDuplicates }}</span>
            <span class="stat-label">张重复图片</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ estimatedSpace }}</span>
            <span class="stat-label">可释放空间</span>
          </div>
        </div>
      </div>
      
      <div class="results-actions">
        <sf-button
          type="secondary"
          @click="selectSmartRecommendations"
        >
          智能推荐
        </sf-button>
        <sf-button
          type="danger"
          @click="deleteAllSelected"
          :disabled="totalSelected === 0"
        >
          批量删除 ({{ totalSelected }})
        </sf-button>
      </div>
    </div>

    <div v-if="duplicateGroups.length === 0" class="no-results">
      <div class="no-results-icon">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12L11 14L15 10" stroke="var(--color-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="12" cy="12" r="10" stroke="var(--color-success)" stroke-width="2"/>
        </svg>
      </div>
      <h3>太棒了！没有发现重复图片</h3>
      <p>您的图库很整洁，没有重复的照片。</p>
    </div>

    <div v-else class="results-content">
      <DuplicateGroup
        v-for="(group, index) in duplicateGroups"
        :key="`group-${index}`"
        :photos="group"
        :group-index="index"
        :similarity="calculateSimilarity(group)"
        @delete-photos="handleDeletePhotos"
      />
    </div>

    <div v-if="duplicateGroups.length > 0" class="results-footer">
      <div class="pagination-info">
        显示 {{ duplicateGroups.length }} 个重复组
      </div>
      
      <sf-button
        type="primary"
        @click="$emit('restart')"
      >
        重新检测
      </sf-button>
    </div>
  </div>
</template>

<script>
import SfButton from '@/components/ui/SfButton.vue'
import DuplicateGroup from './DuplicateGroup.vue'

export default {
  name: 'DuplicateResults',
  components: {
    SfButton,
    DuplicateGroup
  },
  props: {
    duplicateGroups: {
      type: Array,
      default: () => []
    }
  },
  emits: ['restart', 'delete-photos'],
  computed: {
    totalDuplicates() {
      return this.duplicateGroups.reduce((total, group) => total + group.length, 0)
    },
    totalSelected() {
      // 这里需要从子组件收集选中状态，暂时返回0
      return 0
    },
    estimatedSpace() {
      // 估算可释放空间
      const avgSize = 2.5 // MB per photo
      const space = this.totalDuplicates * avgSize * 0.7 // 假设平均70%的重复图片会被删除
      if (space > 1024) {
        return `${(space / 1024).toFixed(1)} GB`
      }
      return `${space.toFixed(0)} MB`
    }
  },
  methods: {
    calculateSimilarity(group) {
      // 模拟相似度计算
      return Math.floor(Math.random() * 10) + 90 // 90-99%
    },
    
    selectSmartRecommendations() {
      // 智能推荐选择策略：
      // 1. 每组保留最大/最高质量的图片
      // 2. 选择其他图片进行删除
      this.$message({
        message: '智能推荐功能正在开发中，敬请期待！',
        type: 'info'
      })
    },
    
    async deleteAllSelected() {
      if (this.totalSelected === 0) return
      
      try {
        await this.$confirm(
          `确定要删除所有选中的图片吗？此操作不可恢复。`,
          '批量删除确认',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        // 处理批量删除逻辑
        this.$emit('delete-photos', [])
      } catch (error) {
        // 用户取消删除，不需要处理
      }
    },
    
    handleDeletePhotos(photoIds) {
      this.$emit('delete-photos', photoIds)
    }
  }
}
</script>

<style scoped>
.duplicate-results {
  max-width: 1200px;
  margin: 0 auto;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-2xl);
  gap: var(--spacing-xl);
}

.results-summary h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.summary-stats {
  display: flex;
  gap: var(--spacing-xl);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-2xs);
}

.results-actions {
  display: flex;
  gap: var(--spacing-md);
  flex-shrink: 0;
}

.no-results {
  text-align: center;
  padding: var(--spacing-4xl) var(--spacing-xl);
  background: var(--bg-secondary);
  border-radius: var(--radius-large);
}

.no-results-icon {
  margin-bottom: var(--spacing-xl);
}

.no-results h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.no-results p {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: 1.5;
}

.results-content {
  margin-bottom: var(--spacing-2xl);
}

.results-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl);
  background: var(--bg-secondary);
  border-radius: var(--radius-large);
}

.pagination-info {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .results-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-lg);
  }
  
  .summary-stats {
    justify-content: space-around;
    gap: var(--spacing-md);
  }
  
  .results-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .results-footer {
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
  }
}
</style>
