<template>
  <div class="error">
    <p>{{ error }}</p>
    <button @click="loadSurvey">다시 시도</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  error: string
}>()

const emit = defineEmits<{
  (e: 'loadSurvey'): void
}>()

const loadSurvey = () => emit('loadSurvey')
</script>
