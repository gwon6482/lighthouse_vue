import { describe, it, expect } from 'vitest'
import type { Project, TimelineSlot } from '../types/career-design'
import {
  mondayOf,
  weeksInMonth,
  monthWeekOf,
  planWeekCount,
  weekDateRange,
  weekOfDate,
  monthWeekLabel,
  weekRangeLabel,
  projectWeeks,
  projectEndWeek,
  fitsInPlan,
  resolveProject,
  projectsActiveInWeek,
  projectIdsActiveOnDate,
  projectStartWeek,
  projectWeekIndexOn,
  parseDateKey,
  toDateKey,
} from '../composables/usePlanTimeline'
import { MONTH_WEEKS, MONTH_WEEKS_START_YEAR, MONTH_WEEKS_END_YEAR } from '../data/month-weeks'

// 진로계획 타임라인 주차 규칙의 회귀 테스트.
//
// 이 규칙은 2026-08-27 에 "startDate 부터 7일 블록" → "월~일 달력 주" 로 한 번 갈아엎었고,
// 그때 통과시킨 테스트가 레포에 남지 않아 배포(2026-08-28) 때 재실행이 불가했다.
// 여기서 다시 못박는다. 규칙의 핵심 명제는 두 개다:
//   1. 한 달의 주차 수 = 그 달의 월요일 개수 (항상 4 또는 5)
//   2. 모든 주가 정확히 7일 ⇒ "n주 프로젝트 = n×7일" 이 배치 위치와 무관하게 성립

const d = (s: string) => parseDateKey(s)!

function proj(id: string, weeks: number, extra: Partial<Project> = {}): Project {
  return { id, name: id, weeks, curriculum: [], days: [], ...extra } as Project
}

describe('mondayOf — 주의 시작은 월요일', () => {
  it('월요일은 자기 자신', () => {
    expect(toDateKey(mondayOf(d('2026-08-03')))).toBe('2026-08-03')
  })

  it('일요일은 그 주 월요일로 되감긴다 (일요일이 주의 끝)', () => {
    // 2026-08-02 은 일요일 → 그 주 월요일은 7월 27일
    expect(toDateKey(mondayOf(d('2026-08-02')))).toBe('2026-07-27')
  })

  it('주 중간 아무 날이나 같은 월요일로 모인다', () => {
    for (const day of ['2026-08-03', '2026-08-05', '2026-08-09']) {
      expect(toDateKey(mondayOf(d(day)))).toBe('2026-08-03')
    }
  })
})

describe('weeksInMonth — 테이블 vs 실제 월요일 개수', () => {
  // 테이블(data/month-weeks.ts)은 생성기 산출물이다. 값이 실제와 어긋나면
  // 화면의 "8월 5주차" 같은 라벨이 통째로 틀어지므로 전수 대조한다.
  it(`${MONTH_WEEKS_START_YEAR}~${MONTH_WEEKS_END_YEAR} 전수 일치 + 항상 4 또는 5`, () => {
    let months = 0
    let five = 0
    const mismatches: string[] = []

    for (let y = MONTH_WEEKS_START_YEAR; y <= MONTH_WEEKS_END_YEAR; y++) {
      for (let m = 1; m <= 12; m++) {
        // 독립 계산 — 테이블을 보지 않고 그 달의 월요일을 직접 센다
        const lastDay = new Date(y, m, 0).getDate()
        let actual = 0
        for (let day = 1; day <= lastDay; day++) {
          if (new Date(y, m - 1, day).getDay() === 1) actual++
        }
        months++
        if (actual === 5) five++
        if (actual !== 4 && actual !== 5) mismatches.push(`${y}-${m} 주차수 ${actual}`)
        if (weeksInMonth(y, m) !== actual) {
          mismatches.push(`${y}-${m} 테이블 ${weeksInMonth(y, m)} ≠ 실제 ${actual}`)
        }
      }
    }

    expect(mismatches).toEqual([])
    expect(months).toBe(888)
    expect(five).toBe(309)
  })

  it('테이블 범위 밖(2100년 이후)은 즉석 계산으로 fallback', () => {
    expect(MONTH_WEEKS[2100]).toBeUndefined()
    // 2100-01: 1월 4일이 첫 월요일 → 4, 11, 18, 25 = 4주
    expect(weeksInMonth(2100, 1)).toBe(4)
  })
})

