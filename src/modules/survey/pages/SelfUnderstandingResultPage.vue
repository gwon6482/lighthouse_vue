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
        <span class="m-lbl y">성격 & 기질</span>
        <h2 class="m-ttl">나의 성격 분포</h2>
        <p class="m-sub">9가지 성격 요소에서 나의 점수야</p>
        <div class="trait-list">
          <div
            v-for="(item, idx) in analysis.personality.all"
            :key="item.code"
            class="trait-item"
          >
            <div class="trait-row" :class="idx >= 3 ? 'dim' : 'top'">
              <span class="trait-name">
                {{ item.name }}
                <span
                  v-if="idx >= 3 && T1_DEFINITIONS[item.code]"
                  class="trait-help"
                  :data-tooltip="T1_DEFINITIONS[item.code]"
                >?</span>
              </span>
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
                v-if="idx < 3 && item.top_percent !== null"
                class="trait-cmp"
                :class="(item.top_percent ?? 100) <= 30 ? 'up' : (item.top_percent ?? 100) <= 60 ? 'eq' : 'dn'"
              >상위 {{ item.top_percent }}%</span>
            </div>
            <p v-if="idx < 3 && T1_DEFINITIONS[item.code]" class="trait-definition">
              {{ T1_DEFINITIONS[item.code] }}
            </p>
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
              <div class="trait-bar-wrap talent-bar-wrap">
                <div
                  class="trait-bar"
                  :class="idx === 0 ? 'hi' : 'mi'"
                  :style="{ width: `${Math.round((item.score ?? 0) * 100)}%` }"
                ></div>
              </div>
              <span class="talent-definition">{{ item.definition || T21_DEFINITIONS[item.code] }}</span>
            </div>
            <span class="talent-score" :class="idx === 0 ? 'hi' : 'mi'">
              {{ Math.round((item.score ?? 0) * 100) }}
            </span>
          </div>
        </div>

        <!-- T22 관심분야 -->
        <p class="result-sub-label" style="margin-top: 1.5rem;">🔍 관심 분야 ({{ analysis.interest.total }}개 선택)</p>
        <div v-if="analysis.interest.total > 0" class="interest-tag-groups">
          <div
            v-for="(cat, key) in analysis.interest.by_category"
            :key="key"
            class="interest-tag-group"
          >
            <span
              class="interest-cat-label"
              :style="{ color: INTEREST_CAT_COLORS[key]?.text ?? '#888' }"
            >{{ cat.name }}</span>
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
              >{{ item.name }}</span>
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
                <span class="talent-definition">{{ prio.definition || T23_DEFINITIONS[prio.code] }}</span>
              </div>
            </div>
          </template>
        </div>
      </section>

      <!-- ─── 섹션 3.5: T2 기반 추천 직업 ─────────────────── -->
      <section class="m-sec gray">
        <span class="m-lbl s">추천 직업</span>
        <h2 class="m-ttl">좋아하는 일 기반 추천 직업</h2>
        <p class="m-sub">재능 · 관심 · 가치관을 바탕으로 찾은 직업이야</p>

        <!-- 로딩 -->
        <div v-if="t2Loading" class="t2rec-skeleton-list">
          <div v-for="n in 3" :key="n" class="t2rec-skeleton" />
        </div>

        <!-- 에러 -->
        <p v-else-if="t2Error" class="t2rec-message">데이터를 불러오지 못했습니다.</p>

        <!-- 결과 없음 -->
        <p v-else-if="t2Jobs.length === 0" class="t2rec-message">추천 직업을 찾을 수 없습니다.</p>

        <!-- 카드 리스트 -->
        <div v-else class="t2rec-list">
          <div
            v-for="job in t2Jobs"
            :key="job.jobCode"
            class="t2rec-card"
          >
            <div class="t2rec-card-top">
              <span class="t2rec-title">{{ job.title }}</span>
              <span class="t2rec-score">매칭도 {{ Math.round(job.t2_match_score * 100) }}%</span>
            </div>
            <p class="t2rec-class">{{ job.classification.primary }} › {{ job.classification.secondary }}</p>
            <p class="t2rec-label">
              <span class="t2rec-tag">{{ t2LabelInterest }}</span> 분야에서<br>
              <span class="t2rec-tag">{{ t2LabelTalent }}</span><br>
              <span class="t2rec-tag">{{ t2LabelValue }}</span>를 추구하는 일
            </p>
            <p class="t2rec-meta">
              <span v-if="job.salary?.median">급여 중위 {{ job.salary.median.toLocaleString() }}만원</span>
              <span v-if="job.salary?.median && job.jobSatisfaction"> · </span>
              <span v-if="job.jobSatisfaction">만족도 {{ job.jobSatisfaction }}%</span>
            </p>
          </div>
        </div>
      </section>

      <!-- ─── 섹션 4: 업무환경 ──────────────────────────────── -->
      <section class="m-sec white">
        <span class="m-lbl" style="color:#2E8FCC;">업무 환경</span>
        <h2 class="m-ttl">나의 업무 환경 성향</h2>

        <div class="env-block env-block--rec">
          <p class="env-block-header">
            <span class="env-block-icon">✅</span>
            <span class="env-block-title">나에게 맞는 환경</span>
          </p>
          <p class="env-block-text">{{ t3RecText }}</p>
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

        <div v-if="t3NonRec.length > 0" class="env-block env-block--non">
          <p class="env-block-header">
            <span class="env-block-icon">❌</span>
            <span class="env-block-title">나에게 맞지 않는 환경</span>
          </p>
          <p class="env-block-text">{{ t3NonRecText }}</p>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchSurveyAnalysis, fetchT2Recommend } from '../survey.api'
