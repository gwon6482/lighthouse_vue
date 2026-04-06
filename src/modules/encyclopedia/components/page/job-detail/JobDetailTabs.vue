<template>
  <nav class="job-detail-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      :class="['job-detail-tabs__btn', { 'job-detail-tabs__btn--active': activeTab === tab.value }]"
      @click="emit('change', tab.value)"
    >
      {{ tab.label }}
    </button>
  </nav>
</template>

<script setup lang="ts">
import type { JobDetailTab } from '../../../types/encyclopedia'

defineProps<{
  activeTab: JobDetailTab
}>()

const emit = defineEmits<{
  change: [tab: JobDetailTab]
}>()

const tabs: { value: JobDetailTab; label: string }[] = [
  { value: 'overview',    label: '개요' },
  { value: 'review',      label: '후기' },
  { value: 'preparation', label: '준비과정' },
  { value: 'recruitment', label: '채용' },
]
</script>

<style scoped lang="scss">
.job-detail-tabs {
  display: flex;
  width: 100%;
  border-bottom: 1.5px solid #eee;
  padding: 0 55px;
  gap: 4px;

  &__btn {
    padding: 10px 16px;
    border: none;
    background: transparent;
    font-family: inherit;
    font-size: 16px;
    font-weight: 500;
    color: #aaa;
    cursor: pointer;
    position: relative;
    transition: color 0.15s ease;

    &::after {
      content: '';
      position: absolute;
      bottom: -1.5px;
      left: 0;
      right: 0;
      height: 2px;
      background-color: #3365E3;
      opacity: 0;
      transition: opacity 0.15s ease;
    }

    &--active {
      color: #3365E3;
      font-weight: 700;

      &::after { opacity: 1; }
    }
  }
}
</style>
