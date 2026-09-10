<template>
  <section class="pd">
    <p class="pd-eyebrow">{{ eyebrow }}</p>
    <h3 class="pd-title">{{ title }}</h3>
    <p class="pd-sub">{{ subtitle }}</p>

    <div
      v-for="(factor, i) in factors"
      :key="factor.name"
      class="pd-row"
      :class="{ 'pd-row--last': i === factors.length - 1 }"
    >
      <div v-if="i < topCount" class="pd-head pd-head--static">
        <span class="pd-name pd-name--top">{{ factor.name }}</span>
        <span class="pd-bar">
          <span class="pd-fill" :style="{ width: factor.score + '%', background: barColor(i) }"></span>
        </span>
        <span class="pd-score pd-score--top" :style="{ color: scoreColor(i) }">{{ factor.score }}</span>
      </div>
      <button
        v-else
        type="button"
        class="pd-head"
        :aria-expanded="isOpen(factor.name)"
        @click="toggle(factor.name)"
      >
        <span class="pd-name">{{ factor.name }}</span>
        <span class="pd-bar">
          <span class="pd-fill" :style="{ width: factor.score + '%', background: barColor(i) }"></span>
        </span>
        <span class="pd-score" :style="{ color: scoreColor(i) }">{{ factor.score }}</span>
        <svg class="pd-chev" :class="{ 'is-open': isOpen(factor.name) }" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <span v-if="i < topCount && factor.percentile != null" class="pd-pct">상위 {{ factor.percentile }}%</span>

      <p v-if="i < topCount" class="pd-desc">{{ factor.description }}</p>
      <p v-else v-show="isOpen(factor.name)" class="pd-desc">{{ factor.description }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

interface Factor {
  name: string
  score: number
  percentile?: number
  description: string
}

type Tier = 'primary' | 'secondary' | 'muted'

const props = withDefaults(
  defineProps<{
    eyebrow?: string
    title?: string
    subtitle?: string
    // 상위 몇 개를 '분류에 사용된 강조 항목'으로 볼지 (0번은 옐로, 그 다음부터 블루)
    topCount?: number
    factors?: Factor[]
  }>(),
  {
    eyebrow: '성격 & 기질',
    title: '나의 성격 분포',
    subtitle: '9가지 성격 요소에서 나의 점수에요',
    topCount: 3,
    factors: () => [
      { name: '자극추구', score: 75, percentile: 13.7, description: '새롭고 신기한 자극에 대해 강한 흥미를 느끼고, 그러한 자극이나 경험을 추구하려는 선천적인 경향성' },
      { name: '외향성', score: 65, percentile: 25.7, description: '외부 세계와의 상호작용에서 활력과 긍정적인 감정을 얻는 경향' },
      { name: '성실성', score: 65, percentile: 20.4, description: '목표를 설정하고 계획하며, 책임감 있고 조직적으로 자신의 의무를 수행하는 경향' },
      { name: '기발함', score: 55, description: '기존과 다른 방식으로 생각하고 독창적인 아이디어를 떠올리는 경향' },
      { name: '자율성', score: 55, description: '스스로 판단하고 독립적으로 행동하려는 경향' },
      { name: '연대감', score: 55, description: '타인과 정서적으로 연결되고 유대를 중시하는 경향' },
      { name: '우호성', score: 50, description: '타인에게 친절하고 협조적으로 대하려는 경향' },
      { name: '위험회피', score: 50, description: '불확실하거나 위험한 상황을 피하려는 경향' },
      { name: '사회적민감성', score: 38, description: '타인의 시선과 평가에 민감하게 반응하는 경향' },
    ],
  },
)

// 기본은 전체 접힘(상위 topCount개는 항상 펼침이라 토글 대상이 아님). 펼친 항목만 여기에 표시(name → true)
const opened = reactive<Record<string, boolean>>({})
const isOpen = (name: string) => !!opened[name]
const toggle = (name: string) => { opened[name] = !opened[name] }

function tier(i: number): Tier {
  if (i === 0) return 'primary'
  if (i < props.topCount) return 'secondary'
  return 'muted'
}
const barColor = (i: number) => ({
  primary: 'var(--pd-brand-yellow)',
  secondary: 'var(--pd-brand-blue)',
  muted: 'var(--pd-brand-blue-soft)',
}[tier(i)])
const scoreColor = (i: number) => ({
  primary: 'var(--pd-score-primary)',
  secondary: 'var(--pd-score-secondary)',
  muted: 'var(--pd-score-muted)',
}[tier(i)])
</script>

<style scoped>
.pd {
  /* 브랜드 색 토큰 */
  --pd-brand-yellow: #ffd100;
  --pd-brand-blue: #5bb8f5;
  --pd-brand-blue-soft: #a5d8f8;   /* 하위 항목 (블루를 옅게) */
  --pd-score-primary: #b08a00;     /* 옐로를 어둡게 (글자 가독성) */
  --pd-score-secondary: #2b8cc7;   /* 블루를 어둡게 */
  --pd-score-muted: #6b7280;

  /* 중립 토큰 — 프로젝트 디자인 토큰이 있으면 교체 */
  --pd-title: #1f2937;
  --pd-name: #374151;
  --pd-sub: #6b7280;
  --pd-desc: #6b7280;
  --pd-hint: #9ca3af;
  --pd-track: #e9eaed;
  --pd-border: #eceef0;
}

.pd-eyebrow {
  margin: 0 0 10px;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--pd-score-primary);
}
@media (min-width: 768px) {
  .pd-eyebrow {
    font-size: 0.8125rem;
  }
}

.pd-title {
  margin: 0 0 6px;
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.7px;
  color: var(--pd-title);
}
@media (min-width: 768px) {
  .pd-title {
    font-size: 1.5rem;
  }
}

.pd-sub {
  margin: 0 0 12px;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--pd-sub);
}
@media (min-width: 768px) {
  .pd-sub {
    font-size: 1rem;
  }
}

.pd-row {
  border-bottom: 0.5px solid var(--pd-border);
}
.pd-row--last {
  border-bottom: none;
}

.pd-head {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 0;
  background: none;
  border: none;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.pd-head--static {
  cursor: default;
}

.pd-name {
  width: 70px;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--pd-name);
}
.pd-name--top {
  font-size: 15px;
  font-weight: 700;
  color: var(--pd-title);
}

.pd-bar {
  flex: 1;
  height: 8px;
  background: var(--pd-track);
  border-radius: 4px;
  overflow: hidden;
}
.pd-fill {
  display: block;
  height: 100%;
  border-radius: 4px;
}

.pd-score {
  display: block;
  width: 20px;
  text-align: right;
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 700;
}
.pd-score--top {
  font-size: 12px;
}
.pd-pct {
  display: block;
  margin-top: -8px;
  font-size: 9px;
  font-weight: 700;
  text-align: right;
  color: var(--pd-hint);
}

.pd-chev {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  fill: none;
  stroke: var(--pd-hint);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.15s ease;
}
.pd-chev.is-open {
  transform: rotate(180deg);
}

.pd-desc {
  margin: 0;
  padding: 0 50px 12px 5px;
  font-size: 11px;
  line-height: 1.6;
  color: var(--pd-desc);
}
</style>
