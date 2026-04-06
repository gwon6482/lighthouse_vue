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
