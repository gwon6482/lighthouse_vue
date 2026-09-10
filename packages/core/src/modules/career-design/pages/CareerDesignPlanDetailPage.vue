<template>
  <div class="cd-detail">

    <!-- 헤더 -->
    <header class="cd-detail__header">
      <button class="cd-detail__back" @click="router.push('/mypage')">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <span class="cd-detail__header-title">진로계획 상세</span>
      <button class="cd-detail__edit" @click="goEdit">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path d="M14.5 2.5a1.77 1.77 0 0 1 2.5 2.5L6.5 15.5l-3.5 1 1-3.5L14.5 2.5z" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>수정</span>
      </button>
    </header>

    <div v-if="loading" class="cd-detail__loading">불러오는 중...</div>
    <div v-else-if="!plan" class="cd-detail__empty">진로계획을 찾을 수 없습니다.</div>

    <div v-else class="cd-detail__body">

      <!-- 요약 카드 -->
      <section class="summary-card">
        <div class="summary-card__title-row">
          <span class="summary-card__plan-name">{{ plan.name || '이름 없는 계획' }}</span>
          <span
            class="summary-card__status"
            :class="`summary-card__status--${plan.status || 'draft'}`"
          >{{ statusLabel(plan.status) }}</span>
        </div>
        <div class="summary-card__target">
          <span class="summary-card__target-icon">🎯</span>
          <span class="summary-card__target-job">{{ plan.targetJob || '목표 직업 미설정' }}</span>
        </div>
        <div v-if="periodLabel" class="summary-card__meta">
          <span class="summary-card__meta-icon">🗓️</span>
          <span>{{ periodLabel }}</span>
        </div>
        <div v-if="plan.reviewDay" class="summary-card__meta">
          <span class="summary-card__meta-icon">🔄</span>
          <span>매주 <strong>{{ plan.reviewDay }}요일</strong>에 주간리뷰</span>
        </div>
      </section>

      <!-- KPI 행 -->
      <section class="kpi-row">
        <div class="kpi-row__cell">
          <span class="kpi-row__value">{{ plan.projects.length }}</span>
          <span class="kpi-row__label">프로젝트</span>
        </div>
        <div class="kpi-row__divider" />
        <div class="kpi-row__cell">
          <span class="kpi-row__value">{{ plan.routines.length }}</span>
          <span class="kpi-row__label">루틴</span>
        </div>
        <div class="kpi-row__divider" />
        <div class="kpi-row__cell">
          <span class="kpi-row__value">{{ placedCount }}<span class="kpi-row__sub">/{{ plan.projects.length }}</span></span>
          <span class="kpi-row__label">배치 완료</span>
        </div>
      </section>

      <!-- 카테고리 분포 -->
      <section v-if="plan.projects.length" class="section">
        <h3 class="section__title">카테고리 분포</h3>
        <div class="cat-dist">
          <div
            v-for="cat in categoriesWithCount"
            :key="cat.value"
            class="cat-dist__row"
          >
            <span class="cat-dist__label" :style="{ color: categoryColorMap[cat.value] }">
              {{ cat.label }}
            </span>
            <div class="cat-dist__bar-bg">
              <div
                class="cat-dist__bar-fill"
                :style="{ width: cat.percent + '%', background: categoryColorMap[cat.value] }"
              />
            </div>
            <span class="cat-dist__count">{{ cat.count }}</span>
          </div>
        </div>
      </section>

      <!-- 타임라인 -->
      <section class="section">
        <h3 class="section__title">타임라인</h3>
        <div v-if="!filledSlots.length" class="section__empty">
          배치된 프로젝트가 없어요
        </div>
        <div v-else class="timeline">
          <div
            v-for="(slot, si) in filledSlots"
            :key="slot.week"
            class="timeline__month"
          >
            <div class="timeline__month-left">
              <div class="timeline__month-dot" />
              <div v-if="si < filledSlots.length - 1" class="timeline__month-line" />
            </div>
            <div class="timeline__month-right">
              <span class="timeline__month-badge">{{ monthWeekLabel(plan?.startDate ?? "", slot.week) }} <em>{{ weekRangeLabel(plan?.startDate ?? "", slot.week) }}</em></span>
              <div class="timeline__projects">
                <div
                  v-for="project in liveProjects(slot)"
                  :key="project.id"
                  class="timeline__project"
                  :style="{ borderLeftColor: categoryColorMap[project.category] }"
                  @click="openProject(project)"
                >
                  <div class="timeline__project-top">
                    <span class="timeline__project-name">{{ project.name }}</span>
                    <span
                      class="timeline__project-cat"
                      :style="{ color: categoryColorMap[project.category], background: `color-mix(in srgb, ${categoryColorMap[project.category]} 10%, white)` }"
                    >{{ categoryLabel(project.category) }}</span>
                  </div>
                  <p v-if="project.goal" class="timeline__project-goal">{{ project.goal }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 루틴 -->
      <section v-if="plan.routines.length" class="section">
        <h3 class="section__title">매일의 루틴</h3>
        <div class="routines">
          <div
            v-for="routine in plan.routines"
            :key="routine.id"
            class="routines__item"
          >
            <span class="routines__name">{{ routine.name }}</span>
            <span class="routines__meta">
              {{ daysSummary(routine.days) }} · {{ routine.duration }}분
              <template v-if="routine.notification"> · 🔔 {{ routine.notificationTime }}</template>
            </span>
          </div>
        </div>
      </section>

      <!-- 미배치 프로젝트 -->
      <section v-if="unplacedProjects.length" class="section">
        <h3 class="section__title">미배치 프로젝트 ({{ unplacedProjects.length }})</h3>
        <div class="unplaced">
          <div
            v-for="project in unplacedProjects"
            :key="project.id"
            class="unplaced__chip"
            :style="{ borderColor: categoryColorMap[project.category], color: categoryColorMap[project.category] }"
            @click="openProject(project)"
          >
            {{ project.name }}
          </div>
        </div>
      </section>

      <!-- 하단 액션 -->
      <div class="cd-detail__footer">
        <button class="cd-detail__btn-danger" @click="onDelete">삭제하기</button>
        <button class="cd-detail__btn-primary" @click="goEdit">수정하기</button>
      </div>

    </div>

    <!-- 프로젝트 상세 팝업 -->
    <Teleport to="body">
      <Transition name="cd-popup">
        <div v-if="selectedProject" class="cd-proj-popup" @click.self="closeProject">
          <div class="cd-proj-popup__sheet">
            <div class="cd-proj-popup__handle" />
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

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { req } from '@/shared/api'
import { useCareerDesign } from '../composables/useCareerDesign'
import type { Project, ProjectCategory, Routine, TimelineSlot, DayOfWeek } from '../types/career-design'
import { weekRangeLabel, monthWeekLabel, resolveProject } from '../composables/usePlanTimeline'

interface PlanDetail {
  planId: string
  name: string
  targetJob: string
  startDate: string
  endDate: string
  reviewDay: DayOfWeek | ''
  status?: 'draft' | 'active' | 'completed'
  projects: Project[]
  routines: Routine[]
  timeline: TimelineSlot[]
}

const router = useRouter()
const route = useRoute()
const { loadPlanFromApi } = useCareerDesign()

const plan = ref<PlanDetail | null>(null)
const loading = ref(true)

const planId = computed(() => String(route.params.planId ?? ''))

onMounted(async () => {
  try {
    const res = await req.get(`/api/career-plan/${planId.value}`)
    const p = res.data.plan
    plan.value = {
      planId:    p.planId,
      name:      p.name      ?? '',
      targetJob: p.targetJob ?? '',
      startDate: p.startDate ?? '',
      endDate:   p.endDate   ?? '',
      reviewDay: p.reviewDay ?? '',
      status:    p.status,
      projects:  p.projects  ?? [],
      routines:  p.routines  ?? [],
      timeline:  p.timeline  ?? [],
    }
  } catch {
    plan.value = null
  } finally {
    loading.value = false
  }
})

async function goEdit() {
  if (!planId.value) return
  const ok = await loadPlanFromApi(planId.value)
  if (ok) router.push('/career-design/result')
}

async function onDelete() {
  if (!planId.value) return
  if (!confirm('이 진로계획을 삭제할까요?')) return
  try {
    await req.delete(`/api/career-plan/${planId.value}`)
    router.push('/mypage')
  } catch {
    alert('삭제에 실패했어요. 잠시 후 다시 시도해주세요.')
  }
}

const statusLabel = (s?: string) => {
  if (s === 'active')    return '진행중'
  if (s === 'completed') return '완료'
  return '초안'
}

const ALL_DAYS: DayOfWeek[] = ['월', '화', '수', '목', '금', '토', '일']
function daysSummary(days: DayOfWeek[]): string {
  if (days.length === 7) return '매일'
  if (days.length === 5 && ALL_DAYS.slice(0, 5).every(d => days.includes(d))) return '평일'
  if (days.length === 2 && days.includes('토') && days.includes('일')) return '주말'
  return days.join('·')
}

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
  (plan.value?.timeline ?? []).filter(s => s.projects.length > 0).sort((a, b) => a.week - b.week)
)

