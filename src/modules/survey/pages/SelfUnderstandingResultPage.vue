<template>
  <div class="lh-page result-page">

    <!-- 로딩 -->
    <div v-if="isLoading" class="result-loading">
      <div class="result-loading-spinner"></div>
      <p>결과를 분석하고 있어...</p>
    </div>

    <!-- 에러 -->
    <div v-else-if="error" class="result-error">
      <p>결과를 불러오지 못했어.<br>잠시 후 다시 시도해줘.</p>
      <button @click="load">다시 시도</button>
    </div>

    <template v-else-if="analysis">

      <!-- ─── 섹션 1: 요약 (T1 유형 카드) ─────────────────── -->
      <section class="result-section">
        <div class="result-preview-card">
          <div class="rp-hero">
            <p class="rp-type-label">나의 성격 유형</p>
            <h1 class="rp-type-name">{{ analysis.personality_type?.full_name ?? '알 수 없음' }}</h1>
            <p class="rp-type-sub">{{ analysis.personality_type?.description }}</p>
            <div class="rp-tags" v-if="analysis.personality_type">
              <span class="rptag y">{{ analysis.personality_type.base_name }}</span>
              <span class="rptag s">{{ analysis.personality_type.modifier }}</span>
              <span class="rptag w">{{ analysis.personality_type.type_code }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ─── 섹션 2: 성격/기질 (T1 바 차트) ──────────────── -->
      <section class="m-sec white">
        <span class="m-lbl y">성격 & 기질</span>
        <h2 class="m-ttl">나의 성격 분포</h2>
        <p class="m-sub">9가지 성격 요소에서 나의 점수야</p>
        <div class="trait-list">
          <div
            v-for="(item, idx) in analysis.personality.all"
            :key="item.code"
            class="trait-row"
          >
            <span class="trait-name">{{ item.name }}</span>
            <div class="trait-bar-wrap">
              <div
                class="trait-bar"
                :class="idx === 0 ? 'hi' : idx < 3 ? 'mi' : 'lo'"
                :style="{ width: `${Math.round((item.score ?? 0) * 100)}%` }"
              ></div>
            </div>
            <span
              class="trait-val"
              :class="idx === 0 ? 'hi' : idx < 3 ? 'mi' : 'lo'"
            >{{ Math.round((item.score ?? 0) * 100) }}</span>
            <span
              v-if="item.top_percent !== null"
              class="trait-cmp"
              :class="(item.top_percent ?? 100) <= 30 ? 'up' : (item.top_percent ?? 100) <= 60 ? 'eq' : 'dn'"
            >상위 {{ item.top_percent }}%</span>
          </div>
        </div>
      </section>

      <!-- ─── 섹션 3: 하고 싶은 일 ─────────────────────────── -->
      <section class="m-sec gray">
        <span class="m-lbl s">하고 싶은 일</span>
        <h2 class="m-ttl">재능 · 관심 · 가치관</h2>

        <!-- T21 재능 Top3 -->
        <p class="result-sub-label">🏆 재능 Top 3</p>
        <div class="talent-list">
          <div
            v-for="(item, idx) in analysis.talent.top3"
            :key="item.code"
            class="talent-card"
            :class="idx === 0 ? 'top' : ''"
          >
            <span class="talent-rank">{{ idx + 1 }}</span>
            <div class="talent-info">
              <span class="talent-name">{{ item.name }}</span>
              <span v-if="item.definition" class="item-def">{{ item.definition }}</span>
              <div class="trait-bar-wrap talent-bar-wrap">
                <div
                  class="trait-bar"
                  :class="idx === 0 ? 'hi' : 'mi'"
                  :style="{ width: `${Math.round((item.score ?? 0) * 100)}%` }"
                ></div>
              </div>
            </div>
            <span class="talent-score" :class="idx === 0 ? 'hi' : 'mi'">
              {{ Math.round((item.score ?? 0) * 100) }}
            </span>
          </div>
        </div>

        <!-- T22 관심분야 -->
        <p class="result-sub-label" style="margin-top: 1.5rem;">🔍 관심 분야 ({{ analysis.interest.total }}개 선택)</p>
        <div v-if="analysis.interest.total > 0" class="interest-categories">
          <div
            v-for="(cat, key) in analysis.interest.by_category"
            :key="key"
            class="interest-cat"
          >
            <span class="interest-cat-name">{{ cat.name }}</span>
            <div class="interest-item-list">
              <div
                v-for="item in cat.items"
                :key="item.field_id"
                class="interest-item-row"
              >
                <span class="interest-item-name">{{ item.name }}</span>
                <span v-if="item.definition" class="item-def">{{ item.definition }}</span>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="result-empty">선택한 관심 분야가 없어.</p>

        <!-- T23 가치관 -->
        <p class="result-sub-label" style="margin-top: 1.5rem;">💎 나의 가치관</p>
        <div class="values-list">
          <template
            v-for="(prio, idx) in [analysis.values.priority_1, analysis.values.priority_2, analysis.values.priority_3]"
            :key="idx"
          >
            <div
              v-if="prio"
              class="value-card"
              :class="`prio-${idx + 1}`"
            >
              <span class="value-rank">{{ idx + 1 }}순위</span>
              <div class="value-text">
                <span class="value-name">{{ prio.name }}</span>
                <span v-if="prio.definition" class="item-def">{{ prio.definition }}</span>
              </div>
            </div>
          </template>
        </div>
      </section>

      <!-- ─── 섹션 4: 업무환경 ──────────────────────────────── -->
      <section class="m-sec white">
        <span class="m-lbl" style="color:#2E8FCC;">업무 환경</span>
        <h2 class="m-ttl">나에게 맞는 업무 환경</h2>
        <p class="m-sub">1(낮음) ~ 5(높음) 스케일이야</p>
        <div class="env-mini-list">
          <div
            v-for="part in analysis.environment.parts"
            :key="part.code"
            class="env-result-row"
          >
            <div class="env-result-head">
              <span class="env-result-name">{{ part.name }}</span>
              <span v-if="part.top_percent !== null" class="env-result-pct">상위 {{ part.top_percent }}%</span>
            </div>
            <div class="env-level-dots">
              <span
                v-for="n in 5"
                :key="n"
                class="env-dot"
                :class="n <= part.level ? 'active' : ''"
              ></span>
            </div>
            <p v-if="part.level_description" class="env-result-desc">{{ part.level_description }}</p>
          </div>
        </div>
      </section>

      <!-- ─── 섹션 5: 버튼 섹션 ─────────────────────────────── -->
      <section class="m-sec result-cta-section">
        <h2 class="result-cta-title">결과를 저장하고<br>진로를 탐색해봐</h2>
        <p class="result-cta-sub">로그인하면 결과를 저장하고 맞춤 진로를 추천받을 수 있어.</p>

        <button class="btn-kakao" disabled>
          <span class="kakao-icon">💬</span>
          카카오로 결과 저장하기
          <span class="btn-soon-badge">준비 중</span>
        </button>

        <RouterLink to="/encyclopedia" class="btn-encyclopedia">
          진로백과 바로가기 →
        </RouterLink>
      </section>

    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchSurveyAnalysis } from '../survey.api'
import type { SurveyAnalysisResponse } from '../types/survey'

const route = useRoute()
const surveyId = route.params.survey_id as string

const isLoading = ref(true)
const error = ref(false)
const analysis = ref<SurveyAnalysisResponse['analysis'] | null>(null)

async function load() {
  isLoading.value = true
  error.value = false
  try {
    const { data } = await fetchSurveyAnalysis(surveyId)
    if (data.success) {
      analysis.value = data.analysis
    } else {
      error.value = true
    }
  } catch {
    error.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(load)
</script>
