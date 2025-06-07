<!--
  PhotoDetail.vue - 照片详情组件
-->

<template>
  <PhotoDetail
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :photo="photo"
    @photo-deleted="$emit('photo-deleted', $event)"
    @tag-clicked="$emit('tag-clicked', $event)"
  />
</template>

<script>
import PhotoDetail from './PhotoDetail/PhotoDetail.vue'

export default {
  name: 'PhotoDetailWrapper',
  components: {
    PhotoDetail,
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    photo: {
      type: Object,
      default: null,
    },
  },
  emits: ['update:modelValue', 'photo-deleted', 'tag-clicked'],
}
</script>

<style scoped></style>
