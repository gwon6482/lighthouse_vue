<template>
  <button @click="handleSubmit" :disabled="disabled" class="nav-btn submit">제출</button>
</template>

<script setup lang="ts">
defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'handleSubmit'): void
}>()

const handleSubmit = () => emit('handleSubmit')
</script>
