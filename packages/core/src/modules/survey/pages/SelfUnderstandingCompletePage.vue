<template>
  <div class="lh-page complete-page">

    <section class="complete-hero">
      <div class="complete-icon">🎉</div>
      <h1 class="complete-title">검사 완료!</h1>
      <p class="complete-sub">수고하셨습니다, 검사가 끝났어요.<br>결과를 분석하고 있어요.</p>
    </section>

    <section class="complete-summary">
      <div v-for="part in parts" :key="part.name" class="complete-part-row">
        <span class="complete-part-emoji">{{ part.emoji }}</span>
        <span class="complete-part-name">{{ part.name }}</span>
        <span class="complete-check">✓</span>
      </div>
    </section>

    <div class="complete-cta-wrap">
      <RouterLink
        class="complete-cta-result"
        :to="resultPath"
      >
        결과 보고서 보기
      </RouterLink>
      <RouterLink class="complete-cta-home" to="/">
        홈으로 돌아가기
      </RouterLink>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSurvey } from '../composables/useSurvey'

const { surveyId } = useSurvey()

// 온보딩(/main/before) 흐름에서 검사를 시작했으면 온보딩 전용 결과 페이지로 분기
const isOnboarding = !!sessionStorage.getItem('lh_survey_return')
const resultPath = computed(() =>
  isOnboarding
    ? `/self-understanding/onboarding-result/${surveyId.value}`
    : `/self-understanding/result/${surveyId.value}`,
)

const parts = [
  { emoji: '🧠', name: '성격 & 기질' },
  { emoji: '✨', name: '좋아하는 일' },
  { emoji: '🌿', name: '업무 환경' },
]
</script>