// 슬롯은 배치 시점의 복사본을 들고 있어 이후 수정이 반영되지 않는다 → id 로 원본을 집어온다.
const liveProjects = (slot: TimelineSlot) =>
  slot.projects.map(p => resolveProject(p, plan.value?.projects))

const placedProjectIds = computed(() =>
  new Set(filledSlots.value.flatMap(s => s.projects.map(p => p.id)))
)
const placedCount = computed(() => placedProjectIds.value.size)

const unplacedProjects = computed(() =>
  (plan.value?.projects ?? []).filter(p => !placedProjectIds.value.has(p.id))
)

const periodLabel = computed(() => {
  if (!plan.value) return ''
  const { startDate, endDate } = plan.value
  if (!startDate) return ''
  const fmt = (d: string) => { const [y, m] = d.split('-'); return `${y}.${m}` }
  return endDate ? `${fmt(startDate)} ~ ${fmt(endDate)}` : fmt(startDate)
})

const categoriesWithCount = computed(() => {
  const projects = plan.value?.projects ?? []
  const total = projects.length || 1
  return categories.map(cat => {
    const count = projects.filter(p => p.category === cat.value).length
    return { ...cat, count, percent: (count / total) * 100 }
  })
})

const selectedProject = ref<Project | null>(null)
const openProject  = (p: Project) => { selectedProject.value = p }
const closeProject = () => { selectedProject.value = null }
</script>

