<template>
  <div class="scale-question">
    <p class="question-text">
      <span class="question-num">{{ questionNum }}.</span>
      {{ questionText }}
    </p>
    <div class="options" :class="`scale-${scaleType || 5}`">
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
      { value: 'O', label: 'O', colorClass: '' },
      { value: 'X', label: 'X', colorClass: '' },
    ]
  }

  if (scale === 5) {
    return [
      { value: 'A', label: '매우 아니다', colorClass: 'btn-bad' },
      { value: 'B', label: '아니다', colorClass: 'btn-bad2' },
      { value: 'C', label: '보통', colorClass: 'btn-mid' },
      { value: 'D', label: '그렇다', colorClass: 'btn-good2' },
      { value: 'E', label: '매우 그렇다', colorClass: 'btn-good' },
    ]
  }

  // 10점 척도
  return Array.from({ length: 10 }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
    colorClass: '',
  }))
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
  display: flex;
  gap: 28px;
  /* flex-wrap: wrap; */
}

.options.scale-5 {
  justify-content: center;
}

.options.scale-2 {
  justify-content: center;
  gap: 24px;
}

.options.scale-10 {
  justify-content: flex-start;
}

.option-btn {
  width: 34px;
  height: 34px;
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

/* 5점 척도 개별 버튼 색상 */
.btn-bad {
  --btn-color: #ff6b57;
  border-color: rgba(255, 107, 87, 0.4);
  color: #ff6b57;
}
.btn-bad2 {
  --btn-color: #ff9a8b;
  border-color: rgba(255, 107, 87, 0.25);
  color: #ff9a8b;
}
.btn-mid {
  --btn-color: #9aa0a6;
  border-color: rgba(154, 160, 166, 0.35);
  color: #9aa0a6;
}
.btn-good2 {
  --btn-color: #5dba8a;
  border-color: rgba(31, 182, 106, 0.35);
  color: #5dba8a;
}
.btn-good {
  --btn-color: #1fb66a;
  border-color: rgba(31, 182, 106, 0.5);
  color: #1fb66a;
}

.btn-bad.selected,
.btn-bad2.selected,
.btn-mid.selected,
.btn-good2.selected,
.btn-good.selected {
  background: var(--btn-color);
  border-color: var(--btn-color);
  color: #fff;
}

@media (max-width: 480px) {
  .options.scale-5 .option-btn {
    padding: 10px 4px;
  }
}
</style>
