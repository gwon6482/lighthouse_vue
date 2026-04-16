<template>
  <div class="pi-wrap">

    <!-- 상단 메타 -->
    <div class="pi-meta-row">
      <span class="pi-label">{{ introData.partLabel }}</span>
      <div class="pi-badges">
        <span class="pi-badge count">{{ introData.questionCount }}</span>
        <span v-if="introData.estimatedMinutes" class="pi-badge time">
          ⏱ 약 {{ introData.estimatedMinutes }}분
        </span>
      </div>
    </div>

    <!-- 이모지 + 타이틀 -->
    <div class="pi-hero">
      <span class="pi-emoji">{{ introData.emoji }}</span>
      <h2 class="pi-title">{{ introData.title }}</h2>
      <p class="pi-desc">{{ introData.description }}</p>
    </div>

    <!-- 핵심 안내 -->
    <ul class="pi-highlights">
      <li v-for="(item, i) in introData.highlights" :key="i" class="pi-hi-item">
        <span class="pi-hi-dot" />
        <span class="pi-hi-text">{{ item }}</span>
      </li>
    </ul>

  </div>
</template>

<script setup lang="ts">
/**
 * SurveyPartIntro 컴포넌트
 *
 * T1 / T21 / T3 파트 시작 전 렌더되는 파트 소개 화면.
 * "다음" 버튼은 SelfUnderstandingTestPage 의 SurveyNavBtnNext 를 그대로 사용.
 *
 * 콘텐츠(introData)는 useSurvey.ts 의 partIntros 객체에 하드코딩.
 * 문구·문항수·예상시간 수정 시 useSurvey.ts 의 partIntros 를 수정할 것.
 *
 * SURVEY_FLOW_UPDATE.md 참고
 */
import type { PartIntroData } from '@/modules/survey/types/survey'

defineProps<{ introData: PartIntroData }>()
</script>

<style scoped>
.pi-wrap {
  max-width: 420px;
  margin: 0 auto;
  padding: 24px 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* 상단 메타 */
.pi-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pi-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.pi-badges {
  display: flex;
  gap: 6px;
}

.pi-badge {
  font-size: 12px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 99px;
  border: 1px solid var(--color-border-tertiary);
  color: var(--color-text-secondary);
  background: var(--color-background-secondary);
}

/* 히어로 */
.pi-hero {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pi-emoji {
  font-size: 40px;
  line-height: 1;
}

.pi-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
  margin: 0;
}

.pi-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* 핵심 안내 */
.pi-highlights {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0;
  margin: 0;
  list-style: none;
  background: var(--color-background-secondary);
  border-radius: var(--border-radius-lg);
  padding: 16px;
  border: 1px solid var(--color-border-tertiary);
}

.pi-hi-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.pi-hi-dot {
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-text-secondary);
  margin-top: 7px;
}

.pi-hi-text {
  font-size: 14px;
  color: var(--color-text-primary);
  line-height: 1.6;
}
</style>