describe('monthWeekOf — 주의 귀속 달은 월요일이 속한 달', () => {
  it('1일이 주 중간이면 그 며칠은 전달 마지막 주 (2026-08 최악 케이스)', () => {
    // 2026-08-01(토)·02(일)이 속한 주의 월요일은 7-27 → 7월 4주차
    expect(monthWeekOf(mondayOf(d('2026-08-01')))).toEqual({ year: 2026, month: 7, week: 4 })
    // 8월 1주차는 첫 월요일 8-03 부터
    expect(monthWeekOf(mondayOf(d('2026-08-03')))).toEqual({ year: 2026, month: 8, week: 1 })
    // 8-31(월) 은 8월의 5번째 월요일
    expect(monthWeekOf(mondayOf(d('2026-08-31')))).toEqual({ year: 2026, month: 8, week: 5 })
    // 9-07(월) 이 9월 1주차 — 9-01~06 은 8월 5주차에 붙는다
    expect(monthWeekOf(mondayOf(d('2026-09-07')))).toEqual({ year: 2026, month: 9, week: 1 })
    expect(monthWeekOf(mondayOf(d('2026-09-01')))).toEqual({ year: 2026, month: 8, week: 5 })
  })

  it('연말연시 — 2027-01-01(금)은 2026년 12월 4주차', () => {
    expect(monthWeekOf(mondayOf(d('2027-01-01')))).toEqual({ year: 2026, month: 12, week: 4 })
  })
})

describe('planWeekCount — 계획 전체 주차 수', () => {
  it('같은 날 시작·종료면 1주', () => {
    expect(planWeekCount('2026-09-01', '2026-09-01')).toBe(1)
  })

  it('같은 달력 주 안이면 며칠이든 1주', () => {
    // 2026-08-31(월) ~ 09-06(일) 은 한 주
    expect(planWeekCount('2026-08-31', '2026-09-06')).toBe(1)
  })

  it('주가 넘어가면 +1 (경계는 일→월)', () => {
    expect(planWeekCount('2026-08-31', '2026-09-07')).toBe(2)
  })

  it('종료일이 시작일보다 앞서면 0', () => {
    expect(planWeekCount('2026-09-10', '2026-09-01')).toBe(0)
  })

  it('기간 미설정이면 0', () => {
    expect(planWeekCount('', '2026-09-01')).toBe(0)
    expect(planWeekCount('2026-09-01', '')).toBe(0)
  })

  it('실측 케이스 — 2026-08-01~10-11 은 11주 (7월4주차 ~ 10월1주차)', () => {
    expect(planWeekCount('2026-08-01', '2026-10-11')).toBe(11)
    expect(monthWeekLabel('2026-08-01', 1)).toBe('7월 4주차')
    expect(monthWeekLabel('2026-08-01', 11)).toBe('10월 1주차')
  })
})

describe('weekDateRange / weekOfDate — 주차 ↔ 날짜 왕복', () => {
  it('모든 주가 정확히 7일 (60주 전수)', () => {
    for (let w = 1; w <= 60; w++) {
      const r = weekDateRange('2026-08-01', w)!
      const days = (d(r.end).getTime() - d(r.start).getTime()) / 86_400_000 + 1
      expect(days).toBe(7)
      expect(d(r.start).getDay()).toBe(1) // 월요일 시작
      expect(d(r.end).getDay()).toBe(0)   // 일요일 종료
    }
  })

  it('1주차는 시작일이 속한 주 — 시작일이 수요일이어도 그 주 월요일부터', () => {
    // 2026-09-02 는 수요일
    expect(weekDateRange('2026-09-02', 1)).toEqual({ start: '2026-08-31', end: '2026-09-06' })
    // 계획 시작 이틀 전인 월요일도 1주차로 친다
    expect(weekOfDate('2026-09-02', d('2026-08-31'))).toBe(1)
  })

  it('왕복 — weekDateRange 로 얻은 날짜를 weekOfDate 에 넣으면 원래 주차', () => {
    for (let w = 1; w <= 30; w++) {
      const r = weekDateRange('2026-09-02', w)!
      expect(weekOfDate('2026-09-02', d(r.start))).toBe(w)
      expect(weekOfDate('2026-09-02', d(r.end))).toBe(w)
    }
  })

  it('계획 첫 주보다 이전이면 null', () => {
    expect(weekOfDate('2026-09-02', d('2026-08-30'))).toBeNull()
  })

  it('week < 1 이면 범위 없음', () => {
    expect(weekDateRange('2026-09-02', 0)).toBeNull()
  })

  it('weekRangeLabel 은 M.D ~ M.D', () => {
    expect(weekRangeLabel('2026-09-02', 1)).toBe('8.31 ~ 9.6')
  })
})

describe('projectWeeks — 기간의 출처 우선순위', () => {
  it('weeks 가 정본', () => {
    expect(projectWeeks({ weeks: 3, curriculum: [{ week: 1, title: '' }] } as never)).toBe(3)
  })

  it('weeks 가 없으면 curriculum 길이로 되살린다 (서버가 weeks 를 저장하지 않음)', () => {
    expect(projectWeeks({ curriculum: [{}, {}, {}, {}, {}] } as never)).toBe(5)
  })

  it('둘 다 없으면 기본값, 0 이하로는 안 내려간다', () => {
    expect(projectWeeks({ weeks: 0, curriculum: [] } as never)).toBeGreaterThanOrEqual(1)
  })
})

