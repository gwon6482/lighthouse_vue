export type ProjectCategory = 'qualification' | 'knowledge' | 'skill' | 'portfolio'
export type Priority = 'high' | 'normal' | 'low'
export type DayOfWeek = '월' | '화' | '수' | '목' | '금' | '토' | '일'

export interface WeekCurriculum {
  week: number
  title: string
  // 그 주차의 설명 텍스트. 한 주 = 한 덩어리이므로 여러 항목으로 쪼개지 않는다(2026-08-27).
  // 그 전에 저장된 데이터·템플릿에는 없으므로 optional.
  description?: string
  // 구 데이터 호환용. 2026-08-27 이전에는 주차 안에 항목을 여러 개 쌓는 방식이었다.
  // 신규 작성은 description 만 쓰고, 읽을 때만 items 를 폴백으로 본다.
  items: string[]
}

export interface Project {
  id: string
  category: ProjectCategory
  name: string
  goal: string
  days: DayOfWeek[]
  duration: number
  priority: Priority
  notification: boolean
  missedNotification: boolean
  notificationTime: string
  memo: string
  source?: string
  field?: string
  level?: string
  weeks?: number
  description?: string
  tags?: string[]
  likes?: number
  views?: number
  curriculum?: WeekCurriculum[]
}

export interface Routine {
  id: string
  name: string
  days: DayOfWeek[]
  duration: number
  notificationTime: string
  notification: boolean
  memo: string
}

// 타임라인 슬롯 — week 는 프로젝트의 **시작 주차**(1-based, startDate 부터 7일 블록).
// 점유 구간은 저장하지 않고 project.weeks 에서 파생한다(usePlanTimeline 참조).
export interface TimelineSlot {
  week: number
  projects: Project[]
}

export interface TimelineItem {
  projectId: string
  projectName: string
  category: ProjectCategory
  date: string
}

export interface TimelineMonth {
  label: string
  items: TimelineItem[]
}

export interface CareerPlan {
  id: string
  name: string
  targetJob: string
  author: string
  duration: string
  description: string
  tags: string[]
  likes: number
  views: number
  routineCount: number
  projects: Project[]
  timeline: TimelineMonth[]
}

export interface DraftPlan {
  planId: string | null
  name: string
  targetJob: string
  projects: Project[]
  routines: Routine[]
  startDate: string
  endDate: string
  reviewDay: DayOfWeek | ''  // 주간리뷰 요일. 일주일의 끝이자 시작. 미설정이면 ''
  timeline: TimelineMonth[]
}
