<template>
  <button @click="goToPrevPage" class="nav-btn prev">이전</button>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'goToPrevPage'): void
}>()

const goToPrevPage = () => emit('goToPrevPage')
</script>
