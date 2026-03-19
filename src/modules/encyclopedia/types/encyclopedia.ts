// ────────────────────────────────────────────────────────────────────────────
// 공통 타입
// ────────────────────────────────────────────────────────────────────────────

/** 순위 항목 (이름 + 점수) */
export interface RankItem {
  name: string
  score: number
}

/** 순위 그룹 (상위 5개 항목) */
export interface RankingGroup {
  item_1st: RankItem
  item_2nd: RankItem
  item_3rd: RankItem
  item_4th: RankItem
  item_5th: RankItem
}

// ────────────────────────────────────────────────────────────────────────────
// 직업 상세 정보
// ────────────────────────────────────────────────────────────────────────────

export interface JobClassification {
  primary: string    // 대분류 (예: 경영·사무·금융·보험직)
  secondary: string  // 중분류 (예: 의회의원·고위공무원 및 기업 고위임원)
}

/** 직업 details 내 각 카테고리는 Record<비교기준명, RankingGroup> 형태 */
export interface JobDetails {
  '능력/지식/환경': {
    '업무수행능력': Record<string, RankingGroup>
    '지식': Record<string, RankingGroup>
    '업무환경': Record<string, RankingGroup>
  }
  '성격/흥미/가치관': {
    '성격': Record<string, RankingGroup>
    '흥미': Record<string, RankingGroup>
    '가치관': Record<string, RankingGroup>
  }
  '업무활동': {
    '업무활동 중요도': Record<string, RankingGroup>
  }
}

export interface JobSalary {
  lower: number   // 하위 25% 임금 (만원)
  median: number  // 중위 임금 (만원)
  upper: number   // 상위 25% 임금 (만원)
}

/** 직업 데이터 */
export interface Job {
  _id: string
  jobCode: string
  classification: JobClassification
  title: string
  overview: string           // 직업 개요
  duties: string[]           // 수행직무 목록
  details: JobDetails        // 능력/지식/환경, 성격/흥미/가치관, 업무활동
  lastUpdated: string
  jobSatisfaction?: number   // 직업 만족도 백분위 (%)
  salary?: JobSalary         // 임금 정보 (만원)
}

/** GET /api/job/:jobCode 응답 */
export interface JobResponse {
  success: boolean
  data: Job
}

// ────────────────────────────────────────────────────────────────────────────
// 검색 / 추천 (추후 API 연동 시 스펙에 맞게 수정)
// ────────────────────────────────────────────────────────────────────────────

/** 목록에서 사용하는 직업 요약 정보 */
export interface JobSummary {
  jobCode: string
  title: string
  classification: JobClassification
}

/** GET /api/job/search?q=... 응답 */
export interface JobSearchResponse {
  success: boolean
  data: JobSummary[]
}

/** GET /api/job/recommend 응답 */
export interface JobRecommendResponse {
  success: boolean
  data: JobSummary[]
}

// ────────────────────────────────────────────────────────────────────────────
// 후기 (추후 API 연동 시 스펙에 맞게 수정)
// ────────────────────────────────────────────────────────────────────────────

export interface JobReview {
  reviewId: string
  author: string
  content: string
  createdAt: string
}

export interface JobReviewResponse {
  success: boolean
  data: JobReview[]
}

// ────────────────────────────────────────────────────────────────────────────
// 준비과정 (추후 API 연동 시 스펙에 맞게 수정)
// ────────────────────────────────────────────────────────────────────────────

export interface PreparationCard {
  preparationId: string
  title: string
  description: string
}

export interface JobPreparationResponse {
  success: boolean
  data: PreparationCard[]
}

// ────────────────────────────────────────────────────────────────────────────
// 채용 (추후 API 연동 시 스펙에 맞게 수정)
// ────────────────────────────────────────────────────────────────────────────

export interface RecruitmentCard {
  recruitmentId: string
  companyName: string
  position: string
  deadline: string
}

export interface JobRecruitmentResponse {
  success: boolean
  data: RecruitmentCard[]
}

// ────────────────────────────────────────────────────────────────────────────
// 세부 진로 페이지 탭 타입
// ────────────────────────────────────────────────────────────────────────────

export type JobDetailTab = 'overview' | 'review' | 'preparation' | 'recruitment'
