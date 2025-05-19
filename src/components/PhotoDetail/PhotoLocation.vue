<!--
  PhotoLocation.vue - 照片详情/位置信息组件
-->

<template>
    <div class="info-group" v-if="hasLocation">
        <h3 class="info-group-title">位置信息</h3>
        <div class="info-item">
            <span class="info-label">经度</span>
            <span class="info-value">{{ formatCoordinate(photo.location.longitude, 'lng') }}</span>
        </div>
        <div class="info-item">
            <span class="info-label">纬度</span>
            <span class="info-value">{{ formatCoordinate(photo.location.latitude, 'lat') }}</span>
        </div>
        <!-- TODO：之后考虑添加地图组件或是来个接口显示位置名称 -->
        <SfLinkButton icon="fas fa-map-marker-alt" @click="openMap">
            在地图中查看
        </SfLinkButton>
    </div>
</template>

<script>
import { SfLinkButton } from '../ui';

export default {
  name: 'PhotoLocation',
  components: {
    SfLinkButton
  },
  props: {
    photo: {
      type: Object,
      default: null
    }
  },
  computed: {
    hasLocation() {
      return !!(this.photo?.location?.latitude && this.photo?.location?.longitude)
    }
  },
  methods: {
    formatCoordinate(coord, type) {
      if (typeof coord !== 'number') return '';

      const degrees = Math.floor(coord);
      const minutesValue = (coord - degrees) * 60;
      const minutes = Math.floor(minutesValue);
      const seconds = ((minutesValue - minutes) * 60).toFixed(2);

      const direction = type === 'lat'
        ? (coord >= 0 ? 'N' : 'S')
        : (coord >= 0 ? 'E' : 'W');

      return `${Math.abs(degrees)}° ${minutes}' ${seconds}" ${direction}`;
    },

    openMap() {
      if (!this.hasLocation) return;

      // 使用系统地图应用打开位置
      const mapUrl = `https://maps.apple.com/?q=${this.photo.location.latitude},${this.photo.location.longitude}`;
      window.open(mapUrl, '_blank');
    }
  }
}
</script>

<style scoped>
.info-group {
  margin-bottom: var(--spacing-lg);
  animation: fadeIn 0.5s ease-out;
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color-subtle);
}

.info-group:last-of-type {
  border-bottom: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.info-group-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-2xs);
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.info-item {
  display: flex;
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-base);
  line-height: 1.5;
}

.info-label {
  width: 100px;
  color: var(--text-secondary);
  flex-shrink: 0;
  font-weight: var(--font-weight-normal);
}

.info-value {
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}
</style>
