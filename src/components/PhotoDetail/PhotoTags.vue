<!--
  PhotoTags.vue - 照片详情/标签组件
-->

<template>
    <div class="info-group" v-if="photo?.tags && photo.tags.length > 0">
        <h3 class="info-group-title">标签</h3>
        <div class="photo-tags">
            <div v-for="tag in photo.tags" :key="tag" class="apple-tag" @click="handleTagClick(tag)">
                <span class="tag-icon">#</span>
                <span class="tag-name">{{ tag }}</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'PhotoTags',
    props: {
        photo: {
            type: Object,
            default: null
        }
    },
    methods: {
        handleTagClick(tag) {
            this.$emit('tag-clicked', tag);

            const tagElement = event.currentTarget;
            if (tagElement) {
                tagElement.style.transition = 'transform 0.1s ease';
                tagElement.style.transform = 'scale(0.95)';

                setTimeout(() => {
                    tagElement.style.transform = '';
                }, 150);
            }
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

.photo-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-sm);
}

.apple-tag {
    display: flex;
    align-items: center;
    padding: 6px 12px;
    border-radius: var(--radius-round);
    background-color: rgba(0, 122, 255, 0.08);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: all var(--transition-fast);
    user-select: none;
    -webkit-user-select: none;
    gap: 4px;
    color: var(--text-primary);
}

.apple-tag:hover {
    background-color: rgba(0, 122, 255, 0.12);
    transform: translateY(-1px);
    box-shadow: var(--shadow-small);
}

.apple-tag:active {
    transform: translateY(0);
    background-color: rgba(0, 122, 255, 0.16);
}

.tag-icon {
    color: var(--color-primary);
    opacity: 0.7;
    font-weight: var(--font-weight-semibold);
}

.tag-name {
    color: var(--color-primary);
    font-weight: var(--font-weight-medium);
}
</style>
