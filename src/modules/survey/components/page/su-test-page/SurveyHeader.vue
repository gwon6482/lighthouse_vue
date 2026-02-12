<template>
  <header class="survey-header">
    <div class="part-info">
      <span class="part-number">파트 {{ currentPartInfo.number }}</span>
      <span class="part-name">{{ currentPartInfo.name }}</span>
    </div>
    <div class="page-info">
      {{ currentPartPageInfo.current }} / {{ currentPartPageInfo.total }} 페이지
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  currentPartInfo: { number: number; name: string }
  currentPartPageInfo: { current: number; total: number }
}>()
</script>
