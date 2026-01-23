<script setup lang="ts">
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
interface Item {
  item_id: string
  item_name?: string
  item_definition?: string
}

const props = defineProps<{
  items: Item[]
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

<style scoped>
.three-choice-question {
  padding: 16px 0;
}

.instruction {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  background: #fff;
}

@media (min-width: 600px) {
  .item-row {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.item-info {
  flex: 1;
}

.item-name {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.item-definition {
  display: block;
  font-size: 13px;
  color: #666;
  margin-top: 2px;
}

.options {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.option-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 60px;
}

.option-btn:hover {
  background: #f5f5f5;
}

.option-btn.selected.o {
  border-color: #4caf50;
  background: #e8f5e9;
}

.option-btn.selected.m {
  border-color: #ff9800;
  background: #fff3e0;
}

.option-btn.selected.x {
  border-color: #f44336;
  background: #ffebee;
}

.option-emoji {
  font-size: 16px;
  font-weight: 700;
}

.option-btn.selected.o .option-emoji {
  color: #4caf50;
}

.option-btn.selected.m .option-emoji {
  color: #ff9800;
}

.option-btn.selected.x .option-emoji {
  color: #f44336;
}

.option-label {
  font-size: 11px;
  color: #666;
}
</style>
