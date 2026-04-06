<template>
  <div class="scale-question-5">
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
      ></button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ScaleQuestion5 컴포넌트
 *
 * 설문 조사의 척도형 질문을 렌더링하는 컴포넌트
 * - 5지선다 (매우 아니다 ~ 매우 그렇다)
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
  { value: 'A', label: '매우 아니다', colorClass: 'btn-bad' },
  { value: 'B', label: '아니다', colorClass: 'btn-bad2' },
  { value: 'C', label: '보통', colorClass: 'btn-mid' },
  { value: 'D', label: '그렇다', colorClass: 'btn-good2' },
  { value: 'E', label: '매우 그렇다', colorClass: 'btn-good' },
]

function selectOption(value: string) {
  emit('update:modelValue', value)
}
</script>
