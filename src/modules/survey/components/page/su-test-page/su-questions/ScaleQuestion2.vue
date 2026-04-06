<template>
  <div class="scale-question-2">
    <p class="question-text">
      <span class="question-num">{{ questionNum }}.</span>
      {{ questionText }}
    </p>
    <div class="options">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        :class="['option-btn', option.colorClass, { selected: modelValue === option.value }]"
        @click="selectOption(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ScaleQuestion2 컴포넌트
 *
 * 설문 조사의 척도형 질문을 렌더링하는 컴포넌트
 * - 2지선다 (O/X)
 * - 5지선다 (매우 아니다 ~ 매우 그렇다)
 * - 10점 척도 (1~10)
 *
 * 사용처: T1(성격), T21(재능) 파트
 */

defineProps<{
  questionId: string
  questionNum: string
  questionText: string
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// 스케일 타입에 따른 옵션 생성
const options = [
  { value: 'O', label: 'O', colorClass: 'btn-O' },
  { value: 'X', label: 'X', colorClass: 'btn-X' },
]

function selectOption(value: string) {
  emit('update:modelValue', value)
}
</script>
