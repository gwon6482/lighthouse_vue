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

      <!-- 이게 실제 사용된 버튼 코드 -->
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        :class="['option-btn', { selected: modelValue === option.value }]"
        @click="selectOption(option.value)"
      >
        {{ option.label }}
      </button>

      <!-- <form class="scale" aria-label="질문 1 응답">
        <div class="scale__choices" role="radiogroup" aria-label="1~5 선택">
          <label>
            <input type="radio" name="q1" value="1" />
            <span class="dot dot--bad" aria-hidden="true"></span>
          </label>
          <label>
            <input type="radio" name="q1" value="2" />
            <span class="dot dot--bad2" aria-hidden="true"></span>
          </label>
          <label>
            <input type="radio" name="q1" value="3" />
            <span class="dot dot--mid" aria-hidden="true"></span>
          </label>
          <label>
            <input type="radio" name="q1" value="4" />
            <span class="dot dot--good2" aria-hidden="true"></span>
          </label>
          <label>
            <input type="radio" name="q1" value="5" />
            <span class="dot dot--good" aria-hidden="true"></span>
          </label>
        </div>

        <div class="scale__label">
          <div class="scale__label--left">아니다</div>
          <div class="scale__label--right">그렇다</div>
        </div>
      </form> -->

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
  padding: 32px 0;
  border-bottom: 1px solid #eee;
  --text: #111;
  --muted: #9aa0a6;
  --line: #e6e6e6;
  --bad: #ff6b57;
  --good: #1fb66a;
  --ring: 3px;
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
  /* letter-spacing: -0.2px; */
  /* white-space: pre-line; */
}

.question-num {
  font-weight: 600;
  color: #666;
  margin-right: 4px;
}

/* 5점 척도 */
.scale {
  display: grid;
  /* grid-template-columns: auto 1fr auto; */
  align-items: end;
  gap: 14px;
  margin: 0 auto;
  max-width: 340px;
}
.scale__label {
  font-size: 13px;
  color: #333;
  display: flex;
  justify-content: space-between;
}
.scale__label--left {
  justify-self: start;
  transform: translateX(-1px);
}
.scale__label--right {
  justify-self: end;
  transform: translateX(1px);
}

.scale__choices {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}

/* 라디오 숨기고 커스텀 원형 버튼 */
.scale input[type='radio'] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.dot {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: inline-grid;
  place-items: center;
  cursor: pointer;
  user-select: none;
  transition:
    transform 120ms ease,
    filter 120ms ease;
}
.dot:active {
  transform: scale(0.96);
}

/* 상태별 스타일 (스크린샷처럼: 좌측 2개 붉은 링, 가운데 회색, 우측 2개 초록) */
.dot--bad {
  --dot-fill-color: rgba(255, 107, 87, 0.55);
  box-shadow: inset 0 0 0 var(--ring) var(--dot-fill-color);
}
.dot--bad2 {
  --dot-fill-color: rgba(255, 107, 87, 0.45);
  box-shadow: inset 0 0 0 var(--ring) var(--dot-fill-color);
  width: 30px;
  height: 30px;
}

.dot--mid {
  --dot-fill-color: rgba(154, 160, 166, 0.35);
  box-shadow: inset 0 0 0 var(--ring) var(--dot-fill-color);
  width: 28px;
  height: 28px;
}

.dot--good2 {
  --dot-fill-color: rgba(31, 182, 106, 0.6);
  box-shadow: inset 0 0 0 var(--ring) var(--dot-fill-color);
  width: 30px;
  height: 30px;
}
.dot--good {
  --dot-fill-color: rgba(31, 182, 106, 0.8);
  box-shadow: inset 0 0 0 var(--ring) var(--dot-fill-color);
}

/* 선택되면 조금 더 진하게 */
.scale input[type='radio']:checked + .dot {
  background-color: var(--dot-fill-color);
  filter: saturate(1.2) contrast(1.05);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}
.scale input[type='radio']:focus-visible + .dot {
  outline: 3px solid rgba(0, 115, 255, 0.35);
  outline-offset: 3px;
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
