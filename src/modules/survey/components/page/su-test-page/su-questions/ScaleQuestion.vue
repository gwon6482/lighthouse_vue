<template>
  <div class="scale-question">
    <p class="question-text">
      <span class="question-num">{{ questionNum }}.</span>
      {{ questionText }}
    </p>
    <div class="options" :class="`scale-${scaleType || 5}`">
      <!-- <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="option-btn"
        :class="{ selected: modelValue === option.value }"
        @click="selectOption(option.value)"
      >
        {{ option.label }}
      </button> -->
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        :class="['option-btn', { selected: modelValue === option.value } ]"
        @click="selectOption(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ScaleQuestion 컴포넌트
 *
 * 설문 조사의 척도형 질문을 렌더링하는 컴포넌트
 * - 2지선다 (O/X)
 * - 5지선다 (매우 아니다 ~ 매우 그렇다)
 * - 10점 척도 (1~10)
 *
 * 사용처: T1(성격), T21(재능) 파트
 */
import { computed } from 'vue'

const props = defineProps<{
  questionId: string
  questionNum: string
  questionText: string
  modelValue: string
  scaleType?: 2 | 5 | 10
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// 스케일 타입에 따른 옵션 생성
const options = computed(() => {
  const scale = props.scaleType || 5

  if (scale === 2) {
    return [
      { value: 'O', label: 'O' },
      { value: 'X', label: 'X' },
    ]
  }

  if (scale === 5) {
    return [
      { value: 'A', label: '매우 아니다' },
      { value: 'B', label: '아니다' },
      { value: 'C', label: '보통' },
      { value: 'D', label: '그렇다' },
      { value: 'E', label: '매우 그렇다' },
    ]
  }

  // 10점 척도
  return Array.from({ length: 10 }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
  }))
})

function selectOption(value: string) {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.scale-question {
  padding: 16px 0;
  border-bottom: 1px solid #eee;
}

.scale-question:last-child {
  border-bottom: none;
}

.question-text {
  font-size: 16px;
  line-height: 1.5;
  color: #333;
  margin-bottom: 12px;
}

.question-num {
  font-weight: 600;
  color: #666;
  margin-right: 4px;
}

.options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.options.scale-5 {
  justify-content: space-between;
}

.options.scale-2 {
  justify-content: center;
  gap: 24px;
}

.options.scale-10 {
  justify-content: flex-start;
}

.option-btn {
  flex: 1;
  min-width: 60px;
  max-width: 120px;
  padding: 12px 8px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.options.scale-10 .option-btn {
  min-width: 40px;
  max-width: 50px;
  padding: 10px 6px;
}

.option-btn:hover {
  border-color: #999;
  background: #f9f9f9;
}

.option-btn.selected {
  border-color: #333;
  background: #333;
  color: #fff;
}

@media (max-width: 480px) {
  .options.scale-5 .option-btn {
    font-size: 12px;
    padding: 10px 4px;
    min-width: 50px;
  }
}
</style>
