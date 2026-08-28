<template>
  <div class="cd-complete">
    <CdYellowHeader title="나의 진로계획" :subtitle="draftPlan.name || '내 진로계획'" back-to="/career-design/plan/projects" />

    <div class="cd-complete__body">
      <!-- 계획 요약 -->
      <div class="cd-complete__summary">
        <div class="cd-complete__summary-row">
          <span class="cd-complete__target">🎯 {{ draftPlan.targetJob || '목표 직업 미설정' }}</span>
          <span class="cd-complete__period">{{ periodLabel }}</span>
        </div>
      </div>

      <!-- 프로젝트 풀 -->
      <div class="cd-complete__section">
        <div class="cd-complete__section-header">
          <h3 class="cd-complete__section-title">프로젝트</h3>
          <span class="cd-complete__section-count">총 {{ draftPlan.projects.length }}개</span>
        </div>

        <!-- 카테고리 탭 -->
        <div class="cd-complete__tabs">
          <button
            v-for="cat in categories"
            :key="cat.value"
            class="cd-complete__tab"
            :class="{
              'cd-complete__tab--active': activeTab === cat.value,
              'cd-complete__tab--done': isCategoryDone[cat.value],
            }"
            :style="activeTab === cat.value
              ? { color: categoryColorMap[cat.value], borderBottomColor: categoryColorMap[cat.value] }
              : {}"
            @click="activeTab = cat.value"
          >
            {{ cat.label }}
            <span
              v-if="isCategoryDone[cat.value]"
              class="cd-complete__tab-done"
              :style="{ background: categoryColorMap[cat.value] }"
            >✓</span>
            <span
              v-else
              class="cd-complete__tab-count"
              :style="activeTab === cat.value ? { background: categoryColorMap[cat.value] } : {}"
            >{{ projectsByCategory[cat.value].length }}</span>
          </button>
        </div>

        <!-- 프로젝트 칩 -->
        <div class="cd-complete__pool">
          <p v-if="!poolProjects.length" class="cd-complete__pool-empty">
            이 카테고리에 프로젝트가 없어요
          </p>
          <div
            v-for="project in poolProjects"
            :key="project.id"
            class="cd-complete__pool-chip"
            :class="{
              'cd-complete__pool-chip--placed': isPlaced(project.id),
              'cd-complete__pool-chip--selected': selectedProject?.id === project.id,
            }"
            :style="chipStyle(project)"
            @click="selectProject(project)"
          >
            {{ project.name }}
          </div>
        </div>

        <p class="cd-complete__hint">
          {{ hintText }}
        </p>
      </div>

      <!-- 타임라인 드롭존 -->
      <div class="cd-complete__section">
        <div class="cd-complete__section-header">
          <h3 class="cd-complete__section-title">타임라인</h3>
          <span class="cd-complete__section-count">{{ placedCount }}개 배치됨</span>
        </div>

        <div v-if="!draftPlan.startDate" class="cd-complete__timeline-empty">
          진로계획 세우기에서 목표 기간을 먼저 설정해주세요
        </div>

        <template v-else-if="!totalWeeks">
          <div class="cd-complete__timeline-empty">
            목표 기간이 올바르지 않아요. 시작일과 목표일을 다시 확인해주세요
          </div>
        </template>

        <template v-else>
          <!-- 시작/종료 범위 -->
          <div class="cd-complete__tl-range">
            <div class="cd-complete__tl-range-item">
              <span class="cd-complete__tl-dot cd-complete__tl-dot--start" />
              <span class="cd-complete__tl-range-label">{{ monthWeekLabel(draftPlan.startDate, 1) }}</span>
            </div>
            <div class="cd-complete__tl-range-bar" />
            <div class="cd-complete__tl-range-item">
              <span class="cd-complete__tl-range-label">{{ monthWeekLabel(draftPlan.startDate, totalWeeks) }} · 총 {{ totalWeeks }}주</span>
              <span class="cd-complete__tl-dot cd-complete__tl-dot--end" />
            </div>
          </div>

          <div class="cd-complete__weeks">
            <template v-for="w in weekRows" :key="w.week">
            <div v-if="w.monthHeader" class="cd-complete__month-sep">{{ w.monthHeader }}</div>
            <div
              class="cd-complete__week"
              :class="{
                'cd-complete__week--target': !!selectedProject && w.canPlace,
                'cd-complete__week--blocked': !!selectedProject && !w.canPlace,
              }"
              @click="placeAtWeek(w.week)"
            >
              <div class="cd-complete__week-head">
                <span class="cd-complete__week-num">{{ w.label }}</span>
                <span class="cd-complete__week-date">{{ w.dateLabel }}</span>
              </div>

              <div class="cd-complete__week-body">
                <p v-if="!w.bars.length" class="cd-complete__week-empty">
                  {{ selectedProject
                    ? (w.canPlace ? '탭해서 여기부터 시작' : '기간이 모자라요')
                    : '비어 있음' }}
                </p>

                <div
                  v-for="bar in w.bars"
                  :key="bar.project.id"
                  class="cd-complete__bar"
                  :class="[`cd-complete__bar--${bar.pos}`]"
                  :style="barStyle(bar)"
                  @click.stop="openProjectPopup(bar.project)"
                >
                  <div class="cd-complete__bar-main">
                    <span class="cd-complete__bar-name">{{ bar.project.name }}</span>
                    <span v-if="bar.pos === 'start' || bar.pos === 'only'" class="cd-complete__bar-span">
                      {{ projectWeeks(bar.project) }}주
                    </span>
                    <button
                      v-if="bar.pos === 'start' || bar.pos === 'only'"
                      class="cd-complete__bar-del"
                      @click.stop="removeProject(bar.project.id)"
                    >✕</button>
                  </div>

                  <!-- 그 주차의 커리큘럼 — 사용자가 채웠을 때만 -->
                  <div v-if="bar.detail" class="cd-complete__bar-detail">
                    <span class="cd-complete__bar-wk">{{ bar.curriculumWeek }}주차</span>
                    <span class="cd-complete__bar-text">{{ bar.detail.text }}</span>
                  </div>
                </div>
              </div>
            </div>
            </template>
          </div>
        </template>
      </div>
    </div>

    <!-- 프로젝트 상세 팝업 -->
    <Teleport to="body">
      <Transition name="cd-popup">
        <div v-if="popupProject" class="cd-proj-popup" @click.self="closeProjectPopup">
          <div class="cd-proj-popup__sheet">
            <div class="cd-proj-popup__handle" />

            <div
              class="cd-proj-popup__header"
              :style="{ borderLeftColor: categoryColorMap[popupProject.category] }"
            >
              <div class="cd-proj-popup__header-left">
                <span
                  class="cd-proj-popup__cat"
                  :style="{ color: categoryColorMap[popupProject.category], background: `color-mix(in srgb, ${categoryColorMap[popupProject.category]} 10%, white)` }"
                >{{ categoryLabel(popupProject.category) }}</span>
                <h2 class="cd-proj-popup__name">{{ popupProject.name }}</h2>
                <p v-if="popupProject.goal" class="cd-proj-popup__goal">{{ popupProject.goal }}</p>
              </div>
              <button class="cd-proj-popup__close" @click="closeProjectPopup">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5l10 10" stroke="#888" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </button>
            </div>

            <div class="cd-proj-popup__body">
              <div v-if="!popupProject.curriculum?.length" class="cd-proj-popup__empty">
                등록된 주차별 계획이 없습니다
              </div>
              <div
                v-for="week in popupProject.curriculum"
                :key="week.week"
                class="cd-proj-popup__week"
              >
                <div class="cd-proj-popup__week-header">
                  <span
                    class="cd-proj-popup__week-badge"
                    :style="{ background: categoryColorMap[popupProject.category] }"
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
    <div class="cd-complete__footer">
      <button class="cd-complete__btn-secondary" @click="goPrev">이전으로</button>
      <button class="cd-complete__btn-primary" @click="goNext">다음으로</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCareerDesign } from '../composables/useCareerDesign'
