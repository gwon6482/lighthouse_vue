<template>
  <button @click="goToNextPage" class="nav-btn next">
    다음
  </button>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'goToNextPage'): void
}>()

const goToNextPage = () => emit('goToNextPage')
</script>
