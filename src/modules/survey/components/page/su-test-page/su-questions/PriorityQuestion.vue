<script setup lang="ts">
/**
 * PriorityQuestion 컴포넌트
 *
 * 여러 항목 중 우선순위를 지정하는 질문 컴포넌트
 * 사용자가 가장 중요하게 생각하는 가치를 1, 2, 3순위로 선택
 * 선택되지 않은 항목은 자동으로 no_priority 배열에 저장됨
 *
 * 사용처: T23(가치관) 파트
 */
import type { PriorityItem, PriorityValue } from '@/modules/survey/types/survey'
import { ref } from 'vue'

const props = defineProps<{
  items: PriorityItem[]
  modelValue: PriorityValue
}>()

const emit = defineEmits<{
  'update:modelValue': [value: PriorityValue]
}>()

const expandedItem = ref<string | null>(null)

// 항목의 현재 순위 (1, 2, 3 또는 null)
function getPriorityRank(itemId: string): number | null {
  if (props.modelValue.priority_1 === itemId) return 1
  if (props.modelValue.priority_2 === itemId) return 2
  if (props.modelValue.priority_3 === itemId) return 3
  return null
}

// 항목 클릭 시 순위 토글45u
function togglePriority(itemId: string) {
  const currentRank = getPriorityRank(itemId)
  const newValue = { ...props.modelValue }

  if (currentRank !== null) {
    // 이미 선택된 항목 해제
    if (currentRank === 1) newValue.priority_1 = ''
    if (currentRank === 2) newValue.priority_2 = ''
    if (currentRank === 3) newValue.priority_3 = ''
  } else {
    // 빈 슬롯에 추가
    if (!newValue.priority_1) {
      newValue.priority_1 = itemId
    } else if (!newValue.priority_2) {
      newValue.priority_2 = itemId
    } else if (!newValue.priority_3) {
      newValue.priority_3 = itemId
    } else {
      // 이미 3개 선택됨
      return
    }
  }

  // no_priority 업데이트
  const selectedIds = [newValue.priority_1, newValue.priority_2, newValue.priority_3].filter(
    Boolean,
  )
  newValue.no_priority = props.items
    .map((item) => item.item_id)
    .filter((id) => !selectedIds.includes(id))

  emit('update:modelValue', newValue)
}

function toggleExpand(itemId: string) {
  expandedItem.value = expandedItem.value === itemId ? null : itemId
}
</script>

<template>
  <div class="priority-question">
    <p class="instruction">가장 중요하게 생각하는 가치를 순서대로 3개 선택해주세요.</p>
    <div class="priority-display">
      <div class="priority-slot" :class="{ filled: modelValue.priority_1 }">
        <span class="slot-label">1순위</span>
        <span class="slot-value">{{
          items.find((i) => i.item_id === modelValue.priority_1)?.item_text || '-'
        }}</span>
      </div>
      <div class="priority-slot" :class="{ filled: modelValue.priority_2 }">
        <span class="slot-label">2순위</span>
        <span class="slot-value">{{
          items.find((i) => i.item_id === modelValue.priority_2)?.item_text || '-'
        }}</span>
      </div>
      <div class="priority-slot" :class="{ filled: modelValue.priority_3 }">
        <span class="slot-label">3순위</span>
        <span class="slot-value">{{
          items.find((i) => i.item_id === modelValue.priority_3)?.item_text || '-'
        }}</span>
      </div>
    </div>
    <div class="items-list">
      <div
        v-for="item in items"
        :key="item.item_id"
        class="item-card"
        :class="{ selected: getPriorityRank(item.item_id) !== null }"
      >
        <div class="item-main" @click="togglePriority(item.item_id)">
          <span v-if="getPriorityRank(item.item_id)" class="priority-badge">
            {{ getPriorityRank(item.item_id) }}
          </span>
          <span class="item-text">{{ item.item_text }}</span>
        </div>
        <button
          v-if="item.item_definition"
          type="button"
          class="expand-btn"
          @click.stop="toggleExpand(item.item_id)"
        >
          {{ expandedItem === item.item_id ? '접기' : '설명' }}
        </button>
        <div v-if="expandedItem === item.item_id && item.item_definition" class="item-definition">
          {{ item.item_definition }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.priority-question {
  padding: 16px 0;
}

.instruction {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.priority-display {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.priority-slot {
  flex: 1;
  padding: 12px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  text-align: center;
  background: #fafafa;
}

.priority-slot.filled {
  border-style: solid;
  border-color: #333;
  background: #fff;
}

.slot-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.slot-value {
  font-size: 13px;
  color: #333;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-card {
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background: #fff;
  overflow: hidden;
  transition: all 0.2s ease;
}

.item-card.selected {
  border-color: #333;
  background: #f9f9f9;
}

.item-main {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  cursor: pointer;
}

.priority-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #333;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.item-text {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  flex: 1;
}

.expand-btn {
  margin: 0 16px 12px;
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  font-size: 12px;
  color: #666;
  cursor: pointer;
}

.item-definition {
  padding: 12px 16px;
  background: #f5f5f5;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  border-top: 1px solid #eee;
}
</style>
