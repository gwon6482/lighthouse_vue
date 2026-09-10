<template>
  <div class="cd-result">
    <CdYellowHeader title="나의 진로계획" :subtitle="draftPlan.name || '내 진로계획'" back-to="/career-design/plan/review-day" />

    <div class="cd-result__body">
      <!-- 완성 축하 -->
      <div class="cd-result__celebrate">
        <span class="cd-result__celebrate-emoji">🎉</span>
        <h2 class="cd-result__celebrate-title">진로계획 완성!</h2>
        <p class="cd-result__celebrate-msg">
          수고하셨습니다! <strong>{{ userName }}</strong>님의 진로계획이 완성되었어요!
        </p>
        <p class="cd-result__celebrate-guide">
          앞으로는 메인화면에서 매일매일 진로계획에 맞춰서 오늘의 할일을 알려드려요!
          일주일에 한번씩 리뷰하는 시간을 가지며 자유롭게 수정할 수 있어요!
        </p>
      </div>

      <!-- 요약 카드 -->
      <div class="cd-result__summary">
        <div class="cd-result__target">
          <span class="cd-result__target-icon">🎯</span>
          <span class="cd-result__target-job">{{ draftPlan.targetJob || '목표 직업 미설정' }}</span>
        </div>
        <div class="cd-result__period-row">
          <span class="cd-result__period">{{ periodLabel }}</span>
          <span class="cd-result__stats">프로젝트 {{ placedCount }}개 배치</span>
        </div>
        <div v-if="draftPlan.reviewDay" class="cd-result__review-row">
          <span class="cd-result__review-icon">🔄</span>
          <span class="cd-result__review-text">
            매주 <strong>{{ draftPlan.reviewDay }}요일</strong>에 한 주를 돌아보고 다음 주를 계획해요
          </span>
        </div>
      </div>

      <!-- 루틴 목록 -->
      <div v-if="draftPlan.routines.length" class="cd-result__section">
        <h3 class="cd-result__section-title">매일의 루틴</h3>
        <div class="cd-result__routines">
          <div
            v-for="routine in draftPlan.routines"
            :key="routine.id"
            class="cd-result__routine"
          >
            <div class="cd-result__routine-left">
              <span class="cd-result__routine-name">{{ routine.name }}</span>
              <span class="cd-result__routine-meta">
                {{ daysSummary(routine.days) }} · {{ routine.duration }}분
                <template v-if="routine.notification"> · 🔔 {{ routine.notificationTime }}</template>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 타임라인 -->
      <div class="cd-result__section">
        <h3 class="cd-result__section-title">타임라인</h3>

        <div v-if="!filledSlots.length" class="cd-result__empty">
          배치된 프로젝트가 없어요
        </div>

        <div v-else class="cd-result__timeline">
          <div
            v-for="(slot, si) in filledSlots"
            :key="slot.week"
            class="cd-result__month"
          >
            <!-- 월 라벨 + 세로선 -->
            <div class="cd-result__month-left">
              <div class="cd-result__month-dot" />
              <div v-if="si < filledSlots.length - 1" class="cd-result__month-line" />
            </div>

            <div class="cd-result__month-right">
              <span class="cd-result__month-badge">{{ monthWeekLabel(draftPlan.startDate, slot.week) }} <em>{{ weekRangeLabel(draftPlan.startDate, slot.week) }}</em></span>

              <div class="cd-result__projects">
                <div
                  v-for="project in liveProjects(slot)"
                  :key="project.id"
                  class="cd-result__project"
                  :style="{ borderLeftColor: categoryColorMap[project.category] }"
                  @click="openProject(project)"
                >
                  <div class="cd-result__project-top">
                    <span class="cd-result__project-name">{{ project.name }}</span>
                    <span
                      class="cd-result__project-cat"
                      :style="{ color: categoryColorMap[project.category], background: `color-mix(in srgb, ${categoryColorMap[project.category]} 10%, white)` }"
                    >{{ categoryLabel(project.category) }}</span>
                  </div>
                  <p v-if="project.goal" class="cd-result__project-goal">{{ project.goal }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 미배치 프로젝트 -->
      <div v-if="unplacedProjects.length" class="cd-result__section cd-result__section--unplaced">
        <h3 class="cd-result__section-title">미배치 프로젝트 ({{ unplacedProjects.length }})</h3>
        <div class="cd-result__unplaced-list">
          <div
            v-for="project in unplacedProjects"
            :key="project.id"
            class="cd-result__unplaced-chip"
            :style="{ borderColor: categoryColorMap[project.category], color: categoryColorMap[project.category] }"
            @click="openProject(project)"
          >
            {{ project.name }}
          </div>
        </div>
      </div>
    </div>

    <!-- 프로젝트 상세 팝업 -->
    <Teleport to="body">
      <Transition name="cd-popup">
        <div v-if="selectedProject" class="cd-proj-popup" @click.self="closeProject">
          <div class="cd-proj-popup__sheet">
            <!-- 핸들 -->
            <div class="cd-proj-popup__handle" />

            <!-- 헤더 -->
            <div
              class="cd-proj-popup__header"
              :style="{ borderLeftColor: categoryColorMap[selectedProject.category] }"
            >
              <div class="cd-proj-popup__header-left">
                <span
                  class="cd-proj-popup__cat"
                  :style="{ color: categoryColorMap[selectedProject.category], background: `color-mix(in srgb, ${categoryColorMap[selectedProject.category]} 10%, white)` }"
                >{{ categoryLabel(selectedProject.category) }}</span>
                <h2 class="cd-proj-popup__name">{{ selectedProject.name }}</h2>
                <p v-if="selectedProject.goal" class="cd-proj-popup__goal">{{ selectedProject.goal }}</p>
              </div>
              <button class="cd-proj-popup__close" @click="closeProject">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5l10 10" stroke="#888" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </button>
            </div>

            <!-- 주차별 커리큘럼 -->
            <div class="cd-proj-popup__body">
              <div v-if="!selectedProject.curriculum?.length" class="cd-proj-popup__empty">
                등록된 주차별 계획이 없습니다
              </div>
              <div
                v-for="week in selectedProject.curriculum"
                :key="week.week"
                class="cd-proj-popup__week"
              >
                <div class="cd-proj-popup__week-header">
                  <span
                    class="cd-proj-popup__week-badge"
                    :style="{ background: categoryColorMap[selectedProject.category] }"
                  >{{ week.week }}주차</span>
                  <span class="cd-proj-popup__week-title">{{ week.title }}</span>
                </div>
                <ul v-if="week.items?.length" class="cd-proj-popup__items">
                  <li v-for="(item, i) in week.items" :key="i" class="cd-proj-popup__item">
                    {{ item }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 하단 버튼 -->
    <div class="cd-result__footer">
      <button class="cd-result__btn-secondary" @click="router.push('/career-design/complete')">
        계획 수정하기
      </button>
      <!-- /main/before 스테퍼(3단계)에서 진입한 경우: 설계 완료 → 복귀 -->
      <button
        v-if="fromMainBefore"
        class="cd-result__btn-primary"
        :disabled="finishing"
        @click="finishDesign"
      >
        {{ finishing ? '이동 중...' : '다음으로' }}
      </button>
      <button v-else class="cd-result__btn-primary" @click="router.push('/career-achievement/weekly-schedule')">
        주간 일정 배치하기
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { req } from '@/shared/api'
import { useCareerDesign } from '../composables/useCareerDesign'
import { weekRangeLabel, monthWeekLabel, resolveProject } from '../composables/usePlanTimeline'
import { useWeeklySchedule } from '@/modules/career-achievement/composables/useWeeklySchedule'
import { useAuthStore } from '@/shared/stores/auth'
import CdYellowHeader from '../components/CdYellowHeader.vue'
import type { Project, ProjectCategory, DayOfWeek } from '../types/career-design'

const router = useRouter()
const authStore = useAuthStore()
const { draftPlan, draftTimeline } = useCareerDesign()
const { ensureFirstWeekSchedule } = useWeeklySchedule()

// 진로계획이 완성된 시점에 첫 주 WeeklySchedule 을 자동 생성 (이미 있으면 no-op).
// 진로달성 메인이 즉시 표시할 데이터 확보.
onMounted(async () => {
  if (!draftPlan.planId || !draftPlan.startDate || !draftPlan.reviewDay) return
  await ensureFirstWeekSchedule(
    draftPlan.planId,
    {
      startDate: draftPlan.startDate,
      reviewDay: draftPlan.reviewDay,
      projects: draftPlan.projects,
      routines: draftPlan.routines,
    },
    draftTimeline.value,
  )
})

const userName = computed(() => authStore.user?.name ?? authStore.user?.email?.split('@')[0] ?? '회원')

// /main/before 스테퍼(3단계)에서 진입했는지
const fromMainBefore = ref(!!sessionStorage.getItem('lh_plan_return'))
const finishing = ref(false)

async function finishDesign() {
  finishing.value = true
  try {
    // 설계 완료 시점에 계획을 active 로 전환 (진로달성 진입 가능 상태)
    if (draftPlan.planId) {
      await req.put(`/api/career-plan/${draftPlan.planId}`, { status: 'active' })
    }
  } catch { /* 활성화 실패해도 복귀는 진행 */ } finally {
    finishing.value = false
  }
  sessionStorage.removeItem('lh_plan_return')
  router.push('/main/before')
}

const ALL_DAYS: DayOfWeek[] = ['월', '화', '수', '목', '금', '토', '일']
function daysSummary(days: DayOfWeek[]): string {
  if (days.length === 7) return '매일'
  if (days.length === 5 && ALL_DAYS.slice(0, 5).every(d => days.includes(d))) return '평일'
  if (days.length === 2 && days.includes('토') && days.includes('일')) return '주말'
  return days.join('·')
}

const selectedProject = ref<Project | null>(null)
const openProject  = (p: Project) => { selectedProject.value = p }
const closeProject = () => { selectedProject.value = null }

const categories: { value: ProjectCategory; label: string }[] = [
  { value: 'qualification', label: '자격요건' },
  { value: 'knowledge',     label: '분야지식' },
  { value: 'skill',         label: '직무기술' },
  { value: 'portfolio',     label: '포트폴리오' },
]
const categoryColorMap: Record<ProjectCategory, string> = {
  qualification: '#1DB95A',
  knowledge:     '#F47820',
  skill:         '#A855F7',
  portfolio:     '#4480F5',
}
const categoryLabel = (cat: ProjectCategory) => categories.find(c => c.value === cat)?.label ?? ''

const filledSlots = computed(() =>
  draftTimeline.value.filter(s => s.projects.length > 0).sort((a, b) => a.week - b.week)
)

// 슬롯은 배치 시점의 복사본을 들고 있어 이후 수정이 반영되지 않는다 → id 로 원본을 집어온다.
const liveProjects = (slot: { projects: Project[] }) =>
  slot.projects.map(p => resolveProject(p, draftPlan.projects))

const placedProjectIds = computed(() =>
  new Set(filledSlots.value.flatMap(s => s.projects.map(p => p.id)))
)
const placedCount = computed(() => placedProjectIds.value.size)

const unplacedProjects = computed(() =>
  draftPlan.projects.filter(p => !placedProjectIds.value.has(p.id))
)

const periodLabel = computed(() => {
  const { startDate, endDate } = draftPlan
  if (!startDate) return ''
  const fmt = (d: string) => { const [y, m] = d.split('-'); return `${y}.${m}` }
  return endDate ? `${fmt(startDate)} ~ ${fmt(endDate)}` : fmt(startDate)
})
</script>

<style lang="scss">
.cd-result {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #F5F5F5;

  &__body {
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* 완성 축하 */
  &__celebrate {
    background: linear-gradient(135deg, #FFFBEC 0%, #FFF4D4 100%);
    border: 1px solid #FFE99A;
    border-radius: 16px;
    padding: 24px 20px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  &__celebrate-emoji {
    font-size: 36px;
    line-height: 1;
  }

  &__celebrate-title {
    font-size: 22px;
    font-weight: 800;
    color: #222;
    margin: 0;
  }

  &__celebrate-msg {
    font-size: 14px;
    color: #444;
    margin: 0;
    line-height: 1.5;

    strong { color: #CC9D00; font-weight: 700; }
  }

  &__celebrate-guide {
    font-size: 12px;
    color: #888;
    line-height: 1.6;
    margin: 6px 0 0;
    padding-top: 12px;
    border-top: 1px dashed #FFE99A;
    width: 100%;
  }

  /* 루틴 목록 */
  &__routines {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__routine {
    background: #FFFBEC;
    border: 1px solid #FFE99A;
    border-radius: 10px;
    padding: 10px 14px;
    display: flex;
    align-items: center;
  }

  &__routine-left {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  &__routine-name {
    font-size: 14px;
    font-weight: 600;
    color: #222;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__routine-meta {
    font-size: 12px;
    color: #888;
  }

  /* 요약 카드 */
  &__summary {
    background: #fff;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__target {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__target-icon { font-size: 18px; }

  &__target-job {
    font-size: 18px;
    font-weight: 700;
    color: #222;
  }

  &__period-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__period {
    font-size: 13px;
    color: #888;
  }

  &__stats {
    font-size: 12px;
    font-weight: 600;
    color: #FFC700;
    background: #FFFBEC;
    padding: 3px 10px;
    border-radius: 20px;
  }

  &__review-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
    padding-top: 10px;
    border-top: 1px dashed #EEEEE8;
    font-size: 12.5px;
    color: #666;
    line-height: 1.4;

    strong {
      color: #B07800;
      font-weight: 800;
      background: #FFFBEC;
      padding: 1px 6px;
      border-radius: 6px;
      margin: 0 2px;
    }
  }

  &__review-icon {
    font-size: 14px;
    flex-shrink: 0;
  }

  /* 섹션 공통 */
  &__section {
    background: #fff;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    &--unplaced { gap: 12px; }
  }

  &__section-title {
    font-size: 15px;
    font-weight: 700;
    color: #222;
  }

  &__empty {
    font-size: 13px;
    color: #ccc;
    text-align: center;
    padding: 20px 0;
  }

  /* 타임라인 세로형 */
  &__timeline {
    display: flex;
    flex-direction: column;
  }

  &__month {
    display: flex;
    gap: 14px;
  }

  &__month-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    padding-top: 3px;
  }

  &__month-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #FFC700;
    border: 2px solid #fff;
    box-shadow: 0 0 0 2px #FFC700;
    flex-shrink: 0;
  }

  &__month-line {
    flex: 1;
    width: 2px;
    background: #eee;
    margin: 4px 0 0;
  }

  &__month-right {
    flex: 1;
    padding-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__month-badge {
    font-size: 13px;
    font-weight: 700;
    color: #222;
    display: inline-block;
    margin-top: -2px;
  }

  &__projects {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__project {
    background: #fafafa;
    border: 1px solid #eee;
    border-left: 3px solid;
    border-radius: 10px;
    padding: 10px 14px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    cursor: pointer;
    transition: background 0.12s;

    &:hover { background: #f0f0f0; }
  }

  &__project-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &__project-name {
    font-size: 14px;
    font-weight: 600;
    color: #222;
    flex: 1;
  }

  &__project-cat {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 10px;
    white-space: nowrap;
  }

  &__project-goal {
    font-size: 12px;
    color: #888;
    line-height: 1.4;
  }

  /* 미배치 */
  &__unplaced-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__unplaced-chip {
    border: 1.5px solid;
    border-radius: 20px;
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.12s;

    &:hover { opacity: 0.7; }
  }

  /* 하단 버튼 */
  &__footer {
    padding: 16px 20px 32px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__btn-secondary {
    width: 100%;
    padding: 16px;
    background: #fff;
    border: 2px solid #FFC700;
    border-radius: 16px;
    font-size: 16px;
    font-weight: 600;
    color: #CC9D00;
    cursor: pointer;

    &:active { opacity: 0.85; }
  }

  &__btn-primary {
    width: 100%;
    padding: 18px;
    background: #FFC700;
    border: none;
    border-radius: 16px;
    font-size: 17px;
    font-weight: 700;
    color: #fff;
    cursor: pointer;

    &:active { opacity: 0.85; }
  }
}

/* ── 프로젝트 상세 팝업 ─────────────────────────── */
.cd-proj-popup {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
  display: flex;
  align-items: flex-end;

  &__sheet {
    width: 100%;
    max-height: 80vh;
    background: #fff;
    border-radius: 20px 20px 0 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__handle {
    width: 36px;
    height: 4px;
    background: #ddd;
    border-radius: 2px;
    margin: 12px auto 4px;
    flex-shrink: 0;
  }

  &__header {
    padding: 14px 20px 16px;
    border-left: 4px solid;
    margin: 0 20px;
    border-radius: 2px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex-shrink: 0;
  }

  &__header-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__cat {
    font-size: 11px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 10px;
    align-self: flex-start;
  }

  &__name {
    font-size: 17px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
    line-height: 1.3;
  }

  &__goal {
    font-size: 13px;
    color: #888;
    margin: 0;
    line-height: 1.4;
  }

  &__close {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #F5F5F5;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    margin-top: 2px;
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px 32px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__empty {
    font-size: 13px;
    color: #bbb;
    text-align: center;
    padding: 24px 0;
  }

  &__week {
    background: #fafafa;
    border: 1px solid #eee;
    border-radius: 12px;
    overflow: hidden;
  }

  &__week-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-bottom: 1px solid #eee;
  }

  &__week-badge {
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    padding: 2px 8px;
    border-radius: 10px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  &__week-title {
    font-size: 13px;
    font-weight: 600;
    color: #222;
  }

  &__items {
    list-style: none;
    margin: 0;
    padding: 8px 14px 10px 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__item {
    font-size: 13px;
    color: #555;
    padding-left: 12px;
    position: relative;
    line-height: 1.4;

    &::before {
      content: '·';
      position: absolute;
      left: 0;
      color: #bbb;
    }
  }
}

/* 팝업 트랜지션 */
.cd-popup-enter-active,
.cd-popup-leave-active {
  transition: opacity 0.22s ease;

  .cd-proj-popup__sheet {
    transition: transform 0.22s ease;
  }
}
.cd-popup-enter-from,
.cd-popup-leave-to {
  opacity: 0;

  .cd-proj-popup__sheet {
    transform: translateY(100%);
  }
}
</style>