import type { SurveyAnalysisResponse, T2RecommendJob } from '../types/survey'

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
  T23_1:  '다른 사람들을 돕거나 사회에 긍정적인 영향을 미치는 데서 큰 만족감을 느끼는 것을 의미합니다.',
  T23_2:  '심리적으로나 물질적으로 불안감 없이 꾸준하고 예측 가능한 삶을 유지하는 것을 중요하게 여깁니다.',
  T23_3:  '새로운 지식을 배우고 탐구하는 과정 자체에서 큰 즐거움을 얻는 것을 의미합니다.',
  T23_4:  '스스로 도전적인 목표를 세우고 이를 내 자신의 노력으로 달성했을 때 큰 만족감을 느끼는 것을 의미합니다.',
  T23_5:  '다른 사람들의 생각이나 행동, 혹은 중요한 결정에 긍정적인 영향을 미치고 싶어 하는 경향을 의미합니다.',
  T23_6:  '나의 노력과 성과에 대해 다른 사람들에게 긍정적으로 평가받고 인정받는 것을 중요하게 생각합니다.',
  T23_7:  '내가 하는 일에 대해 충분하고 만족스러운 금전적인 대가를 받는 것을 중요하게 생각합니다.',
  T23_8:  '정신적, 육체적으로 건강하고 여유로운 삶을 유지하는 것을 최우선으로 생각합니다.',
  T23_9:  '타인의 간섭이나 지시 없이 스스로 생각하고 결정하며, 나의 방식대로 일을 주도적으로 해나갈 수 있는 환경을 중요하게 생각합니다.',
  T23_10: '개인의 이익을 넘어 소속된 공동체나 더 큰 목표를 위해 기꺼이 자신을 바치고 기여하는 것을 중요하게 여깁니다.',
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

