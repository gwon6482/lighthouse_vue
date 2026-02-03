<template>
  <button @click="handleSubmit" class="nav-btn submit">
    제출
  </button>
</template>

<script setup lang="ts">
const emit =defineEmits<{
  (e: 'handleSumbit'): void
}>()

const handleSubmit = () => emit('handleSumbit')
</script>
