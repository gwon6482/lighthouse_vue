<template>
  <header class="job-detail-header">
    <button class="job-detail-header__back" @click="router.back()">‹</button>
    <div class="job-detail-header__info">
      <div class="job-detail-header__classifications">
        <span class="job-detail-header__primary">{{ classification.primary }}</span>
        <span class="job-detail-header__dot">·</span>
        <span class="job-detail-header__secondary">{{ classification.secondary }}</span>
      </div>
      <h1 class="job-detail-header__title">{{ title }}</h1>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { JobClassification } from '../../../types/encyclopedia'

defineProps<{
  title: string
  classification: JobClassification
}>()

const router = useRouter()
</script>

<style scoped>
.job-detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 16px;
  width: 100%;
}

.job-detail-header__back {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: none;
  background-color: #f5f5f5;
  border-radius: 10px;
  font-size: 22px;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  padding-bottom: 1px;
  transition: background-color 0.15s ease;
}

.job-detail-header__back:active {
  background-color: #e8e8e8;
}

.job-detail-header__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.job-detail-header__classifications {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.job-detail-header__primary,
.job-detail-header__secondary {
  font-size: 12px;
  color: #888;
}

.job-detail-header__dot {
  font-size: 12px;
  color: #ccc;
}

.job-detail-header__title {
  font-size: 22px;
  font-weight: 700;
  color: #333;
}
</style>
