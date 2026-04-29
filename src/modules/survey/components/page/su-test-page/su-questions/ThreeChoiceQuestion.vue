<template>
  <div class="survey-wrap">
    <p class="survey-title">업무환경 설문</p>
    <div class="parts-container">
      <div
        v-for="(item, i) in items"
        :key="item.item_id"
        class="part-card"
      >
        <p class="part-label">파트 {{ i + 1 }}  ·  {{ item.item_name }}</p>
        <p class="part-question">{{ item.item_question }}</p>
        <div class="slider-wrap">
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            :value="modelValue[item.item_id as keyof T3Answers]"
            @input="handleInput(item.item_id, ($event.target as HTMLInputElement).valueAsNumber)"
          />
        </div>
        <div class="tick-row">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
        <div class="level-desc">
          <div class="desc-label">레벨 {{ modelValue[item.item_id as keyof T3Answers] }}</div>
          <div class="desc-text">{{ levelDesc(item, modelValue[item.item_id as keyof T3Answers]) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { T3Answers, SurveyItem } from '../../../types/survey'

const props = defineProps<{ modelValue: T3Answers; items: SurveyItem[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: T3Answers] }>()

function handleInput(itemId: string, value: number) {
  emit('update:modelValue', { ...props.modelValue, [itemId]: value })
}

function levelDesc(item: SurveyItem, level: number): string {
  const found = item.levels?.find(l => l.level === level)
  return found?.description ?? ''
}
</script>
