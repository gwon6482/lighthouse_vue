<script setup lang="ts">
import type { ThreeChoiceItem } from '@/modules/survey/types/survey';

/**
 * ThreeChoiceQuestion 컴포넌트
 *
 * 3가지 선택지 중 하나를 고르는 질문 컴포넌트
 * - O (괜찮음)
 * - M (상관없음)
 * - X (별로임)
 *
 * 사용처: T3(근무환경) 파트
 */


const props = defineProps<{
  items: ThreeChoiceItem[]
  modelValue: Record<string, string>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>]
}>()

const options = [
  { value: 'O', label: '괜찮음', emoji: 'O' },
  { value: 'M', label: '상관없음', emoji: '-' },
  { value: 'X', label: '별로임', emoji: 'X' }
]

function selectOption(itemId: string, value: string) {
  emit('update:modelValue', {
    ...props.modelValue,
    [itemId]: value
  })
}

function getSelectedValue(itemId: string) {
  return props.modelValue[itemId] || ''
}
</script>

<template>
  <div class="three-choice-question">
    <p class="instruction">각 근무 환경에 대한 선호도를 선택해주세요.</p>
    <div class="items-list">
      <div
        v-for="item in items"
        :key="item.item_id"
        class="item-row"
      >
        <div class="item-info">
          <span class="item-name">{{ item.item_name || item.item_id }}</span>
          <span v-if="item.item_definition" class="item-definition">{{ item.item_definition }}</span>
        </div>
        <div class="options">
          <button
            v-for="option in options"
            :key="option.value"
            type="button"
            class="option-btn"
            :class="[
              option.value.toLowerCase(),
              { selected: getSelectedValue(item.item_id) === option.value }
            ]"
            @click="selectOption(item.item_id, option.value)"
          >
            <span class="option-emoji">{{ option.emoji }}</span>
            <span class="option-label">{{ option.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
