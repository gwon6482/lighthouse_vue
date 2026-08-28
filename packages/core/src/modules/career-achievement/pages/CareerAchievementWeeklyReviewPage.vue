<template>
  <div class="wr">
    <AppHeader />

<section class="wr__hero">
      <div class="wr__hero-icon">📝</div>
      <div class="wr__hero-body">
        <span class="wr__hero-eyebrow">WEEKLY REVIEW</span>
        <h1 class="wr__hero-title">지난 한 주를<br />돌아봐요</h1>
        <p class="wr__hero-desc">계획대로 흘러가지 않아도 괜찮아요 — 매주 다시 다듬어 나가요.</p>
      </div>
    </section>

    <div v-if="loading" class="wr__loading">불러오는 중...</div>

    <template v-else-if="!draftPlan.planId">
      <div class="wr__empty">
        <span class="wr__empty-icon">📅</span>
        <h2 class="wr__empty-title">진로계획이 없어요</h2>
        <p class="wr__empty-text">먼저 진로계획을 만들어 주세요.</p>
        <button class="wr__empty-btn" @click="router.push('/career-design')">진로계획 만들기</button>
      </div>
    </template>

    <template v-else>
      <!-- 지난 주 회고 — 첫 주이면 안내 카드만 -->
      <section v-if="prevRange" class="wr__section">
        <div class="wr__section-head">
          <h2 class="wr__section-title">지난 주 회고</h2>
          <span class="wr__range">{{ fmtRange(prevRange) }}</span>
        </div>

        <div class="wr__metrics">
          <div class="wr__metric">
            <span class="wr__metric-icon">🎯</span>
            <span class="wr__metric-label">루틴 달성</span>
            <span class="wr__metric-value">
              <strong>{{ summary.routineDone }}</strong>
              <span class="wr__metric-slash">/ {{ summary.routinePlanned }}</span>
            </span>
            <span class="wr__metric-pct">{{ pct(summary.routineDone, summary.routinePlanned) }}%</span>
          </div>
          <div class="wr__metric">
            <span class="wr__metric-icon">✅</span>
            <span class="wr__metric-label">프로젝트 완료</span>
            <span class="wr__metric-value">
              <strong>{{ summary.projectDone }}</strong>
              <span class="wr__metric-slash">/ {{ summary.projectPlanned }}</span>
            </span>
            <span class="wr__metric-pct">{{ pct(summary.projectDone, summary.projectPlanned) }}%</span>
          </div>
        </div>

        <!-- 자동 이월된 프로젝트 (지난 주 미완료 → 이번 주 같은 요일) -->
        <div v-if="missedProjects.length" class="wr__missed-proj">
          <div class="wr__missed-proj-head">
            <span class="wr__missed-proj-label">
              지난 주 미완료
              <strong>{{ missedProjects.length }}</strong>건 — 이번 주로 이월
            </span>
          </div>
          <p class="wr__missed-proj-hint">
            놓친 항목은 자동으로 이번 주 같은 요일에 다시 잡아뒀어요. 빼고 싶다면 아래 "이번 주 일정" 에서 ✕ 로 제거해 주세요.
          </p>
          <ul class="wr__missed-proj-list">
            <li
              v-for="m in missedProjects"
              :key="m.scheduleItemId"
              class="wr__missed-proj-row"
              :class="{ 'wr__missed-proj-row--dropped': !isCarriedOver(m) }"
              :style="{ '--cat-color': m.color } as any"
            >
              <span
                class="wr__missed-proj-cat"
                :style="{ color: m.color, background: `color-mix(in srgb, ${m.color} 14%, white)` }"
              >{{ m.categoryLabel }}</span>
              <div class="wr__missed-proj-body">
                <span class="wr__missed-proj-name">{{ m.name }}</span>
                <span class="wr__missed-proj-flow">
                  <span class="wr__missed-proj-orig">{{ m.origLabel }}</span>
                  <span class="wr__missed-proj-arrow">→</span>
                  <span class="wr__missed-proj-target">{{ m.targetLabel }}</span>
                </span>
              </div>
              <span v-if="isCarriedOver(m)" class="wr__missed-proj-done">✓ 이월됨</span>
              <span v-else class="wr__missed-proj-dropped">이번 주에서 제외</span>
            </li>
          </ul>
        </div>

        <div v-if="missedRoutineNames.length" class="wr__missed">
          <span class="wr__missed-label">놓친 루틴</span>
          <div class="wr__missed-chips">
            <span v-for="name in missedRoutineNames" :key="name" class="wr__missed-chip">{{ name }}</span>
          </div>
        </div>

        <label class="wr__label">
          한 주 회고
          <span class="wr__label-hint">잘 된 점 · 아쉬운 점 · 다음 주 다짐</span>
        </label>
        <textarea
          v-model="reviewNote"
          class="wr__note"
          rows="6"
          maxlength="2000"
          placeholder="이번 한 주는 어땠나요? 다음 주에 어떻게 가져갈까요?"
        />
        <div class="wr__counter">{{ reviewNote.length }} / 2000</div>

        <button class="wr__save" :disabled="saving" @click="saveReview" type="button">
          {{ saving ? '저장 중...' : (prevSchedule?.status === 'reviewed' ? '회고 업데이트' : '회고 저장') }}
        </button>
        <p v-if="prevSchedule?.reviewedAt" class="wr__reviewed-at">
          마지막 저장: {{ fmtTimestamp(prevSchedule.reviewedAt) }}
        </p>
      </section>

      <!-- 마무리 CTA: 이번 주 일정 조정 페이지로 이동 -->
      <div class="wr__footer">
        <button class="wr__start" type="button" @click="goToSchedule">
          이번 주 일정 조정하기 →
        </button>
      </div>

    </template>

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
const { fetchScheduleByWeek, updateSchedule, ensureWeekSchedule } = useWeeklySchedule()
const { isProjectDone, isRoutineDone, toggleProject, toggleRoutine } = useAchievement()

