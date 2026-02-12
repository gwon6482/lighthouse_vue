<template>
  <div class="multi-select-question">
    <p class="instruction">관심 있는 분야를 모두 선택해주세요.</p>
    <div class="items-grid">
      <button
        v-for="item in items"
        :key="item.item_id"
        type="button"
        class="item-btn"
        :class="{ selected: isSelected(item.item_id) }"
        @click="toggleItem(item.item_id)"
      >
        <span class="item-name">{{ item.item_name || item.item_id }}</span>
        <span v-if="item.item_text" class="item-text">{{ item.item_text }}</span>
      </button>
    </div>
    <p class="selected-count">선택된 항목: {{ modelValue.length }}개</p>
  </div>
</template>

<script setup lang="ts">
/**
 * MultiSelectQuestion 컴포넌트
 *
 * 여러 항목 중 다수를 선택할 수 있는 체크박스 형태의 질문 컴포넌트
 * 사용자가 관심 있는 분야를 복수 선택할 수 있음
 *
 * 사용처: T22(흥미) 파트
 */
import type { MultiSelectItem } from '@/modules/survey/types/survey'
import { computed } from 'vue'

const props = defineProps<{
  items: MultiSelectItem[]
  modelValue: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const selectedSet = computed(() => new Set(props.modelValue))

function toggleItem(itemId: string) {
  const newSet = new Set(props.modelValue)
  if (newSet.has(itemId)) {
    newSet.delete(itemId)
  } else {
    newSet.add(itemId)
  }
  emit('update:modelValue', Array.from(newSet))
}

function isSelected(itemId: string) {
  return selectedSet.value.has(itemId)
}
</script>

<style scoped>
.multi-select-question {
  padding: 16px 0;
}

.instruction {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.items-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.item-btn:hover {
  border-color: #999;
  background: #f9f9f9;
}

.item-btn.selected {
  border-color: #333;
  background: #f5f5f5;
}

.item-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.item-text {
  font-size: 13px;
  color: #666;
  margin-top: 4px;
  line-height: 1.4;
}

.selected-count {
  margin-top: 16px;
  font-size: 14px;
  color: #666;
  text-align: right;
}
</style>
