import type { WeekCurriculum } from '../types/career-design'

// 프로젝트 기간(주차 수) 공통 규칙.
// 1단계(ProjectWritePage)에서 주차 수를 정하고 2단계(ProjectCurriculumPage)에서 내용을 채운다.
export const MIN_WEEKS = 1
export const MAX_WEEKS = 52
export const DEFAULT_WEEKS = 4

export function clampWeeks(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_WEEKS
  return Math.min(MAX_WEEKS, Math.max(MIN_WEEKS, Math.trunc(n)))
}

// 주차 제목 기본값 — "프로젝트명 - n주차"
export function defaultWeekTitle(projectName: string, week: number): string {
  return `${projectName || '프로젝트'} - ${week}주차`
}

// 기존 커리큘럼을 주차 수에 맞춰 늘리거나 줄인다.
// 이미 작성한 주차의 제목·항목은 보존하고, 모자란 주차만 기본 제목으로 채운다.
// (1단계에서 기간을 8→4로 줄였다가 다시 8로 늘려도 앞 4주는 그대로 남는다)
export function syncCurriculumLength(
  curriculum: WeekCurriculum[] | undefined,
  weeks: number,
  projectName: string,
): WeekCurriculum[] {
  const target = clampWeeks(weeks)
  const prev = curriculum ?? []
  const next: WeekCurriculum[] = []
  for (let i = 0; i < target; i++) {
    const existing = prev[i]
    next.push({
      week: i + 1,
      title: existing?.title?.trim() ? existing.title : defaultWeekTitle(projectName, i + 1),
      items: [...(existing?.items ?? [])],
    })
  }
  return next
}