const T3_RESULT_TEXTS: Record<string, Record<string, string>> = {
  T3_PHY: {
    '5': '역동적이고 현장감 있는 환경에서 활력을 얻습니다. 강한 신체활동이나 다양한 외부 환경 변화도 부담 없이 감수할 수 있습니다.',
    '4': '움직이며 일하는 환경을 선호합니다. 실외 활동이 많거나 환경이 바뀌어도 잘 적응하는 편입니다.',
    '3': '실내외 환경을 크게 가리지 않는 편입니다. 환경 변화에 무난하게 적응할 수 있습니다.',
    '2': '강도 높은 신체활동이나 열악한 외부 환경에 장시간 노출되는 것은 부담스러울 수 있습니다.',
    '1': '소음, 먼지, 극한 기온 등 환경적 자극이 강한 현장은 피로감과 스트레스를 줄 수 있습니다.',
  },
  T3_PEO: {
    '5': '항상 사람들과 함께하는 환경을 즐깁니다. 신체적 접촉이 있는 대인 업무도 자연스럽게 받아들일 수 있습니다.',
    '4': '다양한 사람들과 자주 접촉하고 고객을 응대하는 환경이 잘 맞습니다.',
    '3': '사람과의 접촉 빈도에 크게 구애받지 않습니다. 혼자 일하는 것도, 함께 일하는 것도 무난하게 적응합니다.',
    '2': '많은 사람과 지속적으로 접촉해야 하는 환경은 다소 부담스러울 수 있습니다.',
    '1': '끊임없는 대인 접촉이나 고객 응대가 많은 환경은 쉽게 소진감을 줄 수 있습니다.',
  },
  T3_COM: {
    '5': '발표, 회의, 설득 등 다양한 방식의 소통이 많은 환경에서 잘 발휘됩니다. 커뮤니케이션이 업무의 중심인 환경이 잘 맞습니다.',
    '4': '전화, 문서, 회의 등 소통 비중이 높은 업무 환경을 편안하게 받아들입니다.',
    '3': '소통 빈도에 크게 민감하지 않습니다. 많든 적든 상황에 맞게 조율할 수 있습니다.',
    '2': '잦은 보고나 소통이 요구되는 환경은 집중력을 흩트릴 수 있습니다.',
    '1': '발표, 회의, 대외 커뮤니케이션이 많은 환경은 부담감과 피로감을 줄 수 있습니다.',
  },
  T3_RES: {
    '5': '높은 의사결정 권한과 그에 따른 책임을 기꺼이 감수합니다. 결과에 대한 책임이 명확한 환경에서 오히려 동기부여가 됩니다.',
    '4': '어느 정도의 의사결정 권한이 주어지고 책임감 있는 역할을 맡는 환경이 잘 맞습니다.',
    '3': '책임의 크기에 크게 구애받지 않습니다. 주어진 역할에 맞게 유연하게 적응할 수 있습니다.',
    '2': '결과에 대한 책임이 크거나 실수의 파급력이 높은 환경은 부담스러울 수 있습니다.',
    '1': '높은 의사결정 권한이나 강한 책임이 요구되는 환경은 심리적 압박감을 줄 수 있습니다.',
  },
  T3_STR: {
    '5': '마감 압박, 갈등 상황, 치열한 경쟁 환경도 감수할 수 있습니다. 긴장감이 있는 환경에서 오히려 집중력이 높아지는 편입니다.',
    '4': '어느 정도의 마감 압박이나 경쟁이 있어도 크게 위축되지 않고 잘 대처합니다.',
    '3': '스트레스 강도에 크게 민감하지 않습니다. 상황에 따라 유연하게 대응할 수 있습니다.',
    '2': '지속적인 마감 압박이나 갈등이 잦은 환경은 쉽게 소진될 수 있습니다.',
    '1': '경쟁이 치열하거나 긴장 상태가 오래 지속되는 환경은 번아웃으로 이어질 수 있습니다.',
  },
  T3_FLX: {
    '5': '매일 다른 업무와 역할이 주어지는 비정형적인 환경에서 활력을 얻습니다. 정해진 틀 없이 자유롭게 움직일 수 있는 환경이 가장 잘 맞습니다.',
    '4': '유동적이고 변화가 많은 업무 환경을 선호합니다. 새로운 상황에 빠르게 적응하는 편입니다.',
    '3': '업무의 규칙성과 유연성 중 어느 쪽도 크게 가리지 않습니다. 주어진 환경에 무난하게 적응할 수 있습니다.',
    '2': '예측하기 어렵거나 매일 업무가 크게 달라지는 환경은 다소 불안정하게 느껴질 수 있습니다.',
    '1': '구조나 루틴 없이 매번 새로운 방식으로 일해야 하는 환경은 혼란스럽고 소모적으로 느껴질 수 있습니다.',
  },
}

