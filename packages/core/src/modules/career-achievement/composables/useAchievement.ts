import { ref, computed, watch } from 'vue'
import type { Project, Routine, DayOfWeek, TimelineSlot } from '@/modules/career-design/types/career-design'
import { planWeekCount, weekOfDate, projectIdsActiveOnDate } from '@/modules/career-design/composables/usePlanTimeline'
import { getToday } from '@/shared/utils/dev-date'
import {
  fetchAchievements, upsertAchievement, deleteAchievement,
} from '@/modules/career-achievement/achievement.api'

const STORAGE_KEY = 'lh_achievement_v1'

type DailyCompletion = { projects: string[]; routines: string[] }
type CompletionMap = Record<string, DailyCompletion>   // key: 'YYYY-MM-DD'

function loadFromStorage(): CompletionMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const completion = ref<CompletionMap>(loadFromStorage())

// localStorage 는 오프라인 캐시로 유지 (서버가 source of truth)
watch(completion, (v) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(v)) } catch { /* quota */ }
}, { deep: true })

// 서버 동기화 대상 planId. loadFromServer 호출 시 세팅. null 이면 로컬 전용(레거시).
const activePlanId = ref<string | null>(null)

// 서버 달성 기록 → completion 맵 재구성 (done=true 인 항목만)
async function loadFromServer(planId: string): Promise<void> {
  activePlanId.value = planId
  try {
    const records = await fetchAchievements(planId)
    const next: CompletionMap = {}
    for (const r of records) {
      if (!r.done) continue
      const day = (next[r.date] ??= { projects: [], routines: [] })
      if (r.itemType === 'project') day.projects.push(r.itemId)
      else day.routines.push(r.itemId)
    }
    completion.value = next
  } catch { /* 네트워크 실패 시 로컬 캐시 유지 */ }
}

// 토글 결과를 서버에 반영 (fire-and-forget). done 이면 upsert, 아니면 delete.
function syncToggle(date: string, itemType: 'project' | 'routine', itemId: string, done: boolean) {
  const planId = activePlanId.value
  if (!planId) return
  if (done) {
    upsertAchievement(planId, date, itemType, itemId, { done: true }).catch(() => {})
  } else {
    deleteAchievement(planId, date, itemType, itemId).catch(() => {})
  }
}

// ── 헬퍼 ───────────────────────────────────────────
const DOW: DayOfWeek[] = ['일', '월', '화', '수', '목', '금', '토']

function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function getDayOfWeek(d: Date): DayOfWeek {
  return DOW[d.getDay()]!
}

// 날짜가 계획 기간(startDate~endDate) 안인가. 월 단위가 아니라 날짜 단위로 본다.
function isDateInRange(date: Date, startDate: string, endDate: string): boolean {
  const key = toDateKey(date)
  if (startDate && key < startDate) return false
  if (endDate && key > endDate) return false
  return true
}

