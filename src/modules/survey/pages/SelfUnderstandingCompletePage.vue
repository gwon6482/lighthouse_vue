<template>
  <div class="lh-page complete-page">

    <section class="complete-hero">
      <div class="complete-icon">🎉</div>
      <h1 class="complete-title">검사 완료!</h1>
      <p class="complete-sub">수고했어, 검사가 끝났어.<br>결과를 분석하고 있어.</p>
    </section>

    <section class="complete-summary">
      <div v-for="part in parts" :key="part.label" class="complete-part-row">
        <span class="complete-part-emoji">{{ part.emoji }}</span>
        <span class="complete-part-name">{{ part.name }}</span>
        <span class="complete-check">✓</span>
      </div>
    </section>

    <!-- TODO: 결과 보고서 페이지 구현 후 아래 버튼을 결과 페이지로 연결할 것 -->
    <!-- 현재는 결과 보고서 미구현으로 홈으로 이동 버튼만 노출 (SURVEY_FLOW_UPDATE.md 참고) -->
    <div class="complete-cta-wrap">
      <button class="complete-cta-result" disabled>
        결과 보고서 보기 (준비 중)
      </button>
      <RouterLink class="complete-cta-home" to="/">
        홈으로 돌아가기
      </RouterLink>
    </div>

  </div>
</template>

<script setup lang="ts">
/**
 * SelfUnderstandingCompletePage
 *
 * 설문 제출 완료 후 도달하는 페이지.
 * 라우트: /self-understanding/complete
 *
 * 진입: SelfUnderstandingTestPage handleSubmit 성공 후 router.push('/self-understanding/complete')
 * 이탈: 결과 보고서 페이지 구현 후 연결 예정 / 현재는 홈으로 이동
 *
 * SURVEY_FLOW_UPDATE.md 참고
 */

const parts = [
  { emoji: '🧠', name: '성격 & 기질' },
  { emoji: '✨', name: '좋아하는 일' },
  { emoji: '🌿', name: '업무 환경' },
]
</script>