const T3_WE_ITEMS: Record<string, { icon: string; name: string; description: string }> = {
  WE01: { icon: '🏢', name: '실내 근무', description: '건물 내부에서 주로 업무를 처리하는 환경' },
  WE02: { icon: '🪑', name: '앉아서 근무', description: '대부분의 업무를 앉은 자세로 처리하는 환경' },
  WE03: { icon: '📧', name: '이메일 업무', description: '이메일을 통한 소통과 업무 처리가 많은 환경' },
  WE04: { icon: '🤝', name: '사람들과 직접 접촉', description: '고객이나 동료와 직접 만나 일하는 환경' },
  WE05: { icon: '💬', name: '다른 사람과의 상호작용', description: '타인과 지속적으로 소통하며 협력하는 환경' },
  WE06: { icon: '👋', name: '다른 사람과의 접촉', description: '다양한 사람들과 접촉이 잦은 환경' },
  WE07: { icon: '👑', name: '조율·이끌기', description: '다른 사람들을 조율하거나 이끄는 역할이 있는 환경' },
  WE08: { icon: '📄', name: '공문·문서 교환', description: '공식 문서나 공문을 주고받는 업무가 많은 환경' },
  WE09: { icon: '📞', name: '전화 업무', description: '전화 통화가 잦은 업무 환경' },
  WE10: { icon: '🛎️', name: '외부 고객 응대', description: '외부 고객을 직접 상대하는 업무 환경' },
  WE11: { icon: '🔬', name: '정확성·정밀성', description: '높은 정밀도와 꼼꼼함이 요구되는 업무 환경' },
  WE12: { icon: '📊', name: '조직에 미치는 강도', description: '이미지, 평판, 재정에 큰 영향을 미치는 업무 환경' },
  WE13: { icon: '🔁', name: '반복적인 업무', description: '동일한 작업이 반복되는 구조의 환경' },
  WE14: { icon: '🔑', name: '의사결정 권한', description: '중요한 결정을 스스로 내릴 수 있는 권한이 있는 환경' },
  WE15: { icon: '📌', name: '결과에 대한 책임', description: '업무 결과에 대해 명확하게 책임지는 환경' },
  WE16: { icon: '🫂', name: '신체적 접촉', description: '타인과 신체적으로 접촉하는 업무가 포함된 환경' },
  WE17: { icon: '🏆', name: '조직에 미치는 영향력', description: '조직의 방향이나 성과에 영향력을 행사하는 환경' },
  WE18: { icon: '🖐️', name: '손 사용', description: '도구나 장치를 손으로 직접 다루는 작업이 많은 환경' },
  WE19: { icon: '⏰', name: '마감시간', description: '촉박한 마감이 자주 있는 업무 환경' },
  WE20: { icon: '💡', name: '의사결정 가능성', description: '업무 내에서 판단하고 결정할 기회가 많은 환경' },
  WE21: { icon: '💥', name: '갈등 상황', description: '갈등이나 충돌이 발생할 수 있는 환경' },
  WE22: { icon: '⚖️', name: '균형 유지', description: '신체 균형을 요구하는 작업이 포함된 환경' },
  WE23: { icon: '🛡️', name: '건강·안전 책임', description: '타인의 건강과 안전을 책임지는 역할이 포함된 환경' },
  WE24: { icon: '🌿', name: '실외 근무', description: '야외나 현장에서 주로 활동하는 환경' },
  WE25: { icon: '🎤', name: '발표·회의', description: '연설, 발표, 회의가 자주 있는 환경' },
  WE26: { icon: '😤', name: '무례한 사람 상대', description: '불쾌하거나 무례한 상황을 감수해야 하는 환경' },
  WE27: { icon: '🎯', name: '실수의 심각성', description: '실수가 큰 결과로 이어질 수 있는 긴장감 있는 환경' },
  WE28: { icon: '⚙️', name: '움직이는 기계', description: '가동 중인 기계 근처에서 작업하는 환경' },
  WE29: { icon: '📅', name: '주말·공휴일 근무', description: '주말이나 공휴일에도 근무해야 하는 환경' },
  WE30: { icon: '🥊', name: '치열한 경쟁', description: '성과 경쟁이 치열한 업무 환경' },
  WE31: { icon: '🔊', name: '소음 노출', description: '작업 중 상당한 소음에 노출되는 환경' },
  WE32: { icon: '🤖', name: '자동화 환경', description: '자동화된 시스템이나 장비가 많은 환경' },
  WE33: { icon: '🏭', name: '장비 속도에 보조', description: '기계나 장비의 속도에 맞춰 작업해야 하는 환경' },
  WE34: { icon: '🌡️', name: '극단적 기온', description: '매우 춥거나 더운 환경에서 일하는 환경' },
  WE35: { icon: '🏠', name: '재택근무', description: '집이나 원격지에서 근무하는 환경' },
  WE36: { icon: '📦', name: '비좁은 업무 공간', description: '좁거나 제한된 공간에서 작업하는 환경' },
  WE37: { icon: '💡', name: '부적절한 조명', description: '지나치게 밝거나 어두운 조명 환경' },
  WE38: { icon: '🦵', name: '서서 근무', description: '장시간 서서 일하는 환경' },
  WE39: { icon: '🩹', name: '경미한 부상 위험', description: '가벼운 화상, 자상 등에 노출될 수 있는 환경' },
  WE40: { icon: '🤸', name: '몸을 구부리거나 비틀기', description: '신체를 자주 굽히거나 비트는 자세가 요구되는 환경' },
  WE41: { icon: '🚶', name: '걷거나 뛰기', description: '이동이 잦고 신체활동이 많은 환경' },
  WE42: { icon: '📳', name: '온몸 진동 노출', description: '진동이 심한 장비나 차량을 다루는 환경' },
  WE43: { icon: '☣️', name: '오염물질 노출', description: '먼지, 화학물질 등 오염 환경에서 일하는 환경' },
  WE44: { icon: '🦺', name: '보호장비 착용', description: '안전모, 장갑 등 보호장비를 착용해야 하는 환경' },
  WE45: { icon: '⚠️', name: '위험한 장비 노출', description: '위험한 기계나 장비를 다루는 환경' },
  WE46: { icon: '🚨', name: '위험한 상태 노출', description: '사고 위험이 있는 상황에서 작업하는 환경' },
  WE47: { icon: '🦠', name: '질병·감염 위험', description: '질병이나 감염에 노출될 수 있는 환경' },
  WE48: { icon: '🏔️', name: '고지대 작업', description: '높은 곳에서 작업하는 환경' },
  WE49: { icon: '🗓️', name: '규칙적인 근무', description: '일정하고 예측 가능한 루틴으로 일하는 환경' },
}

