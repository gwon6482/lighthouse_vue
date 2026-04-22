// ────────────────────────────────────────────────────────────────────────────
// 공통 타입
// ────────────────────────────────────────────────────────────────────────────

/** 순위 항목 — DB는 code만 저장, API 응답 시 name join */
export interface RankItem {
  code: string
  name: string
  score: number
}

/** 카테고리별 순위 데이터 (직업내/직업간 비교 × 중요도/수준) */
export interface CategoryRankings {
  중요도: { 직업내: RankItem[]; 직업간: RankItem[] }
  수준?: { 직업내: RankItem[]; 직업간: RankItem[] }
}

// ────────────────────────────────────────────────────────────────────────────
// 직업 상세 정보
// ────────────────────────────────────────────────────────────────────────────

export interface JobClassification {
  primary: string    // 대분류 (예: 경영·사무·금융·보험직)
  secondary: string  // 중분류 (예: 의회의원·고위공무원 및 기업 고위임원)
}

/** 직업 details — 플랫 구조, 각 카테고리별 중요도/수준 × 직업내/직업간 배열 */
export interface JobDetails {
  '업무수행능력': CategoryRankings
  '지식': CategoryRankings
  '업무환경': CategoryRankings
  '성격': CategoryRankings
  '흥미': CategoryRankings
  '가치관': CategoryRankings
  '업무활동': CategoryRankings
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
  overview: string               // 직업 개요
  duties: string[]               // 수행직무 목록
  relatedMajors: string[]        // 관련학과
  relatedCertifications: string[] // 관련자격
  details: JobDetails            // 능력/지식/환경, 성격/흥미/가치관, 업무활동
  lastUpdated: string
  jobSatisfaction?: number       // 직업 만족도 (백점 기준)
  salary?: JobSalary             // 임금 정보 (만원)
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