import { weekDescriptionOf } from '../composables/useProjectCurriculum'
import CdYellowHeader from '../components/CdYellowHeader.vue'
import type { Project, ProjectCategory } from '../types/career-design'
import {
  planWeekCount, weekRangeLabel, projectWeeks, projectEndWeek, fitsInPlan,
  weekDateRange, monthWeekOf, monthWeekLabel, weeksInMonth, parseDateKey, resolveProject,
} from '../composables/usePlanTimeline'

const router = useRouter()
const { draftPlan, draftTimeline, syncTimeline } = useCareerDesign()

function goPrev() {
  router.push('/career-design/plan/projects')
}

async function goNext() {
  await syncTimeline()
  router.push('/career-design/plan/routines')
}

// ── 카테고리 ──────────────────────────────────────
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

// ── 프로젝트 풀 ───────────────────────────────────
const activeTab = ref<ProjectCategory>('knowledge')

const projectsByCategory = computed(() => {
  const map = {} as Record<ProjectCategory, Project[]>
  categories.forEach(c => { map[c.value] = [] })
  draftPlan.projects.forEach(p => map[p.category]?.push(p))
  return map
})

const poolProjects = computed(() => projectsByCategory.value[activeTab.value])

function chipStyle(project: Project) {
  const color = categoryColorMap[project.category]
  if (isPlaced(project.id)) {
    return { borderColor: '#ddd', color: '#bbb', background: '#fafafa' }
  }
  return {
    borderColor: color,
    color,
    background: `color-mix(in srgb, ${color} 8%, white)`,
  }
}