const T3_PARTS_MAP: Record<string, { up: Array<{ code: string; weight: number }>; down: Array<{ code: string; weight: number }> }> = {
  T3_PHY: {
    up: [
      { code: 'WE24', weight: 1.5 }, { code: 'WE38', weight: 1 }, { code: 'WE40', weight: 1 },
      { code: 'WE41', weight: 1 }, { code: 'WE22', weight: 0.7 }, { code: 'WE31', weight: 0.7 },
      { code: 'WE34', weight: 0.7 }, { code: 'WE37', weight: 0.5 }, { code: 'WE36', weight: 0.5 },
      { code: 'WE18', weight: 0.7 }, { code: 'WE28', weight: 1 }, { code: 'WE39', weight: 1 },
      { code: 'WE42', weight: 1.5 }, { code: 'WE43', weight: 1.5 }, { code: 'WE44', weight: 1 },
      { code: 'WE45', weight: 1.5 }, { code: 'WE46', weight: 1.5 }, { code: 'WE47', weight: 1 },
      { code: 'WE48', weight: 1 },
    ],
    down: [
      { code: 'WE01', weight: 1.5 }, { code: 'WE02', weight: 1 }, { code: 'WE35', weight: 0.5 },
    ],
  },
  T3_PEO: {
    up: [
      { code: 'WE04', weight: 1.5 }, { code: 'WE05', weight: 1.5 }, { code: 'WE06', weight: 1 },
      { code: 'WE10', weight: 1 }, { code: 'WE16', weight: 1 }, { code: 'WE26', weight: 0.7 },
    ],
    down: [
      { code: 'WE35', weight: 1 },
    ],
  },
  T3_COM: {
    up: [
      { code: 'WE25', weight: 1.5 }, { code: 'WE09', weight: 1 }, { code: 'WE08', weight: 0.7 },
      { code: 'WE03', weight: 0.7 },
    ],
    down: [
      { code: 'WE35', weight: 0.7 },
    ],
  },
  T3_RES: {
    up: [
      { code: 'WE14', weight: 1.5 }, { code: 'WE20', weight: 1.5 }, { code: 'WE07', weight: 1 },
      { code: 'WE15', weight: 1 }, { code: 'WE17', weight: 1 }, { code: 'WE23', weight: 1 },
      { code: 'WE27', weight: 0.7 }, { code: 'WE12', weight: 0.7 }, { code: 'WE11', weight: 0.5 },
    ],
    down: [],
  },
  T3_STR: {
    up: [
      { code: 'WE21', weight: 1.5 }, { code: 'WE30', weight: 1.5 }, { code: 'WE19', weight: 1 },
      { code: 'WE29', weight: 0.7 },
    ],
    down: [
      { code: 'WE35', weight: 0.5 },
    ],
  },
  T3_FLX: {
    up: [],
    down: [
      { code: 'WE49', weight: 1.5 }, { code: 'WE13', weight: 1 }, { code: 'WE32', weight: 1 },
      { code: 'WE33', weight: 0.7 },
    ],
  },
}

