<!--
  PhotoExif.vue - 照片详情/Exif信息组件
-->

<template>
    <div class="info-group" v-if="hasExifData">
        <h3 class="info-group-title">相机参数</h3>
        <div class="info-item" v-if="photo?.metadata?.exif?.make || photo?.metadata?.exif?.model">
            <span class="info-label">设备</span>
            <span class="info-value">{{ photo.metadata.exif.model }}</span>
        </div>
        <div class="exif-grid">
            <div class="exif-item" v-if="photo?.metadata?.exif?.exposureTime">
                <div class="exif-value">{{ formatExposureTime(photo.metadata.exif.exposureTime) }}</div>
                <div class="exif-label">曝光时间</div>
            </div>
            <div class="exif-item" v-if="photo?.metadata?.exif?.fNumber">
                <div class="exif-value">f/{{ formatNumber(photo.metadata.exif.fNumber) }}</div>
                <div class="exif-label">光圈</div>
            </div>
            <div class="exif-item" v-if="photo?.metadata?.exif?.isoSpeedRatings">
                <div class="exif-value">ISO {{ formatNumber(photo.metadata.exif.isoSpeedRatings) }}</div>
                <div class="exif-label">感光度</div>
            </div>
            <div class="exif-item" v-if="photo?.metadata?.exif?.focalLength">
                <div class="exif-value">{{ formatNumber(photo.metadata.exif.focalLength) }}mm</div>
                <div class="exif-label">焦距</div>
            </div>
            <div class="exif-item" v-if="photo?.metadata?.exif?.rawExif?.BrightnessValue">
                <div class="exif-value">{{ formatNumber(photo?.metadata?.exif?.rawExif?.BrightnessValue) }}</div>
                <div class="exif-label">EV</div>
            </div>
            <div class="exif-item" v-if="photo?.metadata?.exif?.rawExif?.MeteringMode">
                <div class="exif-value">{{ formatMeteringMode(photo?.metadata?.exif?.rawExif?.MeteringMode) }}</div>
                <div class="exif-label">测光模式</div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'PhotoExif',
    props: {
        photo: {
            type: Object,
            default: null
        }
    },
    computed: {
        hasExifData() {
            return !!(this.photo?.metadata?.exif)
        }
    },
    methods: {
        formatExposureTime(time) {
            if (!time) return '';
            if (time < 0.1) {
                const denominator = Math.round(1 / time);
                return `1/${denominator}s`;
            }
            return `${time.toFixed(2)}s`;
        },

        formatMeteringMode(mode) {
            const modes = {
                0: '未知',
                1: '平均',
                2: '中心加权',
                3: '点测光',
                4: '多区域',
                5: '局部',
                6: '矩阵'
            };
            return modes[mode] || '未知';
        },

        // 通用格式化数值函数，保留最多两位小数
        formatNumber(value) {
            if (value === undefined || value === null) return '';

            const num = Number(value);
            if (isNaN(num)) return value;

            if (Number.isInteger(num) || (num.toString().split('.')[1]?.length || 0) <= 2) {
                return num.toString();
            }

            return num.toFixed(2);
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

.exif-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: var(--spacing-md);
    padding: var(--spacing-sm) 0;
}

.exif-item {
    text-align: center;
    background-color: var(--bg-secondary);
    border-radius: 12px;
    padding: var(--spacing-sm) var(--spacing-xs);
    transition: transform 0.2s ease;
}

.exif-item:hover {
    transform: scale(1.02);
}

.exif-value {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    color: var(--text-primary);
    margin-bottom: 4px;
}

.exif-label {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    font-weight: var(--font-weight-normal);
}
</style>