// ── 주차 타임라인 ─────────────────────────────────
// 슬롯은 시작주만 들고, 점유 구간은 project.weeks 에서 파생한다.
const totalWeeks = computed(() => planWeekCount(draftPlan.startDate, draftPlan.endDate))

type BarPos = 'only' | 'start' | 'middle' | 'end'
interface WeekRow {
  week: number
  label: string          // "8월 1주차"
  dateLabel: string      // "8.3 ~ 8.9"
  monthHeader: string    // 달이 바뀌는 첫 행에만 "8월 (5주)" — 아니면 ''
  bars: WeekBar[]
  canPlace: boolean
}

interface BarDetail { text: string }
interface WeekBar {
  project: Project
  pos: BarPos
  curriculumWeek: number
  detail: BarDetail | null   // 사용자가 그 주차 설명을 채웠을 때만
}

// 그 주차의 설명. 기본 제목("프로젝트명 - n주차")은 바로 옆 프로젝트명과 겹쳐 정보가 없으므로
// 제목은 쓰지 않고, 사용자가 직접 적은 설명 텍스트만 보여준다.
// (구 데이터는 items 를 줄바꿈으로 합쳐 설명처럼 취급 — weekDescriptionOf 참조)
function barDetailOf(project: Project, curriculumWeek: number): BarDetail | null {
  const text = weekDescriptionOf(project.curriculum?.[curriculumWeek - 1]).replace(/\s*\n\s*/g, ' · ')
  return text ? { text } : null
}

const weekRows = computed<WeekRow[]>(() => {
  const rows: WeekRow[] = []
  const sel = selectedProject.value
  let prevMonth = -1
  for (let week = 1; week <= totalWeeks.value; week++) {
    const bars: WeekBar[] = []
    for (const slot of draftTimeline.value) {
      for (const raw of slot.projects) {
        const p = resolveProject(raw, draftPlan.projects)
        const endWeek = projectEndWeek(slot.week, p)
        if (week < slot.week || week > endWeek) continue
        const isStart = week === slot.week
        const isEnd   = week === endWeek
        const curriculumWeek = week - slot.week + 1
        bars.push({
          project: p,
          pos: isStart && isEnd ? 'only' : isStart ? 'start' : isEnd ? 'end' : 'middle',
          curriculumWeek,
          detail: barDetailOf(p, curriculumWeek),
        })
      }
    }
    // 주는 월요일이 속한 달에 귀속된다 → 달이 바뀌는 첫 행에만 월 헤더를 붙인다.
    const range = weekDateRange(draftPlan.startDate, week)
    const mw = range ? monthWeekOf(parseDateKey(range.start)!) : null
    const isNewMonth = !!mw && mw.month !== prevMonth
    if (mw) prevMonth = mw.month

    rows.push({
      week,
      label: mw ? `${mw.month}월 ${mw.week}주차` : `${week}주차`,
      dateLabel: weekRangeLabel(draftPlan.startDate, week),
      monthHeader: isNewMonth && mw ? `${mw.month}월 · ${weeksInMonth(mw.year, mw.month)}주` : '',
      bars,
      canPlace: !!sel && fitsInPlan(week, sel, totalWeeks.value),
    })
  }
  return rows
})

// ── 배치 상태 ─────────────────────────────────────
const placedProjectIds = computed(() =>
  new Set(draftTimeline.value.flatMap(s => s.projects.map(p => p.id)))
)
const isPlaced = (id: string) => placedProjectIds.value.has(id)
const placedCount = computed(() => placedProjectIds.value.size)

