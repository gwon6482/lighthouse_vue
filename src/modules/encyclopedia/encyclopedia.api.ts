import { req } from '@/shared/api'
import type {
  JobResponse,
  JobSearchResponse,
  JobRecommendResponse,
  JobReviewResponse,
  JobPreparationResponse,
  JobRecruitmentResponse,
} from './types/encyclopedia'

/**
 * encyclopediaApi 서비스
 *
 * Lighthouse DB API와 통신하는 서비스 모듈
 * - 직업 상세 조회
 * - 직업 검색
 * - 추천 직업 조회
 * - 후기 / 준비과정 / 채용 조회 (추후 API 확정 시 경로 수정)
 */

/** 직업 상세 조회 GET /api/job/:jobCode */
export const fetchJob = (jobCode: string) =>
  req.get<JobResponse>(`/api/job/${jobCode}`)

/** 직업 검색 GET /api/job/search?name=... */
export const searchJobs = (query: string) =>
  req.get<JobSearchResponse>(`/api/job/search`, { params: { name: query } })

/** 추천 진로 조회 GET /api/job/recommend/:survey_id */
export const fetchRecommendedJobs = (surveyId: string) =>
  req.get<JobRecommendResponse>(`/api/job/recommend/${surveyId}`)

/** 직업 후기 목록 조회 GET /api/job/:jobCode/reviews */
export const fetchJobReviews = (jobCode: string) =>
  req.get<JobReviewResponse>(`/api/job/${jobCode}/reviews`)

/** 직업 준비과정 조회 GET /api/job/:jobCode/preparation */
export const fetchJobPreparations = (jobCode: string) =>
  req.get<JobPreparationResponse>(`/api/job/${jobCode}/preparation`)

/** 직업 채용정보 조회 GET /api/job/:jobCode/recruitment */
export const fetchJobRecruitments = (jobCode: string) =>
  req.get<JobRecruitmentResponse>(`/api/job/${jobCode}/recruitment`)
