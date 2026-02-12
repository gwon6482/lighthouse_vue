<template>
  <span class="page-indicator"> {{ currentPageIndex + 1 }} / {{ totalPages }} </span>
</template>

<script setup lang="ts">
defineProps<{
  currentPageIndex: number
  totalPages: number
}>()
</script>