<style scoped lang="scss">
.cd-detail {
  min-height: 100vh;
  background: #F5F5F5;
  display: flex;
  flex-direction: column;

  &__header {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0 1rem;
    height: 56px;
    background: #fff;
    border-bottom: 1px solid #EEEEE8;
  }

  &__back {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 50%;
    transition: background 0.15s;
    &:hover { background: #F5F5F5; }
  }

  &__header-title {
    font-size: 1rem;
    font-weight: 700;
    color: #1a1a1a;
    flex: 1;
  }

  &__edit {
    display: flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    color: #1a1a1a;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    padding: 6px 10px;
    border-radius: 8px;
    transition: background 0.15s;
    &:hover { background: #F5F5F5; }
  }

  &__loading,
  &__empty {
    padding: 3rem 1rem;
    text-align: center;
    color: #aaa;
    font-size: 0.875rem;
  }

  &__body {
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 480px;
    margin: 0 auto;
    width: 100%;
  }

  &__footer {
    display: flex;
    gap: 8px;
    padding: 16px 0 0;
  }

  &__btn-primary,
  &__btn-danger {
    flex: 1;
    height: 48px;
    border-radius: 12px;
    font-size: 0.9375rem;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.15s, background 0.15s;
  }

  &__btn-primary {
    background: #FFC700;
    color: #1a1a1a;
    border: none;
    &:hover { background: #FFD42A; }
  }

  &__btn-danger {
    background: #fff;
    color: #FF4D4F;
    border: 1px solid #FFD6D6;
    &:hover { background: #FFF5F5; }
  }
}

/* 요약 카드 */
.summary-card {
  background: linear-gradient(135deg, #FFFBEC 0%, #FFF4D4 100%);
  border: 1px solid #FFE99A;
  border-radius: 16px;
  padding: 18px 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__title-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__plan-name {
    flex: 1;
    font-size: 1rem;
    font-weight: 800;
    color: #1a1a1a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__status {
    font-size: 0.6875rem;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 6px;
    flex-shrink: 0;

    &--draft     { color: #888;    background: #F0F0F0; }
    &--active    { color: #F47820; background: #FFF2E8; }
    &--completed { color: #1DB95A; background: #E8F9EF; }
  }

  &__target {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
  }

  &__target-icon { font-size: 1rem; }

  &__target-job {
    font-size: 1rem;
    font-weight: 700;
    color: #1a1a1a;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8125rem;
    color: #555;

    strong { color: #CC9D00; font-weight: 700; }
  }

  &__meta-icon { font-size: 0.875rem; }
}

/* KPI 행 */
.kpi-row {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #EEEEE8;
  border-radius: 12px;
  padding: 14px 0;

  &__cell {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  &__value {
    font-size: 1.25rem;
    font-weight: 800;
    color: #1a1a1a;
    line-height: 1.2;
  }

  &__sub {
    font-size: 0.75rem;
    font-weight: 600;
    color: #aaa;
  }

  &__label {
    font-size: 0.75rem;
    color: #888;
  }

  &__divider {
    width: 1px;
    height: 28px;
    background: #EEEEE8;
  }
}

/* 섹션 공통 */
.section {
  background: #fff;
  border: 1px solid #EEEEE8;
  border-radius: 12px;
  padding: 14px 16px 18px;

  &__title {
    font-size: 0.9375rem;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 12px;
  }

  &__empty {
    padding: 1.5rem 0;
    text-align: center;
    color: #aaa;
    font-size: 0.8125rem;
  }
}

/* 카테고리 분포 */
.cat-dist {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__label {
    width: 64px;
    flex-shrink: 0;
    font-size: 0.75rem;
    font-weight: 700;
  }

  &__bar-bg {
    flex: 1;
    height: 8px;
    background: #F5F5F5;
    border-radius: 4px;
    overflow: hidden;
  }

  &__bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.4s ease;
  }

  &__count {
    width: 24px;
    text-align: right;
    flex-shrink: 0;
    font-size: 0.8125rem;
    font-weight: 700;
    color: #1a1a1a;
  }
}

/* 타임라인 */
.timeline {
  display: flex;
  flex-direction: column;

  &__month {
    display: flex;
    gap: 12px;
  }

  &__month-left {
    width: 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 6px;
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
    background: #FFE99A;
    margin: 4px 0;
  }

  &__month-right {
    flex: 1;
    padding-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__month-badge {
    font-size: 0.8125rem;
    font-weight: 700;
    color: #1a1a1a;
  }

  &__projects {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__project {
    background: #FAFAF8;
    border-left: 3px solid #ccc;
    border-radius: 8px;
    padding: 10px 12px;
    cursor: pointer;
    transition: background 0.15s;

    &:hover { background: #F0F0EC; }
  }

  &__project-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &__project-name {
    font-size: 0.875rem;
    font-weight: 700;
    color: #1a1a1a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__project-cat {
    font-size: 0.625rem;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    flex-shrink: 0;
  }

  &__project-goal {
    font-size: 0.75rem;
    color: #777;
    margin: 4px 0 0;
    line-height: 1.4;
  }
}

/* 루틴 */
.routines {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &__item {
    background: #FFFBEC;
    border: 1px solid #FFE99A;
    border-radius: 8px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__name {
    font-size: 0.875rem;
    font-weight: 700;
    color: #1a1a1a;
  }

  &__meta {
    font-size: 0.75rem;
    color: #777;
  }
}

/* 미배치 칩 */
.unplaced {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  &__chip {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 6px 10px;
    border: 1px solid;
    border-radius: 999px;
    cursor: pointer;
    background: #fff;
    transition: opacity 0.15s;
    &:hover { opacity: 0.7; }
  }
}
</style>

<style lang="scss">
/* 프로젝트 상세 팝업 (Teleport되므로 글로벌) */
.cd-proj-popup {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;

  &__sheet {
    width: 100%;
    max-width: 480px;
    max-height: 85vh;
    background: #fff;
    border-radius: 20px 20px 0 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__handle {
    width: 40px;
    height: 4px;
    background: #ddd;
    border-radius: 2px;
    margin: 10px auto 4px;
    flex-shrink: 0;
  }

  &__header {
    padding: 14px 18px 14px 16px;
    border-left: 4px solid #ccc;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    border-bottom: 1px solid #F0F0F0;
    flex-shrink: 0;
  }

  &__header-left {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__cat {
    align-self: flex-start;
    font-size: 0.6875rem;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 4px;
  }

  &__name {
    font-size: 1rem;
    font-weight: 800;
    color: #1a1a1a;
    margin: 0;
    line-height: 1.3;
  }

  &__goal {
    font-size: 0.8125rem;
    color: #666;
    margin: 0;
    line-height: 1.4;
  }

  &__close {
    flex-shrink: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 50%;
    &:hover { background: #F5F5F5; }
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: 14px 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__empty {
    padding: 2rem 0;
    text-align: center;
    color: #aaa;
    font-size: 0.8125rem;
  }

  &__week {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__week-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__week-badge {
    font-size: 0.6875rem;
    font-weight: 700;
    color: #fff;
    padding: 2px 7px;
    border-radius: 4px;
  }

  &__week-title {
    font-size: 0.8125rem;
    font-weight: 700;
    color: #1a1a1a;
  }

  &__items {
    list-style: none;
    margin: 0;
    padding: 0 0 0 10px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  &__item {
    font-size: 0.75rem;
    color: #555;
    line-height: 1.5;
    padding-left: 10px;
    position: relative;

    &::before {
      content: '•';
      position: absolute;
      left: 0;
      color: #bbb;
    }
  }
}

/* 팝업 트랜지션 */
.cd-popup-enter-active,
.cd-popup-leave-active {
  transition: opacity 0.2s ease;

  .cd-proj-popup__sheet {
    transition: transform 0.25s ease;
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
