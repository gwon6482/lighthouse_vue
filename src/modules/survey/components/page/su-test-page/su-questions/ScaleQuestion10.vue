<template>
  <div class="scale-question">
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

<style scoped>
.scale-question {
  padding: 32px 0;
  border-bottom: 1px solid #eee;
}

.scale-question:first-child {
  padding-top: 10px;
}

.scale-question:last-child {
  border-bottom: none;
}

.question-text {
  text-align: center;
  font-size: 16px;
  line-height: 1.5;
  color: #333;
  margin-bottom: 18px;
}

.question-num {
  font-weight: 600;
  color: #666;
  margin-right: 4px;
}

.options {
  display: grid;
  grid-template-columns: repeat(5, 55px);
  gap: 10px;
  justify-content: center;
}

.option-btn {
  width: 55px;
  height: 55px;
  border-radius: 12px;
  border: 1.5px solid #ccc;
  background: #fff;
  color: #000;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-btn:hover {
  border-color: #999;
  background: #f5f5f5;
}

.option-btn.selected {
  border-color: #333;
  background: #333;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
}
</style>