const route = useRoute()
const surveyId = route.params.survey_id as string

const isLoading = ref(true)
const error = ref(false)
const analysis = ref<SurveyAnalysisResponse['analysis'] | null>(null)

const t1ImgSrc = computed(() => {
  const baseType = analysis.value?.personality_type?.base_type
  return baseType ? (T1_IMG_MAP[baseType] ?? null) : null
})

const t3Rec = computed(() =>
  (analysis.value?.environment.parts ?? [])
    .filter(p => p.level >= 3)
    .sort((a, b) => b.level - a.level)
)

const t3NonRec = computed(() =>
  (analysis.value?.environment.parts ?? [])
    .filter(p => p.level <= 2)
    .sort((a, b) => a.level - b.level)
)

const t3RecText = computed(() => {
  if (t3Rec.value.length === 0) return '대부분의 업무 환경에 신중하게 접근하는 편입니다.'
  return t3Rec.value
    .map(p => T3_RESULT_TEXTS[p.code]?.[String(p.level)] ?? '')
    .filter(Boolean)
    .join('\n')
})

const t3NonRecText = computed(() =>
  t3NonRec.value
    .map(p => T3_RESULT_TEXTS[p.code]?.[String(p.level)] ?? '')
    .filter(Boolean)
    .join('\n')
)

function computeWEItems(
  parts: Array<{ code: string; level: number }>,
  config: Array<{ levels: number[]; side: 'up' | 'down' }>
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
  (analysis.value?.environment.parts ?? []).some(p => p.level !== 3)
)

