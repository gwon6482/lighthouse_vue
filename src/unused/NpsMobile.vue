<template>
  <div class="phone-frame">
    <div class="notch"></div>
    <div class="screen">

      <div class="progress-bar-wrap">
        <div
          v-for="i in totalSteps"
          :key="i"
          class="prog-seg"
          :class="{ done: i <= currentStep }"
        />
      </div>

      <div class="q-tag">질문 {{ currentStep }} / {{ totalSteps }}</div>
      <h2 class="q-title">친구에게 이 서비스를<br>추천할 가능성은?</h2>
      <p class="q-sub">0 = 전혀 추천 안 함 &nbsp;·&nbsp; 9 = 적극 추천</p>

      <div class="nps-grid">
        <button
          v-for="n in options"
          :key="n"
          class="nps-btn"
          :class="{
            active: selected === n,
            dimmed: selected !== null && selected !== n
          }"
          :style="selected === n ? { background: getColor(n), borderColor: 'transparent' } : {}"
          @click="pick(n)"
        >
          {{ n }}
        </button>
      </div>

      <div class="scale-labels">
        <span>추천 안 함</span>
        <span>적극 추천</span>
      </div>

      <transition name="slide-up">
        <div v-if="selected !== null" class="result-box">
          <div class="result-score" :style="{ color: getColor(selected) }">
            {{ selected }}
          </div>
          <div class="result-info">
            <div class="result-label">{{ getLabel(selected) }}</div>
            <div class="result-desc">{{ getDesc(selected) }}</div>
          </div>
        </div>
      </transition>

      <div class="bottom-area">
        <transition name="slide-up">
          <button v-if="selected !== null" class="submit-btn" @click="onSubmit">
            다음 질문 →
          </button>
        </transition>
        <div style="display: flex; justify-content: center;">
          <button
            v-if="selected !== null"
            class="reset-btn"
            @click="reset"
          >
            다시 선택
          </button>
        </div>
      </div>

    </div>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue'

const options = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const selected = ref<number | null>(null)
const currentStep = ref(3)
const totalSteps = ref(4)

const colors = [
  '#A32D2D', '#C13030', '#D85A30', '#E27830', '#BA7517',
  '#9B9020', '#639922', '#3B6D11', '#0F6E56', '#185FA5'
]

function getColor(n: number) {
  return colors[n]
}

function getLabel(n: number) {
  if (n <= 2) return '비추천'
  if (n <= 4) return '부정적'
  if (n <= 6) return '중립'
  if (n <= 7) return '긍정적'
  return '강력 추천'
}

function getDesc(n: number) {
  if (n <= 2) return '개선이 필요한 영역이 있었나요?'
  if (n <= 4) return '아쉬운 경험이 있으셨군요.'
  if (n <= 6) return '보통 수준의 경험이었네요.'
  if (n <= 7) return '좋은 경험을 하셨네요!'
  return '최고의 경험 감사합니다!'
}

function pick(n: number) {
  selected.value = n
}

function reset() {
  selected.value = null
}

const emit = defineEmits(['submit'])

function onSubmit() {
  emit('submit', selected.value)
}
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.phone-frame {
  width: 375px;
  min-height: 720px;
  background: #f5f3ee;
  border-radius: 40px;
  border: 8px solid #1a1a1a;
  margin: 2rem auto;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
  font-family: 'DM Sans', sans-serif;
}

.notch {
  width: 120px;
  height: 28px;
  background: #1a1a1a;
  border-radius: 0 0 18px 18px;
  margin: 0 auto;
}

.screen {
  padding: 1.5rem 1.25rem 2rem;
  min-height: 660px;
  display: flex;
  flex-direction: column;
}

/* Progress */
.progress-bar-wrap {
  display: flex;
  gap: 4px;
  margin-bottom: 1.5rem;
}

.prog-seg {
  flex: 1;
  height: 3px;
  border-radius: 99px;
  background: #e0ddd7;
  transition: background 0.3s;
}

.prog-seg.done {
  background: #1a1a1a;
}

/* Header */
.q-tag {
  font-size: 11px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: #aaa;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.q-title {
  font-size: 20px;
  font-weight: 500;
  line-height: 1.4;
  color: #1a1a1a;
  margin-bottom: 0.4rem;
}

.q-sub {
  font-size: 12px;
  color: #bbb;
  margin-bottom: 1.5rem;
}

/* NPS Grid */
.nps-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 8px;
}

.nps-btn {
  height: 54px;
  border-radius: 14px;
  border: 1.5px solid #e2e0db;
  background: #fff;
  color: #333;
  font-size: 17px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s ease;
  -webkit-tap-highlight-color: transparent;
  font-family: 'DM Sans', sans-serif;
}

.nps-btn:active {
  transform: scale(0.94);
}

.nps-btn.active {
  color: #fff;
  transform: scale(1.06);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
}

.nps-btn.dimmed {
  opacity: 0.3;
}

.scale-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #bbb;
  padding: 0 2px;
  margin-bottom: 1.5rem;
}

/* Result */
.result-box {
  background: #fff;
  border-radius: 18px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.result-score {
  font-size: 44px;
  font-weight: 600;
  line-height: 1;
  min-width: 48px;
  text-align: center;
}

.result-info {
  flex: 1;
}

.result-label {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 2px;
}

.result-desc {
  font-size: 12px;
  color: #999;
  line-height: 1.5;
}

/* Bottom */
.bottom-area {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.submit-btn {
  width: 100%;
  height: 52px;
  border-radius: 16px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: transform 0.15s;
}

.submit-btn:active {
  transform: scale(0.98);
}

.reset-btn {
  background: none;
  border: 1.5px solid #e0ddd7;
  border-radius: 99px;
  padding: 10px 24px;
  font-size: 13px;
  color: #aaa;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.15s;
}

.reset-btn:hover {
  border-color: #bbb;
  color: #666;
}

/* Transitions */
.slide-up-enter-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
</style>
