<template>
  <div class="lh-page result-page">
    <!-- 로딩 -->
    <div v-if="isLoading" class="result-loading">
      <div class="result-loading-spinner"></div>
      <p>결과를 분석하고 있어요...</p>
    </div>

    <!-- 에러 -->
    <div v-else-if="error" class="result-error">
      <p>결과를 불러오지 못했어요.<br />잠시 후 다시 시도해주세요.</p>
      <button @click="load">다시 시도</button>
    </div>

    <template v-else-if="analysis">
      <!-- ─── 섹션 1: 요약 (T1 유형 카드) ─────────────────── -->
      <section class="result-section">
        <div class="result-preview-card">
          <div class="rp-hero">
            <p class="rp-type-label">나의 성격 유형</p>
            <h1 class="rp-type-name">{{ analysis.personality_type?.full_name ?? '알 수 없음' }}</h1>
            <img
              v-if="t1ImgSrc"
              :src="t1ImgSrc"
              :alt="analysis.personality_type?.full_name ?? ''"
              class="rp-type-img"
            />
            <p class="rp-type-sub">{{ analysis.personality_type?.description }}</p>
            <div class="rp-tags" v-if="analysis.personality_type">
              <span class="rptag y">{{ analysis.personality_type.base_name }}</span>
              <span class="rptag s">{{ analysis.personality_type.modifier }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ─── 섹션 2: 성격/기질 (T1 바 차트) ──────────────── -->
      <section class="m-sec white">
        <PersonalityDistribution :factors="personalityFactors" />
      </section>

      <!-- ─── 섹션 3: 하고 싶은 일 ─────────────────────────── -->
      <section class="m-sec gray">
        <span class="m-lbl s">하고 싶은 일</span>
        <h2 class="m-ttl">재능 · 가치관 · 관심</h2>

        <div class="t2-groups">
          <!-- T21 재능 Top3 -->
          <div class="t2-group">
            <p class="result-sub-label">🏆 재능 Top 3</p>
            <div class="talent-list">
              <div
                v-for="(item, idx) in analysis.talent.top3"
                :key="item.code"
                class="talent-card"
                :class="`prio-${idx + 1}`"
              >
                <span class="talent-rank">{{ idx + 1 }}순위</span>
                <div class="talent-info">
                  <span class="talent-name">{{ item.name }}</span>
                  <div class="trait-bar-wrap talent-bar-wrap">
                    <div
                      class="trait-bar"
                      :class="idx === 0 ? 'hi' : 'mi'"
                      :style="{ width: `${Math.round((item.score ?? 0) * 100)}%` }"
                    ></div>
                  </div>
                  <span class="talent-definition">{{
                    item.definition || T21_DEFINITIONS[item.code]
                  }}</span>
                </div>
                <span class="talent-score" :class="idx === 0 ? 'hi' : 'mi'">
                  {{ Math.round((item.score ?? 0) * 100) }}
                </span>
              </div>
            </div>
          </div>

          <!-- T23 가치관 -->
          <div class="t2-group">
            <p class="result-sub-label">💎 나의 가치관</p>
            <div class="values-list">
              <template
                v-for="(prio, idx) in [
                  analysis.values.priority_1,
                  analysis.values.priority_2,
                  analysis.values.priority_3,
                ]"
                :key="idx"
              >
                <div v-if="prio" class="value-card" :class="`prio-${idx + 1}`">
                  <span class="value-rank">{{ idx + 1 }}순위</span>
                  <div class="value-text">
                    <span class="value-name">{{ prio.name }}</span>
                    <span class="talent-definition">{{
                      prio.definition || T23_DEFINITIONS[prio.code]
                    }}</span>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- T22 관심분야 -->
          <div class="t2-group">
            <p class="result-sub-label">🔍 관심 분야</p>
            <!-- <p class="result-sub-label">🔍 관심 분야 ({{ analysis.interest.total }}개 선택)</p> -->
            <div v-if="analysis.interest.total > 0" class="interest-tag-groups">
              <div
                v-for="(cat, key) in analysis.interest.by_category"
                :key="key"
                class="interest-tag-group"
              >
                <span
                  class="interest-cat-label"
                  :style="{ color: INTEREST_CAT_COLORS[key]?.text ?? '#888' }"
                  >{{ cat.name }}</span
                >
                <div class="interest-tag-row">
                  <span
                    v-for="item in cat.items"
                    :key="item.field_id"
                    class="interest-tag"
                    :data-tooltip="item.definition || undefined"
                    :style="{
                      background: INTEREST_CAT_COLORS[key]?.bg ?? '#EFEFEB',
                      color: INTEREST_CAT_COLORS[key]?.text ?? '#777',
                      borderColor: INTEREST_CAT_COLORS[key]?.border ?? '#DDD',
                    }"
                    >{{ item.name }}</span
                  >
                </div>
              </div>
            </div>
            <p v-else class="result-empty">선택한 관심 분야가 없어.</p>
          </div>

          <!-- 좋아하는 일 요약 카드 -->
          <div class="t2-group">
            <p class="result-label">나는</p>
            <div
              v-if="
                topInterestCategoryName || analysis.talent.top3.length || analysis.values.priority_1
              "
              class="like-card"
            >
              <p class="like-text">
                <span v-if="topInterestCategoryName" class="lc-chip lc-chip--s">{{
                  topInterestCategoryName
                }}</span>
                <template v-if="topInterestCategoryName"> 분야에서<br /></template>
                <span v-if="analysis.talent.top3[0]" class="lc-chip lc-chip--y">{{
                  analysis.talent.top3[0].name
                }}</span>
                <template v-if="analysis.talent.top3[0]"> 을 활용해<br /></template>
                <span v-if="analysis.values.priority_1" class="lc-chip lc-chip--p">{{
                  analysis.values.priority_1.name
                }}</span>
                <template v-if="analysis.values.priority_1">
                  을 쫓는 일을 할 때 가장 빛나요.</template
                >
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ─── 섹션 3.5: T2 기반 추천 직업 ─────────────────── -->
      <!-- <section class="m-sec gray"> -->
        <!-- 로딩 -->
        <!-- <div v-if="t2Loading" class="t2rec-skeleton-list">
          <div v-for="n in 3" :key="n" class="t2rec-skeleton" />
        </div> -->

        <!-- 에러 -->
        <!-- <p v-else-if="t2Error" class="t2rec-message">데이터를 불러오지 못했습니다.</p> -->

        <!-- 결과 없음 -->
        <!-- <p v-else-if="t2Jobs.length === 0" class="t2rec-message">추천 직업을 찾을 수 없습니다.</p> -->

        <!-- 카드 리스트 -->
        <!-- <div v-else class="t2rec-list">
          <div
            v-for="job in t2Jobs"
            :key="job.jobCode"
            class="t2rec-card"
            @click="$emit('job-click', job.jobCode)"
          >
            <div class="t2rec-card-top">
              <span class="t2rec-title">{{ job.title }}</span>
              <span class="t2rec-score">매칭도 {{ Math.round(job.t2_match_score * 100) }}%</span>
            </div>
            <p class="t2rec-class">
              {{ job.classification.primary }} › {{ job.classification.secondary }}
            </p>
            <p class="t2rec-label">
              <span class="t2rec-pill t2rec-pill--interest">{{ t2LabelInterest }}</span>
              분야에서<br />
              <span class="t2rec-pill t2rec-pill--talent">{{ t2LabelTalent }}</span
              >하며<br />
              <span class="t2rec-pill t2rec-pill--value">{{ t2LabelValue }}</span
              >을 추구하는 일
            </p>
            <p class="t2rec-meta">
              <span v-if="job.salary?.median"
                >급여 중위 {{ job.salary.median.toLocaleString() }}만원</span
              >
              <span v-if="job.salary?.median && job.jobSatisfaction"> · </span>
              <span v-if="job.jobSatisfaction">만족도 {{ job.jobSatisfaction }}%</span>
            </p>
          </div>
        </div>
      </section> -->

      <!-- ─── 섹션 4: 업무환경 ──────────────────────────────── -->
      <section class="m-sec white">
        <span class="m-lbl" style="color: #2e8fcc">업무 환경</span>
        <h2 class="m-ttl">나의 업무 환경 성향</h2>

        <!-- 6개 파트 전체 레벨 3: 환경 유연형 안내 -->
        <div v-if="t3AllNeutral" class="env-block env-block--neutral">
          <p class="env-block-header">
            <span class="env-block-icon">🔄</span>
            <span class="env-block-title">환경 유연형</span>
          </p>
          <p class="env-block-text">특정 환경에 대한 강한 선호나 거부감이 없어요.</p>
          <p class="env-block-text">
            다양한 업무 환경에 무난하게 적응할 수 있는 유연한 성향이에요.
          </p>
        </div>

        <!-- 일부라도 레벨 3이 아닐 때: 기존 로직 -->
        <template v-else>
          <div v-if="t3GoodTexts.length > 0" class="env-block env-block--rec">
            <p class="env-block-header">
              <span class="env-block-icon">✅</span>
              <span class="env-block-title">나에게 맞는 환경</span>
            </p>
            <p v-for="item in t3GoodTexts" :key="item.part" class="env-block-text">
              {{ item.text }}
            </p>
            <div v-if="t3WeVisible && t3WeRec.length > 0" class="env-we-list">
              <div v-for="item in t3WeRec" :key="item.code" class="env-we-item">
                <span class="env-we-icon">{{ T3_WE_ITEMS[item.code]?.icon }}</span>
                <div class="env-we-info">
                  <span class="env-we-name">{{ T3_WE_ITEMS[item.code]?.name }}</span>
                  <p class="env-we-desc">{{ T3_WE_ITEMS[item.code]?.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="t3BadTexts.length > 0" class="env-block env-block--non">
            <p class="env-block-header">
              <span class="env-block-icon">❌</span>
              <span class="env-block-title">나에게 맞지 않는 환경</span>
            </p>
            <p v-for="item in t3BadTexts" :key="item.part" class="env-block-text">
              {{ item.text }}
            </p>
            <div v-if="t3WeVisible && t3WeNonRec.length > 0" class="env-we-list">
              <div v-for="item in t3WeNonRec" :key="item.code" class="env-we-item">
                <span class="env-we-icon">{{ T3_WE_ITEMS[item.code]?.icon }}</span>
                <div class="env-we-info">
                  <span class="env-we-name">{{ T3_WE_ITEMS[item.code]?.name }}</span>
                  <p class="env-we-desc">{{ T3_WE_ITEMS[item.code]?.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </template>
      </section>

      <!-- ─── 섹션 4.5: 종합 추천 직업 Top5 ─────────────────── -->
      <section class="m-sec white">
        <span class="m-lbl" style="color: #3d7fe8">종합 추천</span>
        <h2 class="m-ttl">나에게 맞는 직업 Top 5</h2>
        <p class="m-sub">성격·재능·관심·가치관·업무환경을 모두 고려한 추천이에요</p>

        <div v-if="compLoading" class="t2rec-skeleton-list">
          <div v-for="n in 3" :key="n" class="t2rec-skeleton" />
        </div>

        <p v-else-if="compError" class="t2rec-message">데이터를 불러오지 못했습니다.</p>
        <p v-else-if="compJobs.length === 0" class="t2rec-message">추천 직업을 찾을 수 없습니다.</p>

        <div v-else class="comp-list">
          <div
            v-for="(job, idx) in compJobs"
            :key="job.jobCode"
            class="comp-card"
            @click="$emit('job-click', job.jobCode)"
          >
            <div class="comp-rank" :class="`comp-rank--${idx + 1}`">{{ idx + 1 }}</div>
            <div class="comp-body">
              <div class="comp-top">
                <span class="comp-title">{{ job.title }}</span>
                <span class="comp-total-score">{{ Math.round(job.match_score * 100) }}%</span>
              </div>
              <p class="comp-class">
                {{ job.classification.primary }} › {{ job.classification.secondary }}
              </p>

              <div class="comp-bars">
                <span class="comp-bar-lbl comp-bar-lbl--t1">성격/기질</span>
                <div class="comp-bar-track">
                  <div
                    class="comp-bar-fill comp-bar-fill--t1"
                    :style="{ width: `${Math.round(job.match_detail.T1 * 100)}%` }"
                  ></div>
                </div>
                <span class="comp-bar-val comp-bar-val--t1">{{
                  Math.round(job.match_detail.T1 * 100)
                }}</span>

                <span class="comp-bar-lbl comp-bar-lbl--t2">재능/흥미/가치관</span>
                <div class="comp-bar-track">
                  <div
                    class="comp-bar-fill comp-bar-fill--t2"
                    :style="{ width: `${Math.round(calcT2Score(job.match_detail) * 100)}%` }"
                  ></div>
                </div>
                <span class="comp-bar-val comp-bar-val--t2">{{
                  Math.round(calcT2Score(job.match_detail) * 100)
                }}</span>

                <span class="comp-bar-lbl comp-bar-lbl--t3">업무환경</span>
                <div class="comp-bar-track">
                  <div
                    class="comp-bar-fill comp-bar-fill--t3"
                    :style="{ width: `${Math.round(job.match_detail.T3 * 100)}%` }"
                  ></div>
                </div>
                <span class="comp-bar-val comp-bar-val--t3">{{
                  Math.round(job.match_detail.T3 * 100)
                }}</span>
              </div>

              <p class="comp-meta">
                <span v-if="job.salary?.median"
                  >급여 중위 {{ job.salary.median.toLocaleString() }}만원</span
                >
                <span v-if="job.salary?.median && job.jobSatisfaction"> · </span>
                <span v-if="job.jobSatisfaction">만족도 {{ job.jobSatisfaction }}%</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 하단 액션(래퍼가 주입): 일반=CTA / 온보딩=다음으로 -->
      <slot />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  fetchSurveyAnalysis,
  fetchT2Recommend,
  fetchComprehensiveRecommend,
  saveRecommendedJobs,
  linkSurveyToUser,
} from '../survey.api'
import { useAuthStore } from '@/shared/stores/auth'
import type {
  SurveyAnalysisResponse,
  T2RecommendJob,
  ComprehensiveRecommendJob,
} from '../types/survey'
import PersonalityDistribution from './PersonalityDistribution.vue'

const props = defineProps<{ surveyId: string }>()
defineEmits<{ (e: 'job-click', jobCode: string): void }>()

const T1_DEFINITIONS: Record<string, string> = {
  E: '외부 세계와의 상호작용에서 활력과 긍정적인 감정을 얻는 경향',
  C: '새로운 생각이나 발상을 잘 해내며, 기존의 가치나 이론에 갇혀있지 않은 정도',
  S: '목표를 설정하고 계획하며, 책임감 있고 조직적으로 자신의 의무를 수행하는 경향',
  A: '타인을 이해하고 공감하며, 협조적이고 친절하며, 원만한 대인 관계를 유지하려는 경향',
  I: '새롭고 신기한 자극에 대해 강한 흥미를 느끼고, 그러한 자극이나 경험을 추구하려는 선천적인 경향성',
  R: '위험하거나 혐오스러운 자극에 대해 행동이 억제되고 위축되는 선천적인 경향성',
  G: '따뜻한 사회적 관계를 형성하고 유지하기 위해 타인의 긍정적인 신호에 민감하게 반응하는 선천적인 경향성',
  U: '외부의 압력이나 기대보다는 자신의 가치관과 신념에 따라 스스로 생각하고 행동하려는 강한 경향성',
  T: '자신을 사회의 통합된 구성원으로 인식하고, 다른 사람들과 자연스럽게 조화를 이루며 협력하려는 내재적인 성향',
}

const T21_DEFINITIONS: Record<string, string> = {
  T: '자연 현상을 인식하고 분류하며 이해하는 능력. 동식물에 대한 관심, 환경 패턴 인식.',
  L: '말과 글을 이해하고 표현하는 능력. 언어 구사 능력, 어휘력, 문장 구성 능력.',
  M: '논리적인 추론, 문제 해결, 수학적 사고 능력. 패턴 인식, 분석적 사고.',
  B: '신체를 이용하여 생각이나 감정을 표현하고 문제를 해결하는 능력. 운동 능력, 손재주.',
  S: '시각적 정보를 인식하고 조작하는 능력, 공간적인 관계를 이해하는 능력.',
  I: '다른 사람의 감정, 의도, 동기를 이해하고 효과적으로 상호작용하는 능력.',
  N: '자신의 감정, 생각, 동기를 이해하고 자기 성찰을 하는 능력. 자기 인식.',
  A: '음악의 리듬, 음조, 가락 등을 이해하고 창조하는 능력. 악기 연주, 작곡.',
}

const INTEREST_CAT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  BUS: { bg: '#FFF3B0', text: '#B8900A', border: '#FFE566' },
  COM: { bg: '#D4ECFA', text: '#2272B0', border: '#90D0F5' },
  EDU: { bg: '#D4F5E2', text: '#1D7A48', border: '#7DDBA6' },
  SAF: { bg: '#FFE8CC', text: '#B05A00', border: '#FFB870' },
  SCI: { bg: '#EAD9FF', text: '#6B30C0', border: '#C090F5' },
  SOC: { bg: '#FFD9E8', text: '#B0306A', border: '#FF90B8' },
  TEC: { bg: '#CCF0F5', text: '#1A7A88', border: '#70D8E8' },
}

const T23_DEFINITIONS: Record<string, string> = {
  T23_1:
    '다른 사람들을 돕거나 사회에 긍정적인 영향을 미치는 데서 큰 만족감을 느끼는 것을 의미합니다.',
  T23_2:
    '심리적으로나 물질적으로 불안감 없이 꾸준하고 예측 가능한 삶을 유지하는 것을 중요하게 여깁니다.',
  T23_3: '새로운 지식을 배우고 탐구하는 과정 자체에서 큰 즐거움을 얻는 것을 의미합니다.',
  T23_4:
    '스스로 도전적인 목표를 세우고 이를 내 자신의 노력으로 달성했을 때 큰 만족감을 느끼는 것을 의미합니다.',
  T23_5:
    '다른 사람들의 생각이나 행동, 혹은 중요한 결정에 긍정적인 영향을 미치고 싶어 하는 경향을 의미합니다.',
  T23_6:
    '나의 노력과 성과에 대해 다른 사람들에게 긍정적으로 평가받고 인정받는 것을 중요하게 생각합니다.',
  T23_7: '내가 하는 일에 대해 충분하고 만족스러운 금전적인 대가를 받는 것을 중요하게 생각합니다.',
  T23_8: '정신적, 육체적으로 건강하고 여유로운 삶을 유지하는 것을 최우선으로 생각합니다.',
  T23_9:
    '타인의 간섭이나 지시 없이 스스로 생각하고 결정하며, 나의 방식대로 일을 주도적으로 해나갈 수 있는 환경을 중요하게 생각합니다.',
  T23_10:
    '개인의 이익을 넘어 소속된 공동체나 더 큰 목표를 위해 기꺼이 자신을 바치고 기여하는 것을 중요하게 여깁니다.',
  T23_11: '업무가 새롭고 변화무쌍하며 다양한 도전으로 가득 찬 환경을 선호합니다.',
  T23_12: '업무를 수행하면서 육체적인 활동이나 움직임이 많지 않은 것을 선호하는 가치관입니다.',
  T23_13: '다른 사람들과 함께 어울려 일하기보다는 혼자 독립적으로 업무를 수행하는 것을 선호합니다.',
}

const T1_IMG_MAP: Record<string, string> = {
  A: '/T1_img/A-Photoroom.png',
  C: '/T1_img/C-Photoroom.png',
  E: '/T1_img/E-Photoroom.png',
  G: '/T1_img/G-Photoroom.png',
  I: '/T1_img/I-Photoroom.png',
  R: '/T1_img/R-Photoroom.png',
  S: '/T1_img/S-Photoroom.png',
  T: '/T1_img/T-Photoroom.png',
  U: '/T1_img/U-Photoroom.png',
}

const T3_WE_ITEMS: Record<string, { icon: string; name: string; description: string }> = {
  WE01: { icon: '🏢', name: '실내 근무', description: '건물 내부에서 주로 업무를 처리하는 환경' },
  WE02: {
    icon: '🪑',
    name: '앉아서 근무',
    description: '대부분의 업무를 앉은 자세로 처리하는 환경',
  },
  WE03: {
    icon: '📧',
    name: '이메일 업무',
    description: '이메일을 통한 소통과 업무 처리가 많은 환경',
  },
  WE04: {
    icon: '🤝',
    name: '사람들과 직접 접촉',
    description: '고객이나 동료와 직접 만나 일하는 환경',
  },
  WE05: {
    icon: '💬',
    name: '다른 사람과의 상호작용',
    description: '타인과 지속적으로 소통하며 협력하는 환경',
  },
  WE06: { icon: '👋', name: '다른 사람과의 접촉', description: '다양한 사람들과 접촉이 잦은 환경' },
  WE07: {
    icon: '👑',
    name: '조율·이끌기',
    description: '다른 사람들을 조율하거나 이끄는 역할이 있는 환경',
  },
  WE08: {
    icon: '📄',
    name: '공문·문서 교환',
    description: '공식 문서나 공문을 주고받는 업무가 많은 환경',
  },
  WE09: { icon: '📞', name: '전화 업무', description: '전화 통화가 잦은 업무 환경' },
  WE10: { icon: '🛎️', name: '외부 고객 응대', description: '외부 고객을 직접 상대하는 업무 환경' },
  WE11: {
    icon: '🔬',
    name: '정확성·정밀성',
    description: '높은 정밀도와 꼼꼼함이 요구되는 업무 환경',
  },
  WE12: {
    icon: '📊',
    name: '조직에 미치는 강도',
    description: '이미지, 평판, 재정에 큰 영향을 미치는 업무 환경',
  },
  WE13: { icon: '🔁', name: '반복적인 업무', description: '동일한 작업이 반복되는 구조의 환경' },
  WE14: {
    icon: '🔑',
    name: '의사결정 권한',
    description: '중요한 결정을 스스로 내릴 수 있는 권한이 있는 환경',
  },
  WE15: {
    icon: '📌',
    name: '결과에 대한 책임',
    description: '업무 결과에 대해 명확하게 책임지는 환경',
  },
  WE16: {
    icon: '🫂',
    name: '신체적 접촉',
    description: '타인과 신체적으로 접촉하는 업무가 포함된 환경',
  },
  WE17: {
    icon: '🏆',
    name: '조직에 미치는 영향력',
    description: '조직의 방향이나 성과에 영향력을 행사하는 환경',
  },
  WE18: {
    icon: '🖐️',
    name: '손 사용',
    description: '도구나 장치를 손으로 직접 다루는 작업이 많은 환경',
  },
  WE19: { icon: '⏰', name: '마감시간', description: '촉박한 마감이 자주 있는 업무 환경' },
  WE20: {
    icon: '💡',
    name: '의사결정 가능성',
    description: '업무 내에서 판단하고 결정할 기회가 많은 환경',
  },
  WE21: { icon: '💥', name: '갈등 상황', description: '갈등이나 충돌이 발생할 수 있는 환경' },
  WE22: { icon: '⚖️', name: '균형 유지', description: '신체 균형을 요구하는 작업이 포함된 환경' },
  WE23: {
    icon: '🛡️',
    name: '건강·안전 책임',
    description: '타인의 건강과 안전을 책임지는 역할이 포함된 환경',
  },
  WE24: { icon: '🌿', name: '실외 근무', description: '야외나 현장에서 주로 활동하는 환경' },
  WE25: { icon: '🎤', name: '발표·회의', description: '연설, 발표, 회의가 자주 있는 환경' },
  WE26: {
    icon: '😤',
    name: '무례한 사람 상대',
    description: '불쾌하거나 무례한 상황을 감수해야 하는 환경',
  },
  WE27: {
    icon: '🎯',
    name: '실수의 심각성',
    description: '실수가 큰 결과로 이어질 수 있는 긴장감 있는 환경',
  },
  WE28: { icon: '⚙️', name: '움직이는 기계', description: '가동 중인 기계 근처에서 작업하는 환경' },
  WE29: {
    icon: '📅',
    name: '주말·공휴일 근무',
    description: '주말이나 공휴일에도 근무해야 하는 환경',
  },
  WE30: { icon: '🥊', name: '치열한 경쟁', description: '성과 경쟁이 치열한 업무 환경' },
  WE31: { icon: '🔊', name: '소음 노출', description: '작업 중 상당한 소음에 노출되는 환경' },
  WE32: { icon: '🤖', name: '자동화 환경', description: '자동화된 시스템이나 장비가 많은 환경' },
  WE33: {
    icon: '🏭',
    name: '장비 속도에 보조',
    description: '기계나 장비의 속도에 맞춰 작업해야 하는 환경',
  },
  WE34: { icon: '🌡️', name: '극단적 기온', description: '매우 춥거나 더운 환경에서 일하는 환경' },
  WE35: { icon: '🏠', name: '재택근무', description: '집이나 원격지에서 근무하는 환경' },
  WE36: {
    icon: '📦',
    name: '비좁은 업무 공간',
    description: '좁거나 제한된 공간에서 작업하는 환경',
  },
  WE37: { icon: '💡', name: '부적절한 조명', description: '지나치게 밝거나 어두운 조명 환경' },
  WE38: { icon: '🦵', name: '서서 근무', description: '장시간 서서 일하는 환경' },
  WE39: {
    icon: '🩹',
    name: '경미한 부상 위험',
    description: '가벼운 화상, 자상 등에 노출될 수 있는 환경',
  },
  WE40: {
    icon: '🤸',
    name: '몸을 구부리거나 비틀기',
    description: '신체를 자주 굽히거나 비트는 자세가 요구되는 환경',
  },
  WE41: { icon: '🚶', name: '걷거나 뛰기', description: '이동이 잦고 신체활동이 많은 환경' },
  WE42: {
    icon: '📳',
    name: '온몸 진동 노출',
    description: '진동이 심한 장비나 차량을 다루는 환경',
  },
  WE43: {
    icon: '☣️',
    name: '오염물질 노출',
    description: '먼지, 화학물질 등 오염 환경에서 일하는 환경',
  },
  WE44: {
    icon: '🦺',
    name: '보호장비 착용',
    description: '안전모, 장갑 등 보호장비를 착용해야 하는 환경',
  },
  WE45: { icon: '⚠️', name: '위험한 장비 노출', description: '위험한 기계나 장비를 다루는 환경' },
  WE46: {
    icon: '🚨',
    name: '위험한 상태 노출',
    description: '사고 위험이 있는 상황에서 작업하는 환경',
  },
  WE47: { icon: '🦠', name: '질병·감염 위험', description: '질병이나 감염에 노출될 수 있는 환경' },
  WE48: { icon: '🏔️', name: '고지대 작업', description: '높은 곳에서 작업하는 환경' },
  WE49: {
    icon: '🗓️',
    name: '규칙적인 근무',
    description: '일정하고 예측 가능한 루틴으로 일하는 환경',
  },
}

const T3_PARTS_MAP: Record<
  string,
  { up: Array<{ code: string; weight: number }>; down: Array<{ code: string; weight: number }> }
> = {
  T3_PHY: {
    up: [
      { code: 'WE24', weight: 1.5 },
      { code: 'WE38', weight: 1 },
      { code: 'WE40', weight: 1 },
      { code: 'WE41', weight: 1 },
      { code: 'WE22', weight: 0.7 },
      { code: 'WE31', weight: 0.7 },
      { code: 'WE34', weight: 0.7 },
      { code: 'WE37', weight: 0.5 },
      { code: 'WE36', weight: 0.5 },
      { code: 'WE18', weight: 0.7 },
      { code: 'WE28', weight: 1 },
      { code: 'WE39', weight: 1 },
      { code: 'WE42', weight: 1.5 },
      { code: 'WE43', weight: 1.5 },
      { code: 'WE44', weight: 1 },
      { code: 'WE45', weight: 1.5 },
      { code: 'WE46', weight: 1.5 },
      { code: 'WE47', weight: 1 },
      { code: 'WE48', weight: 1 },
    ],
    down: [
      { code: 'WE01', weight: 1.5 },
      { code: 'WE02', weight: 1 },
      { code: 'WE35', weight: 0.5 },
    ],
  },
  T3_PEO: {
    up: [
      { code: 'WE04', weight: 1.5 },
      { code: 'WE05', weight: 1.5 },
      { code: 'WE06', weight: 1 },
      { code: 'WE10', weight: 1 },
      { code: 'WE16', weight: 1 },
      { code: 'WE26', weight: 0.7 },
    ],
    down: [{ code: 'WE35', weight: 1 }],
  },
  T3_COM: {
    up: [
      { code: 'WE25', weight: 1.5 },
      { code: 'WE09', weight: 1 },
      { code: 'WE08', weight: 0.7 },
      { code: 'WE03', weight: 0.7 },
    ],
    down: [{ code: 'WE35', weight: 0.7 }],
  },
  T3_RES: {
    up: [
      { code: 'WE14', weight: 1.5 },
      { code: 'WE20', weight: 1.5 },
      { code: 'WE07', weight: 1 },
      { code: 'WE15', weight: 1 },
      { code: 'WE17', weight: 1 },
      { code: 'WE23', weight: 1 },
      { code: 'WE27', weight: 0.7 },
      { code: 'WE12', weight: 0.7 },
      { code: 'WE11', weight: 0.5 },
    ],
    down: [],
  },
  T3_STR: {
    up: [
      { code: 'WE21', weight: 1.5 },
      { code: 'WE30', weight: 1.5 },
      { code: 'WE19', weight: 1 },
      { code: 'WE29', weight: 0.7 },
    ],
    down: [{ code: 'WE35', weight: 0.5 }],
  },
  T3_FLX: {
    up: [],
    down: [
      { code: 'WE49', weight: 1.5 },
      { code: 'WE13', weight: 1 },
      { code: 'WE32', weight: 1 },
      { code: 'WE33', weight: 0.7 },
    ],
  },
}

const authStore = useAuthStore()
const surveyId = props.surveyId

async function tryLinkSurvey() {
  if (!authStore.isLoggedIn) return
  // 이미 연결된 경우(409)는 정상, 나머지 오류는 무시
  await linkSurveyToUser(surveyId).catch(() => {})
}

const isLoading = ref(true)
const error = ref(false)
const analysis = ref<SurveyAnalysisResponse['analysis'] | null>(null)

const t1ImgSrc = computed(() => {
  const baseType = analysis.value?.personality_type?.base_type
  return baseType ? (T1_IMG_MAP[baseType] ?? null) : null
})

const personalityFactors = computed(() =>
  (analysis.value?.personality.all ?? []).map((item) => ({
    name: item.name,
    score: Math.round((item.score ?? 0) * 100),
    percentile: item.top_percent ?? undefined,
    description: item.definition || T1_DEFINITIONS[item.code] || '',
  })),
)

const t3GoodTexts = computed(() => analysis.value?.environment.texts?.good ?? [])
const t3BadTexts = computed(() => analysis.value?.environment.texts?.bad ?? [])

const t3AllNeutral = computed(
  () =>
    (analysis.value?.environment.parts ?? []).length === 6 &&
    (analysis.value?.environment.parts ?? []).every((p) => p.level === 3),
)

function computeWEItems(
  parts: Array<{ code: string; level: number }>,
  config: Array<{ levels: number[]; side: 'up' | 'down' }>,
): Array<{ code: string; weight: number }> {
  const map = new Map<string, number>()
  for (const part of parts) {
    const partData = T3_PARTS_MAP[part.code]
    if (!partData) continue
    for (const { levels, side } of config) {
      if (levels.includes(part.level)) {
        for (const item of partData[side]) {
          map.set(item.code, (map.get(item.code) ?? 0) + item.weight)
        }
      }
    }
  }
  return [...map.entries()]
    .map(([code, weight]) => ({ code, weight }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5)
}

const t3WeVisible = computed(() =>
  (analysis.value?.environment.parts ?? []).some((p) => p.level !== 3),
)

const t3WeRec = computed(() =>
  computeWEItems(analysis.value?.environment.parts ?? [], [
    { levels: [4, 5], side: 'up' },
    { levels: [1, 2], side: 'down' },
  ]),
)

const t3WeNonRec = computed(() =>
  computeWEItems(analysis.value?.environment.parts ?? [], [
    { levels: [1, 2], side: 'up' },
    { levels: [4, 5], side: 'down' },
  ]),
)

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

// ─── T2 추천 ────────────────────────────────────────────────────────────────

const T21_LABEL: Record<string, string> = {
  L: '읽고 쓰고 말',
  M: '논리적으로 분석하고 설계',
  S: '시각적으로 구성하고 표현',
  A: '소리와 리듬으로 창작',
  B: '직접 몸으로 만들고 행동',
  I: '사람을 이해하고 소통',
  N: '깊이 사유하고 성찰',
  T: '자연을 관찰하고 탐구',
}

const T23_TO_VA_FE: Record<string, string> = {
  T23_1: 'VA10',
  T23_2: 'VA11',
  T23_3: 'VA04',
  T23_4: 'VA01',
  T23_5: 'VA06',
  T23_6: 'VA09',
  T23_7: 'VA05',
  T23_8: 'VA12',
  T23_9: 'VA07',
  T23_10: 'VA08',
  T23_11: 'VA03',
  T23_12: 'VA13',
  T23_13: 'VA02',
}

const T23_LABEL: Record<string, string> = {
  VA01: '목표를 달성하는 것',
  VA02: '나만의 방식으로 일하는 것',
  VA03: '다양한 경험을 쌓는 것',
  VA04: '끊임없이 배우고 성장하는 것',
  VA05: '충분한 경제적 보상을 얻는 것',
  VA06: '주변에 영향을 미치는 것',
  VA07: '스스로 결정하며 일하는 것',
  VA08: '더 큰 목표에 기여하는 것',
  VA09: '타인에게 인정받는 것',
  VA10: '타인에게 도움이 되는 것',
  VA11: '안정적으로 오래 일하는 것',
  VA12: '여유롭고 균형 잡힌 삶을 사는 것',
  VA13: '몸을 활발히 움직이는 것',
}

const t2Jobs = ref<T2RecommendJob[]>([])
const t2Loading = ref(false)
const t2Error = ref(false)

const t2LabelInterest = computed(() => {
  const cats = analysis.value?.interest.by_category
  if (!cats) return ''
  const firstCat = Object.values(cats)[0]
  return firstCat?.items[0]?.name ?? ''
})

const t2LabelTalent = computed(() => {
  const code = analysis.value?.talent.top3[0]?.code
  return code ? (T21_LABEL[code] ?? '') : ''
})

const t2LabelValue = computed(() => {
  const code = analysis.value?.values.priority_1?.code
  if (!code) return ''
  const vaCode = T23_TO_VA_FE[code]
  return vaCode ? (T23_LABEL[vaCode] ?? '') : ''
})

// 좋아하는 일 카드용 — T22 최다 선택 카테고리명
const topInterestCategoryName = computed(() => {
  const cats = Object.values(analysis.value?.interest.by_category ?? {})
  if (cats.length === 0) return null
  return cats.reduce((a, b) => (a.items.length >= b.items.length ? a : b)).name
})

async function loadT2Recommend() {
  t2Loading.value = true
  t2Error.value = false
  try {
    const { data } = await fetchT2Recommend(surveyId)
    if (data.success) {
      t2Jobs.value = data.data
    } else {
      t2Error.value = true
    }
  } catch {
    t2Error.value = true
  } finally {
    t2Loading.value = false
  }
}

// ─── 종합 추천 ──────────────────────────────────────────────────────────────

const compJobs = ref<ComprehensiveRecommendJob[]>([])
const compLoading = ref(false)
const compError = ref(false)

function calcT2Score(detail: { T21: number; T22: number; T23: number }): number {
  return (detail.T21 * 0.25 + detail.T22 * 0.25 + detail.T23 * 0.2) / 0.7
}

async function loadComprehensiveRecommend() {
  compLoading.value = true
  compError.value = false
  try {
    const { data } = await fetchComprehensiveRecommend(surveyId, 5)
    if (data.success) {
      compJobs.value = data.data
      if (authStore.isLoggedIn) {
        saveRecommendedJobs(data.data.map((j) => j.jobCode)).catch(() => {})
      }
    } else {
      compError.value = true
    }
  } catch {
    compError.value = true
  } finally {
    compLoading.value = false
  }
}

onMounted(() => {
  load()
  loadT2Recommend()
  loadComprehensiveRecommend()
  tryLinkSurvey()
})
</script>