// 'next' target 은 더 이상 사용 안 함 — 모든 편집/이월은 currentSchedule 로
// 시그니처는 호환 위해 유지 (호출처에서 'current' 만 사용)
type EditTarget = 'current'

const loading        = ref(true)
const saving         = ref(false)
const currentSaving  = ref(false)
const prevSchedule   = ref<WeeklySchedule | null>(null)
const currentSchedule = ref<WeeklySchedule | null>(null)
const reviewNote     = ref('')

// 항목 추가 bottom sheet — 프로젝트만 (루틴은 days 자동 배치, 주간 조정 불필요)
const addSheetOpen   = ref(false)
const addSheetDate   = ref('')

const addSheetDateLabel = computed(() => addSheetDate.value ? fmtDateLabel(addSheetDate.value) : '')

function openAddSheet(date: string, _target: EditTarget = 'current') {
  addSheetDate.value = date
  addSheetOpen.value = true
}
function closeAddSheet() {
  addSheetOpen.value = false
}

// schedule 의 items 를 변경하고 즉시 BE 동기화 (autosave) — currentSchedule 전용
async function persistItems(_target: EditTarget, newItems: WeeklySchedule['items']) {
  const sched = currentSchedule
  if (!draftPlan.planId || !sched.value) return
  const planId = draftPlan.planId
  const weekStart = sched.value.weekStart
  sched.value = { ...sched.value, items: newItems }
  currentSaving.value = true
  try {
    const updated = await updateSchedule(planId, weekStart, { items: newItems })
    if (updated) sched.value = updated
  } finally {
    currentSaving.value = false
  }
}

function removeItem(itemId: string, _target: EditTarget = 'current') {
  const sched = currentSchedule
  if (!sched.value) return

  // 정합성 (Gap 3): localStorage 의 done 마킹이 남아있으면 함께 해제
  // — 같은 itemId 가 나중에 다시 추가될 때 stale "완료" 로 보이지 않도록
  const target_it = sched.value.items.find(it => it.id === itemId)
  if (target_it) {
    if (target_it.itemType === 'project' && isProjectDone(target_it.itemId, target_it.date)) {
      toggleProject(target_it.itemId, target_it.date)
    } else if (target_it.itemType === 'routine' && isRoutineDone(target_it.itemId, target_it.date)) {
      toggleRoutine(target_it.itemId, target_it.date)
    }
  }

  const next = sched.value.items.filter(it => it.id !== itemId)
  persistItems('current', next)
}

