<!--
  MorePage.vue - "更多"页面
-->

<template>
  <div class="more-container">
    <div class="more-content">
      <div class="card-grid">
        <div v-for="card in cards" :key="card.id" class="feature-card" @click="handleCardClick(card)">
          <h3 class="card-title">{{ card.title }}</h3>
          <p class="card-description">{{ card.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MorePage',
  data() {
    return {
      cards: [
        { id: 1, title: '重复照片检测', description: '筛选出重复照片并进行管理' },
        { id: 2, title: '人像识别', description: '人脸属性识别' },
        { id: 3, title: '', description: '这是功能三的简要描述。' },
        { id: 4, title: '功能四', description: '这是功能四的简要描述。' },
        { id: 5, title: '功能五', description: '这是功能五的简要描述。' },
        { id: 6, title: '功能六', description: '这是功能六的简要描述。' }
      ]
    };
  },
  methods: {
    handleCardClick(card) {
      if (card.id === 1) {
        this.$router.push('/duplicate-photos');
      } else {
        // 其他卡片暂时不做跳转，或可以提示功能未开放
        console.log('Clicked on card:', card.title);
      }
    }
  }
}
</script>

<style scoped>
.more-container {
  padding: var(--spacing-3xl);
  max-width: var(--container-lg);
  margin: 0 auto;
  font-family: var(--font-family);
}

.more-title {
  font-size: 32px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 32px;
  text-align: center;
}

.more-content {
  background-color: var(--bg-secondary);
  border-radius: var(--radius-extra-large);
  padding: var(--spacing-2xl);
  min-height: 400px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-xl);
}

.feature-card {
  background-color: var(--bg-primary);
  border-radius: var(--radius-large);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-small);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  cursor: pointer;
  border: var(--border-width) solid var(--border-color);
}

.feature-card:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: var(--shadow-medium);
  border-color: var(--border-color-hover);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.card-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.5;
}
</style>