describe('fitsInPlan — 계획 끝을 넘는 배치는 막는다', () => {
  const p3 = proj('p3', 3)

  it('3주 프로젝트는 10주 계획에서 8주차까지만 시작 가능', () => {
    expect(fitsInPlan(8, p3, 10)).toBe(true)
    expect(projectEndWeek(8, p3)).toBe(10)
    expect(fitsInPlan(9, p3, 10)).toBe(false)
    expect(fitsInPlan(10, p3, 10)).toBe(false)
  })

  it('0 이하 주차는 배치 불가', () => {
    expect(fitsInPlan(0, p3, 10)).toBe(false)
  })
})

describe('projectsActiveInWeek — 시작주에서 구간을 펼친다', () => {
  const p3 = proj('a', 3)
  const p2 = proj('b', 2)
  const timeline: TimelineSlot[] = [
    { week: 2, projects: [p3] },
    { week: 3, projects: [p2] },
  ]

  it('시작주부터 기간만큼 진행 중', () => {
    expect(projectsActiveInWeek(timeline, 1).map(p => p.id)).toEqual([])
    expect(projectsActiveInWeek(timeline, 2).map(p => p.id)).toEqual(['a'])
    expect(projectsActiveInWeek(timeline, 4).map(p => p.id)).toEqual(['a', 'b'])
    expect(projectsActiveInWeek(timeline, 5).map(p => p.id)).toEqual([])
  })

  it('겹침 허용 — 같은 주에 둘 다 진행', () => {
    expect(projectsActiveInWeek(timeline, 3).map(p => p.id).sort()).toEqual(['a', 'b'])
  })
})

describe('resolveProject — stale 복사본 방어 (2026-08-27 버그)', () => {
  // 타임라인 슬롯은 배치 시점의 프로젝트 복사본을 들고 있다.
  // localStorage 복원이나 API 로드를 거치면 원본과 별개 객체가 되어,
  // 배치 후 기간·커리큘럼을 고쳐도 슬롯 쪽은 옛 값에 머물렀다.
  const stale = proj('a', 3, { curriculum: [{ week: 1, title: 'SQL 기초 완성 - 1주차' }] as never })
  const fresh = proj('a', 5, { curriculum: [{ week: 1, title: '인덱스와 실행계획 이해' }] as never })
  const timeline: TimelineSlot[] = [{ week: 1, projects: [stale] }]

  it('projects 를 넘기면 id 로 원본을 다시 집어온다', () => {
    expect(resolveProject(stale, [fresh]).curriculum![0]!.title).toBe('인덱스와 실행계획 이해')
  })

  it('원본에 없는 id 면 복사본 그대로 (미배치·삭제된 프로젝트)', () => {
    expect(resolveProject(stale, []).id).toBe('a')
  })

  it('기간 변경이 점유 구간에 반영된다 — 복사본 3주여도 원본 5주로 펼쳐짐', () => {
    // 복사본만 보면 4·5주차는 이미 끝난 것으로 보인다
    expect(projectsActiveInWeek(timeline, 5).map(p => p.id)).toEqual([])
    // 원본을 넘기면 5주차까지 진행 중
    expect(projectsActiveInWeek(timeline, 5, [fresh]).map(p => p.id)).toEqual(['a'])
  })

  it('projectIdsActiveOnDate 도 원본 기준', () => {
    // 1주차 시작 2026-08-31(월) 기준 5주차는 2026-09-28 주
    const date = d('2026-09-28')
    expect(projectIdsActiveOnDate(timeline, '2026-08-31', date).size).toBe(0)
    expect([...projectIdsActiveOnDate(timeline, '2026-08-31', date, [fresh])]).toEqual(['a'])
  })
})

describe('projectStartWeek / projectWeekIndexOn — 커리큘럼 주차 매핑', () => {
  const p = proj('a', 4)
  const timeline: TimelineSlot[] = [{ week: 6, projects: [p] }]

  it('미배치면 null', () => {
    expect(projectStartWeek([], 'a')).toBeNull()
    expect(projectWeekIndexOn([], '2026-08-31', 'a', d('2026-09-07'))).toBeNull()
  })

  it('여러 슬롯에 걸쳐 있으면 가장 이른 주차가 시작주', () => {
    const multi: TimelineSlot[] = [{ week: 9, projects: [p] }, { week: 6, projects: [p] }]
    expect(projectStartWeek(multi, 'a')).toBe(6)
  })

  it('계획 6주차 = 커리큘럼 1주차, 8주차 = 3주차', () => {
    // 1주차 시작 2026-08-31(월). 6주차 = 10-05 주, 8주차 = 10-19 주
    expect(projectWeekIndexOn(timeline, '2026-08-31', 'a', d('2026-10-05'))).toBe(1)
    expect(projectWeekIndexOn(timeline, '2026-08-31', 'a', d('2026-10-19'))).toBe(3)
  })

  it('시작주 이전 날짜는 null', () => {
    expect(projectWeekIndexOn(timeline, '2026-08-31', 'a', d('2026-09-07'))).toBeNull()
  })
})