// 프로젝트만 추가 (루틴은 마스터 days 로 자동 배치, 주간 조정 불필요)
function addItem(projectId: string) {
  const sched = currentSchedule
  if (!sched.value || !addSheetDate.value) return
  const newItem = {
    id: crypto.randomUUID(),
    itemType: 'project' as const,
    itemId: projectId,
    date: addSheetDate.value,
    curriculumWeek: null,
    note: '',
  }
  const next = [...sched.value.items, newItem]
  persistItems('current', next)
  closeAddSheet()
}

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

// 첫 진입(회고할 직전 주가 없는 상태) — hero / 섹션 카피를 setup 모드로 전환
const isFirstSetup = computed(() => draftPlan.planId !== null && !prevRange.value)

// 오늘 기준 "직전 주" 범위 계산. 현재 주가 첫 주(직전 주가 plan.startDate 이전)면 null.
const prevRange = computed<{ weekStart: string; weekEnd: string } | null>(() => {
  if (!draftPlan.startDate) return null
  const cur = computeWeekRangeContaining(getToday(), draftPlan.startDate, (draftPlan.reviewDay || '월') as DayOfWeek)
  if (!cur) return null
  const curStart = parseDateKey(cur.weekStart)
  const planStart = parseDateKey(draftPlan.startDate)
  if (!curStart || !planStart) return null

  const prevEnd = new Date(curStart)
  prevEnd.setDate(prevEnd.getDate() - 1)
  if (prevEnd.getTime() < planStart.getTime()) return null

  const prevStart = new Date(prevEnd)
  prevStart.setDate(prevStart.getDate() - 6)
  if (prevStart.getTime() < planStart.getTime()) {
    prevStart.setTime(planStart.getTime())
  }
  return { weekStart: toDateKey(prevStart), weekEnd: toDateKey(prevEnd) }
})

// 지난 주 schedule.items 기반 자동 요약
const summary = computed(() => {
  let rp = 0, rd = 0, pp = 0, pd = 0
  const items = prevSchedule.value?.items ?? []
  for (const it of items) {
    if (it.itemType === 'routine') {
      rp++
      if (isRoutineDone(it.itemId, it.date)) rd++
    } else {
      pp++
      if (isProjectDone(it.itemId, it.date)) pd++
    }
  }
  return { routinePlanned: rp, routineDone: rd, projectPlanned: pp, projectDone: pd }
})

// 이번 주 범위 (첫 주 일정 편집용)
const currentRange = computed<{ weekStart: string; weekEnd: string } | null>(() => {
  if (!draftPlan.startDate) return null
  return computeWeekRangeContaining(getToday(), draftPlan.startDate, (draftPlan.reviewDay || '월') as DayOfWeek)
})