export function useAchievement() {
  // ── 오늘 (dev date reactive) ──────────────────────
  const today = computed(() => getToday())
  const todayKey = computed(() => toDateKey(today.value))
  const todayDow = computed(() => getDayOfWeek(today.value))

  // ── 이번 주 (월~일) ───────────────────────────────
  const weekDates = computed<Date[]>(() => {
    const t = today.value
    const day = t.getDay()                           // 0(일) ~ 6(토)
    const monOffset = day === 0 ? -6 : 1 - day       // 월요일까지의 오프셋
    const mon = new Date(t)
    mon.setDate(t.getDate() + monOffset)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mon)
      d.setDate(mon.getDate() + i)
      return d
    })
  })

  // ── 오늘 해당하는 routine/project 필터링 ──────────
  function todayRoutines(routines: Routine[]): Routine[] {
    return routines.filter(r => r.days.includes(todayDow.value))
  }

  function todayProjects(
    projects: Project[],
    timeline: TimelineSlot[],
    startDate: string,
    endDate: string,
  ): Project[] {
    if (!isDateInRange(today.value, startDate, endDate)) return []
    const activeIds = projectIdsActiveOnDate(timeline, startDate, today.value, projects)
    return projects.filter(p => activeIds.has(p.id) && p.days.includes(todayDow.value))
  }

  // 임의 날짜에 매칭되는 프로젝트 (todayProjects 일반화)
  function dateProjects(
    date: Date,
    projects: Project[],
    timeline: TimelineSlot[],
    startDate: string,
    endDate: string,
  ): Project[] {
    if (!isDateInRange(date, startDate, endDate)) return []
    const activeIds = projectIdsActiveOnDate(timeline, startDate, date, projects)
    const dow = getDayOfWeek(date)
    return projects.filter(p => activeIds.has(p.id) && p.days.includes(dow))
  }

  // ── 완료 상태 조회/토글 ───────────────────────────
  function getDay(dateKey: string): DailyCompletion {
    return completion.value[dateKey] ?? { projects: [], routines: [] }
  }

  function isProjectDone(projectId: string, dateKey?: string): boolean {
    return getDay(dateKey ?? todayKey.value).projects.includes(projectId)
  }

  function isRoutineDone(routineId: string, dateKey?: string): boolean {
    return getDay(dateKey ?? todayKey.value).routines.includes(routineId)
  }

  function toggleProject(projectId: string, dateKey?: string) {
    const key = dateKey ?? todayKey.value
    const day = getDay(key)
    const idx = day.projects.indexOf(projectId)
    const nowDone = idx < 0
    if (idx >= 0) day.projects.splice(idx, 1)
    else day.projects.push(projectId)
    completion.value = { ...completion.value, [key]: { ...day } }
    syncToggle(key, 'project', projectId, nowDone)
  }

  function toggleRoutine(routineId: string, dateKey?: string) {
    const key = dateKey ?? todayKey.value
    const day = getDay(key)
    const idx = day.routines.indexOf(routineId)
    const nowDone = idx < 0
    if (idx >= 0) day.routines.splice(idx, 1)
    else day.routines.push(routineId)
    completion.value = { ...completion.value, [key]: { ...day } }
    syncToggle(key, 'routine', routineId, nowDone)
  }

  // ── 일별 예정/완료 수 ─────────────────────────────
  function plannedCount(
    date: Date,
    projects: Project[],
    routines: Routine[],
    timeline: TimelineSlot[],
    startDate: string,
    endDate: string,
  ): number {
    const dow = getDayOfWeek(date)
    let count = routines.filter(r => r.days.includes(dow)).length
    if (isDateInRange(date, startDate, endDate)) {
      const activeIds = projectIdsActiveOnDate(timeline, startDate, date, projects)
      count += projects.filter(p => activeIds.has(p.id) && p.days.includes(dow)).length
    }
    return count
  }

  function doneCount(date: Date): number {
    const day = getDay(toDateKey(date))
    return day.projects.length + day.routines.length
  }

  // ── 타임라인 주차 진행도 (오늘이 몇 주차 / 전체 몇 주차) ─
  function monthProgress(
    _timeline: TimelineSlot[],
    startDate = '',
    endDate = '',
  ): { current: number; total: number; monthLabel: string } | null {
    const total = planWeekCount(startDate, endDate)
    if (!total) return null
    const cur = weekOfDate(startDate, today.value)
    if (cur === null || cur > total) return null
    return { current: cur, total, monthLabel: `${cur}주차` }
  }

  // ── 이번 주 진행률 ────────────────────────────────
  function weekProgress(
    projects: Project[],
    routines: Routine[],
    timeline: TimelineSlot[],
    startDate: string,
    endDate: string,
  ) {
    let planned = 0
    let done = 0
    for (const d of weekDates.value) {
      planned += plannedCount(d, projects, routines, timeline, startDate, endDate)
      done    += doneCount(d)
    }
    return { planned, done, percent: planned ? Math.round(done / planned * 100) : 0 }
  }

  return {
    today,
    todayKey,
    todayDow,
    weekDates,
    todayRoutines,
    todayProjects,
    dateProjects,
    isProjectDone,
    isRoutineDone,
    toggleProject,
    toggleRoutine,
    plannedCount,
    doneCount,
    weekProgress,
    monthProgress,
    toDateKey,
    getDayOfWeek,
    loadFromServer,
  }
}
