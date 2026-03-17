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
      >{{ option.label }}</button>
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
  gap: 100px;
  justify-content: center;
  align-items: center;
}

.option-btn {
  width: 90px;
  height: 120px;
  border-radius: 10px;
  border: 2px solid;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 30px;
}

.option-btn:hover {
  border-color: #999;
  background: #f9f9f9;
  color: #999;
}

.option-btn.selected {
  border-color: #333;
  background: #333;
  color: #fff;
}

.btn-O {
color: #ff6b57;
--btn-color: #ff6b57;
border-color: rgba(255, 107, 87, 0.4);
}
.btn-X {
color: #1fb66a;
--btn-color: #1fb66a;
border-color: rgba(31, 182, 106, 0.5);
}

.btn-0.selected,
.btn-X.selected {
  background: var(--btn-color);
  border-color: var(--btn-color);
  color: #fff;
}
</style>
