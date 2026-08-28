import { describe, it, expect } from 'vitest'
import type { Project, Routine, TimelineSlot, DayOfWeek } from '@/modules/career-design/types/career-design'
import {
  computeFirstWeekRange,
  computeWeekRangeContaining,
  generateItemsForWeek,
  parseDateKey,
  dowOf,
} from '../composables/useWeeklySchedule'

// 주간일정 생성의 회귀 테스트.
//
// 주 경계가 "startDate 부터 7일 블록" → "월~일 달력 주" 로 바뀌면서(2026-08-27)
// 첫 주가 계획 시작 **이전** 날짜를, 마지막 주가 종료 **이후** 날짜를 품게 됐다.
// 그 날짜에 항목이 생기면 안 된다는 게 여기서 지키는 핵심이다.

const d = (s: string) => parseDateKey(s)!

function project(id: string, days: DayOfWeek[], weeks: number): Project {
  return { id, name: id, days, weeks, curriculum: [] } as unknown as Project
}
function routine(id: string, days: DayOfWeek[]): Routine {
  return { id, name: id, days } as unknown as Routine
}

// 2026-08-31(월) 시작. 1주차 = 8.31~9.6, 2주차 = 9.7~9.13 …
const PLAN = {
  startDate: '2026-08-31',
  endDate: '2026-11-08',
  projects: [project('a', ['월', '수'], 3), project('b', ['화'], 2)],
  routines: [routine('r', ['월', '화', '수', '목', '금', '토', '일'])],
}

const TIMELINE: TimelineSlot[] = [
  { week: 1, projects: [PLAN.projects[0]!] },   // a: 1~3주차
  { week: 3, projects: [PLAN.projects[1]!] },   // b: 3~4주차
]

const ids = (items: { itemId: string }[]) => items.map(i => i.itemId).sort()

describe('computeFirstWeekRange — 첫 주는 startDate 가 속한 달력 주', () => {
  it('시작일이 월요일이면 그 날부터', () => {
    expect(computeFirstWeekRange('2026-08-31', '일')).toEqual({
      weekStart: '2026-08-31', weekEnd: '2026-09-06',
    })
  })

  it('시작일이 수요일이면 weekStart 는 이틀 앞선 월요일', () => {
    expect(computeFirstWeekRange('2026-09-02', '일')).toEqual({
      weekStart: '2026-08-31', weekEnd: '2026-09-06',
    })
  })

  it('reviewDay 는 주 경계가 아니다 — 무엇을 넣어도 같은 결과', () => {
    const days: DayOfWeek[] = ['월', '화', '수', '목', '금', '토', '일']
    const results = days.map(r => JSON.stringify(computeFirstWeekRange('2026-09-02', r)))
    expect(new Set(results).size).toBe(1)
  })

  it('잘못된 날짜면 null', () => {
    expect(computeFirstWeekRange('', '일')).toBeNull()
  })
})

describe('computeWeekRangeContaining', () => {
  it('첫 주 이전 날짜는 null', () => {
    expect(computeWeekRangeContaining(d('2026-08-30'), '2026-08-31', '일')).toBeNull()
  })

  it('임의 날짜가 속한 주를 찾는다', () => {
    expect(computeWeekRangeContaining(d('2026-09-10'), '2026-08-31', '일')).toEqual({
      weekStart: '2026-09-07', weekEnd: '2026-09-13',
    })
  })

  it('찾은 주는 항상 7일', () => {
    const r = computeWeekRangeContaining(d('2026-10-15'), '2026-08-31', '일')!
    const days = (d(r.weekEnd).getTime() - d(r.weekStart).getTime()) / 86_400_000 + 1
    expect(days).toBe(7)
  })
})

