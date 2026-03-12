<template>
  <button @click="handleSubmit" class="nav-btn submit">제출</button>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'handleSubmit'): void
}>()

const handleSubmit = () => emit('handleSubmit')
</script>
