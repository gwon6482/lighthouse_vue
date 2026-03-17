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
        :class="['option-btn', option.colorClass, { selected: modelValue === option.value }]"
        @click="selectOption(option.value)"
      ></button>
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

// 스케일 타입에 따른 옵션 생성
const options =
  // 10점 척도
  Array.from({ length: 10 }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
    colorClass: '',
  }))

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
  display: flex;
  gap: 28px;
  justify-content: center;
  align-items: center;
}

.options.scale-10 {
  justify-content: flex-start;
}

.option-btn {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: 2px solid;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
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
</style>