describe('generateItemsForWeek — 커리큘럼 주차 매핑', () => {
  it('1주차: a 만 진행 (월·수 2건) + 루틴 7일', () => {
    const items = generateItemsForWeek(PLAN, TIMELINE, '2026-08-31', '2026-09-06')
    const projects = items.filter(i => i.itemType === 'project')
    expect(ids(projects)).toEqual(['a', 'a'])
    expect(items.filter(i => i.itemType === 'routine')).toHaveLength(7)
    expect(projects.every(i => i.curriculumWeek === 1)).toBe(true)
  })

  it('3주차: a(커리큘럼 3주차)와 b(커리큘럼 1주차)가 겹쳐 진행', () => {
    // 3주차 = 9.14~9.20
    const items = generateItemsForWeek(PLAN, TIMELINE, '2026-09-14', '2026-09-20')
    const projects = items.filter(i => i.itemType === 'project')
    expect(ids(projects)).toEqual(['a', 'a', 'b'])
    expect(projects.filter(i => i.itemId === 'a').every(i => i.curriculumWeek === 3)).toBe(true)
    expect(projects.find(i => i.itemId === 'b')!.curriculumWeek).toBe(1)
  })

  it('종료된 프로젝트는 빠진다 — 5주차엔 프로젝트 0건, 루틴만', () => {
    // 5주차 = 9.28~10.4. a 는 3주차, b 는 4주차에 끝났다
    const items = generateItemsForWeek(PLAN, TIMELINE, '2026-09-28', '2026-10-04')
    expect(items.filter(i => i.itemType === 'project')).toHaveLength(0)
    expect(items.filter(i => i.itemType === 'routine')).toHaveLength(7)
  })

  it('미배치 프로젝트는 생성되지 않는다', () => {
    const items = generateItemsForWeek(PLAN, [], '2026-08-31', '2026-09-06')
    expect(items.filter(i => i.itemType === 'project')).toHaveLength(0)
  })

  it('계획 시작 이전 주는 빈 배열', () => {
    expect(generateItemsForWeek(PLAN, TIMELINE, '2026-08-24', '2026-08-30')).toEqual([])
  })
})

describe('generateItemsForWeek — 달력 주가 계획 밖 날짜를 품을 때 클램프', () => {
  // 2026-09-02(수) 시작 → 첫 주 weekStart 는 8-31(월). 8-31·9-01 은 계획 시작 전이다.
  const plan = {
    startDate: '2026-09-02',
    endDate: '2026-09-15',
    projects: [project('a', ['월', '화', '수'], 3)],
    routines: [routine('r', ['월', '화', '수', '목', '금', '토', '일'])],
  }
  const timeline: TimelineSlot[] = [{ week: 1, projects: [plan.projects[0]!] }]

  it('첫 주: 계획 시작 전 이틀(월·화)에는 항목이 생기지 않는다', () => {
    const items = generateItemsForWeek(plan, timeline, '2026-08-31', '2026-09-06')
    const dates = [...new Set(items.map(i => i.date))].sort()
    expect(dates[0]).toBe('2026-09-02')
    expect(dates).not.toContain('2026-08-31')
    expect(dates).not.toContain('2026-09-01')
    // 수요일 하루뿐이므로 a 1건 + 루틴 5건(9.2~9.6)
    expect(items.filter(i => i.itemType === 'project')).toHaveLength(1)
    expect(items.filter(i => i.itemType === 'routine')).toHaveLength(5)
  })

  it('마지막 주: 종료일 이후 날짜에는 항목이 생기지 않는다', () => {
    // 3주차 = 9.14~9.20 이지만 계획은 9-15 에 끝난다
    const items = generateItemsForWeek(plan, timeline, '2026-09-14', '2026-09-20')
    const dates = [...new Set(items.map(i => i.date))].sort()
    expect(dates).toEqual(['2026-09-14', '2026-09-15'])
  })

  it('endDate 가 없으면 뒤쪽 클램프는 하지 않는다', () => {
    const noEnd = { ...plan, endDate: undefined }
    const items = generateItemsForWeek(noEnd, timeline, '2026-09-14', '2026-09-20')
    expect([...new Set(items.map(i => i.date))]).toContain('2026-09-20')
  })
})

describe('dowOf — 요일 문자열', () => {
  it('월요일부터 일요일까지', () => {
    expect(dowOf(d('2026-08-31'))).toBe('월')
    expect(dowOf(d('2026-09-06'))).toBe('일')
  })
})
