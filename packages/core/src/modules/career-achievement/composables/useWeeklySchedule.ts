import { ref } from 'vue'
import { req } from '@/shared/api'
import type {
  Project, Routine, DayOfWeek, TimelineSlot,
} from '@/modules/career-design/types/career-design'
import { weekOfDate, projectsActiveInWeek, mondayOf } from '@/modules/career-design/composables/usePlanTimeline'

// 한 주의 확정된 일정 1건. BE WeeklySchedule.items 의 1요소.
export interface WeeklyScheduleItem {
  id: string
  itemType: 'project' | 'routine'
  itemId: string
  date: string                  // 'YYYY-MM-DD'
  curriculumWeek?: number | null
  note?: string
}

// 한 주의 확정된 일정 전체. planId + weekStart 로 식별.
export interface WeeklySchedule {
  scheduleId: string
  planId: string
  weekStart: string             // 'YYYY-MM-DD'
  weekEnd:   string             // 'YYYY-MM-DD'
  items: WeeklyScheduleItem[]
  reviewedAt: string | null
  reviewNote: string
  status: 'pending' | 'reviewed'
  createdAt?: string
  updatedAt?: string
}

// 모듈 단위 캐시 — 컴포저블이 여러 컴포넌트에서 사용돼도 같은 ref 공유
const schedules = ref<WeeklySchedule[]>([])

// ── 날짜 / 주차 헬퍼 ─────────────────────────────────
const DOW_ARR: DayOfWeek[] = ['일', '월', '화', '수', '목', '금', '토']

export function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

export function parseDateKey(s: string): Date | null {
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (!m) return null
  const dt = new Date(+m[1]!, +m[2]! - 1, +m[3]!)
  dt.setHours(0, 0, 0, 0)
  return dt
}

export function dowOf(d: Date): DayOfWeek {
  return DOW_ARR[d.getDay()]!
}

// 진로계획 첫 주 [weekStart, weekEnd] — startDate 가 속한 **달력 주(월~일)**.
// 2026-08-27 부터 타임라인과 같은 규칙을 쓴다(그 전에는 startDate 부터 7일 블록이었다).
// 시작일이 수요일이면 weekStart 는 그 주 월요일이라 startDate 보다 이틀 앞선다 —
// 그 이틀은 계획 시작 전이므로 generateItemsForWeek 이 항목을 만들지 않는다.
// reviewDay 는 boundary 가 아니라 "그 주의 리뷰를 하는 요일" annotation (signature 는 호환 유지).
export function computeFirstWeekRange(
  startDate: string, _reviewDay: DayOfWeek,
): { weekStart: string; weekEnd: string } | null {
  const sd = parseDateKey(startDate)
  if (!sd) return null
  const ws = mondayOf(sd)
  const we = new Date(ws); we.setDate(we.getDate() + 6)
  return { weekStart: toDateKey(ws), weekEnd: toDateKey(we) }
}

// 임의 날짜 date 가 속한 주의 [weekStart, weekEnd] 계산.
// 첫 주부터 forward 로 이동하며 date 가 weekEnd 이내에 들어올 때까지 진행.
// date < startDate 면 null (계획 시작 전).
export function computeWeekRangeContaining(
  date: Date, startDate: string, reviewDay: DayOfWeek,
): { weekStart: string; weekEnd: string } | null {
  const first = computeFirstWeekRange(startDate, reviewDay)
  if (!first) return null
  const dateKey = toDateKey(date)
  if (dateKey < first.weekStart) return null

  let weekStart = first.weekStart
  let weekEnd   = first.weekEnd
  // 안전 가드 — 무한루프 방지 (10년치)
  for (let i = 0; i < 600; i++) {
    if (dateKey <= weekEnd) return { weekStart, weekEnd }
    const ed = parseDateKey(weekEnd)
    if (!ed) return null
    const ns = new Date(ed); ns.setDate(ns.getDate() + 1)
    const ne = new Date(ns); ne.setDate(ne.getDate() + 6)
    weekStart = toDateKey(ns)
    weekEnd   = toDateKey(ne)
  }
  return null
}

// 어떤 주(weekStart~weekEnd) 안의 어떤 날짜에 어떤 프로젝트/루틴이 잡힐지 디폴트 생성.
// 마스터 데이터의 Project.days / Routine.days / timeline 을 그대로 곱해서 만든다.
// Phase 4 의 주간리뷰 단계에서 사용자가 자유롭게 수정 가능.
export function generateItemsForWeek(
  plan: { startDate: string; endDate?: string; projects: Project[]; routines: Routine[] },
  timeline: TimelineSlot[],
  weekStart: string,
  weekEnd: string,
): WeeklyScheduleItem[] {
  const out: WeeklyScheduleItem[] = []
  const sd = parseDateKey(weekStart)
  const ed = parseDateKey(weekEnd)
  if (!sd || !ed) return out

  // 이 주가 계획의 몇 주차인지. 타임라인이 주차 기준이므로 이게 기준점이다.
  const planWeek = weekOfDate(plan.startDate, sd)
  if (planWeek === null) return out

  // 프로젝트 id → 타임라인 시작 주차
  const startWeekOf = new Map<string, number>()
  for (const slot of timeline) {
    for (const p of slot.projects) {
      const prev = startWeekOf.get(p.id)
      if (prev === undefined || slot.week < prev) startWeekOf.set(p.id, slot.week)
    }
  }

  // 이번 주에 진행 중인 프로젝트만 후보 (시작주 ~ 시작주+기간-1)
  const activeIds = new Set(projectsActiveInWeek(timeline, planWeek, plan.projects).map(p => p.id))

  const cursor = new Date(sd)
  while (cursor.getTime() <= ed.getTime()) {
    const dow     = dowOf(cursor)
    const dateKey = toDateKey(cursor)

    // 달력 주는 계획 시작 전·종료 후 날짜를 품을 수 있다(첫 주/마지막 주). 그 날은 건너뛴다.
    if ((plan.startDate && dateKey < plan.startDate) || (plan.endDate && dateKey > plan.endDate)) {
      cursor.setDate(cursor.getDate() + 1)
      continue
    }

    for (const p of plan.projects) {
      if (!activeIds.has(p.id)) continue
      if (!p.days?.includes(dow)) continue

      // 커리큘럼 n주차 = 계획주차 - 프로젝트 시작주차 + 1.
      // 주차 모델에서는 배치 자체가 주 단위라 나눗셈 없이 바로 떨어진다.
      const startWeek = startWeekOf.get(p.id)
      const curriculumWeek = startWeek === undefined ? null : planWeek - startWeek + 1

      out.push({
        id: crypto.randomUUID(),
        itemType: 'project',
        itemId: p.id,
        date: dateKey,
        curriculumWeek,
      })
    }

    for (const r of plan.routines) {
      if (!r.days?.includes(dow)) continue
      out.push({
        id: crypto.randomUUID(),
        itemType: 'routine',
        itemId: r.id,
        date: dateKey,
      })
    }

    cursor.setDate(cursor.getDate() + 1)
  }
  return out
}

