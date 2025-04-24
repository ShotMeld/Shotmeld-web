<template>
    <div class="photo-detail">
        <div v-if="photo.url" class="photo-container">
            <img :src="photo.url" :alt="photo.title || '照片'">
        </div>

        <div class="photo-info">
            <h2 v-if="photo.title">{{ photo.title }}</h2>
            <p v-if="photo.description">{{ photo.description }}</p>
            <p v-if="photo.createdAt" class="photo-date">
                上传时间: {{ formatDate(photo.createdAt) }}
            </p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'PhotoDetail',
    props: {
        photo: {
            type: Object,
            required: true
        }
    },
    methods: {
        formatDate(dateString) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' }
            return new Date(dateString).toLocaleDateString(undefined, options)
        }
    }
}
</script>

<style scoped>
.photo-detail {
    margin-top: 30px;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 20px;
    background-color: #f9f9f9;
}

.photo-container {
    margin-bottom: 20px;
}

.photo-container img {
    max-width: 100%;
    max-height: 500px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.photo-info {
    text-align: left;
}

.photo-info h2 {
    margin-bottom: 10px;
    color: #2c3e50;
}

.photo-info p {
    color: #666;
    line-height: 1.6;
}

.photo-date {
    font-size: 0.9em;
    color: #888;
    margin-top: 10px;
}
</style>