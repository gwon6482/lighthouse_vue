<template>
  <div class="guide-wrap">

    <AppHeader />

    <!-- 헤더 -->
    <section class="guide-header">
      <p class="guide-eyebrow">검사 안내</p>
      <h1 class="guide-title">검사 전에<br>이것만 알고 시작해주세요</h1>
      <p class="guide-sub">총 3개 파트 · 약 10분 소요</p>
    </section>

    <!-- 파트 카드 -->
    <section class="guide-parts">
      <div v-for="part in parts" :key="part.label" class="guide-card" :class="part.accent">

        <div class="guide-card-top">
          <div class="guide-card-left">
            <span class="guide-card-label">{{ part.label }}</span>
            <span class="guide-card-title">{{ part.title }}</span>
          </div>
          <span class="guide-card-emoji">{{ part.emoji }}</span>
        </div>

        <p class="guide-card-desc">{{ part.desc }}</p>

        <div class="guide-card-meta">
          <span class="guide-meta-pill">{{ part.questionCount }}</span>
          <span v-if="part.minutes" class="guide-meta-pill">⏱ 약 {{ part.minutes }}분</span>
        </div>

      </div>
    </section>

    <!-- 팁 -->
    <section class="guide-tips">
      <p class="guide-tips-title">이렇게 답해주세요</p>
      <ul class="guide-tip-list">
        <li v-for="tip in tips" :key="tip.text" class="guide-tip-item">
          <span class="guide-tip-icon">{{ tip.icon }}</span>
          <span>{{ tip.text }}</span>
        </li>
      </ul>
    </section>

    <!-- CTA -->
    <div class="guide-cta-wrap">
      <RouterLink class="guide-cta" to="/self-understanding/select">
        척도 선택하고 시작하기 →
      </RouterLink>
    </div>

  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/shared/components/AppHeader.vue'
/**
 * SelfUnderstandingGuidePage
 *
 * 라우트: /self-understanding/guide
 * 진입: SelfUnderstandingIntroPage CTA 클릭
 * 이탈: "척도 선택하고 시작하기" → /self-understanding/select
 *
 * 문항 수: T1=43, T21+T22+T23=107, T3=6개 항목
 * SURVEY_FLOW_UPDATE.md 참고
 */

const parts = [
  {
    label: '파트 1',
    title: '성격 & 기질',
    desc: '타고난 기질·성격 패턴 9가지 요소 분석. 나를 가장 잘 아는 데이터가 돼요.',
    emoji: '🧠',
    questionCount: '43문항',
    minutes: 5,
    accent: 'accent-y',
  },
  {
    label: '파트 2',
    title: '좋아하는 일',
    desc: '재능 · 흥미 · 가치관, 3개 파트로 나눠 내가 좋아하는 일을 구체적으로 찾아요.',
    emoji: '✨',
    questionCount: '총 107문항',
    minutes: 5,
    accent: 'accent-s',
  },
  {
    label: '파트 3',
    title: '업무 환경',
    desc: '좋아하는 일을 해도 맞지 않는 환경이면 힘들 수 있어요. 진로 리스크를 미리 파악해요.',
    emoji: '🌿',
    questionCount: '6개 항목',
    minutes: null,
    accent: 'accent-p',
  },
]

const tips = [
  { icon: '💡', text: '정답은 없어요. 현재 나의 모습 그대로 솔직하게 답해주세요.' },
  { icon: '⚡', text: '너무 오래 고민하지 말고 첫 느낌으로 골라주세요.' },
  { icon: '⚠️', text: '중간에 멈추면 처음부터 다시 시작해야 해요.' },
]
</script>