const t3WeRec = computed(() =>
  computeWEItems(analysis.value?.environment.parts ?? [], [
    { levels: [4, 5], side: 'up' },
    { levels: [1, 2], side: 'down' },
  ])
)

const t3WeNonRec = computed(() =>
  computeWEItems(analysis.value?.environment.parts ?? [], [
    { levels: [1, 2], side: 'up' },
    { levels: [4, 5], side: 'down' },
  ])
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
  L: '읽고 쓰고 말하며',
  M: '논리적으로 분석하고 설계하며',
  S: '시각적으로 구성하고 표현하며',
  A: '소리와 리듬으로 창작하며',
  B: '몸을 활용해 직접 만들고 움직이며',
  I: '사람을 이해하고 이끌며',
  N: '깊이 사유하고 성찰하며',
  T: '자연을 관찰하고 탐구하며',
}

const T23_TO_VA_FE: Record<string, string> = {
  T23_1: 'VA10', T23_2: 'VA11', T23_3: 'VA04',
  T23_4: 'VA01', T23_5: 'VA06', T23_6: 'VA09',
  T23_7: 'VA05', T23_8: 'VA12', T23_9: 'VA07',
  T23_10: 'VA08', T23_11: 'VA03', T23_12: 'VA13',
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

onMounted(() => {
  load()
  loadT2Recommend()
})
</script>

<style scoped>
.env-block {
  border-radius: 12px;
  padding: 1rem 1.125rem;
  margin-top: 1rem;
}

.env-block--rec {
  background: #F0FBF4;
  border: 1px solid #A8E6B8;
}

.env-block--non {
  background: #FFF4F4;
  border: 1px solid #F5B8B8;
}

.env-block-header {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin: 0 0 0.625rem;
}

.env-block-icon {
  font-size: 1rem;
  line-height: 1;
}

.env-block-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #222;
}

.env-block-text {
  font-size: 0.875rem;
  line-height: 1.7;
  color: #444;
  white-space: pre-line;
  margin: 0;
}

.env-we-list {
  margin-top: 0.875rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(0, 0, 0, 0.07);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.env-we-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.env-we-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
  line-height: 1.5;
}

.env-we-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.env-we-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #222;
}

.env-we-desc {
  font-size: 0.8rem;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

/* ── T2 추천 직업 ─────────────────────────────────── */
.t2rec-list {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  -webkit-overflow-scrolling: touch;
}

.t2rec-card {
  flex-shrink: 0;
  width: 220px;
  background: #fff;
  border: 1px solid #E8E8E4;
  border-radius: 14px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.t2rec-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.25rem;
}

.t2rec-title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #111;
  line-height: 1.3;
}

.t2rec-score {
  flex-shrink: 0;
  font-size: 0.75rem;
  font-weight: 700;
  color: #3D7FE8;
}

.t2rec-class {
  font-size: 0.75rem;
  color: #999;
  margin: 0;
}

.t2rec-label {
  font-size: 0.8rem;
  color: #444;
  line-height: 1.7;
  margin: 0.25rem 0;
}

.t2rec-tag {
  display: inline;
  font-weight: 600;
  color: #1a1a1a;
}

.t2rec-meta {
  font-size: 0.75rem;
  color: #888;
  margin: 0;
  margin-top: auto;
  padding-top: 0.375rem;
  border-top: 1px solid #F0F0EC;
}

.t2rec-skeleton-list {
  display: flex;
  gap: 0.75rem;
}

.t2rec-skeleton {
  flex-shrink: 0;
  width: 220px;
  height: 160px;
  background: linear-gradient(90deg, #f0f0eb 25%, #e8e8e3 50%, #f0f0eb 75%);
  background-size: 200% 100%;
  animation: t2rec-shimmer 1.4s infinite;
  border-radius: 14px;
}

@keyframes t2rec-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.t2rec-message {
  font-size: 0.875rem;
  color: #999;
  text-align: center;
  padding: 1.5rem 0;
  margin: 0;
}
</style>