export function useWeeklySchedule() {
  // 그 plan 의 모든 주간 일정 목록 (weekStart desc)
  async function fetchSchedules(planId: string): Promise<WeeklySchedule[]> {
    try {
      const res = await req.get(`/api/career-plan/${planId}/weekly-schedule`)
      schedules.value = res.data.schedules ?? []
      return schedules.value
    } catch {
      return []
    }
  }

  // 특정 주 1건 조회. 없으면 null
  async function fetchScheduleByWeek(planId: string, weekStart: string): Promise<WeeklySchedule | null> {
    try {
      const res = await req.get(`/api/career-plan/${planId}/weekly-schedule/${weekStart}`)
      return res.data.schedule ?? null
    } catch {
      return null
    }
  }

  // 그 주의 일정 신규 생성. 이미 있으면 BE 가 409 와 함께 기존 schedule 을 반환 → 그걸 그대로 반환
  async function createSchedule(
    planId: string,
    weekStart: string,
    weekEnd: string,
    items: WeeklyScheduleItem[] = []
  ): Promise<WeeklySchedule | null> {
    try {
      const res = await req.post(`/api/career-plan/${planId}/weekly-schedule`, {
        weekStart, weekEnd, items
      })
      return res.data.schedule
    } catch (err: any) {
      if (err?.response?.status === 409 && err?.response?.data?.schedule) {
        return err.response.data.schedule
      }
      return null
    }
  }

  // 부분 업데이트 (items / weekEnd / reviewNote / status)
  async function updateSchedule(
    planId: string,
    weekStart: string,
    body: Partial<Pick<WeeklySchedule, 'weekEnd' | 'items' | 'reviewNote' | 'status'>>
  ): Promise<WeeklySchedule | null> {
    try {
      const res = await req.put(`/api/career-plan/${planId}/weekly-schedule/${weekStart}`, body)
      return res.data.schedule
    } catch {
      return null
    }
  }

  async function deleteSchedule(planId: string, weekStart: string): Promise<boolean> {
    try {
      await req.delete(`/api/career-plan/${planId}/weekly-schedule/${weekStart}`)
      return true
    } catch {
      return false
    }
  }

  // ── 헬퍼: weekStart 부터 weekEnd 까지의 날짜별 items 분류 (UI 렌더링 편의) ──
  function itemsByDate(schedule: WeeklySchedule | null): Record<string, WeeklyScheduleItem[]> {
    const map: Record<string, WeeklyScheduleItem[]> = {}
    if (!schedule) return map
    for (const it of schedule.items) {
      ;(map[it.date] ??= []).push(it)
    }
    return map
  }

  // 임의 주의 schedule 이 없으면 디폴트로 자동 생성 (있으면 그대로 반환). idempotent.
  async function ensureWeekSchedule(
    planId: string,
    plan: { startDate: string; endDate?: string; projects: Project[]; routines: Routine[] },
    timeline: TimelineSlot[],
    weekStart: string,
    weekEnd: string,
  ): Promise<WeeklySchedule | null> {
    const existing = await fetchScheduleByWeek(planId, weekStart)
    if (existing) return existing
    const items = generateItemsForWeek(
      { startDate: plan.startDate, endDate: plan.endDate, projects: plan.projects, routines: plan.routines },
      timeline,
      weekStart,
      weekEnd,
    )
    return await createSchedule(planId, weekStart, weekEnd, items)
  }

  // 첫 주 schedule 자동 생성 (진로계획 완성 직후 Result 페이지에서 호출).
  async function ensureFirstWeekSchedule(
    planId: string,
    plan: { startDate: string; endDate?: string; reviewDay: DayOfWeek | ''; projects: Project[]; routines: Routine[] },
    timeline: TimelineSlot[],
  ): Promise<WeeklySchedule | null> {
    if (!plan.startDate || !plan.reviewDay) return null
    const range = computeFirstWeekRange(plan.startDate, plan.reviewDay)
    if (!range) return null
    return ensureWeekSchedule(planId, plan, timeline, range.weekStart, range.weekEnd)
  }

  return {
    schedules,
    fetchSchedules,
    fetchScheduleByWeek,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    itemsByDate,
    ensureWeekSchedule,
    ensureFirstWeekSchedule,
  }
}
