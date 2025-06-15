<!--
  MorePage.vue - "更多"页面
-->

<template>
  <div class="more-container">
    <div class="more-content">
      <div class="card-grid">
        <div
          v-for="card in cards"
          :key="card.id"
          class="feature-card"
          @click="handleCardClick(card)"
        >
          <h3 class="card-title">{{ $t(`morePage.features.${card.key}.title`) }}</h3>
          <p class="card-description">{{ $t(`morePage.features.${card.key}.description`) }}</p>
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
        { id: 1, key: 'duplicatePhotos' },
        { id: 2, key: 'feature2' },
        { id: 3, key: 'feature3' },
        { id: 4, key: 'feature4' },
        { id: 5, key: 'feature5' },
        { id: 6, key: 'feature6' },
      ],
    }
  },
  methods: {
    handleCardClick(card) {
      if (card.id === 1) {
        this.$router.push('/duplicate-photos')
      } else {
        // 其他卡片暂时不做跳转，或可以提示功能未开放
        console.log('Clicked on card:', this.$t(`morePage.features.${card.key}.title`))
      }
    },
  },
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
  background: var(--blur-bg-strong);
  backdrop-filter: var(--blur-strong);
  -webkit-backdrop-filter: var(--blur-strong);
  border-radius: var(--radius-extra-large);
  padding: var(--spacing-2xl);
  min-height: 400px;
  border: 1px solid var(--blur-border);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-xl);
}

.feature-card {
  background: var(--blur-bg-medium);
  backdrop-filter: var(--blur-medium);
  -webkit-backdrop-filter: var(--blur-medium);
  border-radius: var(--radius-large);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-small);
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast),
    background var(--transition-fast);
  cursor: pointer;
  border: var(--border-width) solid var(--blur-border);
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