const isCategoryDone = computed(() => {
  const result: Partial<Record<ProjectCategory, boolean>> = {}
  for (const cat of categories) {
    const projects = projectsByCategory.value[cat.value]
    result[cat.value] = projects.length > 0 && projects.every(p => isPlaced(p.id))
  }
  return result
})

// ── 요약 정보 ─────────────────────────────────────
const periodLabel = computed(() => {
  const { startDate, endDate } = draftPlan
  if (!startDate) return ''
  const fmt = (d: string) => { const [y, m] = d.split('-'); return `${y}.${m}` }
  return endDate ? `${fmt(startDate)} ~ ${fmt(endDate)}` : fmt(startDate)
})

// ── 선택 → 추가 ───────────────────────────────────
const selectedProject = ref<Project | null>(null)

function selectProject(project: Project) {
  selectedProject.value = selectedProject.value?.id === project.id ? null : project
}

const hintText = computed(() => {
  const sel = selectedProject.value
  if (!sel) return '칩을 탭해서 선택하세요'
  const n = projectWeeks(sel)
  return `"${sel.name}"(${n}주) 선택됨 — 시작할 주차를 탭하세요`
})

// ── 프로젝트 상세 팝업 ────────────────────────────
const popupProject = ref<Project | null>(null)
const openProjectPopup  = (p: Project) => { popupProject.value = p }
const closeProjectPopup = () => { popupProject.value = null }

function placeAtWeek(week: number) {
  const project = selectedProject.value
  if (!project) return
  // 계획 기간을 넘어가면 배치하지 않는다(막고 안내).
  if (!fitsInPlan(week, project, totalWeeks.value)) return

  // 이미 배치돼 있으면 옮기는 것 — 기존 시작주에서 뺀다.
  removeProject(project.id)

  let slot = draftTimeline.value.find(s => s.week === week)
  if (!slot) {
    slot = { week, projects: [] }
    draftTimeline.value.push(slot)
    draftTimeline.value.sort((a, b) => a.week - b.week)
  }
  slot.projects.push(project)
  selectedProject.value = null
}

function removeProject(projectId: string) {
  for (const slot of draftTimeline.value) {
    const idx = slot.projects.findIndex(p => p.id === projectId)
    if (idx >= 0) slot.projects.splice(idx, 1)
  }
  draftTimeline.value = draftTimeline.value.filter(s => s.projects.length > 0)
}

function barStyle(bar: WeekBar) {
  const color = categoryColorMap[bar.project.category]
  return {
    background: `color-mix(in srgb, ${color} 12%, white)`,
    borderLeftColor: color,
    color,
  }
}
</script>

