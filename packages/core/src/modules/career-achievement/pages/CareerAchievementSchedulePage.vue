<template>
  <div class="ws">
    <AppHeader />

    <section class="ws__hero">
      <div class="ws__hero-icon">🗓️</div>
      <div class="ws__hero-body">
        <span class="ws__hero-eyebrow">THIS WEEK</span>
        <h1 class="ws__hero-title">이번 주 일정을<br />조정해 보세요</h1>
        <p class="ws__hero-desc">요일·항목을 자유롭게 다듬어 두면 매일이 한결 가벼워져요.</p>
      </div>
    </section>

    <div v-if="loading" class="ws__loading">불러오는 중...</div>

    <template v-else-if="!draftPlan.planId">
      <div class="ws__empty">
        <span class="ws__empty-icon">📅</span>
        <h2 class="ws__empty-title">진로계획이 없어요</h2>
        <button class="ws__empty-btn" @click="router.push('/career-design')">진로계획 만들기</button>
      </div>
    </template>

    <template v-else-if="currentRange">
      <section class="ws__section">
        <div class="ws__section-head">
          <h2 class="ws__section-title">이번 주 일정</h2>
          <span class="ws__range">{{ fmtRange(currentRange) }}</span>
        </div>
        <p class="ws__hint">
          프로젝트를 추가/제거하거나 다른 요일로 옮길 수 있어요. 루틴은 정해진 요일로 자동 배치돼요. 변경은 자동 저장돼요.
          <span v-if="saving" class="ws__autosave">저장 중...</span>
        </p>

        <div v-if="currentDays.length" class="ws__days">
          <div
            v-for="day in currentDays"
            :key="day.date"
            class="ws__day"
            :class="{ 'ws__day--empty': !day.items.length }"
          >
            <div class="ws__day-head">
              <span class="ws__day-dow">{{ day.dow }}</span>
              <span class="ws__day-date">{{ day.dateLabel }}</span>
              <span v-if="day.items.length" class="ws__day-count">{{ day.items.length }}</span>
              <button class="ws__day-add" @click="openAddSheet(day.date)" type="button">+ 추가</button>
            </div>
            <ul v-if="day.items.length" class="ws__day-items">
              <li
                v-for="it in day.items"
                :key="it.id"
                class="ws__day-item"
                :style="{ '--cat-color': it.color } as any"
              >
                <span
                  class="ws__day-item-cat"
                  :style="{ color: it.color, background: `color-mix(in srgb, ${it.color} 14%, white)` }"
                >{{ it.categoryLabel }}</span>
                <span class="ws__day-item-name">{{ it.name }}</span>
                <span class="ws__day-item-meta">{{ it.duration }}분</span>
                <button
                  class="ws__day-item-remove"
                  @click="removeItem(it.id)"
                  type="button"
                  aria-label="삭제"
                >✕</button>
              </li>
            </ul>
            <p v-else class="ws__day-empty">예정된 프로젝트 없음</p>
          </div>
        </div>
      </section>

      <!-- 시작하기 CTA -->
      <div class="ws__footer">
        <button class="ws__start" type="button" @click="router.push('/career-achievement')">
          오늘의 계획 시작하기
        </button>
      </div>
    </template>

    <!-- 계획은 있으나 이번 주 범위를 못 구한 경우(시작 전 / 데이터 미비) — 빈 화면 방지 -->
    <template v-else>
      <div class="ws__empty">
        <span class="ws__empty-icon">🗓️</span>
        <h2 class="ws__empty-title">
          {{ notStarted ? '아직 시작 전이에요' : '이번 주 일정을 만들 수 없어요' }}
        </h2>
        <p class="ws__empty-text">
          <template v-if="notStarted">
            이 진로계획은 {{ fmtDateLabel(draftPlan.startDate) }}에 시작해요.<br />
            시작일이 되면 이번 주 일정이 자동으로 만들어져요.
          </template>
          <template v-else>
            계획의 시작일 정보가 없어 일정을 만들 수 없어요. 계획을 다시 확인해 주세요.
          </template>
        </p>
        <button class="ws__empty-btn" @click="router.push('/career-achievement')">진로달성으로 가기</button>
      </div>
    </template>

    <!-- 항목 추가 bottom sheet — 프로젝트만 추가 가능 -->
    <Teleport to="body">
      <Transition name="ws-sheet">
        <div v-if="addSheetOpen" class="ws-sheet" @click.self="closeAddSheet">
          <div class="ws-sheet__panel">
            <div class="ws-sheet__handle" />
            <div class="ws-sheet__head">
              <h3 class="ws-sheet__title">{{ addSheetDateLabel }} 에 프로젝트 추가</h3>
              <button class="ws-sheet__close" @click="closeAddSheet" type="button">✕</button>
            </div>
            <div class="ws-sheet__list">
              <button
                v-for="p in draftPlan.projects"
                :key="p.id"
                class="ws-sheet__row"
                @click="addItem(p.id)"
                type="button"
              >
                <span
                  class="ws-sheet__row-dot"
                  :style="{ background: CAT_COLOR[p.category] }"
                />
                <div class="ws-sheet__row-body">
                  <span class="ws-sheet__row-name">{{ p.name }}</span>
                  <span class="ws-sheet__row-meta">{{ CAT_LABEL[p.category] }} · {{ p.duration }}분</span>
                </div>
                <span class="ws-sheet__row-plus">＋</span>
              </button>
              <p v-if="!draftPlan.projects.length" class="ws-sheet__empty">등록된 프로젝트가 없어요.</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/shared/components/AppHeader.vue'
