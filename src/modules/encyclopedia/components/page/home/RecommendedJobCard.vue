<template>
  <div class="recommended-job-card" @click="emit('click')">
    <div class="recommended-job-card__classifications">
      <span class="recommended-job-card__primary">{{ job.classification.primary }}</span>
      <span class="recommended-job-card__dot">·</span>
      <span class="recommended-job-card__secondary">{{ job.classification.secondary }}</span>
    </div>
    <p class="recommended-job-card__title">{{ job.title }}</p>
    <span class="recommended-job-card__arrow">›</span>
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

<style scoped lang="scss">
.recommended-job-card {
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

  &:active { background-color: #e8e8e8; }

  @media (hover: hover) {
    &:hover { background-color: #e8e8e8; }
  }

  &__classifications {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
  }

  &__primary,
  &__secondary {
    font-size: 12px;
    color: #888;
  }

  &__dot {
    font-size: 12px;
    color: #ccc;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    padding-right: 24px;
  }

  &__arrow {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 22px;
    color: #bbb;
  }
}
</style>