// 요일별 카드 데이터 (project 만 — 루틴은 days 로 자동 배치, 주간 조정 UI 에 노출 안 함)
interface DayCardItem {
  id: string
  itemType: 'project'
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

function buildDayCards(
  range: { weekStart: string; weekEnd: string } | null,
  schedule: WeeklySchedule | null,
): DayCard[] {
  if (!range || !schedule) return []
  const sd = parseDateKey(range.weekStart)
  const ed = parseDateKey(range.weekEnd)
  if (!sd || !ed) return []

  const itemsByDate: Record<string, WeeklySchedule['items']> = {}
  for (const it of schedule.items) {
    if (it.itemType !== 'project') continue   // 루틴은 주간 조정 UI 미노출
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
        id: it.id,
        itemType: 'project',
        itemId: it.itemId,
        name: p.name,
        duration: p.duration ?? 0,
        categoryLabel: CAT_LABEL[p.category] ?? '',
        color: CAT_COLOR[p.category] ?? '#888',
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
}

const currentDays = computed<DayCard[]>(() => buildDayCards(currentRange.value, currentSchedule.value))

// 지난 주 놓친 프로젝트 항목 — 같은 요일로 다음 주로 이월 가능
interface MissedProject {
  scheduleItemId: string       // prevSchedule.items[].id (원본 식별)
  itemId: string               // master Project.id
  origDate: string             // 지난 주 원래 날짜
  origLabel: string            // '5/26 (월)'
  targetDate: string           // 다음 주 같은 요일 날짜
  targetLabel: string          // '6/2 (월)'
  name: string
  categoryLabel: string
  color: string
}

const missedProjects = computed<MissedProject[]>(() => {
  if (!prevSchedule.value || !currentRange.value) return []

  const out: MissedProject[] = []
  for (const it of prevSchedule.value.items) {
    if (it.itemType !== 'project') continue
    if (isProjectDone(it.itemId, it.date)) continue
    const p = draftPlan.projects.find(x => x.id === it.itemId)
    if (!p) continue
    const od = parseDateKey(it.date)
    if (!od) continue

    // 같은 요일의 다음 주 날짜 = od + 7 일
    const td = new Date(od)
    td.setDate(td.getDate() + 7)
    const targetDate = toDateKey(td)

    out.push({
      scheduleItemId: it.id,
      itemId: it.itemId,
      origDate:    it.date,
      origLabel:   fmtDateLabel(it.date),
      targetDate,
      targetLabel: fmtDateLabel(targetDate),
      name:        p.name,
      categoryLabel: CAT_LABEL[p.category] ?? '',
      color:         CAT_COLOR[p.category] ?? '#888',
    })
  }
  return out
})

// 이번 주 schedule 에 이미 동일 (itemId, targetDate) 가 있는지 — 이월 완료 여부 판단
function isCarriedOver(m: MissedProject): boolean {
  const items = currentSchedule.value?.items ?? []
  return items.some(it =>
    it.itemType === 'project' &&
    it.itemId === m.itemId &&
    it.date === m.targetDate
  )
}

const remainingMissedCount = computed(() =>
  missedProjects.value.filter(m => !isCarriedOver(m)).length,
)

// 자동 이월은 onMounted 에서 일괄 처리.
// 별도 카르오버 트리거 함수는 더 이상 노출하지 않음 (사용자는 '이번 주 일정' 에서 ✕ 로 제외만 가능).

// 놓친 루틴 이름 목록 (중복 제거)
const missedRoutineNames = computed<string[]>(() => {
  const items = prevSchedule.value?.items ?? []
  const set = new Set<string>()
  for (const it of items) {
    if (it.itemType !== 'routine') continue
    if (isRoutineDone(it.itemId, it.date)) continue
    const r = draftPlan.routines.find(x => x.id === it.itemId)
    if (r) set.add(r.name)
  }
  return Array.from(set)
})

function pct(done: number, planned: number): number {
  if (planned <= 0) return 100
  return Math.round((done / planned) * 100)
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
function fmtTimestamp(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}.${m}.${dd} ${hh}:${mm}`
}

async function saveReview() {
  if (!draftPlan.planId || !prevRange.value) return
  saving.value = true
  try {
    const updated = await updateSchedule(draftPlan.planId, prevRange.value.weekStart, {
      reviewNote: reviewNote.value.trim(),
      status:     'reviewed',
    })
    if (updated) prevSchedule.value = updated
  } finally {
    saving.value = false
  }
}

function goToSchedule() {
  router.push('/career-achievement/weekly-schedule')
}

onMounted(async () => {
  try {
    if (!draftPlan.planId) {
      const plans = await fetchMyPlans()
      const target = plans.find((p: any) => p.status === 'active') ?? plans[0]
      if (target?.planId) await loadPlanFromApi(target.planId)
    }

    // 첫 진입(직전 주 없음)이면 회고할 게 없음 → 이번 주 일정 페이지로 바로 이동
    if (draftPlan.planId && !prevRange.value) {
      router.replace('/career-achievement/weekly-schedule')
      return
    }

    if (draftPlan.planId && prevRange.value) {
      const s = await fetchScheduleByWeek(draftPlan.planId, prevRange.value.weekStart)
      prevSchedule.value = s
      if (s) reviewNote.value = s.reviewNote ?? ''
    }
    // 이번 주 schedule — 자동 이월 대상으로 로드
    if (draftPlan.planId && currentRange.value) {
      currentSchedule.value = await ensureWeekSchedule(
        draftPlan.planId,
        { startDate: draftPlan.startDate, endDate: draftPlan.endDate, projects: draftPlan.projects, routines: draftPlan.routines },
        draftTimeline.value,
        currentRange.value.weekStart,
        currentRange.value.weekEnd,
      )
    }
    // 자동 이월: 지난 주에 놓친 프로젝트를 같은 요일로 이번 주에 자동 추가
    // — isCarriedOver 중복 체크로 idempotent (재진입 시 안전)
    if (prevSchedule.value && currentSchedule.value && draftPlan.planId) {
      const toAdd: WeeklySchedule['items'] = []
      for (const m of missedProjects.value) {
        if (isCarriedOver(m)) continue
        toAdd.push({
          id: crypto.randomUUID(),
          itemType: 'project',
          itemId: m.itemId,
          date: m.targetDate,
          curriculumWeek: null,
          note: '',
        })
      }
      if (toAdd.length > 0) {
        await persistItems('current', [...currentSchedule.value.items, ...toAdd])
      }
    }
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss">
.wr {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 32px;

  &__hero {
    margin: 16px 16px 4px;
    padding: 22px 22px 22px;
    border-radius: 22px;
    background: linear-gradient(135deg, #FFC700 0%, #FFB300 100%);
    color: #fff;
    display: flex;
    align-items: flex-start;
    gap: 14px;
    box-shadow: 0 6px 20px rgba(255, 199, 0, 0.28);
    position: relative;
    overflow: hidden;

    /* 우측 상단 장식 원 */
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
    box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.06);
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
    opacity: 0.85;
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

  /* 첫 주 안내 카드 */
  &__section--info {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background: #FFFBEC;
    border: 1px solid #FFE99A;
  }

  &__info-icon { font-size: 22px; line-height: 1; padding-top: 2px; }
  &__info-body { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  &__info-title { font-size: 14px; font-weight: 800; color: #B07800; margin: 0; }
  &__info-text  { font-size: 12.5px; color: #888; margin: 0; line-height: 1.5; }

  /* 마무리 CTA */
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
  &__empty-text  { font-size: 13px; color: #888; margin: 0; }
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

  &__section--placeholder {
    background: #FAFAF7;
    border: 1px dashed #E5E5DD;
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

  /* 메트릭 카드 row */
  &__metrics {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 2px;
  }

  &__metric {
    background: #FFFBEC;
    border: 1px solid #FFE99A;
    border-radius: 14px;
    padding: 14px 14px 12px;
    display: grid;
    grid-template-columns: 28px 1fr;
    grid-template-rows: auto auto;
    column-gap: 10px;
    row-gap: 2px;
  }

  &__metric-icon {
    grid-row: 1 / 3;
    align-self: center;
    font-size: 22px;
    text-align: center;
  }

  &__metric-label {
    font-size: 12px;
    font-weight: 700;
    color: #666;
    letter-spacing: 0.2px;
  }

  &__metric-value {
    font-size: 13px;
    font-weight: 700;
    color: #444;
    display: flex;
    align-items: baseline;
    gap: 3px;

    strong {
      font-size: 20px;
      font-weight: 900;
      color: #222;
      letter-spacing: -0.5px;
    }
  }
  &__metric-slash { color: #aaa; font-weight: 700; font-size: 13px; }

  &__metric-pct {
    grid-column: 1 / 3;
    text-align: right;
    margin-top: 2px;
    font-size: 11px;
    font-weight: 800;
    color: #B07800;
  }

  /* 놓친 루틴 chips */
  &__missed {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px 12px;
    background: #FFF5F5;
    border: 1px solid #FFD8D8;
    border-radius: 10px;
  }

  &__missed-label {
    font-size: 11px;
    font-weight: 800;
    color: #C5443A;
  }

  &__missed-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  &__missed-chip {
    font-size: 11px;
    font-weight: 700;
    color: #C5443A;
    background: #fff;
    border: 1px solid #FFCCC8;
    padding: 3px 8px;
    border-radius: 999px;
  }

  /* 놓친 프로젝트 — 이월 가능 */
  &__missed-proj {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 12px 12px;
    background: #FFF7EE;
    border: 1px solid #FFE0BD;
    border-radius: 12px;
  }

  &__missed-proj-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &__missed-proj-label {
    font-size: 12px;
    font-weight: 700;
    color: #B05D00;

    strong {
      font-size: 14px;
      font-weight: 900;
      color: #B05D00;
      margin: 0 1px;
    }
  }

  &__missed-proj-sub {
    margin-left: 4px;
    font-size: 11px;
    color: #aa8a55;
    font-weight: 600;
  }

  &__missed-proj-hint {
    font-size: 11.5px;
    color: #B05D00;
    line-height: 1.5;
    margin: -2px 0 0;
  }

  &__missed-proj-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__missed-proj-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    background: #fff;
    border-radius: 8px;
    border-left: 3px solid var(--cat-color, #FFC700);

    /* 사용자가 이번 주에서 ✕ 로 뺀 상태 */
    &--dropped {
      opacity: 0.5;
      background: #FAFAF7;

      .wr__missed-proj-name {
        text-decoration: line-through;
        color: #aaa;
      }
    }
  }

  &__missed-proj-cat {
    flex-shrink: 0;
    font-size: 10px;
    font-weight: 800;
    padding: 2px 8px;
    border-radius: 8px;
    white-space: nowrap;
  }

  &__missed-proj-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__missed-proj-name {
    font-size: 13px;
    font-weight: 800;
    color: #222;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__missed-proj-flow {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    color: #888;
  }

  &__missed-proj-orig { text-decoration: line-through; color: #aaa; }
  &__missed-proj-arrow { color: #B05D00; font-weight: 800; }
  &__missed-proj-target { color: #B05D00; font-weight: 800; }

  &__missed-proj-done {
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 800;
    color: #1DB95A;
    padding: 6px 12px;
  }

  &__missed-proj-dropped {
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 800;
    color: #aaa;
    padding: 6px 12px;
  }

  &__label {
    font-size: 13px;
    font-weight: 800;
    color: #222;
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-top: 2px;
  }
  &__label-hint {
    font-size: 11px;
    font-weight: 600;
    color: #aaa;
  }

  &__note {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #eee;
    border-radius: 10px;
    padding: 12px;
    font-size: 14px;
    line-height: 1.55;
    resize: vertical;
    font-family: inherit;
    background: #fafafa;
    color: #222;

    &:focus {
      outline: none;
      border-color: #FFC700;
      background: #fff;
    }
  }

  &__counter {
    text-align: right;
    font-size: 11px;
    color: #aaa;
    margin-top: -6px;
  }

  &__save {
    margin-top: 4px;
    background: #FFC700;
    border: none;
    border-radius: 14px;
    padding: 14px;
    font-size: 15px;
    font-weight: 800;
    color: #fff;
    cursor: pointer;
    transition: opacity 0.12s;

    &:active { opacity: 0.85; }

    &:disabled {
      background: #e8e8e8;
      color: #aaa;
      cursor: not-allowed;
    }
  }

  &__reviewed-at {
    text-align: right;
    font-size: 11px;
    color: #888;
    margin: -2px 2px 0;
  }

  &__placeholder-text {
    font-size: 13px;
    color: #888;
    margin: 0;
  }

  /* ── 다음 주 일정 ───────────────────── */
  &__next-hint {
    font-size: 12px;
    color: #888;
    margin: -4px 0 2px;
    line-height: 1.5;
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
    background: #FFF5E0;
    color: #B07800;
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

    &--routine {
      border-left-color: #FFD84D;
    }
  }

  &__day-item-cat {
    flex-shrink: 0;
    font-size: 10px;
    font-weight: 800;
    padding: 2px 8px;
    border-radius: 8px;
    letter-spacing: 0.2px;
    white-space: nowrap;

    &--routine {
      color: #B07800;
      background: #FFFBEC;
    }
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

  &__day-empty {
    font-size: 12px;
    color: #bbb;
    margin: 0;
    text-align: center;
    padding: 4px 0;
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
      border-color: #FFC700;
      color: #B07800;
      background: #FFFBEC;
    }
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

  &__autosave {
    margin-left: 6px;
    font-size: 11px;
    font-weight: 700;
    color: #B07800;
  }
}

/* ── 항목 추가 bottom sheet (Teleport 대상이라 scoped 외부) ────────── */
.wr-sheet {
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

  &__tabs {
    display: flex;
    gap: 6px;
    padding: 2px 0 4px;
  }

  &__tab {
    flex: 1;
    background: #FAFAF7;
    border: 1px solid #EEEEE8;
    border-radius: 10px;
    padding: 8px;
    font-size: 12px;
    font-weight: 800;
    color: #888;
    cursor: pointer;

    &--active {
      background: #FFFBEC;
      border-color: #FFE99A;
      color: #B07800;
    }
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

    &:hover { background: #FFFBEC; border-color: #FFE99A; }
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
    color: #B07800;
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

.wr-sheet-enter-active, .wr-sheet-leave-active {
  transition: opacity 0.18s ease;
  .wr-sheet__panel { transition: transform 0.22s cubic-bezier(.2,.8,.2,1); }
}
.wr-sheet-enter-from, .wr-sheet-leave-to {
  opacity: 0;
  .wr-sheet__panel { transform: translateY(40px); }
}
</style>