import { useCareerDesign } from '@/modules/career-design/composables/useCareerDesign'
import {
  useWeeklySchedule, computeWeekRangeContaining, parseDateKey, toDateKey,
} from '../composables/useWeeklySchedule'
import type { WeeklySchedule } from '../composables/useWeeklySchedule'
import { useAchievement } from '../composables/useAchievement'
import { getToday } from '@/shared/utils/dev-date'
import type { ProjectCategory, DayOfWeek } from '@/modules/career-design/types/career-design'

const router = useRouter()
const { draftPlan, draftTimeline, fetchMyPlans, loadPlanFromApi } = useCareerDesign()
const { updateSchedule, ensureWeekSchedule } = useWeeklySchedule()
const { isProjectDone, isRoutineDone, toggleProject, toggleRoutine } = useAchievement()

const CAT_COLOR: Record<ProjectCategory, string> = {
  qualification: '#1DB95A',
  knowledge:     '#F47820',
  skill:         '#A855F7',
  portfolio:     '#4480F5',
}
const CAT_LABEL: Record<ProjectCategory, string> = {
  qualification: '자격요건',
  knowledge:     '분야지식',
  skill:         '직무기술',
  portfolio:     '포트폴리오',
}

const loading         = ref(true)
const saving          = ref(false)
const currentSchedule = ref<WeeklySchedule | null>(null)

const addSheetOpen = ref(false)
const addSheetDate = ref('')

// reviewDay 는 주차 계산에 쓰이지 않으므로(=헬퍼에서 무시됨) startDate 만 있으면 계산.
const currentRange = computed<{ weekStart: string; weekEnd: string } | null>(() => {
  if (!draftPlan.startDate) return null
  return computeWeekRangeContaining(getToday(), draftPlan.startDate, (draftPlan.reviewDay || '월') as DayOfWeek)
})

// 계획 시작일이 오늘보다 미래여서 "이번 주"가 아직 없는 경우
const notStarted = computed(() => {
  if (!draftPlan.startDate) return false
  return toDateKey(getToday()) < draftPlan.startDate
})

interface DayCardItem {
  id: string
  itemId: string
  name: string
  duration: number
  categoryLabel: string
  color: string
}
interface DayCard {
  date: string
  dateLabel: string
  dow: string
  items: DayCardItem[]
}

const currentDays = computed<DayCard[]>(() => {
  if (!currentRange.value || !currentSchedule.value) return []
  const sd = parseDateKey(currentRange.value.weekStart)
  const ed = parseDateKey(currentRange.value.weekEnd)
  if (!sd || !ed) return []

  const itemsByDate: Record<string, WeeklySchedule['items']> = {}
  for (const it of currentSchedule.value.items) {
    if (it.itemType !== 'project') continue
    ;(itemsByDate[it.date] ??= []).push(it)
  }

  const DOW = ['일', '월', '화', '수', '목', '금', '토']
  const out: DayCard[] = []
  const cursor = new Date(sd)
  while (cursor.getTime() <= ed.getTime()) {
    const key = toDateKey(cursor)
    const rawItems = itemsByDate[key] ?? []
    const items: DayCardItem[] = []
    for (const it of rawItems) {
      const p = draftPlan.projects.find(x => x.id === it.itemId)
      if (!p) continue
      items.push({
        id:        it.id,
        itemId:    it.itemId,
        name:      p.name,
        duration:  p.duration ?? 0,
        categoryLabel: CAT_LABEL[p.category] ?? '',
        color:     CAT_COLOR[p.category] ?? '#888',
      })
    }
    out.push({
      date: key,
      dateLabel: `${cursor.getMonth() + 1}/${cursor.getDate()}`,
      dow: DOW[cursor.getDay()]!,
      items,
    })
    cursor.setDate(cursor.getDate() + 1)
  }
  return out
})

const addSheetDateLabel = computed(() => addSheetDate.value ? fmtDateLabel(addSheetDate.value) : '')

