<template>
  <div class="scale-question-10">
    <p class="question-text">
      <span class="question-num">{{ questionNum }}.</span>
      {{ questionText }}
    </p>
    <div class="options">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        :class="['option-btn', { selected: modelValue === option.value }]"
        :style="modelValue === option.value ? option.selectedStyle : {}"
        @click="selectOption(option.value)"
      >{{ option.label }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ScaleQuestion10 컴포넌트
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

function interpolateColor(t: number): string {
  const r = Math.round(203 + (68 - 203) * t)
  const g = Math.round(221 + (133 - 221) * t)
  const b = Math.round(255 + (254 - 255) * t)
  return `rgb(${r}, ${g}, ${b})`
}

// 스케일 타입에 따른 옵션 생성
const options = Array.from({ length: 10 }, (_, i) => {
  const color = interpolateColor(i / 9)
  return {
    value: String(i + 1),
    label: String(i + 1),
    selectedStyle: { backgroundColor: color, borderColor: color, color: '#fff' },
  }
})

function selectOption(value: string) {
  emit('update:modelValue', value)
}
</script>