<style lang="scss">
.cd-complete {
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

  /* 요약 */
  &__summary {
    background: #fff;
    border-radius: 16px;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &__target {
    font-size: 15px;
    font-weight: 700;
    color: #222;
  }

  &__period {
    font-size: 12px;
    color: #aaa;
    white-space: nowrap;
  }

  /* 공통 섹션 */
  &__section {
    background: #fff;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__section-title {
    font-size: 15px;
    font-weight: 700;
    color: #222;
  }

  &__section-count {
    font-size: 12px;
    color: #aaa;
  }

  /* 카테고리 탭 */
  &__tabs {
    display: flex;
    border-bottom: 1.5px solid #eee;
    gap: 4px;
  }

  &__tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 8px 4px;
    background: none;
    border: none;
    border-bottom: 2.5px solid transparent;
    font-size: 12px;
    font-weight: 500;
    color: #aaa;
    cursor: pointer;
    transition: all 0.15s;
    margin-bottom: -1.5px;

    &--active { font-weight: 700; color: #222; }
    &--done { color: #555; font-weight: 600; }
  }

  &__tab-done {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 16px;
    height: 16px;
    border-radius: 8px;
    padding: 0 4px;
    font-size: 10px;
    font-weight: 700;
    color: #fff;
  }

  &__tab-count {
    background: #eee;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: 10px;
    line-height: 1.4;
    transition: background 0.15s;
  }

  /* 프로젝트 풀 */
  &__pool {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 8px;
    min-height: 44px;
  }

  &__pool-empty {
    font-size: 13px;
    color: #ccc;
    padding: 10px 0;
  }

  &__pool-chip {
    border: 1.5px solid;
    border-radius: 20px;
    padding: 6px 14px;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    transition: opacity 0.15s, transform 0.1s, box-shadow 0.15s;

    &:active { opacity: 0.75; }

    &--selected {
      border-width: 2.5px;
      font-weight: 700;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: currentColor;
        opacity: 0.18;
        pointer-events: none;
      }
    }
  }

  &__hint {
    font-size: 12px;
    color: #bbb;
    text-align: center;
    margin-top: -4px;
  }

  /* 날짜 범위 바 */
  &__tl-range {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__tl-range-item {
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }

  &__tl-range-label {
    font-size: 12px;
    font-weight: 600;
    color: #555;
  }

  &__tl-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;

    &--start { background: #FFC700; }
    &--end   { background: #ccc; }
  }

  &__tl-range-bar {
    flex: 1;
    height: 2px;
    background: linear-gradient(to right, #FFC700, #ddd);
    border-radius: 2px;
  }

  /* 타임라인 */
  &__timeline-empty {
    font-size: 13px;
    color: #ccc;
    text-align: center;
    padding: 20px 0;
  }

  /* 주차 타임라인 */
  &__month-sep {
    font-size: 13px;
    font-weight: 700;
    color: #999;
    padding: 10px 2px 2px;
    border-top: 1px solid #f0f0f0;

    &:first-child { border-top: none; padding-top: 0; }
  }

  &__weeks {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__week {
    border: 1.5px solid #f0f0f0;
    border-radius: 12px;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: border-color 0.15s, background 0.15s, opacity 0.15s;

    &--target {
      border-color: #FFC700;
      background: #FFFDF3;
      cursor: pointer;
    }

    &--blocked {
      opacity: 0.45;
      cursor: not-allowed;
    }
  }

  &__week-head {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  &__week-num {
    font-size: 13px;
    font-weight: 700;
    color: #333;
    white-space: nowrap;
  }

  &__week-date {
    font-size: 11px;
    color: #bbb;
  }

  &__week-body {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  &__week-empty {
    font-size: 12px;
    color: #ccc;
    padding: 2px 0;
  }

  /* 프로젝트 점유 바 — 시작/중간/끝에 따라 모서리를 달리해 구간처럼 보이게 */
  &__bar {
    display: flex;
    flex-direction: column;
    gap: 4px;
    border-left: 3px solid;
    padding: 8px 10px;
    font-size: 13px;
    cursor: pointer;

    &--only   { border-radius: 8px; }
    &--start  { border-radius: 8px 8px 0 0; }
    &--middle { border-radius: 0; }
    &--end    { border-radius: 0 0 8px 8px; }

    /* 이어지는 주차는 이름을 흐리게 — 시작 주차가 어디인지 눈에 띄게 */
    &--middle .cd-complete__bar-name,
    &--end .cd-complete__bar-name { opacity: 0.55; }
  }

  &__bar-main {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* 그 주차 커리큘럼 — 프로젝트명 아래 한 줄 */
  &__bar-detail {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
  }

  &__bar-wk {
    font-weight: 700;
    opacity: 0.7;
    white-space: nowrap;
  }

  &__bar-text {
    flex: 1;
    min-width: 0;
    color: #555;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__bar-items {
    font-weight: 600;
    opacity: 0.6;
    white-space: nowrap;
  }

  &__bar-name {
    flex: 1;
    min-width: 0;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__bar-span {
    font-size: 11px;
    font-weight: 700;
    opacity: 0.75;
    white-space: nowrap;
  }

  &__bar-del {
    background: none;
    border: none;
    font-size: 12px;
    color: #ccc;
    cursor: pointer;
    padding: 0 2px;
    flex-shrink: 0;

    &:hover { color: #FF5555; }
  }

  /* 하단 버튼 */
  &__footer {
    padding: 16px 20px 32px;
    display: flex;
    gap: 10px;
  }

  &__btn-secondary {
    flex: 1;
    padding: 18px;
    background: #fff;
    border: 1.5px solid #ddd;
    border-radius: 16px;
    font-size: 15px;
    font-weight: 700;
    color: #666;
    cursor: pointer;

    &:active { opacity: 0.85; }
  }

  &__btn-primary {
    flex: 2;
    padding: 18px;
    background: #FFC700;
    border: none;
    border-radius: 16px;
    font-size: 17px;
    font-weight: 700;
    color: #fff;
    cursor: pointer;

    &:active { opacity: 0.85; }

    &:disabled {
      background: #e8e8e8;
      color: #aaa;
      cursor: not-allowed;
    }
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

/* CompletePage 슬롯 아이템 클릭 가능 표시 */
.cd-complete__slot-item {
  cursor: pointer;
  transition: background 0.12s;

  &:hover { background: #fafafa; }
}
</style>
