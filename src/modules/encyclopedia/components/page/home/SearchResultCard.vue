<template>
  <div class="search-result-card" @click="emit('click')">
    <div class="search-result-card__classifications">
      <span class="search-result-card__primary">{{ job.classification.primary }}</span>
      <span class="search-result-card__dot">·</span>
      <span class="search-result-card__secondary">{{ job.classification.secondary }}</span>
    </div>
    <p class="search-result-card__title">{{ job.title }}</p>
    <span class="search-result-card__arrow">›</span>
  </div>
</template>

<script setup lang="ts">
import type { JobSummary } from '../../../types/encyclopedia'

defineProps<{
  job: JobSummary
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<style scoped>
.search-result-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  padding: 18px 20px;
  border-radius: 14px;
  background-color: #f5f5f5;
  cursor: pointer;
  transition: background-color 0.15s ease;
  position: relative;
}

.search-result-card:active {
  background-color: #e8e8e8;
}

@media (hover: hover) {
  .search-result-card:hover {
    background-color: #e8e8e8;
  }
}

.search-result-card__classifications {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.search-result-card__primary,
.search-result-card__secondary {
  font-size: 12px;
  color: #888;
}

.search-result-card__dot {
  font-size: 12px;
  color: #ccc;
}

.search-result-card__title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  padding-right: 24px;
}

.search-result-card__arrow {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 22px;
  color: #bbb;
}
</style>
