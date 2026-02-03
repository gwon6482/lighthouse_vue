<template>
  <div class="progress-bar">
    <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
  </div>
  <div class="progress-text">전체 진행률: {{ progress }}%</div>
</template>

<script setup lang="ts">
  defineProps<{
    progress: number
  }>()
</script>
