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

/** 추천 진로 조회 GET /api/job/recommend */
export const fetchRecommendedJobs = () =>
  req.get<JobRecommendResponse>(`/api/job/recommend`)

/** 직업 후기 조회 GET /api/job/:jobCode/review */
export const fetchJobReviews = (jobCode: string) =>
  req.get<JobReviewResponse>(`/api/job/${jobCode}/review`)

/** 직업 준비과정 조회 GET /api/job/:jobCode/preparation */
export const fetchJobPreparations = (jobCode: string) =>
  req.get<JobPreparationResponse>(`/api/job/${jobCode}/preparation`)

/** 직업 채용정보 조회 GET /api/job/:jobCode/recruitment */
export const fetchJobRecruitments = (jobCode: string) =>
  req.get<JobRecruitmentResponse>(`/api/job/${jobCode}/recruitment`)