function openAddSheet(date: string) {
  addSheetDate.value = date
  addSheetOpen.value = true
}
function closeAddSheet() {
  addSheetOpen.value = false
}

function fmtRange(r: { weekStart: string; weekEnd: string }): string {
  return `${fmtDateLabel(r.weekStart)} ~ ${fmtDateLabel(r.weekEnd)}`
}
function fmtDateLabel(s: string): string {
  const d = parseDateKey(s)
  if (!d) return s
  const DOW = ['일', '월', '화', '수', '목', '금', '토']
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${DOW[d.getDay()]})`
}

async function persistItems(newItems: WeeklySchedule['items']) {
  if (!draftPlan.planId || !currentSchedule.value) return
  const planId    = draftPlan.planId
  const weekStart = currentSchedule.value.weekStart
  currentSchedule.value = { ...currentSchedule.value, items: newItems }
  saving.value = true
  try {
    const updated = await updateSchedule(planId, weekStart, { items: newItems })
    if (updated) currentSchedule.value = updated
  } finally {
    saving.value = false
  }
}

function removeItem(itemId: string) {
  if (!currentSchedule.value) return
  // 정합성: localStorage 의 done 마킹도 함께 해제
  const target = currentSchedule.value.items.find(it => it.id === itemId)
  if (target) {
    if (target.itemType === 'project' && isProjectDone(target.itemId, target.date)) {
      toggleProject(target.itemId, target.date)
    } else if (target.itemType === 'routine' && isRoutineDone(target.itemId, target.date)) {
      toggleRoutine(target.itemId, target.date)
    }
  }
  const next = currentSchedule.value.items.filter(it => it.id !== itemId)
  persistItems(next)
}

function addItem(projectId: string) {
  if (!currentSchedule.value || !addSheetDate.value) return
  const newItem = {
    id: crypto.randomUUID(),
    itemType: 'project' as const,
    itemId: projectId,
    date: addSheetDate.value,
    curriculumWeek: null,
    note: '',
  }
  persistItems([...currentSchedule.value.items, newItem])
  closeAddSheet()
}

onMounted(async () => {
  try {
    if (!draftPlan.planId) {
      const plans = await fetchMyPlans()
      const target = plans.find((p: any) => p.status === 'active') ?? plans[0]
      if (target?.planId) await loadPlanFromApi(target.planId)
    }
    if (draftPlan.planId && currentRange.value) {
      currentSchedule.value = await ensureWeekSchedule(
        draftPlan.planId,
        { startDate: draftPlan.startDate, endDate: draftPlan.endDate, projects: draftPlan.projects, routines: draftPlan.routines },
        draftTimeline.value,
        currentRange.value.weekStart,
        currentRange.value.weekEnd,
      )
    }
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss">
.ws {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 32px;

  &__hero {
    margin: 16px 16px 4px;
    padding: 22px;
    border-radius: 22px;
    background: linear-gradient(135deg, #4480F5 0%, #2A60D6 100%);
    color: #fff;
    display: flex;
    align-items: flex-start;
    gap: 14px;
    box-shadow: 0 6px 20px rgba(68, 128, 245, 0.28);
    position: relative;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      right: -36px;
      top: -36px;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.12);
      pointer-events: none;
    }
  }

  &__hero-icon {
    font-size: 28px;
    line-height: 1;
    background: rgba(255, 255, 255, 0.22);
    border-radius: 14px;
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    backdrop-filter: blur(2px);
  }

  &__hero-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    position: relative;
    z-index: 1;
  }

  &__hero-eyebrow {
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 1.4px;
    opacity: 0.9;
    margin-bottom: 2px;
  }

  &__hero-title {
    font-size: 22px;
    font-weight: 900;
    margin: 0;
    letter-spacing: -0.5px;
    line-height: 1.25;
    text-shadow: 0 2px 0 rgba(0, 0, 0, 0.08);
  }

  &__hero-desc {
    margin: 6px 0 0;
    font-size: 12.5px;
    line-height: 1.55;
    opacity: 0.95;
    font-weight: 600;
  }

  &__loading {
    padding: 60px 20px;
    text-align: center;
    color: #aaa;
  }

  &__empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 60px 24px;
    text-align: center;
  }
  &__empty-icon { font-size: 48px; }
  &__empty-title { font-size: 17px; font-weight: 800; color: #222; margin: 4px 0 0; }
  &__empty-btn {
    margin-top: 12px;
    background: #FFC700;
    color: #fff;
    border: none;
    border-radius: 12px;
    padding: 12px 22px;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
  }

  &__section {
    margin: 16px 16px 0;
    background: #fff;
    border-radius: 16px;
    padding: 18px 18px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__section-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
  }

  &__section-title {
    font-size: 16px;
    font-weight: 900;
    color: #222;
    margin: 0;
  }

  &__range {
    font-size: 12px;
    font-weight: 700;
    color: #888;
  }

  &__hint {
    font-size: 12px;
    color: #888;
    margin: -4px 0 2px;
    line-height: 1.5;
  }

  &__autosave {
    margin-left: 6px;
    font-size: 11px;
    font-weight: 700;
    color: #4480F5;
  }

  &__days {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__day {
    border: 1px solid #EEEEE8;
    border-radius: 12px;
    padding: 12px 14px 10px;
    background: #fff;

    &--empty {
      background: #FAFAF7;
      border-style: dashed;
    }
  }

  &__day-head {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 8px;
  }

  &__day-dow {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #EBF2FF;
    color: #2A60D6;
    font-size: 11px;
    font-weight: 900;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__day-date {
    flex: 1;
    font-size: 13px;
    font-weight: 800;
    color: #222;
  }

  &__day-count {
    font-size: 11px;
    font-weight: 800;
    color: #888;
    background: #F0F0F0;
    border-radius: 999px;
    padding: 2px 8px;
  }

  &__day-add {
    flex-shrink: 0;
    background: transparent;
    border: 1px dashed #DDD;
    color: #888;
    font-size: 11px;
    font-weight: 800;
    padding: 4px 10px;
    border-radius: 999px;
    cursor: pointer;
    transition: border-color 0.12s, color 0.12s, background 0.12s;

    &:hover {
      border-color: #4480F5;
      color: #2A60D6;
      background: #EBF2FF;
    }
  }

  &__day-items {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__day-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    background: #FAFAF7;
    border-radius: 8px;
    border-left: 3px solid var(--cat-color, #FFC700);
  }

  &__day-item-cat {
    flex-shrink: 0;
    font-size: 10px;
    font-weight: 800;
    padding: 2px 8px;
    border-radius: 8px;
    letter-spacing: 0.2px;
    white-space: nowrap;
  }

  &__day-item-name {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    font-weight: 700;
    color: #222;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__day-item-meta {
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 600;
    color: #888;
  }

  &__day-item-remove {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: #bbb;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;

    &:hover {
      background: #FFE8E8;
      color: #C5443A;
    }
  }

  &__day-empty {
    font-size: 12px;
    color: #bbb;
    margin: 0;
    text-align: center;
    padding: 4px 0;
  }

  /* 시작하기 CTA */
  &__footer {
    padding: 16px 20px 32px;
  }

  &__start {
    width: 100%;
    padding: 18px;
    background: linear-gradient(135deg, #FFC700 0%, #FFB300 100%);
    color: #fff;
    border: none;
    border-radius: 16px;
    font-size: 17px;
    font-weight: 900;
    letter-spacing: -0.2px;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(255, 199, 0, 0.32);
    transition: transform 0.08s, opacity 0.12s;

    &:active { transform: scale(0.985); opacity: 0.9; }
  }
}

/* 항목 추가 bottom sheet */
.ws-sheet {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  &__panel {
    width: 100%;
    max-width: 480px;
    max-height: 70vh;
    background: #fff;
    border-radius: 22px 22px 0 0;
    padding: 14px 16px 20px;
    box-shadow: 0 -8px 28px rgba(0, 0, 0, 0.18);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__handle {
    width: 44px;
    height: 4px;
    border-radius: 2px;
    background: #DDD;
    align-self: center;
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    font-size: 16px;
    font-weight: 900;
    color: #222;
    margin: 0;
  }

  &__close {
    background: none;
    border: none;
    color: #888;
    font-size: 14px;
    cursor: pointer;
    width: 28px;
    height: 28px;
    border-radius: 50%;

    &:hover { background: #F0F0F0; }
  }

  &__list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-bottom: 4px;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: #FAFAF7;
    border: 1px solid #EEEEE8;
    border-radius: 10px;
    text-align: left;
    cursor: pointer;
    transition: background 0.12s;

    &:hover { background: #EBF2FF; border-color: #B5CEF8; }
  }

  &__row-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__row-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__row-name {
    font-size: 13px;
    font-weight: 800;
    color: #222;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__row-meta {
    font-size: 11px;
    color: #888;
    font-weight: 600;
  }

  &__row-plus {
    font-size: 18px;
    color: #2A60D6;
    font-weight: 900;
    flex-shrink: 0;
  }

  &__empty {
    font-size: 12px;
    color: #aaa;
    text-align: center;
    padding: 20px 0;
    margin: 0;
  }
}

.ws-sheet-enter-active, .ws-sheet-leave-active {
  transition: opacity 0.18s ease;
  .ws-sheet__panel { transition: transform 0.22s cubic-bezier(.2,.8,.2,1); }
}
.ws-sheet-enter-from, .ws-sheet-leave-to {
  opacity: 0;
  .ws-sheet__panel { transform: translateY(40px); }
}
</style>
